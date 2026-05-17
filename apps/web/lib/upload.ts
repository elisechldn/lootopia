export type FileKind = 'cover' | 'ar-model' | 'ar-marker';

export async function uploadFile(
  file: File,
  kind: FileKind,
): Promise<{ key: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', kind);

  const res = await fetch('/api/files', { method: 'POST', body: formData });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message ?? "Échec de l'upload du fichier");
  }
  const json = await res.json();
  return json.data as { key: string; url: string };
}
