import { getSession } from "@/services/auth";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const { data: session, error } = await getSession();
    if (error) throw error;
    const user = session?.user;
    return Response.json({ user: user ? { id: user.id, name: user.name, email: user.email } : null }, { headers });
  } catch {
    return Response.json({ error: "Não foi possível verificar sua sessão. Tente novamente." }, { status: 503, headers });
  }
}
