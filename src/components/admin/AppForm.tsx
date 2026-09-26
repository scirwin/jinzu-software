"use client";

import { statusOptions, statusLabels, type AppRecord, type AppScreenshot } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import IconUploadField from "@/components/admin/IconUploadField";
import ScreenshotManager from "@/components/admin/ScreenshotManager";

export default function AppForm({
  action,
  pending,
  error,
  initial,
  applicationId,
  screenshots,
}: {
  action: (formData: FormData) => void;
  pending: boolean;
  error?: string;
  initial?: Partial<AppRecord>;
  /** Set only in edit mode — enables icon/screenshot management, which requires an existing app row. */
  applicationId?: string;
  screenshots?: AppScreenshot[];
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-bg p-5">
        {applicationId ? (
          <div className="space-y-6">
            <IconUploadField applicationId={applicationId} initialUrl={initial?.icon_url ?? null} />
            <ScreenshotManager applicationId={applicationId} screenshots={screenshots ?? []} />
          </div>
        ) : (
          <p className="text-sm text-ink-soft">
            Save this application first — then reopen it here to upload an icon and screenshots.
          </p>
        )}
      </div>

      <form action={action} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Application Name" name="name" required defaultValue={initial?.name} />
        <Field label="Slug" name="slug" required defaultValue={initial?.slug} hint="Used in the URL, e.g. utang-tracker" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tagline" name="tagline" defaultValue={initial?.tagline} />
        <Field label="Category" name="category" defaultValue={initial?.category} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-ink">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "coming-soon"}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
        <Field label="Version" name="version" defaultValue={initial?.version ?? ""} placeholder="1.0.0" />
        <Field
          label="Display Order"
          name="display_order"
          type="number"
          defaultValue={String(initial?.display_order ?? 0)}
        />
      </div>

      <Field
        label="Short Description"
        name="short_description"
        as="textarea"
        rows={2}
        defaultValue={initial?.short_description}
        hint="Shown on app cards across the site."
      />

      <Field
        label="Full Description"
        name="description"
        as="textarea"
        rows={4}
        defaultValue={initial?.description}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Download URL"
          name="download_url"
          type="url"
          defaultValue={initial?.download_url ?? ""}
          hint="Leave blank until a real download link exists."
        />
        <Field
          label="Website / App URL"
          name="website_url"
          type="url"
          defaultValue={initial?.website_url ?? ""}
        />
      </div>

      <Field
        label="Release Date"
        name="release_date"
        type="date"
        defaultValue={initial?.release_date ?? ""}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Key Features"
          name="features"
          as="textarea"
          rows={4}
          defaultValue={initial?.features?.join("\n")}
          hint="One feature per line."
        />
        <Field
          label="Who It's For"
          name="who_for"
          as="textarea"
          rows={4}
          defaultValue={initial?.who_for?.join("\n")}
          hint="One audience per line."
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial?.featured ?? false}
            className="h-4 w-4 rounded border-border"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initial?.active ?? true}
            className="h-4 w-4 rounded border-border"
          />
          Active (visible on the public website)
        </label>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving\u2026" : "Save Changes"}
        </Button>
      </div>
    </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  defaultValue,
  type = "text",
  as = "input",
  rows,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          required={required}
          rows={rows}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
      )}
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
