"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import StepsTab from "./StepsTab";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Hunt, Step } from "./types";
import HuntMap from "@/components/partner/HuntMap";
import { uploadFile } from "@/lib/upload";
import { assetUrl } from "@/lib/assets";

type Tab = "metadata" | "steps";
type Status = "DRAFT" | "ACTIVE" | "FINISHED";

interface Props {
    initialData?: Hunt;
}

export default function HuntForm({ initialData }: Props) {
    const [steps, setSteps] = useState<Step[]>(
        initialData?.steps?.map((s) => ({
            id: s.id,
            orderNumber: s.orderNumber,
            title: s.title,
            clue: s.clue ?? "",
            latitude: s.latitude ?? null,
            longitude: s.longitude ?? null,
            radius: s.radius,
            actionType: s.actionType,
            arContent: s.arContent ?? null,
            qrCode: s.qrCode ?? null,
            points: s.points,
        })) ?? []
    );
    const isEditing = !!initialData;
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const [activeTab, setActiveTab] = useState<Tab>("metadata");
    const [status, setStatus] = useState<Status>((initialData?.status as Status) ?? "DRAFT");
    const [tags, setTags] = useState<string[]>(["futuriste", "Historique", "Piraterie"]);
    const [tagInput, setTagInput] = useState("");
    const [coverImage, setCoverImage] = useState<string | null>(assetUrl(initialData?.coverImage));
    const [coverImageKey, setCoverImageKey] = useState<string | null>(initialData?.coverImage ?? null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        title: initialData?.title ?? "",
        shortDescription: initialData?.shortDescription ?? "",
        fullDescription: initialData?.description ?? "",
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : "",
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : "",
        locationCenter: initialData?.latitude && initialData?.longitude ? `${initialData?.latitude} ${initialData?.longitude}` : null,
        // country: initialData?.location?.split(", ")[1] ?? "France",
        // city: initialData?.location?.split(", ")[0] ?? "",
        // difficulty: initialData?.difficulty ?? "Intermédiaire",
        rewardType: initialData?.rewardType ?? "DISCOUNT_CODE",
        rewardValue: initialData?.rewardValue ?? "",
    });
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const set = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed]);
        }
        setTagInput("");
    };

    const removeTag = (tag: string) =>
        setTags((prev) => prev.filter((t) => t !== tag));

    const handleSave = async (nextStatus?: Status) => {
        setError(null);
        setSaving(true);
        if (!form.locationCenter) throw new Error('Hunt must have a defined location center');
        const coords = form.locationCenter.split(' ');

        let nextCoverKey = coverImageKey;
        try {
            if (coverImageFile) {
                const uploaded = await uploadFile(coverImageFile, "cover");
                nextCoverKey = uploaded.key;
                setCoverImageKey(uploaded.key);
                setCoverImageFile(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Échec de l'upload de l'image");
            setSaving(false);
            return;
        }

        const payload = {
            title: form.title || "Sans titre",
            shortDescription: form.shortDescription || null,
            description: form.fullDescription || null,
            startDate: form.startDate || null,
            endDate: form.endDate || null,
            locationLat: coords[0],
            locationLon: coords[1],
            // location: form.city ? `${form.city}, ${form.country}` : null,
            // difficulty: form.difficulty,
            status: nextStatus ?? status,
            rewardType: form.rewardType,
            rewardValue: form.rewardValue || null,
            coverImage: nextCoverKey,
            refUser: user?.sub,
        };

        try {
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/hunts/${initialData!.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/hunts`;
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const json = await res.json();
                setError(json.message ?? "Erreur lors de l'enregistrement");
                return;
            }

            const huntJson = await res.json();
            const huntId = huntJson.data?.id ?? initialData?.id;

            if (steps.length > 0 && huntId) {
                let preparedSteps: Step[];
                try {
                    preparedSteps = await Promise.all(
                        steps.map(async (s) => {
                            if (!s._arContentFile) return s;
                            const uploaded = await uploadFile(s._arContentFile, "ar-model");
                            return { ...s, arContent: uploaded.key, _arContentFile: null };
                        }),
                    );
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Échec de l'upload d'un modèle 3D");
                    return;
                }
                setSteps(preparedSteps);

                const stepsPayload = preparedSteps.map(({ _arContentFile, ...rest }) => {
                    void _arContentFile;
                    return rest;
                });
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunts/${huntId}/steps`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ steps: stepsPayload }),
                });
            }

            router.push("/dashboard");
        } catch {
            setError(`Impossible de contacter le serveur`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl">

            {/* Header — ligne 1 : titre + badge */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-2xl font-bold text-foreground">
                        {isEditing ? "Modifier la chasse" : "Création d'une chasse"}
                    </h1>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground border border-border">
                        {status === "DRAFT" ? "Brouillon" : status === "ACTIVE" ? "Actif" : "Terminé"}
                    </span>
                </div>

                {/* Header — ligne 2 : boutons */}
                <div className="flex items-center gap-2">
                    <button onClick={() => handleSave()} disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-foreground/80 bg-card border border-gray-300 rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50">
                        {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-foreground/80 bg-card border border-gray-300 rounded-lg hover:bg-muted/50 transition-colors">
                        Dupliquer
                    </button>
                    <button onClick={() => handleSave("ACTIVE")} disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
                        Publier la chasse
                    </button>
                    <button onClick={() => handleSave("FINISHED")} disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-muted/500 transition-colors disabled:opacity-50">
                        Mettre en pause
                    </button>
                    <button onClick={() => router.push("/dashboard")}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                        Annuler chasse
                    </button>
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
            </div>

            {/* Tabs — centrés */}
            <div className="flex justify-center mb-8">
                <div className="flex gap-1 bg-muted rounded-xl p-1">
                    {(["metadata", "steps"] as Tab[]).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    activeTab === tab
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground/80"
                                }`}>
                            {tab === "metadata" ? "Métadonnées" : "Étapes"}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "metadata" && (
                <div className="space-y-8">

                    {/* Titre + Image de couverture */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1">
                                    Titre de la chasse
                                </label>
                                <input value={form.title} onChange={(e) => set("title", e.target.value)}
                                       placeholder="Titre de la chasse"
                                       className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1">
                                    Description courte
                                </label>
                                <input value={form.shortDescription}
                                       onChange={(e) => set("shortDescription", e.target.value)}
                                       placeholder="Une phrase d'accroche pour donner le thème de la chasse"
                                       className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1">
                                    Description complète
                                </label>
                                <textarea value={form.fullDescription}
                                          onChange={(e) => set("fullDescription", e.target.value)}
                                          placeholder="Décrivez l'histoire que raconte votre chasse au trésor..."
                                          rows={5}
                                          className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
                            </div>
                        </div>

                        {/* Image upload */}
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-1">
                                Image de couverture
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setCoverImageFile(file);
                                        setCoverImage(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                            >
                                {coverImage ? (
                                    <img src={coverImage} alt="Couverture" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                             className="w-8 h-8 text-muted-foreground/70">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                                        </svg>
                                        <p className="text-sm text-muted-foreground text-center">
                                            Téléchargez une image de couverture<br />de la chasse
                                        </p>
                                    </>
                                )}
                            </div>
                            {coverImage && (
                                <button
                                    onClick={() => {
                                        setCoverImage(null);
                                        setCoverImageFile(null);
                                        setCoverImageKey(null);
                                    }}
                                    className="mt-2 text-xs text-muted-foreground/70 hover:text-red-500 transition-colors">
                                    Supprimer l&apos;image
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Temps */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Temps
                        </h3>
                        <div className="h-0.5 bg-gray-200 mb-4" />
                        <div className="grid grid-cols-3 gap-4">
                            {/*<div>*/}
                            {/*    <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">*/}
                            {/*        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">*/}
                            {/*            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>*/}
                            {/*        </svg>*/}
                            {/*        Durée estimée*/}
                            {/*    </label>*/}
                            {/*    <input value={form.estimatedDuration}*/}
                            {/*           onChange={(e) => set("estimatedDuration", e.target.value)}*/}
                            {/*           placeholder="Durée approximative..."*/}
                            {/*           className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />*/}
                            {/*</div>*/}
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"/>
                                    </svg>
                                    Date de début
                                </label>
                                <input type="date" value={form.startDate}
                                       onChange={(e) => set("startDate", e.target.value)}
                                       className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"/>
                                    </svg>
                                    Date de fin
                                </label>
                                <input type="date" value={form.endDate}
                                       onChange={(e) => set("endDate", e.target.value)}
                                       className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />
                            </div>
                        </div>
                    </div>

                    {/* Lieu */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                            </svg>
                            Lieu
                        </h3>
                        <div className="h-0.5 bg-gray-200 mb-4" />
                        <HuntMap
                            locationCenter={form.locationCenter}
                            radius={5}
                            onChange={(lat, lng) => {
                                const value = `${lat} ${lng}`;
                                set('locationCenter', value);
                            }}
                        />
                        {/*<div className="grid grid-cols-3 gap-4">*/}
                        {/*    <div>*/}
                        {/*        <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">*/}
                        {/*            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">*/}
                        {/*                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>*/}
                        {/*                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>*/}
                        {/*            </svg>*/}
                        {/*            Pays*/}
                        {/*        </label>*/}
                        {/*        <input value={form.country} onChange={(e) => set("country", e.target.value)}*/}
                        {/*               className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />*/}
                        {/*    </div>*/}
                        {/*    <div>*/}
                        {/*        <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">*/}
                        {/*            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">*/}
                        {/*                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>*/}
                        {/*                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>*/}
                        {/*            </svg>*/}
                        {/*            Ville*/}
                        {/*        </label>*/}
                        {/*        <input value={form.city} onChange={(e) => set("city", e.target.value)}*/}
                        {/*               placeholder="Paris"*/}
                        {/*               className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />*/}
                        {/*    </div>*/}
                        {/*    <div>*/}
                        {/*        <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">*/}
                        {/*            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">*/}
                        {/*                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>*/}
                        {/*            </svg>*/}
                        {/*            Difficulté estimée*/}
                        {/*        </label>*/}
                        {/*        <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}*/}
                        {/*                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-card">*/}
                        {/*            <option>Facile</option>*/}
                        {/*            <option>Intermédiaire</option>*/}
                        {/*            <option>Difficile</option>*/}
                        {/*            <option>Expert</option>*/}
                        {/*        </select>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>

                    {/* Tags */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/>
                            </svg>
                            Tags
                        </h3>
                        <div className="h-0.5 bg-gray-200 mb-4" />
                        <div className="flex flex-wrap gap-2 mb-3">
                            {tags.map((tag) => (
                                <span key={tag}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 text-sm border border-gray-300 rounded-full text-muted-foreground">
                                    {tag}
                                    <button onClick={() => removeTag(tag)}
                                            className="text-muted-foreground/70 hover:text-muted-foreground leading-none">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                   onKeyDown={(e) => e.key === "Enter" && addTag()}
                                   placeholder="Nouveau tag..."
                                   className="px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />
                            <button onClick={addTag}
                                    className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                                + Ajouter
                            </button>
                        </div>
                    </div>

                    {/* Récompense */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/>
                            </svg>
                            Récompense
                        </h3>
                        <div className="h-0.5 bg-gray-200 mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Type de récompense</label>
                                <select value={form.rewardType} onChange={(e) => set("rewardType", e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-card">
                                    <option value="DISCOUNT_CODE">Code de réduction</option>
                                    <option value="FREE_ITEM">Article gratuit</option>
                                    <option value="BADGE">Badge</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Valeur de la récompense</label>
                                <input value={form.rewardValue} onChange={(e) => set("rewardValue", e.target.value)}
                                       placeholder="ex: PROMO10, URL, description..."
                                       className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "steps" && (
                <StepsTab steps={steps} onChange={setSteps} />
            )}
        </div>
    );
}