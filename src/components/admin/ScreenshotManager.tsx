"use client";

import { useActionState, useRef, useTransition } from "react";
import {
  uploadAppScreenshots,
  removeAppScreenshot,
  moveAppScreenshot,
  type ScreenshotUploadState,
} from "@/lib/actions/assets";
import type { AppScreenshot } from "@/lib/types";

const initialState: ScreenshotUploadState = {};

export default function ScreenshotManager({
  applicationId,
  screenshots,
}: {
  applicationId: string;
  screenshots: AppScreenshot[];
}) {
  const boundUpload = uploadAppScreenshots.bind(null, applicationId);
  const [uploadState, uploadAction, uploading] = useActionState(boundUpload, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <label className="block text-sm font-medium text-ink">Screenshots</label>
      <p className="mt-1 text-xs text-ink-soft">
        Upload real product screenshots — PNG, JPG, or WebP, up to 5MB each.
      </p>

      <form ref={formRef} action={uploadAction} className="mt-2">
        <input
          type="file"
          name="files"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={uploading}
          onChange={() => formRef.current?.requestSubmit()}
          className="text-xs text-ink-soft file:mr-3 file:rounded-full file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
        />
      </form>
      {uploading && <p className="mt-2 text-xs text-ink-soft">Uploading…</p>}
      {uploadState.error && <p className="mt-2 text-xs text-danger">{uploadState.error}</p>}

      {screenshots.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {screenshots.map((shot, index) => (
            <div key={shot.id} className="rounded-xl border border-border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.url}
                alt=""
                className="h-28 w-full rounded-lg border border-border object-cover"
              />
              <div className="mt-2 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0 || isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await moveAppScreenshot(applicationId, shot.id, "up");
                      })
                    }
                    className="rounded border border-border px-2 py-0.5 text-xs text-ink-soft disabled:opacity-40"
                    aria-label="Move screenshot earlier"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    disabled={index === screenshots.length - 1 || isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await moveAppScreenshot(applicationId, shot.id, "down");
                      })
                    }
                    className="rounded border border-border px-2 py-0.5 text-xs text-ink-soft disabled:opacity-40"
                    aria-label="Move screenshot later"
                  >
                    &darr;
                  </button>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await removeAppScreenshot(applicationId, shot.id);
                    })
                  }
                  className="rounded-full border border-danger/40 px-2 py-0.5 text-xs font-semibold text-danger hover:bg-danger-light disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
