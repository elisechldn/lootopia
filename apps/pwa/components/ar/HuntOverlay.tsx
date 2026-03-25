"use client";

import type { HuntGetPayload, SingleResult } from "@repo/types";
import { use, useRef } from "react";
import { useARStore } from '@/store/arStore'

type HuntWithSteps = HuntGetPayload<{
    include: { steps: true };
}>;

export function HuntOverlay({ hunt }: { hunt: Promise<SingleResult<HuntWithSteps>> }) {
    const coords = useARStore((s) => s.coords);
    const { data } = use(hunt);
    console.log("data ==> ", data)
    const currentStep = data.steps[0]; // step 1 (orderNumber 1 est déjà trié par l'API)

    if (!currentStep) return null;

    return (
        <div
            style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                maxWidth: "260px",
            }}
        >

            <div style={{ fontWeight: "bold"}}><p>{data.title}</p>
                Étape {currentStep.orderNumber} — {currentStep.title}
            </div>
            <div style={{ opacity: 0.85 }}>{currentStep.clue}</div>
            <div style={{ opacity: 0.85 }}>Lat : {currentStep.latitude}</div>
            <div style={{ opacity: 0.85 }}>Lon : {currentStep.longitude}</div>
            <div style={{ opacity: 0.85 }}>
                <div style={{ fontWeight: "bold"}}>
                    Position actuelle
                </div>
                <div>Lat : {coords?.lat || 'null'}</div>
                <div>Lon : {coords?.long || 'null'}</div>
            </div>
        </div>
    );
}
