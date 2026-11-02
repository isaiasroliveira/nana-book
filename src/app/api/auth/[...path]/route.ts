import { getAuth } from "@/services/auth";

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: Request, context: Context) {
  try {
    const method = request.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    const response = await getAuth().handler()[method](request, context);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return Response.json({ message: "Não foi possível acessar sua conta. Tente novamente." }, {
      status: 503, headers: { "Cache-Control": "private, no-store" },
    });
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE, handle as PATCH };
