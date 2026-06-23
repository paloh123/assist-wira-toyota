import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "pending" | "planned" | "exported";
  className?: string;
}) {
  const variants = {
    default:   "bg-secondary text-secondary-foreground",
    success:   "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    warning:   "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    danger:    "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
    pending:   "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    planned:   "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30",
    exported:  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
