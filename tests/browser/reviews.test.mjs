import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Only the reader interface is under test here; server/database tests exercise real persistence.
test("reader saves and restores half-star ratings, then revises an opinion without duplicates", async t => {
  const profile = await mkdtemp(join(tmpdir(), "nana-reviews-browser-"));
  const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless=new", "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let socket;
  try {
    const endpoint = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Chrome did not start")), 15000);
      chrome.once("error", error => { clearTimeout(timeout); reject(error); });
      let output = "";
      chrome.stderr.on("data", chunk => {
        output += chunk;
        const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) { clearTimeout(timeout); resolve(match[1]); }
      });
    });
    socket = new WebSocket(endpoint);
    await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
    let id = 0;
    const pending = new Map();
    socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
    });
    async function call(method, params = {}, sessionId) {
      const requestId = ++id;
      const response = new Promise(resolve => pending.set(requestId, resolve));
      socket.send(JSON.stringify({ id: requestId, method, params, sessionId }));
      const result = await response;
      assert.equal(result.error, undefined, JSON.stringify(result.error));
      return result.result;
    }
    const { targetId } = await call("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true });
    const page = (method, params) => call(method, params, sessionId);
    async function evaluate(expression) {
      const response = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      assert.equal(response.exceptionDetails, undefined, JSON.stringify(response.exceptionDetails));
      return response.result.value;
    }
    async function waitFor(expression) {
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      assert.fail(`Timed out: ${expression}; page: ${await evaluate("document.body.innerText")}`);
    }
    await page("Page.enable");
    await page("Page.addScriptToEvaluateOnNewDocument", { source: `
      const originalFetch = window.fetch.bind(window);
      window.hasMore = localStorage.getItem('pagination-fixture') === 'yes';
      const book = { id: 'volume-1', source: 'Google Books', title: 'Torto Arado', authors: ['Itamar Vieira Junior'], publisher: 'Todavia', publishedDate: '2019', language: 'pt', isbn: '9786580309313' };
      window.fetch = async (input, options = {}) => {
        const url = new URL(typeof input === 'string' ? input : input.url, location.origin);
        if (url.pathname === '/api/session') return Response.json({ user: { id: window.sessionReader || 'reader-1', name: 'Marina', email: 'reader@example.test' } });
        if (url.pathname === '/api/books') return Response.json({ books: [book] });
        if (url.pathname === '/api/reviews') {
          const reviews = window.sessionReader === 'reader-2' ? [] : JSON.parse(localStorage.getItem('review-fixture') || '[]');
          if ((options.method || 'GET') === 'POST') {
            window.saveRequests = (window.saveRequests || 0) + 1;
            window.hasMore = false;
            if (window.failReviewSave) { window.failReviewSave = false; return Response.json({ error: 'Não foi possível salvar. Tente novamente.' }, { status: 503 }); }
            const input = JSON.parse(options.body);
            const existing = reviews.find(review => review.volumeId === input.volumeId);
            const review = { id: existing?.id || 'review-1', volumeId: input.volumeId, ratingUnits: input.ratingUnits, opinion: input.opinion?.trim() || null, containsSpoilers: input.containsSpoilers || false, createdAt: existing?.createdAt || '2026-11-01T12:00:00.000Z', updatedAt: '2026-11-01T13:00:00.000Z' };
            localStorage.setItem('review-fixture', JSON.stringify([{ ...review, book }]));
            return Response.json({ review });
          }
          if (url.searchParams.has('cursor') && window.delayReviewPage) return new Promise(resolve => { window.resolveReviewPage = () => resolve(Response.json({ reviews: [{ ...reviews[0], id: 'stale-review', book: { ...book, title: 'Resposta antiga' } }], nextCursor: 'stale-cursor' })); });
          return Response.json({ reviews: url.searchParams.has('volumeId') ? reviews.filter(review => review.volumeId === url.searchParams.get('volumeId')) : reviews, nextCursor: window.hasMore ? 'page-2' : null });
        }
        return originalFetch(input, options);
      };
    ` });
    await page("Page.navigate", { url: process.env.TEST_BASE_URL || "http://localhost:3000" });
    await waitFor("!!document.querySelector('#book-query')");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await evaluate("document.querySelector('#book-query').value = 'Torto arado'; document.querySelector('.search-form').requestSubmit()");
    await waitFor("document.querySelector('.search-results')?.textContent.includes('Torto Arado')");
    assert.equal(await evaluate("Array.from(document.querySelectorAll('.search-results button')).some(button => /Avaliar esta edição/.test(button.textContent))"), true, "search results let the reader select an edition");
    await evaluate("Array.from(document.querySelectorAll('.search-results button')).find(button => /Avaliar esta edição/.test(button.textContent)).click()");
    await waitFor("!!document.querySelector('.rating-control input') && !document.querySelector('.review-form fieldset').disabled");
    assert.equal(await evaluate("!!document.querySelector('.review-form select[name=ratingUnits]')"), false, "stars are the only rating control");
    await evaluate("document.querySelector('.review-form input[name=confirmed]').click(); document.querySelector('.review-form').requestSubmit()");
    await waitFor("document.querySelector('#review-editor').innerText.includes('Escolha uma nota')");
    assert.equal(await evaluate("window.saveRequests || 0"), 0, "saving requires a rating");
    await evaluate("document.querySelector('.rating-control input').focus()");
    await page("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    await page("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    assert.equal(await evaluate("document.querySelector('.rating-control input').value"), "1", "keyboard selects a half star");
    const slider = await evaluate("(() => { const r = document.querySelector('.rating-control input').getBoundingClientRect(); return { x: r.x, y: r.y + r.height / 2, width: r.width }; })()");
    await page("Input.dispatchMouseEvent", { type: "mousePressed", x: slider.x + 20, y: slider.y, button: "left", clickCount: 1 });
    await page("Input.dispatchMouseEvent", { type: "mouseMoved", x: slider.x + slider.width - 2, y: slider.y, button: "left", buttons: 1 });
    await page("Input.dispatchMouseEvent", { type: "mouseReleased", x: slider.x + slider.width - 2, y: slider.y, button: "left", clickCount: 1 });
    assert.equal(await evaluate("document.querySelector('.rating-control input').value"), "10", "dragging selects five stars");
    assert.match(await evaluate("document.querySelector('#review-editor').innerText"), /Torto Arado/);
    await evaluate("document.querySelector('.rating-control input').focus(); window.failReviewSave = true");
    await page("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37 });
    await page("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37 });
    await evaluate("document.querySelector('.review-form').requestSubmit()");
    await waitFor("document.querySelector('#review-editor').innerText.includes('Não foi possível salvar')");
    assert.equal(await evaluate("document.querySelector('.rating-control input').value"), '9', 'failed save preserves half-star input');
    assert.equal(await evaluate("document.querySelector('.review-form input[name=confirmed]').checked"), true);
    await evaluate("document.querySelector('.review-form').requestSubmit()");
    await waitFor("document.querySelector('.diary-readings')?.innerText.includes('Torto Arado')");
    await waitFor("document.querySelector('[aria-label=\"Última leitura avaliada\"]')?.textContent.includes('Torto Arado')");
    assert.equal(await evaluate("!!document.querySelector('[aria-label=\"Última leitura avaliada\"] [aria-label=\"4,5 de 5 estrelas\"]')"), true);
    assert.match(await evaluate("document.querySelector('[aria-label=\"Última leitura avaliada\"]').textContent"), /ainda não escreveu uma opinião/);
    assert.equal(await evaluate("!!document.querySelector('#review-editor a[href=\"#readings\"]')"), true, "saving offers a path to the diary");
    assert.equal(await evaluate("document.querySelectorAll('.diary-readings [data-review-id]').length"), 1);
    assert.equal(await evaluate("JSON.parse(localStorage.getItem('review-fixture'))[0].ratingUnits"), 9);
    await page("Page.reload");
    await waitFor("document.querySelector('.diary-readings')?.innerText.includes('Torto Arado')");
    assert.equal(await evaluate("document.querySelectorAll('.diary-readings [data-review-id]').length"), 1, 'reload restores the saved rating');
    await evaluate("Array.from(document.querySelectorAll('.diary-readings button')).find(button => /Editar avaliação/.test(button.textContent)).click()");
    await waitFor("!!document.querySelector('.review-form')");
    assert.equal(await evaluate("!!document.querySelector('.review-form textarea[name=opinion]')"), true, 'reader can write an optional opinion');
    assert.equal(await evaluate("document.querySelector('.rating-control input').value"), '9', 'editing restores the saved rating');
    const opinion = '  Uma história que continua comigo.  ';
    await evaluate(`(() => { const field = document.querySelector('.review-form textarea[name=opinion]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(field, ${JSON.stringify(opinion)}); field.dispatchEvent(new Event('input', {bubbles:true})); document.querySelector('.review-form input[name=containsSpoilers]').click(); window.failReviewSave = true; })()`);
    await evaluate("document.querySelector('.review-form').requestSubmit()");
    await waitFor("document.querySelector('#review-editor').innerText.includes('Não foi possível salvar')");
    assert.equal(await evaluate("document.querySelector('.review-form textarea[name=opinion]').value"), opinion, 'failed revision preserves the opinion');
    assert.equal(await evaluate("document.querySelector('.review-form input[name=containsSpoilers]').checked"), true);
    await evaluate("document.querySelector('.review-form').requestSubmit()");
    await waitFor("document.querySelector('.diary-readings')?.textContent.includes('Uma história que continua comigo.')");
    await waitFor("document.querySelector('[aria-label=\"Última leitura avaliada\"]')?.textContent.includes('contém spoilers')");
    assert.equal(await evaluate("document.querySelector('[aria-label=\"Última leitura avaliada\"]').textContent.includes('Uma história que continua comigo.')"), false, 'featured excerpt hides spoilers');
    assert.match(await evaluate("document.querySelector('.diary-readings').textContent"), /spoilers/i);
    await page("Page.reload");
    await waitFor("document.querySelector('.diary-readings')?.textContent.includes('Uma história que continua comigo.')");
    assert.equal(await evaluate("!!document.querySelector('[aria-label=\"Última leitura avaliada\"]')"), true, 'featured reading survives reload');
    assert.equal(await evaluate("document.querySelectorAll('.diary-readings [data-review-id]').length"), 1, 'revising keeps one evaluation');
    assert.equal(await evaluate("document.querySelector('.diary-readings [data-review-id]').dataset.reviewId"), 'review-1');
    await evaluate("Array.from(document.querySelectorAll('.diary-readings button')).find(button => /Editar avaliação/.test(button.textContent)).click()");
    await waitFor("!!document.querySelector('.review-form textarea[name=opinion]')");
    assert.equal(await evaluate("document.querySelector('.review-form textarea[name=opinion]').value"), opinion.trim());
    assert.equal(await evaluate("document.querySelector('.review-form input[name=containsSpoilers]').checked"), true, 'reload restores spoiler marking');

    for (const width of [390, 768, 1440]) {
      await page("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
      assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true, `${width}: no horizontal overflow`);
      if (width === 390) {
        await evaluate("document.querySelector('.review-form textarea').focus()");
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.nav')).visibility"), "hidden", "navigation clears the writing area");
        await evaluate("document.querySelector('.review-form textarea').blur()");
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.nav')).visibility"), "visible", "navigation returns after writing");
      }
      if (width !== 768) {
        const screenshot = await page("Page.captureScreenshot", { format: 'png', captureBeyondViewport: true });
        await writeFile(join(tmpdir(), `nana-reviews-${width}.png`), Buffer.from(screenshot.data, 'base64'));
      }
    }

    await t.test("returning to the same account preserves the current draft", async () => {
      const draft = await evaluate("document.querySelector('.review-form textarea[name=opinion]').value");
      await evaluate("window.dispatchEvent(new Event('focus'))");
      await new Promise(resolve => setTimeout(resolve, 300));
      assert.equal(await evaluate("document.querySelector('.review-form textarea[name=opinion]')?.value"), draft);
      assert.equal(await evaluate("document.querySelectorAll('.diary-readings [data-review-id]').length"), 1);
    });
    await t.test("a delayed older diary page cannot overwrite a saved revision", async () => {
      await evaluate("localStorage.setItem('pagination-fixture', 'yes')");
      await page("Page.reload");
      await waitFor("Array.from(document.querySelectorAll('button')).some(button => button.textContent === 'Carregar mais')");
      await evaluate("Array.from(document.querySelectorAll('.diary-readings button')).find(button => /Editar avaliação/.test(button.textContent)).click(); window.delayReviewPage = true; Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Carregar mais').click()");
      await waitFor("typeof window.resolveReviewPage === 'function' && !!document.querySelector('.review-form')");
      await evaluate("const field = document.querySelector('textarea[name=opinion]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(field, 'Avaliação atualizada'); field.dispatchEvent(new Event('input', {bubbles:true}))");
      await evaluate("document.querySelector('.review-form').requestSubmit()");
      await waitFor("document.querySelector('.diary-readings')?.textContent.includes('Avaliação atualizada')");
      await evaluate("window.resolveReviewPage()");
      await new Promise(resolve => setTimeout(resolve, 300));
      assert.equal(await evaluate("document.querySelector('.diary-readings').textContent.includes('Resposta antiga')"), false, 'late pagination cannot append stale diary content');
      assert.equal(await evaluate("Array.from(document.querySelectorAll('button')).some(button => button.textContent === 'Carregar mais')"), false, 'late pagination cannot restore an obsolete cursor');
    });
    await t.test("switching accounts in another tab clears the previous reader diary and form", async () => {
      await evaluate("localStorage.removeItem('pagination-fixture')");
      await page("Page.reload");
      await waitFor("!!document.querySelector('.diary-readings [data-review-id]')");
      await evaluate("Array.from(document.querySelectorAll('.diary-readings button')).find(button => /Editar avaliação/.test(button.textContent)).click()");
      await waitFor("!!document.querySelector('.review-form')");
      await evaluate("window.sessionReader = 'reader-2'; window.dispatchEvent(new Event('focus'))");
      await new Promise(resolve => setTimeout(resolve, 500));
      assert.equal(await evaluate("!!document.querySelector('.review-form')"), false, 'account change clears the previous reader form');
      assert.equal(await evaluate("document.querySelectorAll('.diary-readings [data-review-id]').length"), 0, 'account change clears previous reader notes');
      assert.equal(await evaluate("!!document.querySelector('[aria-label=\"Última leitura avaliada\"]')"), false, 'account change clears featured reading');
    });
    await t.test("an account change immediately before save cannot copy another reader opinion", async () => {
      await page("Page.reload");
      await waitFor("!!document.querySelector('.diary-readings [data-review-id]')");
      await evaluate("Array.from(document.querySelectorAll('.diary-readings button')).find(button => /Editar avaliação/.test(button.textContent)).click()");
      await waitFor("!!document.querySelector('.review-form')");
      await evaluate("window.saveRequests = 0; window.sessionReader = 'reader-2'; document.querySelector('.review-form').requestSubmit()");
      await new Promise(resolve => setTimeout(resolve, 500));
      assert.equal(await evaluate("window.saveRequests"), 0, 'save rechecks identity before transmitting private input');
    });
    await t.test("featured reading keeps the opinion when catalog data is unavailable", async () => {
      await evaluate("(() => { const reviews = JSON.parse(localStorage.getItem('review-fixture')); reviews[0].book = null; reviews[0].containsSpoilers = false; reviews[0].opinion = 'Uma leitura para lembrar.'; localStorage.setItem('review-fixture', JSON.stringify(reviews)); })()");
      await page("Page.reload");
      await waitFor("document.querySelector('[aria-label=\"Última leitura avaliada\"]')?.textContent.includes('Uma leitura para lembrar.')");
      assert.match(await evaluate("document.querySelector('[aria-label=\"Última leitura avaliada\"]').textContent"), /Edição indisponível no catálogo/);
    });

  } finally {
    socket?.close();
    chrome.kill();
    if (chrome.exitCode === null) await new Promise(resolve => chrome.once("exit", resolve));
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
});
