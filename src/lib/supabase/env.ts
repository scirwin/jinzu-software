/**
 * Reads and validates the public Supabase environment variables.
 * Throws a clear, actionable error naming exactly which variable(s)
 * are missing, instead of the generic error @supabase/ssr throws
 * when passed an empty string.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(
        ", "
      )}. Add them to .env.local at the project root (see .env.local.example), then restart the dev server.`
    );
  }

  return { url: url!, anonKey: anonKey! };
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
