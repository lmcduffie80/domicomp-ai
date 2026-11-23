"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { money } from "@/lib/format";
import type { Comp, SubjectProperty } from "@/lib/schemas";

export default function CompsMap({ subject, comps }: { subject: SubjectProperty | null; comps: Comp[] }) {
  const points = comps.filter((c) => c.latitude != null && c.longitude != null);
  const center: [number, number] | null =
    subject?.latitude != null && subject.longitude != null
      ? [subject.latitude, subject.longitude]
      : points[0]
        ? [points[0].latitude!, points[0].longitude!]
        : null;

  if (!center) {
    return <div className="grid h-72 place-items-center rounded-lg border text-sm text-muted-foreground">No map coordinates</div>;
  }

  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom={false} className="z-0 h-72 w-full rounded-lg border md:h-96">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c.latitude!, c.longitude!]}
          radius={8}
          pathOptions={{
            color: c.included ? "#2563eb" : "#9ca3af",
            fillColor: c.included ? "#3b82f6" : "#d1d5db",
            fillOpacity: 0.85,
          }}
        >
          <Tooltip>
            {c.formattedAddress}
            <br />
            {money(c.price)} · {c.squareFootage ?? "?"} sq ft · {c.status ?? ""}
          </Tooltip>
        </CircleMarker>
      ))}
      <CircleMarker center={center} radius={11} pathOptions={{ color: "#047857", fillColor: "#10b981", fillOpacity: 1 }}>
        <Tooltip permanent direction="top">
          Subject
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
