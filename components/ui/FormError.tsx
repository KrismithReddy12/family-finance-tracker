export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="rounded-lg border border-status-critical/30 bg-status-critical/10 px-3 py-2 text-sm text-status-critical">
      {children}
    </div>
  );
}
