import { AppStatus, statusLabels } from "@/lib/types";

const statusStyles: Record<AppStatus, string> = {
  available: "bg-accent-light text-accent",
  "in-development": "bg-brand-light text-brand",
  "coming-soon": "bg-amber-light text-amber",
  maintenance: "bg-danger-light text-danger",
  discontinued: "bg-muted-light text-muted",
};

export default function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide font-mono ${statusStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status].toUpperCase()}
    </span>
  );
}
