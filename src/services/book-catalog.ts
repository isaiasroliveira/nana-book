export type BookResult = {
  id: string;
  source: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  isbn?: string;
  publisher?: string;
  language?: string;
  publishedDate?: string;
};

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function coverUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return;
    url.protocol = "https:";
    return url.href;
  } catch { return; }
}

export async function searchBooks(query: string): Promise<BookResult[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  const isbn = query.replace(/[\s-]/g, "");
  url.searchParams.set("q", /^(\d{13}|\d{9}[\dXx])$/.test(isbn) ? `isbn:${isbn}` : query);
  url.searchParams.set("printType", "books");
  url.searchParams.set("maxResults", "12");
  if (!process.env.GOOGLE_BOOKS_API_KEY) throw new Error("Google Books API key is not configured");
  url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  url.searchParams.set("hl", "pt-BR");

  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Book provider unavailable");
  const data = await response.json();
  if (!data || typeof data !== "object" || Array.isArray(data) ||
      (data.items !== undefined && !Array.isArray(data.items))) {
    throw new Error("Invalid provider response");
  }

  return (data.items ?? []).flatMap((item: { id?: unknown; volumeInfo?: Record<string, unknown> }) => {
    const info = item?.volumeInfo;
    const id = text(item?.id);
    const title = text(info?.title);
    if (!id || !info || !title) return [];
    const identifiers = Array.isArray(info.industryIdentifiers) ? info.industryIdentifiers : [];

    return [{
      id,
      source: "Google Books",
      title,
      authors: Array.isArray(info.authors)
        ? info.authors.filter((author): author is string => typeof author === "string")
        : [],
      coverUrl: coverUrl((info.imageLinks as Record<string, unknown> | undefined)?.medium)
        ?? coverUrl((info.imageLinks as Record<string, unknown> | undefined)?.small)
        ?? coverUrl((info.imageLinks as Record<string, unknown> | undefined)?.thumbnail)
        ?? coverUrl((info.imageLinks as Record<string, unknown> | undefined)?.smallThumbnail),
      publisher: text(info.publisher),
      publishedDate: text(info.publishedDate),
      language: text(info.language),
      isbn: text(identifiers.find(entry => entry?.type === "ISBN_13")?.identifier)
        ?? text(identifiers.find(entry => entry?.type === "ISBN_10")?.identifier),
    }];
  });
}
