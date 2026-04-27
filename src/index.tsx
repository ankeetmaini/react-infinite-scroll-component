import {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  CSSProperties,
} from 'react';
import { buildRootMargin } from './utils/buildRootMargin';

export { useInfiniteScroll } from './useInfiniteScroll';
export type {
  UseInfiniteScrollOptions,
  UseInfiniteScrollResult,
} from './useInfiniteScroll';

type Fn = () => any;

export interface Props {
  /**
   * Total number of items currently rendered. Unlocks the next load when it
   * changes. Always pass the length of your full accumulated list, not just
   * the most recently fetched page.
   */
  dataLength: number;
  /**
   * Called when the user scrolls near the end of the list. Must append new
   * items to your list state (not replace them). The component calls this at
   * most once per data load, guarded by an IntersectionObserver sentinel.
   */
  next: Fn;
  /**
   * Whether more data exists to load. When false, the observer stops and
   * `endMessage` is shown instead of `loader`.
   */
  hasMore: boolean;
  /**
   * The full accumulated list of items to render. Pass every item loaded so
   * far — the component is not paginated internally.
   */
  children: ReactNode;
  /**
   * Element shown while the next page is being fetched (while `hasMore` is
   * true and `next` has been triggered).
   */
  loader: ReactNode;
  /**
   * How close to the end of the list before `next` fires.
   * - Number 0–1: fraction of container height, e.g. `0.8` triggers at 80%
   *   scrolled (default).
   * - Pixel string: absolute offset, e.g. `"200px"` triggers 200 px before
   *   the end.
   * @default 0.8
   */
  scrollThreshold?: number | string;
  /** Shown below the list once `hasMore` is false. */
  endMessage?: ReactNode;
  /** Inline styles applied to the inner scroll container. */
  style?: CSSProperties;
  /**
   * Fixed height for the scroll container. When provided, a scrollable box
   * of this height is rendered. Omit to scroll the window (document body).
   */
  height?: number | string;
  /**
   * A scrollable parent element that already provides overflow scrollbars.
   * Accepts a DOM element reference or the element's string `id`. Pass this
   * instead of `height` when the scroll container is owned by the parent.
   *
   * @example
   * // string id
   * scrollableTarget="scrollableDiv"
   *
   * @example
   * // ref value
   * const ref = useRef(null);
   * <div ref={ref}><InfiniteScroll scrollableTarget={ref.current} /></div>
   */
  scrollableTarget?: HTMLElement | string | null;
  /**
   * Set to `true` when `children` is not a plain array (e.g. a single node
   * or a fragment). Prevents the component from treating a length of 0 as
   * "no items loaded".
   */
  hasChildren?: boolean;
  /**
   * Reverse the scroll direction: the sentinel is placed at the top of the
   * list and `next` loads older content upward. Use with
   * `flexDirection: 'column-reverse'` on the scroll container for chat or
   * messaging UIs.
   * @default false
   */
  inverse?: boolean;
  /**
   * Enable pull-down-to-refresh on touch and mouse. Requires
   * `refreshFunction` to be provided.
   * @default false
   */
  pullDownToRefresh?: boolean;
  /** Content shown while the user is pulling down. @default <h3>Pull down to refresh</h3> */
  pullDownToRefreshContent?: ReactNode;
  /** Content shown when the pull threshold is breached. @default <h3>Release to refresh</h3> */
  releaseToRefreshContent?: ReactNode;
  /**
   * Minimum pixels the user must pull before `refreshFunction` fires.
   * @default 100
   */
  pullDownToRefreshThreshold?: number;
  /**
   * Called when the pull-to-refresh threshold is breached. Should reload or
   * reset the list to fresh data.
   */
  refreshFunction?: Fn;
  /** Called on every scroll event of the scroll container. */
  onScroll?: (e: UIEvent) => any;
  /** Scroll Y position (in pixels) to restore when the component mounts. */
  initialScrollY?: number;
  /** CSS class name added to the inner scroll container element. */
  className?: string;
}

