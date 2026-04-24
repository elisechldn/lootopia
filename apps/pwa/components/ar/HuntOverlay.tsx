"use client";

import type { HuntGetPayload, SingleResult } from "@repo/types";
import { use } from "react";

type HuntWithSteps = HuntGetPayload<{
    include: { steps: true };
}>;

type Props = {
    hunt: Promise<SingleResult<HuntWithSteps>>;
    stepId?: number;
};

export function HuntOverlay({ hunt, stepId }: Props) {
    const { data } = use(hunt);

    const currentStep = stepId ? data.steps.find((s) => s.id === stepId) : data.steps[0];

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
            <div style={{ fontWeight: "bold" }}>
                <p>{data.title}</p>
                Étape {currentStep.orderNumber} — {currentStep.title}
            </div>
        </div>
    );
}
