import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const base = process.env.TEST_BASE_URL || 'http://localhost:3102';
const accounts = [];
const runId = randomUUID().replaceAll('-','');
const volume = `test-${runId}`;
function sql(statement) {
  assert.ok(process.env.TEST_DATABASE_URL, 'An isolated TEST_DATABASE_URL is required');
  const result = spawnSync('psql', ['--dbname',process.env.TEST_DATABASE_URL,'-X','-qAt','-v','ON_ERROR_STOP=1','-c',statement], {encoding:'utf8'});
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}
async function request(path, account, body, extraHeaders = {}) {
  return fetch(base + path, {method:body === undefined ? 'GET':'POST', headers:{...(account ? {Cookie:account.cookie}:{}), Origin:base,...(body === undefined?{}:{'Content-Type':'application/json'}),...extraHeaders},...(body===undefined?{}:{body:JSON.stringify(body)})});
}
before(async () => {
  assert.ok(process.env.TEST_DATABASE_URL,'Run only against an isolated database');
  for (let index=0;index<2;index++) {
    const email = `nana-test-${runId}-${index}@example.com`;
    const password = randomUUID()+'Aa1!';
    const response = await request('/api/auth/sign-up/email',null,{email,password,name:'Test reader'});
    assert.equal(response.status,200,await response.clone().text());
    const user = (await response.json()).user;
    assert.match(user.id,/^[0-9a-f-]{36}$/i);
    const cookie = response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
    assert.ok(cookie.includes('session_token'),'The test auth branch must allow email signup without verification');
    accounts.push({id:user.id,cookie});
  }
});
after(() => {
  for (const account of accounts) {
    sql(`DELETE FROM neon_auth."user" WHERE id='${account.id}'`);
    assert.equal(sql(`SELECT count(*) FROM reviews WHERE user_id='${account.id}'`),'0');
  }
  sql(`DELETE FROM editions e WHERE provider_volume_id LIKE '%${runId}%' AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.edition_id=e.id)`);
});

test('private ratings persist, isolate owners, reject invalid input and survive concurrent retry', async () => {
  const [first, second] = accounts;
  assert.equal((await request('/api/reviews')).status,401);
  assert.equal((await request('/api/reviews',null,{volumeId:volume,ratingUnits:9})).status,401);
  for (const ratingUnits of [0,11,1.5,'9',null]) assert.equal((await request('/api/reviews',first,{volumeId:volume,ratingUnits})).status,400);
  for (const volumeId of ['', '../invalid', 'x'.repeat(129)]) assert.equal((await request('/api/reviews',first,{volumeId,ratingUnits:9})).status,400);
  assert.equal((await request('/api/reviews',first,{volumeId:volume,ratingUnits:9,userId:second.id})).status,400);
  assert.equal((await request('/api/reviews',first,{volumeId:volume,ratingUnits:9},{Origin:'https://untrusted.example'})).status,403);
  const responses = await Promise.all(Array.from({length:4},()=>request('/api/reviews',first,{volumeId:volume,ratingUnits:9})));
  for (const response of responses) assert.equal(response.status,200,await response.clone().text());
  const saved = (await responses[0].json()).review;
  assert.equal(saved.ratingUnits,9);
  const restored = await request('/api/reviews',first);
  assert.equal(restored.headers.get('cache-control'),'private, no-store');
  assert.equal((await restored.json()).reviews.filter(r=>r.volumeId===volume).length,1);
  assert.equal((await (await request(`/api/reviews?volumeId=${volume}`,second)).json()).reviews.length,0);
  await request('/api/reviews',second,{volumeId:volume,ratingUnits:3});
  assert.equal((await (await request(`/api/reviews?volumeId=${volume}`,first)).json()).reviews[0].ratingUnits,9);
  assert.equal((await request('/api/reviews',first,{volumeId:'unavailable',ratingUnits:8})).status,502);
  assert.equal((await request('/api/reviews',first,{volumeId:'missing',ratingUnits:8})).status,502);
  assert.equal(sql(`SELECT count(*) FROM reviews r JOIN editions e ON e.id=r.edition_id WHERE r.user_id='${first.id}' AND e.provider_volume_id IN ('unavailable','missing')`),'0');
  assert.equal(sql(`SELECT count(*) FROM editions WHERE provider_volume_id='${volume}'`),'1');
  assert.equal((await request('/api/reviews?cursor=invalid',first)).status,400);
  const impossibleDate = Buffer.from(JSON.stringify(['2026-02-31 12:00:00+00',saved.id])).toString('base64url');
  assert.equal((await request('/api/reviews?cursor='+impossibleDate,first)).status,400);
  assert.equal((await request('/api/reviews',first,{volumeId:volume,ratingUnits:9,opinion:'x'.repeat(70000)})).status,400);
  for (const body of ['invalid JSON','null','[]']) {
    assert.equal((await fetch(base+'/api/reviews',{method:'POST',headers:{Cookie:first.cookie,Origin:base,'Content-Type':'application/json'},body})).status,400);
  }
  const spoofed = await request('/api/reviews',null,undefined,{'x-user-id':first.id});
  assert.equal(spoofed.status,401);
});

