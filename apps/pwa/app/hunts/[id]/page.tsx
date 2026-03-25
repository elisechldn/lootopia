import { Briefcase, Clock, Award, CircleDot } from "lucide-react";
import HuntHero from "../../../components/hunt/HuntHero";
import HuntInfoSection from "../../../components/hunt/HuntInfoSection";
import DifficultyStars from "../../../components/hunt/DifficultyStars";
import PlayButton from "../../../components/hunt/PlayButton";
import { getHuntById } from "../../../services/hunt.service";

function formatDuration(startDate: Date | string | null, endDate: Date | string | null): string {
  if (!startDate || !endDate) return "—";
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  if (ms <= 0) return "—";
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    return `${hours} heure${hours > 1 ? "s" : ""}`;
  }
  return `${totalMinutes} min`;
}

export default async function HuntOnBoardingPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  const { data: hunt } = await getHuntById(1);

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <HuntHero title={hunt.title} />

      <div className="flex flex-col flex-1 px-4">
        <hr className="border-border" />

        <HuntInfoSection icon={Briefcase} label="Scénario">
          <p className="text-center leading-relaxed">
            {hunt.description ?? hunt.shortDescription ?? "—"}
          </p>
        </HuntInfoSection>

        <HuntInfoSection icon={CircleDot} label="Difficulté">
          <DifficultyStars difficulty={hunt.difficulty} />
        </HuntInfoSection>

        <HuntInfoSection icon={Clock} label="Temps">
          <p className="font-semibold text-base">{formatDuration(hunt.startDate, hunt.endDate)}</p>
        </HuntInfoSection>

        <HuntInfoSection icon={Award} label="Récompense">
          <p className="font-semibold text-2xl tracking-widest">
            {hunt.rewardValue ?? "? ? ?"}
          </p>
        </HuntInfoSection>

        <div className="mt-auto py-6">
          <PlayButton huntId={id} />
        </div>
      </div>
    </main>
  );
}
