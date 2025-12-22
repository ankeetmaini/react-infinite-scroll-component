import { render, cleanup } from '@testing-library/react';
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
    node.dispatchEvent(down);

    const move = new MouseEvent('mousemove', { bubbles: true } as any);
    Object.defineProperty(move, 'pageY', { value: 60 });
    node.dispatchEvent(move);

    // verify transform is applied during drag
    expect(node.style.transform).toBe('translate3d(0px, 60px, 0px)');

    const up = new MouseEvent('mouseup', { bubbles: true } as any);
    node.dispatchEvent(up);

    expect(refresh).toHaveBeenCalled();
  });
});
