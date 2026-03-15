"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
    latitude: number | null;
    longitude: number | null;
    radius: number;
    orderNumber: number;
    onChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522];

export default function StepMap({ latitude, longitude, radius, orderNumber, onChange }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const onChangeRef = useRef(onChange);

    // Garde le callback à jour sans recréer le listener
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Init carte — une seule fois
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: DEFAULT_CENTER,
            zoom: 15,
            doubleClickZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        map.on("click", (e: L.LeafletMouseEvent) => {
            onChangeRef.current(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Marqueur + cercle
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
        if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }

        if (latitude != null && longitude != null) {
            const pos: [number, number] = [latitude, longitude];

            const icon = L.divIcon({
                className: "",
                html: `<div style="width:28px;height:28px;border-radius:50%;background:#1e293b;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);">${orderNumber}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            });

            markerRef.current = L.marker(pos, { icon }).addTo(map);
            circleRef.current = L.circle(pos, {
                radius,
                color: "#16a34a",
                fillColor: "#22c55e",
                fillOpacity: 0.15,
                weight: 2,
            }).addTo(map);

            map.setView(pos, map.getZoom());
        }
    }, [latitude, longitude, radius, orderNumber]);

    return (
        <div
            ref={containerRef}
            className="h-100 rounded-xl overflow-hidden border border-gray-200"
            style={{ cursor: "crosshair" }}
        />
    );
}