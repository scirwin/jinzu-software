"use client";

import { useActionState } from "react";
import { updateApp, type AppFormState } from "@/lib/actions/apps";
import AppForm from "@/components/admin/AppForm";
import type { AppRecord, AppScreenshot } from "@/lib/types";

const initialState: AppFormState = {};

export default function EditApplicationForm({
  app,
  screenshots,
}: {
  app: AppRecord;
  screenshots: AppScreenshot[];
}) {
  const boundAction = updateApp.bind(null, app.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <AppForm
      action={formAction}
      pending={pending}
      error={state?.error}
      initial={app}
      applicationId={app.id}
      screenshots={screenshots}
    />
  );
}
