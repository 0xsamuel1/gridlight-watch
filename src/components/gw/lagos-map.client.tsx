import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";

import { stateColorVar } from "@/components/gw/status-badge";
import type { Neighbourhood } from "@/lib/types";

/** Map marker: a coloured pulse pin built as a Leaflet divIcon. */
function markerIcon(n: Neighbourhood, active: boolean) {
  const color = stateColorVar(n.state);
  const size = active ? 26 : 20;
  return L.divIcon({
    className: "gw-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <span style="position:relative;display:grid;place-items:center;width:${size}px;height:${size}px;">
        <span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:.28;animation:pulse-ring 2.4s cubic-bezier(.4,0,.6,1) infinite;"></span>
        <span style="position:relative;width:${size * 0.55}px;height:${size * 0.55}px;border-radius:9999px;background:${color};box-shadow:0 0 0 2.5px white, 0 2px 6px rgba(7,17,31,.35);"></span>
      </span>`,
  });
}

function FlyTo({ target }: { target: Neighbourhood | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 13, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function LagosMapClient({
  areas,
  selectedId,
  onSelect,
  zoom = 11,
}: {
  areas: Neighbourhood[];
  selectedId?: string | null;
  onSelect?: (area: Neighbourhood) => void;
  zoom?: number;
}) {
  const selected = areas.find((a) => a.id === selectedId) ?? null;

  return (
    <MapContainer
      center={[6.5244, 3.3792]}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-full w-full rounded-xl"
      attributionControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO'
      />
      <FlyTo target={selected} />
      {areas.map((area) => (
        <Marker
          key={area.id}
          position={[area.lat, area.lng]}
          icon={markerIcon(area, area.id === selectedId)}
          alt={`${area.name} power status marker`}
          eventHandlers={{ click: () => onSelect?.(area) }}
        >
          <Tooltip direction="top" offset={[0, -12]}>
            <span className="text-xs font-semibold">{area.name}</span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
