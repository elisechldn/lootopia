"use client";

import { useRef } from "react";

interface ArItemUploaderProps {
  arContent: string | null;
  arContentFile: File | null;
  onChange: (file: File) => void;
}

export default function ArItemUploader({ arContent, arContentFile, onChange }: ArItemUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".glb,model/gltf-binary"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        {arContent ? (
          <p className="text-sm text-foreground/80 font-medium truncate max-w-full">
            {arContentFile ? arContent : arContent.split("/").pop()}
          </p>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-7 h-7 text-muted-foreground/70"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-muted-foreground">Téléchargez un item 3D</p>
            <p className="text-xs text-muted-foreground/70">format : .glb</p>
          </>
        )}
      </div>
    </>
  );
}
