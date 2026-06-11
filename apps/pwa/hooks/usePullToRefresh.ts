'use client';

import { useEffect, useRef, useState } from 'react';

const RESISTANCE = 0.5;
const MAX_PULL = 80;
// Tolerance for iOS Safari fractional scrollTop values (can return 0.5 at top)
const SCROLL_TOP_TOLERANCE = 2;

export function usePullToRefresh(
  el: HTMLElement | null,
  onRefresh: () => Promise<void>,
  threshold = 60,
): { pullDistance: number; isRefreshing: boolean } {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const rafPendingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current || el.scrollTop > SCROLL_TOP_TOLERANCE || !e.touches[0]) return;
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || !e.touches[0]) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta <= 0) {
        isPullingRef.current = false;
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }
      e.preventDefault();
      const d = Math.min(delta * RESISTANCE, MAX_PULL);
      pullDistanceRef.current = d;

      if (!rafPendingRef.current) {
        rafPendingRef.current = true;
        requestAnimationFrame(() => {
          setPullDistance(pullDistanceRef.current);
          rafPendingRef.current = false;
        });
      }
    };

    const onTouchEnd = async () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;
      const dist = pullDistanceRef.current;
      pullDistanceRef.current = 0;
      setPullDistance(0);

      if (dist < threshold) return;

      isRefreshingRef.current = true;
      setIsRefreshing(true);
      try {
        await onRefreshRef.current();
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [el, threshold]);

  return { pullDistance, isRefreshing };
}
