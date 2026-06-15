import Link from "next/link";
import { Briefcase, Clock, Award, Trophy, Store } from "lucide-react";
import HuntHero from "../../../components/hunt/HuntHero";
import HuntInfoSection from "../../../components/hunt/HuntInfoSection";
import PlayButton from "../../../components/hunt/PlayButton";
import { getHuntById } from "../../../services/hunt.service";
import { assetUrl } from "@/lib/assets";
import { formatRewardType } from "@/lib/reward";

export default async function HuntOnBoardingPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  const { data: hunt } = await getHuntById(Number(id));
  return (
    <main className="flex flex-col min-h-screen bg-background pt-safe">
      <HuntHero
        title={hunt.title}
        imageUrl={assetUrl(hunt.coverImage)!}
        backHref="/"
      />

      <div className="flex flex-col flex-1 px-4">
        <hr className="border-border" />

        <HuntInfoSection icon={Briefcase} label="Scénario">
          <p className="text-center leading-relaxed">
            {hunt.description ?? hunt.shortDescription ?? "—"}
          </p>
        </HuntInfoSection>

        <HuntInfoSection icon={Clock} label="Chasse disponible du">
          <p className="font-semibold text-base">{hunt.startDate ? new Date(hunt.startDate).toLocaleDateString('fr-FR') : '—'} - {hunt.endDate ? new Date(hunt.endDate).toLocaleDateString('fr-FR') : '—'}</p>
        </HuntInfoSection>

        <HuntInfoSection icon={Award} label="Récompense">
          <p className="font-semibold text-2xl tracking-widest">
            {formatRewardType(hunt.rewardType)}
          </p>
        </HuntInfoSection>

        {hunt.partner && (
          <HuntInfoSection icon={Store} label="Organisateur">
            <p className="font-semibold text-base">@{hunt.partner.username}</p>
          </HuntInfoSection>
        )}

        <div
          className="mt-auto pt-6 pb-safe space-y-3"
          style={{
            paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
          }}
        >
          <Link
            href={`/hunts/${id}/leaderboard`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 py-3 text-sm font-semibold text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-500/20 active:bg-amber-500/30"
          >
            <Trophy size={16} className="text-amber-500" />
            Classement
          </Link>
          <PlayButton huntId={id} />
        </div>
      </div>
    </main>
  );
}
