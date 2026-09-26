"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleActive, softDeleteApp } from "@/lib/actions/apps";
import ConfirmDialog from "./ConfirmDialog";

export default function AppRowActions({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/apps/${id}/edit`}
        className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
      >
        Edit
      </Link>

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await toggleActive(id, !active);
          })
        }
        className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-ink hover:border-brand hover:text-brand disabled:opacity-60"
      >
        {active ? "Deactivate" : "Activate"}
      </button>

      <ConfirmDialog
        title="Delete Application?"
        description={`Are you sure you want to delete "${name}"? This application will no longer appear on the public website.`}
        confirmLabel="Delete Application"
        onConfirm={async () => {
          await softDeleteApp(id);
        }}
        trigger={
          <span className="inline-flex rounded-full border border-danger/40 px-4 py-1.5 text-xs font-semibold text-danger hover:bg-danger-light">
            Delete
          </span>
        }
      />
    </div>
  );
}
