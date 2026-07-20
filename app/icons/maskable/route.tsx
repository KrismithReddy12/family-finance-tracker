import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/**
 * Maskable icons must be a full-bleed background (no rounding of our own -
 * the OS applies its own mask shape) with the foreground content kept inside
 * the centered ~80% "safe zone" so it survives circular/squircle cropping.
 */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#8b5cf6",
          color: "#ffffff",
          fontSize: 180,
          fontWeight: 700,
        }}
      >
        F
      </div>
    ),
    size
  );
}
