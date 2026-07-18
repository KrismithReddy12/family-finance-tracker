import { AVATAR_EMOJIS, AVATAR_COLORS } from "@/lib/avatarOptions";
import { Label } from "@/components/ui/Input";

export function AvatarPicker() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Avatar</Label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_EMOJIS.map((emoji, i) => (
            <label
              key={emoji}
              className="cursor-pointer rounded-full p-1 transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 has-checked:ring-2 has-checked:ring-accent has-checked:ring-offset-2 has-checked:ring-offset-surface"
            >
              <input
                type="radio"
                name="avatarEmoji"
                value={emoji}
                defaultChecked={i === 0}
                className="sr-only"
              />
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-page text-xl">
                {emoji}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((color, i) => (
            <label
              key={color}
              className="cursor-pointer rounded-full p-1 transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 has-checked:ring-2 has-checked:ring-accent has-checked:ring-offset-2 has-checked:ring-offset-surface"
            >
              <input
                type="radio"
                name="avatarColor"
                value={color}
                defaultChecked={i === 0}
                className="sr-only"
              />
              <span
                className="block h-8 w-8 rounded-full"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