test('database independently enforces rating, uniqueness and ownership references', () => {
  sql(`DO $$ DECLARE edition uuid; BEGIN
    SELECT id INTO edition FROM editions WHERE provider_volume_id='${volume}';
    IF edition IS NULL THEN RAISE EXCEPTION 'Missing fixture edition'; END IF;
    BEGIN UPDATE reviews SET rating_units=0 WHERE user_id='${accounts[0].id}'; RAISE EXCEPTION 'Expected rating check'; EXCEPTION WHEN check_violation THEN NULL; END;
    BEGIN INSERT INTO reviews(user_id,edition_id,rating_units) VALUES ('00000000-0000-0000-0000-000000000000',edition,9); RAISE EXCEPTION 'Expected user foreign key'; EXCEPTION WHEN foreign_key_violation THEN NULL; END;
    BEGIN INSERT INTO reviews(user_id,edition_id,rating_units) VALUES ('${accounts[0].id}',edition,9); RAISE EXCEPTION 'Expected unique evaluation'; EXCEPTION WHEN unique_violation THEN NULL; END;
    BEGIN DELETE FROM editions WHERE id=edition; RAISE EXCEPTION 'Expected edition restriction'; EXCEPTION WHEN foreign_key_violation OR restrict_violation THEN NULL; END;
  END $$;`);
});

test('opinions trim text, preserve private ownership and revise the existing evaluation', async () => {
  const first = accounts[0];
  const original = (await (await request(`/api/reviews?volumeId=${volume}`,first)).json()).reviews[0];
  const response = await request('/api/reviews',first,{volumeId:volume,ratingUnits:7,opinion:'  Uma leitura que ficou comigo.  ',containsSpoilers:true});
  assert.equal(response.status,200,await response.clone().text());
  const saved = (await response.json()).review;
  assert.equal(saved.id,original.id);
  assert.equal(saved.opinion,'Uma leitura que ficou comigo.');
  assert.equal(saved.containsSpoilers,true);
  assert.equal(saved.createdAt,original.createdAt);
  for (const opinion of ['x'.repeat(5001),42,{},['text']]) assert.equal((await request('/api/reviews',first,{volumeId:volume,ratingUnits:7,opinion})).status,400);
  assert.equal((await request('/api/reviews',first,{volumeId:volume,ratingUnits:7,containsSpoilers:'true'})).status,400);
  const second = (await (await request(`/api/reviews?volumeId=${volume}`,accounts[1])).json()).reviews[0];
  assert.equal(second.ratingUnits,3);
  assert.equal(second.opinion,null);
  const cleared = (await (await request('/api/reviews',first,{volumeId:volume,ratingUnits:9,opinion:' \n ',containsSpoilers:false})).json()).review;
  assert.equal(cleared.opinion,null);
  assert.equal(cleared.containsSpoilers,false);
  sql(`DO $$ BEGIN
    BEGIN UPDATE reviews SET opinion=repeat('x',5001) WHERE user_id='${first.id}'; RAISE EXCEPTION 'Expected opinion length check'; EXCEPTION WHEN check_violation THEN NULL; END;
    BEGIN UPDATE reviews SET opinion='   ' WHERE user_id='${first.id}'; RAISE EXCEPTION 'Expected blank opinion check'; EXCEPTION WHEN check_violation THEN NULL; END;
  END $$;`);
});

