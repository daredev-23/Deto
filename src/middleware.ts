import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Dashboard: solo BUSINESS_OWNER
    if (path.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (token.role !== "BUSINESS_OWNER") {
        return NextResponse.redirect(new URL("/explorar", req.url));
      }
    }

    // Mis citas: usuarios autenticados
    if (path.startsWith("/mis-citas")) {
      if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/dashboard") || path.startsWith("/mis-citas")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/mis-citas/:path*"],
};
