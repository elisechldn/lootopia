"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Step } from "../types";
import { assetUrl } from "@/lib/assets";
import ArItemUploader from "./ArItemUploader";
import ArItemLibrary from "./ArItemLibrary";

const GlbPreview = dynamic(() => import("./GlbPreview"), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-xl border border-border bg-muted flex items-center justify-center">
      <p className="text-sm text-muted-foreground/70">Chargement de la prévisualisation...</p>
    </div>
  ),
});

interface ArItemPickerProps {
  stepIndex: number;
  step: Step;
  onChange: (updatedStep: Partial<Step>) => void;
}

type PickerMode = "upload" | "library" | "current";

export default function ArItemPicker({ step, onChange }: Omit<ArItemPickerProps, "stepIndex"> & { stepIndex: number }) {
  const hasExistingArItem = step.refArItem && step.arItem;
  const [mode, setMode] = useState<PickerMode>(hasExistingArItem ? "current" : "upload");
  const [librarySelection, setLibrarySelection] = useState<{ filepath: string } | null>(null);

  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  useEffect(() => {
    if (mode !== "upload" || !step._arContentFile) {
      setUploadedFileUrl(null);
      return;
    }
    const url = URL.createObjectURL(step._arContentFile);
    setUploadedFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mode, step._arContentFile]);

  const previewSrc = useMemo(() => {
    if (uploadedFileUrl) return uploadedFileUrl;
    if (librarySelection) return assetUrl(librarySelection.filepath);
    if (step.arItem?.filepath) return assetUrl(step.arItem.filepath);
    return null;
  }, [uploadedFileUrl, librarySelection, step.arItem?.filepath]);

  return (
    <div className={"flex gap-5"}>
      <div className={"w-1/2"}>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Item 3D</label>
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-3">
          {hasExistingArItem && (
            <button
              type="button"
              onClick={() => setMode("current")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === "current"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              Item Actuel
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === "upload"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            Télécharger un nouvel item
          </button>
          <button
            type="button"
            onClick={() => setMode("library")}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === "library"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            Bibliothèque
          </button>
        </div>

        {mode === "current" && hasExistingArItem && (
          <div className="border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{step.arItem?.filename}</p>
              <p className="text-xs text-muted-foreground/70">{step.arItem?.filepath}</p>
            </div>
            <button
              type="button"
              onClick={() => setMode("library")}
              className="px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
            >
              Changer
            </button>
          </div>
        )}

        {mode === "upload" && (
          <ArItemUploader
            arItemFilename={step.arItemFilename ?? null}
            arContentFile={step._arContentFile ?? null}
            onChange={(file) =>
              onChange({ arItemFilename: file.name, _arContentFile: file, refArItem: null })
            }
          />
        )}

        {mode === "library" && (
          <ArItemLibrary
            selectedId={step.refArItem}
            onSelect={(item) => {
              setLibrarySelection({ filepath: item.filepath });
              onChange({ refArItem: item.id, arItemFilename: item.filename, _arContentFile: null });
            }}
          />
        )}
      </div>
      <div className={"w-1/2"}>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Pré-visualisation</label>
        <GlbPreview src={previewSrc} />
      </div>
    </div>
  );
}
