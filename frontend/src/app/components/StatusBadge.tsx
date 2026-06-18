interface StatusBadgeProps {
  status: string;
  small?: boolean;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-green-500/15 text-green-400 border border-green-500/30" },
  runtime_error: { label: "Runtime Error", cls: "bg-red-500/15 text-red-400 border border-red-500/30" },
  compile_error: { label: "Compile Error", cls: "bg-orange-500/15 text-orange-400 border border-orange-500/30" },
  timeout: { label: "Timeout", cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" },
};

export default function StatusBadge({ status, small }: StatusBadgeProps) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "bg-muted text-muted-foreground border border-border" };
  return (
    <span className={`inline-flex items-center rounded-full font-mono font-medium ${small ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"} ${s.cls}`}>
      <span className={`mr-1.5 inline-block w-1.5 h-1.5 rounded-full ${
        status === "completed" ? "bg-green-400" :
        status === "runtime_error" ? "bg-red-400" :
        status === "compile_error" ? "bg-orange-400" :
        status === "timeout" ? "bg-yellow-400" : "bg-muted-foreground"
      }`} />
      {s.label}
    </span>
  );
}
