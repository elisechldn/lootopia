"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ARCameraLoader from "./ARCameraLoader";
import { getParticipationById } from "@/services/participation.service";
import { getHuntById } from "@/services/hunt.service";
import { useUserStore } from "@/store/userStore";

const ARScene = dynamic(() => import("./ARScene"), { ssr: false });

interface Props {
  huntId: number;
}

export default function ARPageContent({ huntId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const participationId = searchParams.get("participationId");
  const stepId = searchParams.get("stepId");
  const user = useUserStore((s) => s.user);

  const [arMode, setArMode] = useState<"GPS" | "MARKER" | null>(null);
  const [patternUrl, setPatternUrl] = useState<string | null>(null);
  const [glbFilepath, setGlbFilepath] = useState<string | null>(null);

  // hunt promise for ARScene (GPS mode)
  const hunt = useMemo(() => getHuntById(huntId), [huntId]);
  useEffect(() => {
    if (!participationId || !stepId) {
      setArMode("GPS");
      return;
    }
    getParticipationById(+participationId)
      .then((p) => {
        const step = p.hunt?.steps.find((s) => s.id === +stepId);
        console.log("P", p)
        setArMode(step?.arMode ?? "GPS");
        setPatternUrl(step?.markerPatternUrl ?? null);
        setGlbFilepath(step?.arItem?.filepath ?? null);
      })
      .catch(() => {
        setArMode("GPS");
      });
  }, [participationId, stepId]);

  if (arMode === null) {
    // Loading participation data
    return (
      <div
        style={{
          display: "flex",
          height: "100dvh",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
          fontSize: 14,
        }}
      >
        Chargement…
      </div>
    );
  }

  if (arMode === "MARKER" && patternUrl) {
    return (
      <ARCameraLoader
        patternUrl={patternUrl}
        glbFilepath={glbFilepath}
        participationId={participationId ? +participationId : undefined}
        stepId={stepId ? +stepId : undefined}
        userId={user?.id}
        onValidate={() => {
          router.push(
            `/hunts/${huntId}/game/map?participationId=${participationId}`,
          );
        }}
      />
    );
  }

  // GPS mode — existing ARScene
  return (
    <Suspense fallback={null}>
      <ARScene
        hunt={hunt}
        huntId={huntId}
        participationId={participationId ? +participationId : undefined}
        stepId={stepId ? +stepId : undefined}
      />
    </Suspense>
  );
}
