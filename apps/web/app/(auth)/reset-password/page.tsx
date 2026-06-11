import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    if (!token) {
        return (
            <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm border border-border px-8 py-10 text-center">
                <h1 className="text-xl font-bold text-foreground mb-4">Lien invalide</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    Ce lien de réinitialisation est invalide ou a expiré.
                </p>
                <Link href="/forgot-password" className="text-sm text-foreground underline hover:text-muted-foreground">
                    Demander un nouveau lien
                </Link>
            </div>
        );
    }

    return <ResetPasswordForm token={token} />;
}
