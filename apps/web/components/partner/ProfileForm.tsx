"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Camera } from "lucide-react";

interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    profilePicture?: string | null;
}

interface Props {
    user: User | null;
}

export default function ProfileForm({ user }: Props) {
    const { user: storeUser, setUser } = useAuthStore();
    const [form, setForm] = useState({
        firstname: user?.firstname ?? "",
        lastname: user?.lastname ?? "",
        email: user?.email ?? "",
        password: "",
        confirmPassword: "",
    });
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.profilePicture ?? null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarError(null);
        setAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/avatar", { method: "POST", body: formData });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.message ?? "Échec de l'upload");
            }
            const json = await res.json();
            const url: string = json.data?.url ?? json.url;
            setAvatarUrl(url);
            if (storeUser) setUser({ ...storeUser, profilePicture: url });
        } catch (err) {
            setAvatarError(err instanceof Error ? err.message : "Erreur lors de l'upload de l'avatar");
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setSuccess(false);
        setError(null);
    };

    const handleSave = async () => {
        setError(null);
        setSuccess(false);

        if (form.password && form.password !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (form.password && form.password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        setSaving(true);
        try {
            const body: Record<string, string> = {
                firstname: form.firstname,
                lastname: form.lastname,
                email: form.email,
            };
            if (form.password) body.password = form.password;

            const res = await fetch(
                `/api/users/${user?.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );
            if (!res.ok) throw new Error("Erreur lors de la mise à jour");
            await res.json(); // ← suppression de const json =

            // ← utilise storeUser au lieu de user
            if (storeUser) {
                setUser({
                    ...storeUser,
                    firstname: form.firstname,
                    lastname: form.lastname,
                    email: form.email,
                });
            }

            setSuccess(true);
            setForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Avatar */}
            <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-6">
                <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
                        {avatarUrl ? (
                            // biome-ignore lint/performance/noImgElement: avatar URL from trusted MinIO bucket
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{(user?.firstname?.[0] ?? "").toUpperCase()}{(user?.lastname?.[0] ?? "").toUpperCase()}</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
                        aria-label="Changer l'avatar"
                    >
                        <Camera size={20} className="text-white" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">Photo de profil</p>
                    <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG ou WebP · Max 2 Mo</p>
                    {avatarUploading && <p className="text-xs text-primary mt-1">Upload en cours…</p>}
                    {avatarError && <p className="text-xs text-destructive mt-1">{avatarError}</p>}
                </div>
            </div>

            {/* Identité */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-foreground">Informations personnelles</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Prénom</label>
                        <Input
                            value={form.firstname}
                            onChange={e => handleChange("firstname", e.target.value)}
                            placeholder="Prénom"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Nom</label>
                        <Input
                            value={form.lastname}
                            onChange={e => handleChange("lastname", e.target.value)}
                            placeholder="Nom"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Adresse email</label>
                    <Input
                        type="email"
                        value={form.email}
                        onChange={e => handleChange("email", e.target.value)}
                        placeholder="email@exemple.com"
                    />
                </div>
            </div>

            {/* Mot de passe */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-foreground">Changer le mot de passe</h2>
                <p className="text-xs text-muted-foreground/70">Laissez vide pour conserver votre mot de passe actuel.</p>
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Nouveau mot de passe</label>
                    <Input
                        type="password"
                        value={form.password}
                        onChange={e => handleChange("password", e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Confirmer le mot de passe</label>
                    <Input
                        type="password"
                        value={form.confirmPassword}
                        onChange={e => handleChange("confirmPassword", e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {/* Feedback */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}
            {success && (
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                    Profil mis à jour avec succès.
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
            </div>
        </div>
    );
}