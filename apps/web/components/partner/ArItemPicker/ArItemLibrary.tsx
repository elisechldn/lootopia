"use client";

import { useEffect, useState } from "react";
import ArItemDeleteModal from "./ArItemDeleteModal";

interface ArItem {
  id: string;
  filename: string;
  filepath: string;
  hasAnimations: boolean;
  createdAt: string;
}

interface ArItemLibraryProps {
  onSelect: (arItem: { id: string; filename: string; filepath: string }) => void;
  selectedId?: string | null;
}

export default function ArItemLibrary({ onSelect, selectedId }: ArItemLibraryProps) {
  const [arItems, setArItems] = useState<ArItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<{ stepsCount: number; huntsCount: number } | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/ar-items")
      .then((res) => res.json())
      .then((json: { data: ArItem[] }) => setArItems(json.data ?? []))
      .catch(() => setError("Impossible de charger la bibliothèque"))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteClick = async (id: string) => {
    const res = await fetch(`/api/ar-items/${id}`);
    const json = await res.json() as { data: { stepsCount: number; huntsCount: number } };
    setDeletingId(id);
    setUsageInfo(json.data);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const res = await fetch(`/api/ar-items/${deletingId}`, { method: "DELETE" });
    if (res.status === 409) {
      const json = await res.json() as { data?: { stepsCount: number; huntsCount: number }; stepsCount?: number; huntsCount?: number };
      setUsageInfo(json.data ?? { stepsCount: json.stepsCount ?? 0, huntsCount: json.huntsCount ?? 0 });
      return;
    }
    setArItems((prev) => prev.filter((item) => item.id !== deletingId));
    setShowModal(false);
    setDeletingId(null);
    setUsageInfo(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDeletingId(null);
    setUsageInfo(null);
  };

  if (loading) {
    return (
      <div className="py-8 flex items-center justify-center text-sm text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 flex items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (arItems.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-muted-foreground/70 text-sm">
        <p>Aucun asset AR dans votre bibliothèque.</p>
        <p className="text-xs mt-1">Uploadez un fichier .glb via l&apos;onglet &quot;Uploader&quot;.</p>
      </div>
    );
  }

  const deletingItem = arItems.find((item) => item.id === deletingId);

  return (
    <>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {arItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
              selectedId === item.id
                ? "border-gray-900 bg-muted"
                : "border-border bg-card hover:bg-muted/50"
            }`}
            onClick={() => onSelect(item)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                {item.filename.endsWith(".glb") ? "GLB" : "IMG"}
              </span>
              <span className="text-sm text-foreground truncate">{item.filename}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleDeleteClick(item.id);
              }}
              className="ml-2 shrink-0 text-muted-foreground/70 hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {showModal && deletingItem && usageInfo && (
        <ArItemDeleteModal
          filename={deletingItem.filename}
          stepsCount={usageInfo.stepsCount}
          huntsCount={usageInfo.huntsCount}
          onConfirm={() => void handleConfirmDelete()}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
