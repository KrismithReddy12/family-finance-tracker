export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-status-critical/10 px-4 py-3 text-sm font-medium text-status-critical">
      <span aria-hidden>⚠️</span>
      <span>{children}</span>
    </div>
  );
}
