import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/categoryOptions";
import { Label } from "@/components/ui/Input";

export function IconColorPicker({
  defaultIcon,
  defaultColor,
}: {
  defaultIcon?: string;
  defaultColor?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ICONS.map((icon, i) => (
            <label
              key={icon}
              className="cursor-pointer rounded-full p-1 transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 has-checked:ring-2 has-checked:ring-accent has-checked:ring-offset-2 has-checked:ring-offset-surface"
            >
              <input
                type="radio"
                name="icon"
                value={icon}
                defaultChecked={defaultIcon ? defaultIcon === icon : i === 0}
                className="sr-only"
              />
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-page text-xl">
                {icon}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((color, i) => (
            <label
              key={color}
              className="cursor-pointer rounded-full p-1 transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 has-checked:ring-2 has-checked:ring-accent has-checked:ring-offset-2 has-checked:ring-offset-surface"
            >
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={defaultColor ? defaultColor === color : i === 0}
                className="sr-only"
              />
              <span className="block h-8 w-8 rounded-full" style={{ backgroundColor: color }} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
