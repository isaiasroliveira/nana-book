import type { NextRequest } from "next/server";
import { getAuth } from "@/services/auth";

export default function proxy(request: NextRequest) {
  return getAuth().middleware({
    loginUrl: "/auth/sign-in",
    publicRoutes: ["/", "/api/books", "/api/reviews", "/api/session"],
  })(request);
}

export const config = { matcher: ["/", "/auth/:path*", "/api/:path*"] };
