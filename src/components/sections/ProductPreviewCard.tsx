export default function ProductPreviewCard() {
  return (
    <div
      className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(11,18,32,0.10)]"
      aria-hidden="true"
    >
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] text-ink-soft">
          LendZu
        </span>
        <span className="ml-auto rounded-full bg-muted-light px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted">
          Demo Preview
        </span>
      </div>

      <div className="p-5">
        <p className="text-xs leading-relaxed text-ink-soft">
          An example of how LendZu organizes lending records &mdash;
          illustrative layout only, not real user or company data.
        </p>

        {/* sample borrower rows */}
        <div className="mt-4 space-y-2">
          {[
            { name: "Sample Borrower 1", note: "Payment recorded" },
            { name: "Sample Borrower 2", note: "Balance due" },
            { name: "Sample Borrower 3", note: "Overdue reminder" },
          ].map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-ink-soft/20" />
                <span className="text-xs font-medium text-ink">
                  {row.name}
                </span>
              </div>
              <span className="font-mono text-[10px] text-ink-soft">
                {row.note}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5">
          <span className="text-xs font-medium text-ink-soft">
            LendZu
          </span>
          <span className="font-mono text-[10px] text-accent">Available</span>
        </div>
      </div>
    </div>
  );
}
