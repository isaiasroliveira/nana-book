export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 200) {
    return Response.json({ error: "Digite entre 2 e 200 caracteres." }, { status: 400 });
  }
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  const isbn = query.replace(/[\s-]/g, "");
  url.searchParams.set("q", /^(\d{13}|\d{9}[\dXx])$/.test(isbn) ? `isbn:${isbn}` : query);
  url.searchParams.set("printType", "books");
  url.searchParams.set("maxResults", "12");
  if (process.env.GOOGLE_BOOKS_API_KEY) url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Book provider unavailable");
    const data = await response.json();
    if (!data || (data.items !== undefined && !Array.isArray(data.items))) throw new Error("Invalid provider response");
    const text = (value: unknown) => typeof value === "string" ? value : undefined;
    const books = (data.items ?? []).flatMap((item: { id?: unknown; volumeInfo?: Record<string, unknown> }) => {
      const info = item?.volumeInfo;
      if (!text(item?.id) || !info || !text(info.title)) return [];
      const identifiers = Array.isArray(info.industryIdentifiers) ? info.industryIdentifiers : [];
      return [{ id: item.id, source: "Google Books", title: info.title,
        authors: Array.isArray(info.authors) ? info.authors.filter((author): author is string => typeof author === "string") : [],
        publisher: text(info.publisher), publishedDate: text(info.publishedDate), language: text(info.language),
        isbn: text(identifiers.find(entry => entry?.type === "ISBN_13")?.identifier) ?? text(identifiers.find(entry => entry?.type === "ISBN_10")?.identifier) }];
    });
    return Response.json({ books }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível consultar os livros. Tente novamente." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
