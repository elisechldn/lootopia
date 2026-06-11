const REWARD_TYPE_LABELS: Record<string, string> = {
  DISCOUNT_CODE: 'Code de réduction',
  FREE_ITEM: 'Article offert',
  BADGE: 'Badge',
};

export function formatRewardType(type: string | null | undefined): string {
  if (!type) return '—';
  return REWARD_TYPE_LABELS[type] ?? type;
}
