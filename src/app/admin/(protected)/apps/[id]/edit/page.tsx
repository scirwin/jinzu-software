import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditApplicationForm from "@/components/admin/EditApplicationForm";
import type { AppRecord } from "@/lib/types";

export const revalidate = 0;

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const app = data as AppRecord;

  const { data: screenshotRows } = await supabase
    .from("app_screenshots")
    .select("*")
    .eq("application_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-2xl">
      <Link href="/admin/apps" className="text-sm font-medium text-ink-soft hover:text-brand">
        &larr; Manage Applications
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-ink">
        Edit {app.name}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">/{app.slug}</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <EditApplicationForm app={app} screenshots={screenshotRows ?? []} />
      </div>
    </div>
  );
}
