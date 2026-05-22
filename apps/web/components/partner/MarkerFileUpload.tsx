"use client";

import { CloudUpload, FileTextIcon, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { assetUrl } from "@/lib/assets";

interface Props {
  accept: string;
  maxSize: number;
  label: string;
  hint: string;
  value: File | null;
  existingUrl?: string | null;
  showImagePreview?: boolean;
  onFileValidate?: (file: File) => string | null;
  onChange: (file: File | null) => void;
  onExistingFileDelete?: () => void;
}

export default function MarkerFileUpload({
  accept,
  maxSize,
  label,
  hint,
  value,
  existingUrl,
  showImagePreview = false,
  onFileValidate,
  onChange,
  onExistingFileDelete,
}: Props) {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const files = value ? [value] : [];

  const existingFilename = existingUrl?.split("/").pop() ?? null;
  const existingPreviewUrl = showImagePreview ? assetUrl(existingUrl) : null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>

      <FileUpload
        value={files}
        onValueChange={(f) => onChange(f[0] ?? null)}
        accept={accept}
        maxFiles={1}
        maxSize={maxSize}
        onFileValidate={onFileValidate ?? undefined}
        onFileReject={(_, msg) => alert(msg)}
      >
        <FileUploadDropzone className="flex-row flex-wrap border-dotted text-center py-4 gap-1.5">
          <CloudUpload className="size-4 shrink-0" />
          <span className="text-xs">Déposer ici ou</span>
          <FileUploadTrigger asChild>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              parcourir
            </Button>
          </FileUploadTrigger>
          <span className="text-xs text-muted-foreground w-full">{hint}</span>
        </FileUploadDropzone>

        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file}>
              <FileUploadItemPreview />
              <FileUploadItemMetadata size="sm" />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7 ml-auto shrink-0">
                  <X className="size-3.5" />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>

      {/* Existing configured file (server-side) */}
      {!value && existingFilename && (
        <div className="flex items-center gap-2.5 rounded-md border border-green-200 bg-green-50 p-2.5">
          {existingPreviewUrl ? (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="shrink-0 cursor-zoom-in"
              title="Voir en grand"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingPreviewUrl}
                alt={existingFilename}
                className="size-10 rounded border object-cover"
              />
            </button>
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded border bg-muted">
              <FileTextIcon className="size-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-green-700">
              {existingFilename}
            </p>
            <p className="text-[11px] text-green-500">Fichier configuré · déposez un nouveau pour remplacer</p>
          </div>
          {onExistingFileDelete && (
            <button
              type="button"
              onClick={onExistingFileDelete}
              className="ml-auto shrink-0 text-muted-foreground/70 hover:text-red-500 transition-colors"
              title="Supprimer ce fichier"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {existingPreviewUrl && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={existingPreviewUrl}
              alt={existingFilename ?? ""}
              className="w-full rounded"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
