"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Step } from "./types";
import { Clue } from "@repo/types";
import StepItem from "./StepItem";

const HuntRouteMap = dynamic(() => import("./HuntRouteMap"), {
    ssr: false,
    loading: () => (
        <div className="h-100 rounded-xl bg-muted border border-border flex items-center justify-center">
            <p className="text-sm text-muted-foreground/70">Chargement de la carte...</p>
        </div>
    ),
});

interface Props {
    steps: Step[];
    onChange: (steps: Step[]) => void;
    huntId?: number;
}

function emptyStep(orderNumber: number): Step {
    return {
        orderNumber,
        title: "",
        clues: [],
        radius: 50,
        refArItem: null,
        arItemFilename: null,
        qrCode: null,
        points: 0,
        estimatedDuration: 10,
        arMode: "GPS",
        _markerFile: null,
        _markerPatternFile: null,
        markerImageUrl: null,
        markerPatternUrl: null,
    };
}

export default function StepsTab({ steps, onChange, huntId }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const addStep = useCallback(() => {
        const newStep = emptyStep(steps.length + 1);
        const updated = [...steps, newStep];
        console.log("UPDATED --> ", updated);
        onChange(updated);
        setOpenIndex(updated.length - 1);
    }, [steps, onChange]);

    const updateStep = useCallback((index: number, field: keyof Step, value: unknown) => {
        const updated = steps.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
        );
        onChange(updated);
    }, [steps, onChange]);

    const removeStep = useCallback((index: number) => {
        const updated = steps
            .filter((_, i) => i !== index)
            .map((s, i) => ({ ...s, orderNumber: i + 1 }));
        onChange(updated);
        setOpenIndex(null);
    }, [steps, onChange]);

    const setClues = useCallback((stepIndex: number, clues: Partial<Clue>[]) => {
        updateStep(stepIndex, "clues", clues);
    }, [updateStep]);

    return (
        <div className="space-y-3">
            <button
                onClick={addStep}
                className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                Ajouter une étape
            </button>

            {steps.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-muted-foreground/70">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mb-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    <p className="text-sm">Aucune étape — cliquez sur &quot;Ajouter une étape&quot; pour commencer</p>
                </div>
            )}

            {steps.map((step, index) => (
                <StepItem
                    key={step.id ?? index}
                    step={step}
                    index={index}
                    isOpen={openIndex === index}
                    onToggle={setOpenIndex}
                    onRemove={removeStep}
                    onUpdate={updateStep}
                    onCluesChange={setClues}
                    allSteps={steps}
                    onStepsChange={onChange}
                    huntId={huntId}
                />
            ))}

            {steps.some((s) => s.latitude != null && s.longitude != null) && (
                <div className="mt-6 pt-6 border-t border-border">
                    <HuntRouteMap steps={steps} />
                </div>
            )}
        </div>
    );
}
