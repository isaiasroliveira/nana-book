import { searchBooks } from "@/services/book-catalog";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 200) {
    return Response.json({ error: "Digite entre 2 e 200 caracteres." }, { status: 400 });
  }
  try {
    const books = await searchBooks(query);
    return Response.json({ books }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível consultar os livros. Tente novamente." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
