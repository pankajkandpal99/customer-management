import { NextResponse, NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/inngest")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("jwt")?.value;

  const isLoggedIn = !!token;

  const protectedPaths = ["/dashboard"];
  const isProtectedRoute = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  const publicPaths = ["/login", "/register", "/"];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isPublicRoute = publicPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (!isLoggedIn && isProtectedRoute) {
    const redirectUrl = new URL("/login", req.nextUrl.origin);
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoggedIn) {
    try {
      const payload = await verifyJWT(token, process.env.JWT_SECRET_KEY!); // Custom JWT verification logic for Edge Runtime

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("userId", payload.userId);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("Invalid token:", error);
      const response = NextResponse.redirect(
        new URL("/login", req.nextUrl.origin)
      );
      response.cookies.delete("jwt");
      return response;
    }
  }

  return NextResponse.next();
}

async function verifyJWT(token: string, secret: string) {
  const [header, payload, signature] = token.split(".");
  const data = `${header}.${payload}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(signature),
    encoder.encode(data)
  );

  if (!isValid) {
    throw new Error("Invalid token");
  }

  return JSON.parse(atob(payload));
}

function base64UrlDecode(str: string) {
  return Uint8Array.from(atob(str.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
    c.charCodeAt(0)
  );
}

export const config = {
  matcher: ["/((?!api/inngest|api|_next/static|_next/image|favicon.ico).*)"], // Ignore Inngest API
};
