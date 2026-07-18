export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-hairline bg-surface shadow-sm ${className}`}>
      {children}
    </div>
  );
}
