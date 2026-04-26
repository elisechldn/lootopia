import SettingsForm from "@/components/partner/SettingsForm";

export default function SettingsPage() {
    return (
        <div className="p-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Personnalisez votre expérience
                </p>
            </div>
            <SettingsForm />
        </div>
    );
}