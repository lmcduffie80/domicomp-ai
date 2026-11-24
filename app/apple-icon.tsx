import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "#0d1f17",
        borderRadius: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* House + subtle "AI" spark */}
      <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
        {/* House body */}
        <path d="M55 10L8 50h12v50h25V72h20v28h25V50h12L55 10z" fill="white" />
        {/* Small AI dot accent */}
        <circle cx="85" cy="22" r="7" fill="#4ade80" />
      </svg>
    </div>,
    { ...size }
  );
}
