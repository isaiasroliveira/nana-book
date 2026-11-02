import { getSession } from "@/services/auth";
import { database } from "@/services/database";
import { resolveBook } from "@/services/book-catalog";

const headers = { "Cache-Control": "private, no-store" };
const volumePattern = /^[A-Za-z0-9_-]{1,128}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const pageSize = 12;
function failure(error: string, status: number) { return Response.json({ error }, { status, headers }); }

export async function GET(request: Request) {
  try {
    const { data: session, error } = await getSession();
    if (error) throw error;
    if (!session?.user) return Response.json({ error: "Entre na sua conta para acessar suas avaliações." }, { status: 401, headers });
    const params = new URL(request.url).searchParams;
    const volumeId = params.get("volumeId");
    if (volumeId !== null && !volumePattern.test(volumeId)) return failure("Edição inválida.", 400);
    let before: string | null = null;
    let beforeId: string | null = null;
    const cursor = params.get("cursor");
    if (cursor !== null) {
      try {
        if (cursor.length > 256) throw new Error();
        const value = JSON.parse(Buffer.from(cursor, "base64url").toString());
        if (!Array.isArray(value) || value.length !== 2 || typeof value[0] !== "string" ||
            !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?\+00$/.test(value[0]) ||
            !Number.isFinite(Date.parse(value[0])) || new Date(value[0]).toISOString().slice(0, 10) !== value[0].slice(0, 10) ||
            typeof value[1] !== "string" || !uuidPattern.test(value[1])) throw new Error();
        [before, beforeId] = value;
      } catch { return failure("Página inválida. Atualize seu diário.", 400); }
    }
    const sql = database();
    const rows = await sql`
      SELECT r.id, e.provider_volume_id AS "volumeId", r.rating_units AS "ratingUnits",
             r.opinion, r.contains_spoilers AS "containsSpoilers", r.created_at::text AS "createdAt", r.updated_at::text AS "updatedAt"
      FROM reviews r JOIN editions e ON e.id = r.edition_id
      WHERE r.user_id = ${session.user.id}::uuid
        AND (${volumeId}::text IS NULL OR e.provider_volume_id = ${volumeId})
        AND (${before}::timestamptz IS NULL OR (r.created_at,r.id) < (${before}::timestamptz,${beforeId}::uuid))
      ORDER BY r.created_at DESC, r.id DESC LIMIT ${pageSize + 1}`;
    const page = rows.slice(0, pageSize);
    const last = page.at(-1);
    const nextCursor = rows.length > pageSize && last ? Buffer.from(JSON.stringify([last.createdAt, last.id])).toString("base64url") : null;
    const reviews = await Promise.all(page.map(async row => {
      let book = null;
      try { book = await resolveBook(row.volumeId); } catch { /* A catalog outage must not hide a saved evaluation. */ }
      return { ...row, book };
    }));
    return Response.json({ reviews, nextCursor }, { headers });
  } catch {
    return Response.json({ error: "Não foi possível acessar suas avaliações. Tente novamente." }, { status: 503, headers });
  }
}

export async function POST(request: Request) {
  try {
    const { data: session, error } = await getSession();
    if (error) throw error;
    if (!session?.user) return failure("Entre na sua conta para salvar sua avaliação.", 401);
    if (request.headers.get("origin") !== new URL(request.url).origin) return failure("Origem inválida.", 403);
    const expectedUserId = request.headers.get("x-expected-user-id");
    if (expectedUserId !== null && expectedUserId !== session.user.id) return failure("Sua conta mudou. Atualize o diário antes de salvar.", 409);
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return failure("Envie uma avaliação válida.", 400);
    const reader = request.body?.getReader();
    if (!reader) return failure("Avaliação inválida.", 400);
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 65536) { await reader.cancel(); return failure("Avaliação muito longa.", 400); }
      chunks.push(value);
    }
    const raw = Buffer.concat(chunks).toString("utf8");
    let input;
    try { input = JSON.parse(raw); } catch { return failure("Avaliação inválida.", 400); }
    if (!input || typeof input !== "object" || Array.isArray(input) ||
        Object.keys(input).some(key => !["volumeId", "ratingUnits", "opinion", "containsSpoilers"].includes(key)) ||
        typeof input.volumeId !== "string" || !volumePattern.test(input.volumeId) ||
        !Number.isInteger(input.ratingUnits) || input.ratingUnits < 1 || input.ratingUnits > 10) return failure("Selecione uma edição e uma nota entre 0,5 e 5 estrelas.", 400);
    if ((input.opinion !== undefined && input.opinion !== null && typeof input.opinion !== "string") ||
        (input.containsSpoilers !== undefined && typeof input.containsSpoilers !== "boolean")) return failure("Opinião ou marcação de spoiler inválida.", 400);
    const opinion = input.opinion?.trim() || null;
    if (opinion && Array.from(opinion).length > 5000) return failure("Escreva uma opinião com até 5.000 caracteres.", 400);
    const containsSpoilers = input.containsSpoilers ?? false;
    try { await resolveBook(input.volumeId); } catch { return failure("Não foi possível confirmar a edição. Tente novamente.", 502); }
    const sql = database();
    const [review] = await sql`
      WITH edition AS (
        INSERT INTO editions (provider, provider_volume_id) VALUES ('google_books', ${input.volumeId})
        ON CONFLICT (provider, provider_volume_id) DO UPDATE SET provider_volume_id = EXCLUDED.provider_volume_id
        RETURNING id
      ), saved AS (
        INSERT INTO reviews (user_id, edition_id, rating_units, opinion, contains_spoilers)
        SELECT ${session.user.id}::uuid, id, ${input.ratingUnits}, ${opinion}, ${containsSpoilers} FROM edition
        ON CONFLICT (user_id, edition_id) DO UPDATE SET rating_units = EXCLUDED.rating_units,
          opinion = EXCLUDED.opinion, contains_spoilers = EXCLUDED.contains_spoilers, updated_at = now()
        RETURNING *
      )
      SELECT id, ${input.volumeId}::text AS "volumeId", rating_units AS "ratingUnits", opinion,
             contains_spoilers AS "containsSpoilers", created_at::text AS "createdAt", updated_at::text AS "updatedAt" FROM saved`;
    return Response.json({ review }, { headers });
  } catch { return failure("Não foi possível salvar sua avaliação. Tente novamente.", 503); }
}

export async function DELETE(request: Request) {
  try {
    const { data: session, error } = await getSession();
    if (error) throw error;
    if (!session?.user) return failure("Entre na sua conta para excluir sua avaliação.", 401);
    if (request.headers.get("origin") !== new URL(request.url).origin) return failure("Origem inválida.", 403);
    if (request.headers.get("x-expected-user-id") !== session.user.id) return failure("Sua conta mudou. Atualize o diário antes de excluir.", 409);
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !uuidPattern.test(id)) return failure("Avaliação inválida.", 400);
    const sql = database();
    const rows = await sql`DELETE FROM reviews WHERE id = ${id}::uuid AND user_id = ${session.user.id}::uuid RETURNING id`;
    if (!rows.length) return failure("Avaliação não encontrada.", 404);
    return Response.json({ deleted: true }, { headers });
  } catch { return failure("Não foi possível excluir sua avaliação. Tente novamente.", 503); }
}
