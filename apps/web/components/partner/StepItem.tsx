"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import { Step } from "./types";
import { Clue } from "@repo/types";
import ArItemPicker from "./ArItemPicker/ArItemPicker";
import CluesTab from "./CluesTab";
import MarkerFileUpload from "./MarkerFileUpload";

const StepMap = dynamic(() => import("./StepMap"), {
    ssr: false,
    loading: () => (
        <div className="h-96 rounded-xl bg-muted border border-border flex items-center justify-center">
            <p className="text-sm text-muted-foreground/70">Chargement de la carte...</p>
        </div>
    ),
});

interface Props {
    step: Step;
    index: number;
    isOpen: boolean;
    onToggle: (index: number | null) => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, field: keyof Step, value: unknown) => void;
    onCluesChange: (stepIndex: number, clues: Partial<Clue>[]) => void;
    allSteps: Step[];
    onStepsChange: (steps: Step[]) => void;
}

const StepItem = memo(function StepItem({
    step,
    index,
    isOpen,
    onToggle,
    onRemove,
    onUpdate,
    onCluesChange,
    allSteps,
    onStepsChange,
}: Props) {
    console.log("step", step)
    return (
        <div className="border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div
                onClick={() => onToggle(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/50 transition-colors cursor-pointer"
            >
                <span className="text-sm font-semibold text-foreground">
                    Étape {step.orderNumber}{step.title ? ` - ${step.title}` : ""}
                </span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                        className="text-muted-foreground/70 hover:text-red-500 transition-colors"
                        title="Supprimer"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                        </svg>
                    </button>
                    <svg
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                        className={`w-4 h-4 text-muted-foreground/70 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-5 py-5 border-t border-border bg-card space-y-5">

                        {/* Titre */}
                        <div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Titre</label>
                                <input
                                    value={step.title}
                                    onChange={(e) => onUpdate(index, "title", e.target.value)}
                                    placeholder="Titre de l'étape"
                                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Points</label>
                                <input
                                    value={step.points}
                                    type={"number"}
                                    min={0}
                                    onChange={(e) => onUpdate(index, "points", Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                        </div>

                        {/* Item 3D + Mode AR */}
                        <div className="space-y-4">
                                <ArItemPicker
                                    stepIndex={index}
                                    step={step}
                                    onChange={(partial) => {
                                        const updated = allSteps.map((s, i) =>
                                            i === index ? { ...s, ...partial } : s
                                        );
                                        onStepsChange(updated);
                                    }}
                                />

                                {/* Technologie AR */}
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                                        Technologie AR
                                    </label>
                                    <div className="flex gap-1 bg-muted rounded-lg p-1">
                                        {(["GPS", "MARKER"] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => {
                                                    const updated = allSteps.map((s, i) =>
                                                        i === index ? { ...s, arMode: mode, _markerFile: null } : s
                                                    );
                                                    onStepsChange(updated);
                                                }}
                                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                                    (step.arMode ?? "GPS") === mode
                                                        ? "bg-card text-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground/80"
                                                }`}
                                            >
                                                {mode === "GPS" ? "GPS" : "Marqueur physique"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Upload marker (conditionnel) */}
                                {step.arMode === "MARKER" && (
                                    <div className="space-y-3">
                                        {/* Lien outil externe */}
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                                            <p className="font-semibold mb-1">Génération du marqueur AR</p>
                                            <span>1. Générez votre image et fichier <code>.patt</code> avec l&apos;outil officiel AR.js : </span>
                                            <a
                                                href="https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold break-all hover:underline"
                                            >
                                                AR.js Marker Trainer
                                            </a>
                                            <p className="mt-1">2. Téléchargez les deux fichiers générés puis uploadez-les ci-dessous.</p>
                                        </div>

                                        {/* Image du marqueur */}
                                        <MarkerFileUpload
                                            accept="image/jpeg,image/png,image/webp"
                                            maxSize={10 * 1024 * 1024}
                                            label="Image du marqueur"
                                            hint="JPG, PNG ou WebP · max 10 Mo"
                                            value={step._markerFile ?? null}
                                            existingUrl={step.markerImageUrl}
                                            showImagePreview
                                            onFileValidate={(f) =>
                                                ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
                                                    ? null
                                                    : 'Seuls JPG, PNG et WebP sont acceptés'
                                            }
                                            onChange={(file) => {
                                                const updated = allSteps.map((s, i) =>
                                                    i === index ? { ...s, _markerFile: file } : s
                                                );
                                                onStepsChange(updated);
                                            }}
                                            onExistingFileDelete={() => {
                                                const updated = allSteps.map((s, i) =>
                                                    i === index ? { ...s, markerImageUrl: null } : s
                                                );
                                                onStepsChange(updated);
                                            }}
                                        />

                                        {/* Fichier .patt */}
                                        <MarkerFileUpload
                                            accept=".patt"
                                            maxSize={1024 * 1024}
                                            label="Fichier pattern"
                                            hint=".patt · max 1 Mo"
                                            value={step._markerPatternFile ?? null}
                                            existingUrl={step.markerPatternUrl}
                                            onFileValidate={(f) =>
                                                f.name.endsWith('.patt')
                                                    ? null
                                                    : 'Extension .patt requise'
                                            }
                                            onChange={(file) => {
                                                const updated = allSteps.map((s, i) =>
                                                    i === index ? { ...s, _markerPatternFile: file } : s
                                                );
                                                onStepsChange(updated);
                                            }}
                                            onExistingFileDelete={() => {
                                                const updated = allSteps.map((s, i) =>
                                                    i === index ? { ...s, markerPatternUrl: null } : s
                                                );
                                                onStepsChange(updated);
                                            }}
                                        />
                                    </div>
                                )}
                        </div>

                        {/*/!* QR Code *!/*/}
                        {/*<div>*/}
                        {/*    <label className="block text-xs font-medium text-muted-foreground mb-1">*/}
                        {/*        Contenu du QR Code*/}
                        {/*    </label>*/}
                        {/*    <input*/}
                        {/*        value={step.qrCode ?? ""}*/}
                        {/*        onChange={(e) => onUpdate(index, "qrCode", e.target.value)}*/}
                        {/*        placeholder="URL ou texte encodé dans le QR Code..."*/}
                        {/*        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"*/}
                        {/*    />*/}
                        {/*</div>*/}

                        {/* Carte */}
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Localisation de l&apos;étape
                            </label>
                            <p className="text-xs text-muted-foreground/70 mb-2">
                                Cliquez sur la carte pour positionner l&apos;étape
                            </p>
                            <StepMap
                                latitude={step.latitude ?? null}
                                longitude={step.longitude ?? null}
                                radius={step.radius}
                                orderNumber={step.orderNumber}
                                onChange={(lat, lng) => {
                                    const updated = allSteps.map((s, i) =>
                                        i === index ? { ...s, latitude: lat, longitude: lng } : s
                                    );
                                    onStepsChange(updated);
                                }}
                            />
                            {step.latitude != null && step.longitude != null && (
                                <div className="flex gap-4 mt-2">
                                    <div className="flex-1">
                                        <label className="block text-xs text-muted-foreground mb-1">Latitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={step.latitude}
                                            onChange={(e) => onUpdate(index, "latitude", Number(e.target.value))}
                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-muted-foreground mb-1">Longitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={step.longitude}
                                            onChange={(e) => onUpdate(index, "longitude", Number(e.target.value))}
                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rayon */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-2">
                                    Rayon de déclenchement de l&apos;indice
                                </label>
                                <input
                                    type="number"
                                    value={step.radius}
                                    onChange={(e) => onUpdate(index, "radius", Number(e.target.value))}
                                    placeholder="Valeur en mètres"
                                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                        </div>

                        {/* Indices */}
                        <div className="border-t border-border pt-4">
                            <h4 className="text-xs font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
                                </svg>
                                Indices
                            </h4>
                            <CluesTab stepIndex={index} clues={step.clues} onChange={onCluesChange} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
});

export default StepItem;
