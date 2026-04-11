import { render, cleanup, act } from '@testing-library/react';
import InfiniteScroll from '../index';

describe('pull down to refresh', () => {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  beforeAll(() => {
    // ensure RAF exists
    // @ts-ignore
    global.requestAnimationFrame = (cb: any) => cb();
    // Mock getBoundingClientRect to return a height for maxPullDownDistance
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      height: 100,
      width: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));
  });

  afterAll(() => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  afterEach(() => cleanup());

  it('calls refreshFunction after pulling past threshold', () => {
    const refresh = jest.fn();
    const { container } = render(
      <InfiniteScroll
        dataLength={10}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={200}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        refreshFunction={refresh}
        pullDownToRefreshContent={<div style={{ height: 100 }}>Pull</div>}
      >
        <div />
      </InfiniteScroll>
    );

    const node = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;

    const down = new MouseEvent('mousedown', { bubbles: true } as any);
    Object.defineProperty(down, 'pageY', { value: 0 });
    act(() => {
      node.dispatchEvent(down);
    });

    const move = new MouseEvent('mousemove', { bubbles: true } as any);
    Object.defineProperty(move, 'pageY', { value: 60 });
    act(() => {
      node.dispatchEvent(move);
    });

    // verify transform is applied during drag
    expect(node.style.transform).toBe('translate3d(0px, 60px, 0px)');

    const up = new MouseEvent('mouseup', { bubbles: true } as any);
    act(() => {
      node.dispatchEvent(up);
    });

    expect(refresh).toHaveBeenCalled();
  });

  it('calls refreshFunction after touch pull past threshold', () => {
    const refresh = jest.fn();
    const { container } = render(
      <InfiniteScroll
        dataLength={10}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={200}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        refreshFunction={refresh}
        pullDownToRefreshContent={<div style={{ height: 100 }}>Pull</div>}
      >
        <div />
      </InfiniteScroll>
    );

    const node = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;

    const touchStart = new TouchEvent('touchstart', { bubbles: true });
    Object.defineProperty(touchStart, 'touches', { value: [{ pageY: 0 }] });
    act(() => {
      node.dispatchEvent(touchStart);
    });

    const touchMove = new TouchEvent('touchmove', { bubbles: true });
    Object.defineProperty(touchMove, 'touches', { value: [{ pageY: 60 }] });
    act(() => {
      node.dispatchEvent(touchMove);
    });

    expect(node.style.transform).toBe('translate3d(0px, 60px, 0px)');

    const touchEnd = new TouchEvent('touchend', { bubbles: true });
    act(() => {
      node.dispatchEvent(touchEnd);
    });

    expect(refresh).toHaveBeenCalled();
  });

  it('does not start drag when scrollTop > 0', () => {
    const refresh = jest.fn();
    const { container } = render(
      <InfiniteScroll
        dataLength={10}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={200}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        refreshFunction={refresh}
        pullDownToRefreshContent={<div style={{ height: 100 }}>Pull</div>}
      >
        <div />
      </InfiniteScroll>
    );

    const node = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;

    // Simulate container already scrolled down
    Object.defineProperty(node, 'scrollTop', { configurable: true, value: 50 });

    const down = new MouseEvent('mousedown', { bubbles: true } as any);
    Object.defineProperty(down, 'pageY', { value: 0 });
    act(() => {
      node.dispatchEvent(down);
    });

    // Move should have no effect since drag was never started
    const move = new MouseEvent('mousemove', { bubbles: true } as any);
    Object.defineProperty(move, 'pageY', { value: 60 });
    act(() => {
      node.dispatchEvent(move);
    });

    expect(node.style.transform).toBe('');

    // Reset scrollTop
    Object.defineProperty(node, 'scrollTop', { configurable: true, value: 0 });
  });

  it('ignores upward pull (currentY < startY)', () => {
    const refresh = jest.fn();
    const { container } = render(
      <InfiniteScroll
        dataLength={10}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={200}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        refreshFunction={refresh}
        pullDownToRefreshContent={<div style={{ height: 100 }}>Pull</div>}
      >
        <div />
      </InfiniteScroll>
    );

    const node = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;

    const down = new MouseEvent('mousedown', { bubbles: true } as any);
    Object.defineProperty(down, 'pageY', { value: 100 });
    act(() => {
      node.dispatchEvent(down);
    });

    // Move upward (pageY < startY)
    const move = new MouseEvent('mousemove', { bubbles: true } as any);
    Object.defineProperty(move, 'pageY', { value: 40 });
    act(() => {
      node.dispatchEvent(move);
    });

    // No transform applied for upward pull
    expect(node.style.transform).toBe('');
  });

  it('caps transform at 1.5x maxPullDownDistance', () => {
    const refresh = jest.fn();
    const { container } = render(
      <InfiniteScroll
        dataLength={10}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={200}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        refreshFunction={refresh}
        pullDownToRefreshContent={<div style={{ height: 100 }}>Pull</div>}
      >
        <div />
      </InfiniteScroll>
    );

    const node = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;

    const down = new MouseEvent('mousedown', { bubbles: true } as any);
    Object.defineProperty(down, 'pageY', { value: 0 });
    act(() => {
      node.dispatchEvent(down);
    });

    // Pull 60px — within cap (100 * 1.5 = 150), transform applied
    const move1 = new MouseEvent('mousemove', { bubbles: true } as any);
    Object.defineProperty(move1, 'pageY', { value: 60 });
    act(() => {
      node.dispatchEvent(move1);
    });
    expect(node.style.transform).toBe('translate3d(0px, 60px, 0px)');

    // Pull 200px — exceeds cap (150px), transform NOT updated
    const move2 = new MouseEvent('mousemove', { bubbles: true } as any);
    Object.defineProperty(move2, 'pageY', { value: 200 });
    act(() => {
      node.dispatchEvent(move2);
    });
    // Transform stays at 60px because the 200px delta exceeds the 1.5x cap
    expect(node.style.transform).toBe('translate3d(0px, 60px, 0px)');
  });

  it('calls refreshFunction in window-scroll PTR mode (no height)', () => {
    // Exercises the scrollEl = window path (line 218 false branch) in PTR onStart
    const refresh = jest.fn();
    const { container } = render(
      <InfiniteScroll
        dataLength={10}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        refreshFunction={refresh}
        pullDownToRefreshContent={<div style={{ height: 100 }}>Pull</div>}
      >
        <div />
      </InfiniteScroll>
    );

    const node = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;

    // Listeners are attached to window when there is no height prop
    const down = new MouseEvent('mousedown', { bubbles: true } as any);
    Object.defineProperty(down, 'pageY', { value: 0 });
    act(() => {
      window.dispatchEvent(down);
    });

    const move = new MouseEvent('mousemove', { bubbles: true } as any);
    Object.defineProperty(move, 'pageY', { value: 60 });
    act(() => {
      window.dispatchEvent(move);
    });

    expect(node.style.transform).toBe('translate3d(0px, 60px, 0px)');

    const up = new MouseEvent('mouseup', { bubbles: true } as any);
    act(() => {
      window.dispatchEvent(up);
    });

    expect(refresh).toHaveBeenCalled();
  });

  it('shows releaseToRefreshContent when threshold is breached', () => {
    const { container, getByText, queryByText } = render(
      <InfiniteScroll
        dataLength={10}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={200}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        refreshFunction={() => {}}
        pullDownToRefreshContent={<div>Pull down</div>}
        releaseToRefreshContent={<div>Release to refresh</div>}
      >
        <div />
      </InfiniteScroll>
    );

    const node = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;

    expect(queryByText('Release to refresh')).toBeNull();

    const down = new MouseEvent('mousedown', { bubbles: true } as any);
    Object.defineProperty(down, 'pageY', { value: 0 });
    act(() => {
      node.dispatchEvent(down);
    });

    // Pull past threshold (60 > 50)
    const move = new MouseEvent('mousemove', { bubbles: true } as any);
    Object.defineProperty(move, 'pageY', { value: 60 });
    act(() => {
      node.dispatchEvent(move);
    });

    expect(getByText('Release to refresh')).toBeTruthy();
  });
});
