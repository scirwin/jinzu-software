import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Server-only Supabase client authenticated with the service-role key.
 *
 * This bypasses Row Level Security entirely, so it must only ever be
 * imported from server-side code (server actions, route handlers, server
 * components) that itself re-validates everything the RLS policies would
 * otherwise have enforced. The `server-only` import above makes any
 * accidental import from a client component fail at build time.
 *
 * Unlike `./server.ts` and `./client.ts`, this client does not read or
 * write cookies and carries no end-user session — it is not "logged in"
 * as anyone, it simply has elevated database privileges. Do not use it
 * for anything that should run as the visiting user.
 */
export function createServiceClient() {
  const { url } = getSupabaseEnv();

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY. " +
        "Add it to .env.local at the project root (see .env.local.example), " +
        "then restart the dev server. This key must come from Supabase " +
        "project Settings > API and must never be prefixed with NEXT_PUBLIC_."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
