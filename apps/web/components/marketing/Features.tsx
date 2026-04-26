function CheckIcon() {
    return (
        <svg className="w-4 h-4 text-foreground flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"/>
        </svg>
    );
}

interface FeatureListItem {
    text: string;
}

function FeatureList({items}: { items: FeatureListItem[] }) {
    return (
        <ul className="flex flex-col gap-3">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckIcon/>
                    <span>{item.text}</span>
                </li>
            ))}
        </ul>
    );
}

function DemoPlaceholder({label}: { label: string }) {
    return (
        <div className="w-full aspect-video rounded-2xl bg-gray-300 flex items-center justify-center">
            <span className="text-sm text-white font-medium">{label}</span>
        </div>
    );
}

export default function Features() {
    const playerFeatures: FeatureListItem[] = [
        {text: "Jeu interactif basé sur une carte"},
        {text: "Découverte de trésors améliorée par la réalité augmentée"},
        {text: "Niveaux de difficulté progressifs"},
        {text: "Système de succès et classements"},
    ];

    const partnerFeatures: FeatureListItem[] = [
        {text: "Création facile d'une chasse au trésor"},
        {text: "Gestion de la chasse en temps réel"},
        {text: "Analyses et données sur les joueurs"},
        {text: "Mécanismes de jeu personnalisables"},
    ];

    return (
        <section id="features" className="bg-card py-24">
            <div className="max-w-5xl mx-auto px-6 flex flex-col gap-24">
                <div className="grid grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-foreground">Pour les joueurs</h2>
                        <FeatureList items={playerFeatures}/>
                    </div>
                    <DemoPlaceholder label="Démo de l'expérience joueur"/>
                </div>

                <div className="grid grid-cols-2 gap-16 items-center">
                    <DemoPlaceholder label="Aperçu du tableau de bord partenaire"/>
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-foreground">Pour les partenaires</h2>
                        <FeatureList items={partnerFeatures}/>
                    </div>
                </div>
            </div>
        </section>
    );
}