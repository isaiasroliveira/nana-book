import { getAuth } from "@/services/auth";
import { validPassword } from "@/services/password-policy";

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: Request, context: Context) {
  try {
    const path = (await context.params).path.join("/");
    if (request.method === "POST" && (path === "sign-up/email" || path === "reset-password")) {
      if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
        return Response.json({ message: "Dados inválidos." }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
      }
      const reader = request.clone().body?.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      if (!reader) return Response.json({ message: "Dados inválidos." }, { status: 400 });
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 65536) { void reader.cancel(); return Response.json({ message: "Dados inválidos." }, { status: 400 }); }
        chunks.push(value);
      }
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return Response.json({ message: "Dados inválidos." }, { status: 400 }); }
      const password = path === "sign-up/email" ? input?.password : input?.newPassword;
      if (typeof password !== "string" || !validPassword(password)) return Response.json({ message: "A senha não atende aos requisitos." }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
    }
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
