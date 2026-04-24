'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link                from 'next/link';
import type { NearbyHunt } from '@/services/hunt.service';

// Fix Leaflet's default icon path broken by webpack bundling
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

type Props = {
  hunts: NearbyHunt[];
  center: { lat: number; lon: number };
};

export default function LeafletMap({ hunts, center }: Props) {
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap lat={center.lat} lon={center.lon} />

      {hunts
        .filter((h) => h.latitude != null && h.longitude != null)
        .map((hunt) => (
          <Marker key={hunt.id} position={[hunt.latitude!, hunt.longitude!]}>
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-semibold text-sm">{hunt.title}</p>
                {hunt.shortDescription && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {hunt.shortDescription}
                  </p>
                )}
                <Link
                  href={`/hunts/${hunt.id}`}
                  className="block mt-2 text-xs text-blue-600 underline"
                >
                  Voir la chasse
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
