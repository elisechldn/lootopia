import { Star } from "lucide-react";

const DIFFICULTY_MAP: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

interface DifficultyStarsProps {
  difficulty: string | null;
}

export default function DifficultyStars({ difficulty }: DifficultyStarsProps) {
  const filled = difficulty ? (DIFFICULTY_MAP[difficulty.toLowerCase()] ?? 0) : 0;

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 3 }, (_, i) =>
        i < filled ? (
          <Star key={i} size={24} className="fill-foreground text-foreground" />
        ) : (
          <Star key={i} size={24} className="text-foreground" />
        )
      )}
    </div>
  );
}
