export default function AppWindowMockup() {
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
          jinzu &mdash; suite overview
        </span>
        <span className="ml-auto rounded-full bg-muted-light px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted">
          Demo Preview
        </span>
      </div>

      <div className="p-5">
        {/* top summary row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand-light p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">
              Applications
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">4</p>
          </div>
          <div className="rounded-xl bg-accent-light p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-accent">
              In Development
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">2</p>
          </div>
        </div>

        {/* generic activity chart */}
        <div className="mt-4 flex h-20 items-end gap-2 rounded-xl border border-border p-3">
          {[40, 65, 30, 80, 55, 70, 45].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-brand/80"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* product suite rows */}
        <div className="mt-4 space-y-2">
          {[
            { name: "LendZu", status: "Available", tone: "text-accent" },
            { name: "JIMS", status: "Building", tone: "text-brand" },
            { name: "Expense Manager", status: "Planned", tone: "text-amber" },
          ].map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-ink-soft/20" />
                <span className="text-xs font-medium text-ink">
                  {row.name}
                </span>
              </div>
              <span className={`font-mono text-[10px] ${row.tone}`}>
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
