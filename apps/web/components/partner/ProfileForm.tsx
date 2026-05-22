"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/stores/auth.store";

interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    username: string;
}

interface Props {
    user: User | null;
}

export default function ProfileForm({ user }: Props) {
    const { user: storeUser, setUser } = useAuthStore(); // ← ajout
    const [form, setForm] = useState({
        firstname: user?.firstname ?? "",
        lastname: user?.lastname ?? "",
        email: user?.email ?? "",
        password: "",
        confirmPassword: "",
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`,
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