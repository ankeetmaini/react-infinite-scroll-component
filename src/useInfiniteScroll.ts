import { useEffect, useRef, useState, useCallback, RefObject } from 'react';
import { buildRootMargin } from './utils/buildRootMargin';

export interface UseInfiniteScrollOptions {
  /**
   * Called when the sentinel enters the viewport. Append new items to your
   * list state, do not replace the existing items.
   */
  next: () => void;
  /**
   * Whether more data exists to load. Set to false when you have fetched all
   * pages, the observer disconnects and stops calling next().
   */
  hasMore: boolean;
  /**
   * Total number of items currently rendered. Resets the load guard so the
   * next page can be triggered after new items arrive. Pass the length of
   * your full accumulated list, not just the current page.
   */
  dataLength: number;
  /**
   * How close to the sentinel before next() fires.
   * - Number 0–1: fraction of container height, e.g. 0.8 triggers at 80%.
   * - Pixel string: absolute offset, e.g. "200px" triggers 200 px before end.
   * @default 0.8
   */
  scrollThreshold?: number | string;
  /**
   * A scrollable parent element (or its DOM id string) to use as the
   * IntersectionObserver root. Defaults to the viewport when omitted.
   */
  scrollableTarget?: HTMLElement | string | null;
  /**
   * Reverse scroll direction, sentinel is observed from the top. Use for
   * chat or messaging UIs with flex-direction: column-reverse.
   * @default false
   */
  inverse?: boolean;
}

export interface UseInfiniteScrollResult {
  /**
   * Attach this ref to a div at the bottom of your list (or top for inverse
   * mode). When it enters the viewport the hook calls next().
   *
   * @example
   * <ul>
   *   {items.map(item => <li key={item.id}>{item.name}</li>)}
   *   <li ref={sentinelRef} />
   * </ul>
   */
  sentinelRef: RefObject<HTMLDivElement | null>;
  /**
   * True from when the sentinel fires until dataLength changes (i.e. new
   * data has arrived). Use this to show your own loading indicator.
   */
  isLoading: boolean;
}

/**
 * Low-level hook for building custom infinite scroll UIs.
 *
 * Manages an IntersectionObserver that watches a sentinel element you place
 * at the end of your list. When the sentinel enters the viewport, next() is
 * called. The hook handles deduplication and resets automatically when
 * dataLength changes.
 *
 * Use the InfiniteScroll component instead if you want a ready-made wrapper
 * with built-in loader, endMessage, pull-to-refresh, and inverse scroll UI.
 *
 * @example Basic usage
 * ```tsx
 * function Feed() {
 *   const [items, setItems] = useState(initialItems);
 *   const [hasMore, setHasMore] = useState(true);
 *
 *   const { sentinelRef, isLoading } = useInfiniteScroll({
 *     next: async () => {
 *       const more = await fetchItems(items.length);
 *       if (more.length === 0) { setHasMore(false); return; }
 *       setItems(prev => [...prev, ...more]);
 *     },
 *     hasMore,
 *     dataLength: items.length,
 *   });
 *
 *   return (
 *     <ul>
 *       {items.map(item => <li key={item.id}>{item.name}</li>)}
 *       <li ref={sentinelRef} aria-hidden />
 *       {isLoading && <li>Loading...</li>}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useInfiniteScroll({
  next,
  hasMore,
  dataLength,
  scrollThreshold = 0.8,
  scrollableTarget,
  inverse = false,
}: UseInfiniteScrollOptions): UseInfiniteScrollResult {
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const actionTriggeredRef = useRef(false);

  // Stable ref so the observer callback always calls the latest next()
  // without triggering observer reconnection when an inline function is passed.
  const nextRef = useRef(next);
  nextRef.current = next;

  const getScrollableNode = useCallback((): HTMLElement | null => {
    if (scrollableTarget instanceof HTMLElement) return scrollableTarget;
    if (typeof scrollableTarget === 'string') {
      return document.getElementById(scrollableTarget);
    }
    return null;
  }, [scrollableTarget]);

  // Reset the load guard when new data arrives.
  useEffect(() => {
    actionTriggeredRef.current = false;
    setIsLoading(false);
  }, [dataLength]);

  // IntersectionObserver lifecycle.
  useEffect(() => {
    if (!hasMore) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const root: Element | null = getScrollableNode();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || actionTriggeredRef.current) return;
        actionTriggeredRef.current = true;
        setIsLoading(true);
        nextRef.current();
      },
      {
        root,
        rootMargin: buildRootMargin(scrollThreshold, inverse),
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, scrollThreshold, inverse, getScrollableNode]);

  return { sentinelRef, isLoading };
}
