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

type PickerMode = "upload" | "library";

export default function ArItemPicker({ step, onChange }: Omit<ArItemPickerProps, "stepIndex"> & { stepIndex: number }) {
  const [mode, setMode] = useState<PickerMode>("upload");

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-2">Item 3D</label>
      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-3">
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
