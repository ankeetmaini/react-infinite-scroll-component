import {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  CSSProperties,
} from 'react';
import { buildRootMargin } from './utils/buildRootMargin';

type Fn = () => any;

export interface Props {
  next: Fn;
  hasMore: boolean;
  children: ReactNode;
  loader: ReactNode;
  scrollThreshold?: number | string;
  endMessage?: ReactNode;
  style?: CSSProperties;
  height?: number | string;
  scrollableTarget?: HTMLElement | string | null;
  hasChildren?: boolean;
  inverse?: boolean;
  pullDownToRefresh?: boolean;
  pullDownToRefreshContent?: ReactNode;
  releaseToRefreshContent?: ReactNode;
  pullDownToRefreshThreshold?: number;
  refreshFunction?: Fn;
  onScroll?: (e: UIEvent) => any;
  dataLength: number;
  initialScrollY?: number;
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
