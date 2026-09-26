import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root proxy (formerly `middleware.ts`, renamed by Next.js 16 — the
 * `middleware` file convention is deprecated and silently ignored at
 * runtime, so this is a required file move, not a cosmetic rename).
 *
 * Responsible for Supabase SSR session refresh on every matched request
 * (per @supabase/ssr's expected usage). `updateSession()` also contains a
 * best-effort redirect for unauthenticated visits to /admin/* — this is a
 * defense-in-depth convenience, NOT the authoritative guard. The
 * authoritative admin route guard remains the server-side `getUser()`
 * check in `src/app/admin/(protected)/layout.tsx`, backed by Supabase RLS.
 * Do not remove that layout check in reliance on this proxy.
 *
 * The `proxy` runtime is always nodejs (not configurable, no edge
 * runtime) — fine here since `updateSession()` already needs Node APIs.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - common static asset extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
