"use client";

import { useActionState, useRef, useState } from "react";
import { uploadAppIcon, removeAppIcon, type AssetActionState } from "@/lib/actions/assets";

const initialState: AssetActionState = {};

export default function IconUploadField({
  applicationId,
  initialUrl,
}: {
  applicationId: string;
  initialUrl: string | null;
}) {
  const boundUpload = uploadAppIcon.bind(null, applicationId);
  const boundRemove = removeAppIcon.bind(null, applicationId);
  const [uploadState, uploadAction, uploading] = useActionState(boundUpload, initialState);
  const [removeState, removeAction, removing] = useActionState(boundRemove, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const currentUrl =
    removeState.url !== undefined
      ? removeState.url
      : uploadState.url !== undefined
      ? uploadState.url
      : initialUrl;

  const error = uploadState.error || removeState.error;

  return (
    <div>
      <label className="block text-sm font-medium text-ink">App Icon</label>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-bg">
          {localPreview || currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={localPreview ?? currentUrl ?? ""}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-ink-soft">No icon</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <form
            ref={formRef}
            action={uploadAction}
            onSubmit={() => {
              /* keep the local object-URL preview until the server confirms */
            }}
          >
            <input
              type="file"
              name="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setLocalPreview(URL.createObjectURL(file));
                  formRef.current?.requestSubmit();
                }
              }}
              className="text-xs text-ink-soft file:mr-3 file:rounded-full file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
            />
          </form>

          {currentUrl && (
            <form action={removeAction}>
              <button
                type="submit"
                disabled={removing}
                className="w-fit rounded-full border border-danger/40 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger-light disabled:opacity-60"
              >
                {removing ? "Removing\u2026" : "Remove Icon"}
              </button>
            </form>
          )}
        </div>
      </div>

      {uploading && <p className="mt-2 text-xs text-ink-soft">Uploading…</p>}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <p className="mt-1 text-xs text-ink-soft">PNG, JPG, or WebP. Up to 5MB.</p>
    </div>
  );
}
