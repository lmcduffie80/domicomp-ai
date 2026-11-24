import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: "#0d1f17",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* House shape */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        {/* Roof */}
        <path d="M10 2L2 9h2v9h4v-5h4v5h4V9h2L10 2z" fill="white" />
      </svg>
    </div>,
    { ...size }
  );
}
