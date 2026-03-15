"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Step } from "./types";

const StepMap = dynamic(() => import("./StepMap"), {
    ssr: false,
    loading: () => (
        <div className="h-96 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
            <p className="text-sm text-gray-400">Chargement de la carte...</p>
        </div>
    ),
});

const HuntRouteMap = dynamic(() => import("./HuntRouteMap"), {
    ssr: false,
    loading: () => (
        <div className="h-100 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
            <p className="text-sm text-gray-400">Chargement de la carte...</p>
        </div>
    ),
});

interface Props {
    steps: Step[];
    onChange: (steps: Step[]) => void;
}

function emptyStep(orderNumber: number): Step {
    return {
        orderNumber,
        title: "",
        clue: "",
        radius: 50,
        actionType: "QR_CODE",
        arMarker: null,
        arContent: null,
        qrCode: null,
        points: 0,
    };
}

export default function StepsTab({ steps, onChange }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(
        steps.length > 0 ? steps.length - 1 : null
    );
    const glbInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const addStep = () => {
        const newStep = emptyStep(steps.length + 1);
        const updated = [...steps, newStep];
        onChange(updated);
        setOpenIndex(updated.length - 1);
    };

    const updateStep = (index: number, field: keyof Step, value: unknown) => {
        const updated = steps.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
        );
        onChange(updated);
    };

    const removeStep = (index: number) => {
        const updated = steps
            .filter((_, i) => i !== index)
            .map((s, i) => ({ ...s, orderNumber: i + 1 }));
        onChange(updated);
        setOpenIndex(null);
    };

    return (
        <div className="space-y-3">
            {/* Bouton ajouter une étape */}
            <button
                onClick={addStep}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                Ajouter une étape
            </button>

            {steps.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mb-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    <p className="text-sm">Aucune étape — cliquez sur &quot;Ajouter une étape&quot; pour commencer</p>
                </div>
            )}

            {/* Liste des étapes */}
            {steps.map((step, index) => {
                const isOpen = openIndex === index;
                return (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Header de l'étape */}
                        <div
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <span className="text-sm font-semibold text-gray-900">
                                Étape {step.orderNumber}{step.title ? ` - ${step.title}` : ""}
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeStep(index); }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Supprimer"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                                    </svg>
                                </button>
                                <svg
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                                </svg>
                            </div>
                        </div>

                        {/* Contenu de l'étape */}
                        {isOpen && (
                            <div className="px-5 py-5 border-t border-gray-100 bg-white space-y-5">

                                {/* Titre */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Titre</label>
                                    <input
                                        value={step.title}
                                        onChange={(e) => updateStep(index, "title", e.target.value)}
                                        placeholder="Titre de l'étape"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>

                                {/* Message / indice */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                                    <input
                                        value={step.clue}
                                        onChange={(e) => updateStep(index, "clue", e.target.value)}
                                        placeholder="Indice donné au joueur..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>

                                {/* Type de validation + Rayon */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Type de validation de l&apos;étape
                                        </label>
                                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                            {(["QR_CODE", "AR"] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => updateStep(index, "actionType", type)}
                                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                                        step.actionType === type
                                                            ? "bg-white text-gray-900 shadow-sm"
                                                            : "text-gray-500 hover:text-gray-700"
                                                    }`}
                                                >
                                                    {type === "QR_CODE" ? "Scan QRCode" : "Touch sur l'item 3D"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Rayon de déclenchement de l&apos;indice
                                        </label>
                                        <input
                                            type="number"
                                            value={step.radius}
                                            onChange={(e) => updateStep(index, "radius", Number(e.target.value))}
                                            placeholder="Valeur en mètres"
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                </div>

                                {/* Item 3D — visible uniquement en mode AR */}
                                {step.actionType === "AR" && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                URL du marqueur AR
                                            </label>
                                            <input
                                                value={step.arMarker ?? ""}
                                                onChange={(e) => updateStep(index, "arMarker", e.target.value)}
                                                placeholder="https://assets.example.com/markers/..."
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                                Item 3D
                                            </label>
                                            <input
                                                ref={(el) => { glbInputRefs.current[index] = el; }}
                                                type="file"
                                                accept=".glb"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) updateStep(index, "arContent", file.name);
                                                }}
                                            />
                                            <div
                                                onClick={() => glbInputRefs.current[index]?.click()}
                                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                {step.arContent ? (
                                                    <p className="text-sm text-gray-700 font-medium">{step.arContent}</p>
                                                ) : (
                                                    <>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-gray-400">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                                                        </svg>
                                                        <p className="text-sm text-gray-500">Téléchargez un item 3D</p>
                                                        <p className="text-xs text-gray-400">format : .glb</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* QR Code */}
                                {step.actionType === "QR_CODE" && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Contenu du QR Code
                                        </label>
                                        <input
                                            value={step.qrCode ?? ""}
                                            onChange={(e) => updateStep(index, "qrCode", e.target.value)}
                                            placeholder="URL ou texte encodé dans le QR Code..."
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                )}

                                {/* Carte interactive */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Localisation de l&apos;étape
                                    </label>
                                    <p className="text-xs text-gray-400 mb-2">
                                        Cliquez sur la carte pour positionner l&apos;étape
                                    </p>
                                    <StepMap
                                        latitude={step.latitude ?? null}
                                        longitude={step.longitude ?? null}
                                        radius={step.radius}
                                        orderNumber={step.orderNumber}
                                        onChange={(lat, lng) => {
                                            const updated = steps.map((s, i) =>
                                                i === index ? { ...s, latitude: lat, longitude: lng } : s
                                            );
                                            onChange(updated);
                                        }}
                                    />
                                    {step.latitude != null && step.longitude != null && (
                                        <div className="flex gap-4 mt-2">
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    value={step.latitude}
                                                    onChange={(e) => updateStep(index, "latitude", Number(e.target.value))}
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    value={step.longitude}
                                                    onChange={(e) => updateStep(index, "longitude", Number(e.target.value))}
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                );
            })}

            {/* Carte globale — itinéraire complet */}
            {steps.some((s) => s.latitude != null && s.longitude != null) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <HuntRouteMap steps={steps} />
                </div>
            )}
        </div>
    );
}