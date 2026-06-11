const ASSETS_BASE = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? "/assets";

export function assetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${ASSETS_BASE}/${value}`;
}
