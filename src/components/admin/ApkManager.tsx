"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createApkUploadTarget,
  confirmApkUpload,
  removeApk,
  setDownloadEnabled,
} from "@/lib/actions/apk";
import { formatFileSize } from "@/lib/types";

const BUCKET = "app-downloads";

export default function ApkManager({
  applicationId,
  initialFilename,
  initialSizeBytes,
  initialUploadedAt,
  initialDownloadEnabled,
}: {
  applicationId: string;
  initialFilename: string | null;
  initialSizeBytes: number | null;
  initialUploadedAt: string | null;
  initialDownloadEnabled: boolean;
}) {
  const [filename, setFilename] = useState(initialFilename);
  const [sizeBytes, setSizeBytes] = useState(initialSizeBytes);
  const [uploadedAt, setUploadedAt] = useState(initialUploadedAt);
  const [downloadEnabled, setDownloadEnabledState] = useState(initialDownloadEnabled);

  const [status, setStatus] = useState<"idle" | "uploading" | "confirming">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const hasApk = Boolean(filename);
  const busy = status !== "idle" || isPending;

  async function handleFileChosen(file: File) {
    setError(null);
    setStatus("uploading");
    try {
      const target = await createApkUploadTarget(
        applicationId,
        file.name,
        file.size,
        file.type || "application/octet-stream"
      );
      if (target.error || !target.path || !target.token) {
        setError(target.error ?? "Could not start the upload.");
        setStatus("idle");
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(target.path, target.token, file);

      if (uploadError) {
        setError(uploadError.message);
        setStatus("idle");
        return;
      }

      setStatus("confirming");
      const confirmed = await confirmApkUpload(applicationId, target.path, file.name);
      if (confirmed.error) {
        setError(confirmed.error);
        setStatus("idle");
        return;
      }

      setFilename(confirmed.filename ?? file.name);
      setSizeBytes(confirmed.sizeBytes ?? file.size);
      setUploadedAt(confirmed.uploadedAt ?? new Date().toISOString());
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setStatus("idle");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeApk(applicationId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setFilename(null);
      setSizeBytes(null);
      setUploadedAt(null);
      setDownloadEnabledState(false);
    });
  }

  function handleToggleDownloadEnabled(next: boolean) {
    setError(null);
    setDownloadEnabledState(next); // optimistic
    startTransition(async () => {
      const result = await setDownloadEnabled(applicationId, next);
      if (result.error) {
        setError(result.error);
        setDownloadEnabledState(!next); // revert
      }
    });
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink">APK / Download</label>

      {hasApk ? (
        <div className="mt-2 rounded-xl border border-border bg-bg p-4">
          <p className="text-sm font-medium text-ink">{filename}</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-soft">
            <div className="flex justify-between sm:block">
              <dt className="inline sm:block">Size</dt>
              <dd className="inline sm:block">{formatFileSize(sizeBytes) ?? "Unknown"}</dd>
            </div>
            <div className="flex justify-between sm:block">
              <dt className="inline sm:block">Uploaded</dt>
              <dd className="inline sm:block">
                {uploadedAt ? new Date(uploadedAt).toLocaleString() : "Unknown"}
              </dd>
            </div>
          </dl>

          <label className="mt-3 flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={downloadEnabled}
              disabled={busy}
              onChange={(e) => handleToggleDownloadEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Download enabled on the public site
          </label>
          <p className="mt-1 text-xs text-ink-soft">
            When on, the public site can serve a short-lived signed link to
            this APK — unless the application is purchase-gated, in which
            case it is only served through a valid download grant for a
            confirmed order.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand hover:text-brand">
              {busy ? "Working\u2026" : "Replace APK"}
              <input
                ref={inputRef}
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                disabled={busy}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChosen(file);
                }}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={handleRemove}
              className="rounded-full border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-light disabled:opacity-60"
            >
              {isPending ? "Removing\u2026" : "Remove APK"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 rounded-xl border border-dashed border-border bg-bg p-4">
          <p className="text-xs text-ink-soft">No APK uploaded yet.</p>
          <label className="mt-3 inline-block cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand hover:text-brand">
            {busy ? "Working\u2026" : "Choose APK"}
            <input
              ref={inputRef}
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              disabled={busy}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChosen(file);
              }}
            />
          </label>
        </div>
      )}

      {status === "uploading" && (
        <p className="mt-2 text-xs text-ink-soft">Uploading to storage\u2026</p>
      )}
      {status === "confirming" && (
        <p className="mt-2 text-xs text-ink-soft">Confirming upload\u2026</p>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <p className="mt-1 text-xs text-ink-soft">
        .apk files up to 150MB. Stored privately; never exposed as a public
        URL.
      </p>
    </div>
  );
}
