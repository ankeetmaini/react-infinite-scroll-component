import { Component, ReactNode, CSSProperties } from 'react';
declare type Fn = () => any;
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
    onScroll?: (e: MouseEvent) => any;
    dataLength: number;
    initialScrollY?: number;
    className?: string;
}
interface State {
    showLoader: boolean;
    pullToRefreshThresholdBreached: boolean;
    prevDataLength: number | undefined;
}
export default class InfiniteScroll extends Component<Props, State> {
    constructor(props: Props);
    private throttledOnScrollListener;
    private _scrollableNode;
    private el;
    private _infScroll;
    private lastScrollTop;
    private actionTriggered;
    private _pullDown;
    private startY;
    private currentY;
    private dragging;
    private maxPullDownDistance;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: Props): void;
    static getDerivedStateFromProps(nextProps: Props, prevState: State): {
        prevDataLength: number;
        showLoader: boolean;
        pullToRefreshThresholdBreached: boolean;
    } | null;
    getScrollableTarget: () => HTMLElement | null;
    onStart: EventListener;
    onMove: EventListener;
    onEnd: EventListener;
    isElementAtTop(target: HTMLElement, scrollThreshold?: string | number): boolean;
    isElementAtBottom(target: HTMLElement, scrollThreshold?: string | number): boolean;
    onScrollListener: (event: MouseEvent) => void;
    render(): JSX.Element;
}
export {};
