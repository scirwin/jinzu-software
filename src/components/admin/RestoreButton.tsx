"use client";

import { useTransition } from "react";
import { restoreApp } from "@/lib/actions/apps";

export default function RestoreButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => restoreApp(id))}
      className="rounded-full border border-accent/40 px-4 py-1.5 text-xs font-semibold text-accent hover:bg-accent-light disabled:opacity-60"
    >
      {isPending ? "Restoring\u2026" : "Restore"}
    </button>
  );
}
