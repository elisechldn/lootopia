"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ARCameraLoader from "./ARCameraLoader";
import { getParticipationById, validateStep } from "@/services/participation.service";
import { getHuntById } from "@/services/hunt.service";
import { useUserStore } from "@/store/userStore";
import StepValidationOverlay, { type StepValidationResult } from "./StepValidationOverlay";

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
  const [isValidating, setIsValidating] = useState(false);
  const [stepResult, setStepResult] = useState<StepValidationResult | null>(null);

  const hunt = useMemo(() => getHuntById(huntId), [huntId]);

  useEffect(() => {
    if (!participationId || !stepId) {
      setArMode("GPS");
      return;
    }
    getParticipationById(+participationId)
      .then((p) => {
        const step = p.hunt?.steps.find((s) => s.id === +stepId);
        setArMode(step?.arMode ?? "GPS");
        setPatternUrl(step?.markerPatternUrl ?? null);
        setGlbFilepath(step?.arItem?.filepath ?? null);
      })
      .catch(() => {
        setArMode("GPS");
      });
  }, [participationId, stepId]);

  const handleItemHit = useCallback(async (lat: number, lon: number) => {
    if (isValidating || !participationId || !stepId || !user) return;
    setIsValidating(true);
    try {
      const res = await validateStep(+participationId, +stepId, user.id, lat, lon) as { status?: string; totalPoints?: number };
      setStepResult({ success: true, message: 'Étape validée !', points: res?.totalPoints ?? 0 });
    } catch (err) {
      setStepResult({
        success: false,
        message: err instanceof Error ? err.message : 'Validation échouée',
      });
    } finally {
      setIsValidating(false);
    }
  }, [isValidating, participationId, stepId, user]);

  const handleDismiss = useCallback(() => {
    setStepResult(null);
    router.replace(`/hunts/${huntId}/game/map?participationId=${participationId}`);
  }, [huntId, participationId, router]);

  if (arMode === null) {
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

  return (
    <>
      {arMode === "MARKER" && patternUrl ? (
        <ARCameraLoader
          patternUrl={patternUrl}
          glbFilepath={glbFilepath}
          participationId={participationId ? +participationId : undefined}
          stepId={stepId ? +stepId : undefined}
          userId={user?.id}
          onItemHit={handleItemHit}
          isValidating={isValidating}
        />
      ) : (
        <Suspense fallback={null}>
          <ARScene
            hunt={hunt}
            huntId={huntId}
            participationId={participationId ? +participationId : undefined}
            stepId={stepId ? +stepId : undefined}
            onItemHit={handleItemHit}
            isValidating={isValidating}
          />
        </Suspense>
      )}
      <StepValidationOverlay
        isValidating={isValidating}
        result={stepResult}
        onDismiss={handleDismiss}
      />
    </>
  );
}
