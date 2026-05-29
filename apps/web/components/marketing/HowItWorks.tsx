// Icons as inline SVG to avoid extra dependencies
import React from "react";

function MapIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
        </svg>
    );
}

function CameraIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/>
        </svg>
    );
}

function TrophyIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/>
        </svg>
    );
}

interface StepCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function StepCard({icon, title, description}: StepCardProps) {
    return (
        <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-base text-foreground">{title}</h3>
            <p className="text-sm text-foreground/80 leading-relaxed max-w-50">{description}</p>
        </div>
    );
}

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="bg-card py-24">
            <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-foreground text-center mb-16">
                    Comment ça marche ?
                </h2>

                <div className="mb-16">
                    <h3 className="text-xl font-bold text-foreground mb-10 text-left">
                        En tant que partenaire
                    </h3>
                    <div className="grid grid-cols-3 gap-10">
                        <StepCard icon={<MapIcon/>} title="Utilisez notre map API pour designer vos parcours"
                                  description="Utilisez votre appareil mobile pour naviguer sur des cartes interactives et découvrir les trésors cachés qui vous entourent."/>
                        <StepCard icon={<CameraIcon/>} title="Utilisez vos items 3D personnalisés"
                                  description="Découvrez une expérience de jeu améliorée grâce aux fonctionnalités de réalité augmentée qui intègrent des éléments numériques au monde réel."/>
                        <StepCard icon={<TrophyIcon/>} title="surveillez l'état de vos parcours"
                                  description="Relevez des défis, résolvez des énigmes et gagnez des points pour débloquer des succès et grimper dans les classements."/>
                    </div>
                </div>

                <hr className="border-border mb-16"/>

                <div>
                    <h3 className="text-xl font-bold text-foreground mb-10 text-left">
                        En tant que joueur
                    </h3>
                    <div className="grid grid-cols-3 gap-10">
                        <StepCard icon={<MapIcon/>} title="Explorez les villes"
                                  description="Utilisez votre appareil mobile pour naviguer sur des cartes interactives et découvrir les trésors cachés qui vous entourent."/>
                        <StepCard icon={<CameraIcon/>} title="Vivez des expériences ludiques en réalité augmentée"
                                  description="Découvrez une expérience de jeu améliorée grâce aux fonctionnalités de réalité augmentée qui intègrent des éléments numériques au monde réel."/>
                        <StepCard icon={<TrophyIcon/>} title="Gagnez des récompenses"
                                  description="Relevez des défis, résolvez des énigmes et gagnez des points pour débloquer des succès et grimper dans les classements."/>
                    </div>
                </div>
            </div>
        </section>
    );
}