test('stable diary pages do not lose equal-time entries and catalog failures keep saved ratings visible', async () => {
  const first = accounts[0];
  for (let index=0;index<14;index++) {
    assert.equal((await request('/api/reviews',first,{volumeId:`page-${runId}-${index}`,ratingUnits:8})).status,200);
  }
  sql(`UPDATE reviews SET created_at='2026-01-01T00:00:00.123456Z' WHERE user_id='${first.id}'`);
  const firstPage = await (await request('/api/reviews',first)).json();
  assert.equal(firstPage.reviews.length,12);
  assert.ok(firstPage.nextCursor);
  const secondPage = await (await request('/api/reviews?cursor='+encodeURIComponent(firstPage.nextCursor),first)).json();
  assert.equal(secondPage.reviews.length,3);
  assert.equal(secondPage.nextCursor,null);
  assert.equal(new Set([...firstPage.reviews,...secondPage.reviews].map(r=>r.id)).size,15);
  sql(`INSERT INTO editions(provider,provider_volume_id) VALUES ('google_books','unavailable') ON CONFLICT DO NOTHING;
    INSERT INTO reviews(user_id,edition_id,rating_units) SELECT '${first.id}',id,7 FROM editions WHERE provider_volume_id='unavailable' ON CONFLICT (user_id,edition_id) DO NOTHING;`);
  const unavailable = await (await request('/api/reviews?volumeId=unavailable',first)).json();
  assert.equal(unavailable.reviews[0].book,null);
  assert.equal(unavailable.reviews[0].ratingUnits,7);
});

test('a database write failure rolls back its new edition and allows retry', async () => {
  sql(`CREATE OR REPLACE FUNCTION reject_test_review() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF EXISTS (SELECT 1 FROM editions WHERE id=NEW.edition_id AND provider_volume_id='rollback-${runId}') THEN RAISE EXCEPTION 'Injected database failure'; END IF;
    RETURN NEW; END $$;
    CREATE TRIGGER reject_test_review BEFORE INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION reject_test_review();`);
  try {
    assert.equal((await request('/api/reviews',accounts[0],{volumeId:`rollback-${runId}`,ratingUnits:8})).status,503);
    assert.equal(sql(`SELECT count(*) FROM editions WHERE provider_volume_id='rollback-${runId}'`),'0');
  } finally { sql('DROP TRIGGER reject_test_review ON reviews; DROP FUNCTION reject_test_review();'); }
  assert.equal((await request('/api/reviews',accounts[0],{volumeId:`rollback-${runId}`,ratingUnits:8})).status,200);
});

test('a form opened under another reader cannot write through a changed session', async () => {
  const switchedVolume = `switch-${runId}`;
  const response = await request('/api/reviews', accounts[0], {volumeId:switchedVolume,ratingUnits:8}, {'X-Expected-User-Id':accounts[1].id});
  assert.equal(response.status,409);
  assert.equal((await (await request(`/api/reviews?volumeId=${switchedVolume}`,accounts[0])).json()).reviews.length,0);
  const own = await request('/api/reviews', accounts[0], {volumeId:switchedVolume,ratingUnits:8}, {'X-Expected-User-Id':accounts[0].id});
  assert.equal(own.status,200);
});
