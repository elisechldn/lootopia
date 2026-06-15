'use client';

import TopBar from '@/components/ui/TopBar';
import TabNavigation from '@/components/ui/TabNavigation';
import {
  Target,
  MapPin,
  Compass,
  Lightbulb,
  Camera,
  Trophy,
  Gift,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="flex flex-col h-screen pb-tabbar">
      <TopBar />

      <div className="flex-1 overflow-y-auto pt-topbar">
        <div className="px-4 pt-4 pb-6 space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold">Règles du jeu</h1>
            <p className="text-sm text-muted-foreground">
              Tout ce qu&apos;il faut savoir pour réussir vos chasses au trésor Lootopia.
            </p>
          </header>

          <RuleSection icon={Target} title="Objectif">
            Lootopia, c&apos;est une chasse au trésor en réalité augmentée. Rejoignez une chasse
            près de vous, suivez les étapes une à une jusqu&apos;au lieu indiqué, et capturez
            l&apos;objet caché en AR pour gagner des points et débloquer une récompense.
          </RuleSection>

          <RuleSection icon={MapPin} title="Rejoindre une chasse">
            Les chasses proches de vous apparaissent sur la carte d&apos;accueil. Ouvrez celle qui
            vous intéresse, lisez sa description, puis appuyez sur <strong>Participer</strong> pour
            commencer. Vous pouvez régler le rayon de recherche des chasses dans les Réglages.
          </RuleSection>

          <RuleSection icon={Compass} title="Avancer étape par étape">
            Une chasse se compose d&apos;étapes à faire <strong>dans l&apos;ordre</strong> :
            impossible de sauter une étape. Pour chacune, dirigez-vous vers le lieu indiqué. Le GPS
            vous montre votre distance en temps réel et signale quand vous êtes{' '}
            <strong>dans la zone</strong> (environ 50 m autour du point).
          </RuleSection>

          <RuleSection icon={Lightbulb} title="Les indices">
            Bloqué ? Chaque étape propose des indices à révéler un par un. Attention :{' '}
            <strong>chaque indice révélé vous coûte des points</strong>. À utiliser seulement si
            nécessaire. Le dernier indice vous fait passer à l&apos;étape suivante mais vous enlève d&apos;office tous les points associés.
            À savoir que pour remporter la récompense associée à une chasse, il faut finir celle-ci avec un score non nul.
          </RuleSection>

          <RuleSection icon={Camera} title="La capture en réalité augmentée">
            Une fois sur place, ouvrez la caméra AR pour trouver l&apos;item en réalité augmentée.
            En touchant l&apos;item, vous validez l&apos;étape. Deux modes possibles
            selon l&apos;étape : repérer et toucher un <strong>item</strong> sur le lieu
            (mode GPS), ou viser un <strong>marqueur physique visuel</strong> précis (mode marqueur). La
            capture réussie valide l&apos;étape et calcule votre bonus de temps.
          </RuleSection>

          <RuleSection icon={Trophy} title="Score & bonus de temps">
            Chaque étape rapporte des points. Votre score final = points des étapes (moins les
            indices utilisés) + <strong>bonus de temps</strong> : plus vous allez vite, plus le
            bonus est élevé.
            <br />
            <br />
            Chaque étape a une <strong>durée estimée</strong>. Si vous la terminez plus vite, le
            bonus = points de l&apos;étape × (durée estimée ÷ temps réel). Par exemple, une étape
            de 10 points estimée à 4 minutes mais résolue en 2 minutes rapporte un bonus de 10 ×
            (4 ÷ 2) = 20 points, en plus des 10 points de base. Si vous mettez plus de temps que
            l&apos;estimation, ou si l&apos;étape ne rapporte déjà plus aucun point (indices
            épuisés), il n&apos;y a pas de bonus.
          </RuleSection>

          <RuleSection icon={Gift} title="Récompenses">
            Terminez la chasse avec un score <strong>supérieur à 0</strong> pour débloquer la
            récompense prévue par l&apos;organisateur. Retrouvez vos récompenses à tout moment
            depuis votre <strong>Profil</strong>.
          </RuleSection>

          <RuleSection icon={BarChart3} title="Classement">
            Vos scores vous classent face aux autres joueurs, par chasse et au classement général.
            Consultez le <strong>Classement</strong> depuis la barre de navigation. Abandonner une
            chasse n&apos;enregistre aucun score.
          </RuleSection>
        </div>
      </div>

      <TabNavigation />
    </div>
  );
}

function RuleSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon size={20} className="shrink-0 text-primary" />
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}
