import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { throttle } from 'throttle-debounce';
import { ThresholdUnits, parseThreshold } from './utils/threshold';

type Fn = () => unknown;
export interface Props {
  next: Fn;
  hasMore: boolean;
  children: ReactNode;
  loader: ReactNode;
  scrollThreshold?: number | string;
  endMessage?: ReactNode;
  style?: CSSProperties;
  height?: number | string;
  scrollableTarget?: ReactNode;
  hasChildren?: boolean;
  inverse?: boolean;
  pullDownToRefresh?: boolean;
  pullDownToRefreshContent?: ReactNode;
  releaseToRefreshContent?: ReactNode;
  pullDownToRefreshThreshold?: number;
  refreshFunction?: Fn;
  onScroll?: (e: MouseEvent) => unknown;
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
  inverse,
  pullDownToRefresh,
  pullDownToRefreshContent,
  releaseToRefreshContent,
  pullDownToRefreshThreshold = 100,
  refreshFunction,
  onScroll,
  dataLength,
  initialScrollY,
  className,
}: Props) {
  const [showLoader, setShowLoader] = useState(false);
  const [pullToRefreshThresholdBreached, setPullToRefreshThresholdBreached] =
    useState(false);

  const _infScroll = useRef<HTMLDivElement | null>(null);
  const _pullDown = useRef<HTMLDivElement | null>(null);
  const actionTriggered = useRef(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);
  const maxPullDownDistance = useRef(0);
  const lastScrollTop = useRef(0);

  // #region handlers
  const getScrollableTarget = useCallback(() => {
    if (scrollableTarget instanceof HTMLElement) return scrollableTarget;
    if (typeof scrollableTarget === 'string') {
      return document.getElementById(scrollableTarget);
    }
    if (scrollableTarget === null) {
      console.warn(`You are trying to pass scrollableTarget but it is null. This might
        happen because the element may not have been added to DOM yet.
        See https://github.com/ankeetmaini/react-infinite-scroll-component/issues/59 for more info.
      `);
    }
    return null;
  }, [scrollableTarget]);

  const isElementAtTop = useCallback(
    (target: HTMLElement, scrollThreshold: string | number = 0.8) => {
      const clientHeight =
        target === document.body || target === document.documentElement
          ? window.screen.availHeight
          : target.clientHeight;

      const threshold = parseThreshold(scrollThreshold);

      if (threshold.unit === ThresholdUnits.Pixel) {
        return (
          target.scrollTop <=
          threshold.value + clientHeight - target.scrollHeight + 1
        );
      }

      return (
        target.scrollTop <=
        threshold.value / 100 + clientHeight - target.scrollHeight + 1
      );
    },
    []
  );

  const isElementAtBottom = useCallback(
    (target: HTMLElement, scrollThreshold: string | number = 0.8) => {
      const clientHeight =
        target === document.body || target === document.documentElement
          ? window.screen.availHeight
          : target.clientHeight;

      const threshold = parseThreshold(scrollThreshold);

      if (threshold.unit === ThresholdUnits.Pixel) {
        return (
          target.scrollTop + clientHeight >=
          target.scrollHeight - threshold.value
        );
      }

      return (
        target.scrollTop + clientHeight >=
        (threshold.value / 100) * target.scrollHeight
      );
    },
    []
  );

  const onScrollListener = useCallback(
    (event: Event) => {
      if (typeof onScroll === 'function') {
        setTimeout(() => onScroll && onScroll(event as MouseEvent), 0);
      }

      const target =
        height || getScrollableTarget()
          ? (event.target as HTMLElement)
          : document.documentElement.scrollTop
            ? document.documentElement
            : document.body;

      if (actionTriggered.current) return;

      const atBottom = inverse
        ? isElementAtTop(target, scrollThreshold)
        : isElementAtBottom(target, scrollThreshold);

      if (atBottom && hasMore) {
        actionTriggered.current = true;
        setShowLoader(true);
        next();
      }

      lastScrollTop.current = target.scrollTop;
    },
    [
      getScrollableTarget,
      hasMore,
      height,
      inverse,
      isElementAtBottom,
      isElementAtTop,
      next,
      onScroll,
      scrollThreshold,
    ]
  );

  const onStart = useCallback((evt: Event) => {
    if (lastScrollTop.current) return;

    dragging.current = true;

    if (evt instanceof MouseEvent) {
      startY.current = evt.pageY;
    } else if (evt instanceof TouchEvent) {
      startY.current = evt.touches[0].pageY;
    }
    currentY.current = startY.current;

    if (_infScroll.current) {
      _infScroll.current.style.willChange = 'transform';
      _infScroll.current.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
    }
  }, []);

  const onMove = useCallback(
    (evt: Event) => {
      if (!dragging.current) return;

      if (evt instanceof MouseEvent) {
        currentY.current = evt.pageY;
      } else if (evt instanceof TouchEvent) {
        currentY.current = evt.touches[0].pageY;
      }

      if (currentY.current < startY.current) return;

      if (currentY.current - startY.current >= pullDownToRefreshThreshold) {
        setPullToRefreshThresholdBreached(true);
      }

      if (currentY.current - startY.current > maxPullDownDistance.current * 1.5)
        return;

      if (_infScroll.current) {
        _infScroll.current.style.overflow = 'visible';
        _infScroll.current.style.transform = `translate3d(0px, ${
          currentY.current - startY.current
        }px, 0px)`;
      }
    },
    [pullDownToRefreshThreshold]
  );

  const onEnd = useCallback(() => {
    startY.current = 0;
    currentY.current = 0;

    dragging.current = false;

    if (pullToRefreshThresholdBreached) {
      refreshFunction?.();
      setPullToRefreshThresholdBreached(false);
    }

    requestAnimationFrame(() => {
      if (_infScroll.current) {
        _infScroll.current.style.overflow = 'auto';
        _infScroll.current.style.transform = 'none';
        _infScroll.current.style.willChange = 'unset';
      }
    });
  }, [pullToRefreshThresholdBreached, refreshFunction]);
  // #endregion

  // #region useEffect
  const throttledOnScrollListener = throttle(150, onScrollListener);
  useEffect(() => {
    if (typeof dataLength === 'undefined') {
      throw new Error(
        `mandatory prop "dataLength" is missing. The prop is needed` +
          ` when loading more content. Check README.md for usage`
      );
    }

    const scrollableNode = getScrollableTarget();
    const el = height ? _infScroll.current : scrollableNode || window;

    if (el) {
      el.addEventListener('scroll', throttledOnScrollListener);
    }

    if (
      typeof initialScrollY === 'number' &&
      el &&
      el instanceof HTMLElement &&
      el.scrollHeight > initialScrollY
    ) {
      el.scrollTo(0, initialScrollY);
    }

    if (pullDownToRefresh && el) {
      el.addEventListener('touchstart', onStart);
      el.addEventListener('touchmove', onMove);
      el.addEventListener('touchend', onEnd);

      el.addEventListener('mousedown', onStart);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseup', onEnd);

      maxPullDownDistance.current =
        (_pullDown.current &&
          _pullDown.current.firstChild &&
          (
            _pullDown.current.firstChild as HTMLDivElement
          ).getBoundingClientRect().height) ||
        0;

      if (typeof refreshFunction !== 'function') {
        throw new Error(
          `Mandatory prop "refreshFunction" missing.
          Pull Down To Refresh functionality will not work
          as expected. Check README.md for usage'`
        );
      }
    }

    return () => {
      if (el) {
        el.removeEventListener('scroll', throttledOnScrollListener);

        if (pullDownToRefresh) {
          el.removeEventListener('touchstart', onStart);
          el.removeEventListener('touchmove', onMove);
          el.removeEventListener('touchend', onEnd);

          el.addEventListener('mousedown', onStart);
          el.addEventListener('mousemove', onMove);
          el.addEventListener('mouseup', onEnd);
        }
      }
    };
  }, [
    throttledOnScrollListener,
    getScrollableTarget,
    dataLength,
    height,
    initialScrollY,
    pullDownToRefresh,
    refreshFunction,
    onStart,
    onMove,
    onEnd,
  ]);

  useEffect(() => {
    actionTriggered.current = false;
    setShowLoader(false);
  }, [dataLength]);
  // #endregion

  // #region composition
  const componentStyle = {
    height: height || 'auto',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    ...style,
  } as CSSProperties;

  const outerDivStyle = pullDownToRefresh && height ? { overflow: 'auto' } : {};

  const hasChildrenProp =
    hasChildren || !!(children && Array.isArray(children) && children.length);

  return (
    <div style={outerDivStyle} className="infinite-scroll-component__outerdiv">
      <div
        className={`infinite-scroll-component ${className || ''}`}
        ref={_infScroll}
        style={componentStyle}
      >
        {pullDownToRefresh && (
          <div style={{ position: 'relative' }} ref={_pullDown}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: -1 * maxPullDownDistance.current,
              }}
            >
              {pullToRefreshThresholdBreached
                ? releaseToRefreshContent
                : pullDownToRefreshContent}
            </div>
          </div>
        )}
        {children}
        {!showLoader && !hasChildrenProp && hasMore && loader}
        {showLoader && hasMore && loader}
        {!hasMore && endMessage}
      </div>
    </div>
  );
  // #endregion
}
