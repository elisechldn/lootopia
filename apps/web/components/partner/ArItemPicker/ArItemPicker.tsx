"use client";

import { useState } from "react";
import type { Step } from "../types";
import ArItemUploader from "./ArItemUploader";
import ArItemLibrary from "./ArItemLibrary";

interface ArItemPickerProps {
  stepIndex: number;
  step: Step;
  onChange: (updatedStep: Partial<Step>) => void;
}

type PickerMode = "upload" | "library" | "current";

export default function ArItemPicker({ step, onChange }: Omit<ArItemPickerProps, "stepIndex"> & { stepIndex: number }) {
  const hasExistingArItem = step.refArItem && step.arItem;
  const [mode, setMode] = useState<PickerMode>(hasExistingArItem ? "current" : "upload");

  return (
    <div>
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
            ✓ Actuel
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
          Uploader
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
          onSelect={(item) =>
            onChange({ refArItem: item.id, arItemFilename: item.filename, _arContentFile: null })
          }
        />
      )}
    </div>
  );
}
