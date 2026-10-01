export default function UtangTrackerPreview() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
          Example Dashboard Preview
        </p>
        <span className="rounded-full bg-muted-light px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
          Illustrative Only
        </span>
      </div>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Below is an example of the kind of information LendZu can
        organize &mdash; not real user or company data.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-brand">
            Outstanding (example)
          </p>
          <p className="mt-1 text-lg font-semibold text-ink">
            Sample balance across active loans
          </p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-accent">
            Collected (example)
          </p>
          <p className="mt-1 text-lg font-semibold text-ink">
            Sample total of recorded payments
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {[
          { label: "Sample Borrower 1", note: "Payment recorded" },
          { label: "Sample Borrower 2", note: "Balance due" },
          { label: "Sample Borrower 3", note: "Overdue reminder" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <span className="text-sm font-medium text-ink">{row.label}</span>
            <span className="font-mono text-xs text-ink-soft">{row.note}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-ink-soft">
        Receivables, payables, and expenses can be tracked the same way,
        organized around your own borrowers and records.
      </p>
    </div>
  );
}
