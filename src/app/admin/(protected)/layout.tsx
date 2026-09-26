import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg py-20">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-wide text-danger">
            Configuration Needed
          </p>
          <h1 className="mt-2 text-lg font-semibold text-ink">
            Supabase isn&apos;t configured
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            The admin panel needs NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY set in .env.local at the project
            root. Add them and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-1 bg-admin-bg">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-admin-border bg-admin-surface p-5 lg:flex">
        <Link href="/admin" className="font-display text-base font-bold text-ink-inverse">
          JinZu<span className="text-brand">.</span>{" "}
          <span className="font-mono text-[10px] font-normal uppercase tracking-wide text-white/40">
            Admin
          </span>
        </Link>
        <AdminNav />
        <div className="mt-auto pt-6">
          <p className="truncate text-xs text-white/40">{user.email}</p>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-full border border-admin-border px-4 py-2 text-xs font-semibold text-ink-inverse hover:border-white/30"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-admin-border bg-admin-surface px-5 lg:hidden">
          <Link href="/admin" className="font-display text-base font-bold text-ink-inverse">
            JinZu Admin
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-admin-border px-3 py-1.5 text-xs font-semibold text-ink-inverse"
            >
              Sign Out
            </button>
          </form>
        </header>
        <nav className="flex gap-2 border-b border-admin-border bg-admin-surface px-5 py-3 lg:hidden">
          <Link href="/admin" className="rounded-full px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5">
            Dashboard
          </Link>
          <Link href="/admin/apps" className="rounded-full px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5">
            Manage Applications
          </Link>
        </nav>
        <main className="flex-1 bg-bg">
          <div className="container-page py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
