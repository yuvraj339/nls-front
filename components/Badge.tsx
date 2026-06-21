type Variant = "success" | "warning" | "danger" | "neutral";

const styles: Record<Variant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger:  "bg-danger/10 text-danger border-danger/20",
  neutral: "bg-surface text-text-muted border-border",
};

export default function Badge({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]}`}
    >
      {label}
    </span>
  );
}