export default function InfiniteScroll({
  next,
  hasMore,
  children,
  loader,
  scrollThreshold = 0.8,
  endMessage,
  style,
  height,
  scrollableTarget,
  hasChildren,
  inverse = false,
  pullDownToRefresh = false,
  pullDownToRefreshContent,
  releaseToRefreshContent,
  pullDownToRefreshThreshold = 100,
  refreshFunction,
  onScroll,
  dataLength,
  initialScrollY,
  className = '',
}: Props) {
  const [showLoader, setShowLoader] = useState(false);
  const [pullToRefreshThresholdBreached, setPullToRefreshThresholdBreached] =
    useState(false);
  // State drives the JSX re-render when height is measured; ref is read by handlers
  const [maxPullDownDistance, setMaxPullDownDistance] = useState(0);

  const infScrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pullDownRef = useRef<HTMLDivElement>(null);

  // --- Stable callback refs ---
  // Assigned synchronously every render so effects and event handlers always call
  // the latest version without adding the functions to any effect dependency array.
  // This prevents the IO observer and PTR listeners from being recreated every time
  // consumers pass inline functions (the most common real-world usage).
  const nextRef = useRef(next);
  nextRef.current = next;

  const refreshFunctionRef = useRef(refreshFunction);
  refreshFunctionRef.current = refreshFunction;

  // Ref for pullDownToRefreshThreshold so onMove always reads the current value
  // without needing it in the PTR effect deps
  const pullThresholdRef = useRef(pullDownToRefreshThreshold);
  pullThresholdRef.current = pullDownToRefreshThreshold;

  // --- Mutable refs — never trigger re-renders ---
  const actionTriggeredRef = useRef(false);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const maxPullDownDistanceRef = useRef(0); // kept in sync with maxPullDownDistance state

  // Resolve the custom scrollable element; stable as long as scrollableTarget doesn't change
  const getScrollableNode = useCallback((): HTMLElement | null => {
    if (scrollableTarget instanceof HTMLElement) return scrollableTarget;
    if (typeof scrollableTarget === 'string') {
      return document.getElementById(scrollableTarget);
    }
    if (scrollableTarget === null) {
      console.warn(
        `You are trying to pass scrollableTarget but it is null. This might
        happen because the element may not have been added to DOM yet.
        See https://github.com/ankeetmaini/react-infinite-scroll-component/issues/59 for more info.
      `
      );
    }
    return null;
  }, [scrollableTarget]);

  // Effect 1 — one-time validation and initialScrollY
  useEffect(() => {
    if (typeof dataLength === 'undefined') {
      throw new Error(
        `mandatory prop "dataLength" is missing. The prop is needed` +
          ` when loading more content. Check README.md for usage`
      );
    }

    if (pullDownToRefresh && typeof refreshFunction !== 'function') {
      throw new Error(
        `Mandatory prop "refreshFunction" missing.
          Pull Down To Refresh functionality will not work
          as expected. Check README.md for usage'`
      );
    }

    if (typeof initialScrollY === 'number') {
      const el = height ? infScrollRef.current : getScrollableNode();
      if (el && el.scrollHeight > initialScrollY) {
        el.scrollTo(0, initialScrollY);
      }
    }
  }, []);

  // Effect 2a — reset the load guard when new data arrives.
  // Deliberately decoupled from the IO observer (Effect 2b) so the observer
  // is NOT recreated on every data load — it lives for the component's full
  // mount lifetime and only reconnects when structural config changes.
  useEffect(() => {
    actionTriggeredRef.current = false;
    setShowLoader(false);
  }, [dataLength]);

  // Effect 2b — IntersectionObserver lifecycle.
  // dataLength is intentionally absent from deps: the guard reset above handles
  // the per-load reset. The observer only reconnects when the root, margin, or
  // direction changes — typically never after initial mount.
  useEffect(() => {
    if (!hasMore) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const root: Element | null = height
      ? infScrollRef.current
      : getScrollableNode();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || actionTriggeredRef.current) return;
        actionTriggeredRef.current = true;
        setShowLoader(true);
        nextRef.current(); // stable ref — safe to call without listing next in deps
      },
      {
        root,
        rootMargin: buildRootMargin(scrollThreshold, inverse),
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, scrollThreshold, inverse, height, getScrollableNode]);

  // Effect 3 — onScroll passthrough (only when prop is provided)
  useEffect(() => {
    if (!onScroll) return;

    const scrollEl: HTMLElement | Window | null =
      (height ? infScrollRef.current : getScrollableNode()) ??
      (typeof window !== 'undefined' ? window : null);
    if (!scrollEl) return;

    const handler = (e: Event) => {
      setTimeout(() => onScroll(e as UIEvent), 0);
    };

    scrollEl.addEventListener('scroll', handler as EventListener);
    return () =>
      scrollEl.removeEventListener('scroll', handler as EventListener);
  }, [onScroll, height, getScrollableNode]);

  // Effect 4 — Pull-to-refresh event listeners.
  // refreshFunction and pullDownToRefreshThreshold are intentionally absent from
  // deps — they are read via refs so listener re-registration is not needed when
  // consumers pass new function references or change the threshold at runtime.
  useEffect(() => {
    if (!pullDownToRefresh) return;

    const scrollEl: HTMLElement | Window | null =
      (height ? infScrollRef.current : getScrollableNode()) ??
      (typeof window !== 'undefined' ? window : null);
    if (!scrollEl) return;

    // Measure pull-down indicator height after mount
    if (pullDownRef.current?.firstChild) {
      const dist = (
        pullDownRef.current.firstChild as HTMLElement
      ).getBoundingClientRect().height;
      maxPullDownDistanceRef.current = dist;
      setMaxPullDownDistance(dist);
    }

    const onStart = (evt: Event) => {
      // Only allow pull-to-refresh when the scroll container is at the very top.
      // Replaces the old lastScrollTop ref which was never updated after removing
      // the scroll event listener, making the original guard permanently a no-op.
      const scrollTop =
        scrollEl instanceof HTMLElement
          ? scrollEl.scrollTop
          : document.documentElement.scrollTop;
      if (scrollTop > 0) return;

      draggingRef.current = true;

      if (evt instanceof MouseEvent) {
        startYRef.current = evt.pageY;
      } else if (evt instanceof TouchEvent) {
        startYRef.current = evt.touches[0].pageY;
      }
      currentYRef.current = startYRef.current;

      if (infScrollRef.current) {
        infScrollRef.current.style.willChange = 'transform';
        infScrollRef.current.style.transition =
          'transform 0.2s cubic-bezier(0,0,0.31,1)';
      }
    };

    const onMove = (evt: Event) => {
      if (!draggingRef.current) return;

      if (evt instanceof MouseEvent) {
        currentYRef.current = evt.pageY;
      } else if (evt instanceof TouchEvent) {
        currentYRef.current = evt.touches[0].pageY;
      }

      // user is scrolling up — ignore
      if (currentYRef.current < startYRef.current) return;

      const delta = currentYRef.current - startYRef.current;

      // Read via ref — no stale closure risk, no effect re-registration needed
      if (delta >= pullThresholdRef.current) {
        setPullToRefreshThresholdBreached(true);
      }

      // limit drag to 1.5x maxPullDownDistance
      if (delta > maxPullDownDistanceRef.current * 1.5) return;

      if (infScrollRef.current) {
        infScrollRef.current.style.overflow = 'visible';
        infScrollRef.current.style.transform = `translate3d(0px, ${delta}px, 0px)`;
      }
    };

    const onEnd = () => {
      startYRef.current = 0;
      currentYRef.current = 0;
      draggingRef.current = false;

      setPullToRefreshThresholdBreached((breached) => {
        if (breached) {
          // Read via ref — refreshFunction identity changes don't re-register listeners
          refreshFunctionRef.current?.();
        }
        return false;
      });

      requestAnimationFrame(() => {
        if (infScrollRef.current) {
          infScrollRef.current.style.overflow = 'auto';
          infScrollRef.current.style.transform = 'none';
          infScrollRef.current.style.willChange = 'unset';
        }
      });
    };

    scrollEl.addEventListener('touchstart', onStart as EventListener);
    scrollEl.addEventListener('touchmove', onMove as EventListener);
    scrollEl.addEventListener('touchend', onEnd as EventListener);
    scrollEl.addEventListener('mousedown', onStart as EventListener);
    scrollEl.addEventListener('mousemove', onMove as EventListener);
    scrollEl.addEventListener('mouseup', onEnd as EventListener);

    return () => {
      scrollEl.removeEventListener('touchstart', onStart as EventListener);
      scrollEl.removeEventListener('touchmove', onMove as EventListener);
      scrollEl.removeEventListener('touchend', onEnd as EventListener);
      scrollEl.removeEventListener('mousedown', onStart as EventListener);
      scrollEl.removeEventListener('mousemove', onMove as EventListener);
      scrollEl.removeEventListener('mouseup', onEnd as EventListener);
    };
  }, [pullDownToRefresh, height, getScrollableNode]);

  const containerStyle: CSSProperties = {
    height: height ?? 'auto',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    ...style,
  };

  const hasChildrenResolved =
    hasChildren || !!(children && children instanceof Array && children.length);

  const outerDivStyle: CSSProperties =
    pullDownToRefresh && height ? { overflow: 'auto' } : {};

  const sentinel = hasMore ? (
    <div ref={sentinelRef} style={{ height: 1 }} />
  ) : null;

  return (
    <div style={outerDivStyle} className="infinite-scroll-component__outerdiv">
      <div
        className={['infinite-scroll-component', className]
          .filter(Boolean)
          .join(' ')}
        ref={infScrollRef}
        style={containerStyle}
      >
        {pullDownToRefresh && (
          <div style={{ position: 'relative' }} ref={pullDownRef}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: -1 * maxPullDownDistance,
              }}
            >
              {pullToRefreshThresholdBreached
                ? releaseToRefreshContent
                : pullDownToRefreshContent}
            </div>
          </div>
        )}
        {children}
        {!showLoader && !hasChildrenResolved && hasMore && loader}
        {showLoader && hasMore && loader}
        {sentinel}
        {!hasMore && endMessage}
      </div>
    </div>
  );
}
