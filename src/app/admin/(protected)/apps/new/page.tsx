"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createApp, type AppFormState } from "@/lib/actions/apps";
import AppForm from "@/components/admin/AppForm";

const initialState: AppFormState = {};

export default function NewApplicationPage() {
  const [state, formAction, pending] = useActionState(createApp, initialState);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/apps" className="text-sm font-medium text-ink-soft hover:text-brand">
        &larr; Manage Applications
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-ink">Add Application</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Create a new JinZu application entry.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <AppForm action={formAction} pending={pending} error={state?.error} />
      </div>
    </div>
  );
}
