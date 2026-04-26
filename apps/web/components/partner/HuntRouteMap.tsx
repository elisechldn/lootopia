"use client";

import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Step } from "./types";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)["_getIconUrl"];
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
    steps: Step[];
}

function createNumberedIcon(n: number) {
    return L.divIcon({
        className: "",
        html: `<div style="
            width:28px;height:28px;border-radius:50%;
            background:#1e293b;color:white;
            display:flex;align-items:center;justify-content:center;
            font-size:12px;font-weight:700;
            border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.35);
        ">${n}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
}

function haversineDistance(a: [number, number], b: [number, number]): number {
    const R = 6371000;
    const dLat = ((b[0] - a[0]) * Math.PI) / 180;
    const dLon = ((b[1] - a[1]) * Math.PI) / 180;
    const lat1 = (a[0] * Math.PI) / 180;
    const lat2 = (b[0] * Math.PI) / 180;
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522];

export default function HuntRouteMap({ steps }: Props) {
    const positioned = steps.filter((s) => s.latitude != null && s.longitude != null);
    const positions: [number, number][] = positioned.map((s) => [s.latitude!, s.longitude!]);

    const totalDistance =
        positions.length > 1
            ? positions.reduce((acc, pos, i) => {
                if (i === 0) return 0;
                return acc + haversineDistance(positions[i - 1]!, pos);
            }, 0)
            : 0;

    const center = positions.length > 0 ? positions[0] : DEFAULT_CENTER;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                    Aperçu de l&apos;itinéraire
                </p>
                {totalDistance > 0 && (
                    <p className="text-xs text-muted-foreground">
                        Distance totale estimée :{" "}
                        <span className="font-semibold text-foreground/80">
                            {totalDistance >= 1000
                                ? `${(totalDistance / 1000).toFixed(1)} km`
                                : `${Math.round(totalDistance)} m`}
                        </span>
                    </p>
                )}
            </div>

            <div className="h-100 rounded-xl overflow-hidden border border-border">
                <MapContainer
                    center={center}
                    zoom={14}
                    style={{ width: "100%", height: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Ligne de l'itinéraire */}
                    {positions.length > 1 && (
                        <Polyline
                            positions={positions}
                            pathOptions={{
                                color: "#1e293b",
                                weight: 2,
                                dashArray: "6 5",
                                opacity: 0.7,
                            }}
                        />
                    )}

                    {/* Marqueurs + cercles de rayon */}
                    {positioned.map((step) => (
                        <div key={step.orderNumber}>
                            <Marker
                                position={[step.latitude!, step.longitude!]}
                                icon={createNumberedIcon(step.orderNumber)}
                            >
                                <Tooltip direction="top" offset={[0, -14]}>
                                    Étape {step.orderNumber}
                                    {step.title ? ` — ${step.title}` : ""}
                                </Tooltip>
                            </Marker>
                            <Circle
                                center={[step.latitude!, step.longitude!]}
                                radius={step.radius}
                                pathOptions={{
                                    color: "#1d4ed8",
                                    fillColor: "#3b82f6",
                                    fillOpacity: 0.08,
                                    weight: 1,
                                }}
                            />
                        </div>
                    ))}
                </MapContainer>
            </div>

            {positioned.length < steps.length && (
                <p className="text-xs text-amber-600">
                    {steps.length - positioned.length} étape(s) sans localisation ne sont pas affichées.
                </p>
            )}
        </div>
    );
}