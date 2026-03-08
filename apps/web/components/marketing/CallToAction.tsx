import Link from "next/link";

export default function CallToAction() {
    return (
        <section className="bg-gray-900 text-white py-24">
            <div className="max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                    Prêt à commencer votre aventure ?
                </h2>
                <p className="text-gray-400 text-base leading-relaxed">
                    Rejoignez des milliers de joueurs qui explorent leurs villes à travers des chasses au trésor
                    numériques.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Link
                        href="/download"
                        className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all"
                    >
                        Télécharger l'application
                    </Link>
                    <Link
                        href="/auth/register?role=partner"
                        className="inline-flex items-center justify-center gap-2 border border-gray-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:border-gray-400 hover:bg-gray-800 active:scale-[0.98] transition-all"
                    >
                        Portail des partenaires
                    </Link>
                </div>
            </div>
        </section>
    );
}