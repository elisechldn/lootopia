import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gray-50 min-h-125 flex items-center">
            <div className="relative w-full max-w-4xl mx-auto px-6 py-32 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-8">
                    La solution de gestion de parcours interactifs en réalité augmentée
                </h1>
                <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-10">
                    Créez, explorez et vivez des parcours numériques interactifs où le réel rencontre le virtuel
                </p>
                <div className="flex flex-row items-center justify-center gap-3">
                    <Link
                        href="/auth/register?role=partner"
                        className="bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all"
                    >
                        Devenez partenaire
                    </Link>
                    <Link
                        href="/explore"
                        className="bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all"
                    >
                        Explorez les parcours
                    </Link>
                </div>
            </div>
        </section>
    );
}