export default function StatCard({
    label,
    value,
    accent,
  }: {
    label: string;
    value: number | string;
    accent?: "success" | "warning" | "danger" | "accent";
  }) {
    const colorMap = {
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      accent: "text-accent",
    };
    return (
      <div className="bg-surface border border-border rounded-lg p-5">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">{label}</p>
        <p
          className={`text-3xl font-bold font-mono ${
            accent ? colorMap[accent] : "text-text-primary"
          }`}
        >
          {value}
        </p>
      </div>
    );
  }