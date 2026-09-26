import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Visible only when NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are missing. Makes a misconfiguration obvious instead of silently
 * rendering an empty apps list.
 */
export default function SupabaseConfigNotice() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="border-b border-amber/30 bg-amber-light">
      <div className="container-page py-3 text-center text-xs font-medium text-amber">
        Supabase isn&apos;t configured yet {"\u2014"} add NEXT_PUBLIC_SUPABASE_URL and
        NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local. Application data will be
        empty until then.
      </div>
    </div>
  );
}
