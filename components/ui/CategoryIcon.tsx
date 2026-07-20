const SIZE_CLASSES = {
  sm: "h-9 w-9 text-base",
  md: "h-11 w-11 text-xl",
};

export function CategoryIcon({
  icon,
  color,
  size = "sm",
}: {
  icon: string;
  color: string;
  size?: keyof typeof SIZE_CLASSES;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border-2 ${SIZE_CLASSES[size]}`}
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 30%, var(--surface))`,
        borderColor: color,
      }}
    >
      {icon}
    </span>
  );
}
