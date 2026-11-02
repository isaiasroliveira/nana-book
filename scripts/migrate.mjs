import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const connection = process.env.DATABASE_URL_UNPOOLED;
if (!connection) throw new Error('DATABASE_URL_UNPOOLED is required');
if (new URL(connection).hostname.includes('-pooler')) throw new Error('Migrations require a direct connection');
const directory = new URL('../db/migrations/', import.meta.url);
const files = readdirSync(directory).filter(name => /^\d+.*\.sql$/.test(name)).sort();
const migration = files.map(name => {
  const content = readFileSync(new URL(name, directory), 'utf8');
  return `SELECT NOT EXISTS (SELECT 1 FROM schema_migrations WHERE name = '${name}') AS apply_migration \\gset
\\if :apply_migration
${content}
INSERT INTO schema_migrations (name) VALUES ('${name}');
\\endif`;
}).join('\n');
const result = spawnSync('psql', ['--dbname',connection,'-X','-v','ON_ERROR_STOP=1'], {
  input:`BEGIN;\nSELECT pg_advisory_xact_lock(736154923);\nCREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());\n${migration}\nCOMMIT;\n`, encoding:'utf8',
});
if (result.status !== 0) { console.error(result.stderr); process.exit(result.status || 1); }
console.log('Database migrations applied.');
