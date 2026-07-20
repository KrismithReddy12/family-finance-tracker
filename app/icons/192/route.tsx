import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

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
          backgroundColor: "#ff4d6d",
          color: "#ffffff",
          fontSize: 110,
          fontWeight: 700,
        }}
      >
        F
      </div>
    ),
    size
  );
}
