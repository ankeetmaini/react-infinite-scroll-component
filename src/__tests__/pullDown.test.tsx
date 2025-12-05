import React from 'react';
import { render, cleanup } from '@testing-library/react';
import InfiniteScroll from '../index';

describe('pull down to refresh', () => {
  beforeAll(() => {
    // ensure RAF exists
    // @ts-ignore
    global.requestAnimationFrame = (cb: any) => cb();
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

    const up = new MouseEvent('mouseup', { bubbles: true } as any);
    node.dispatchEvent(up);

    expect(refresh).toHaveBeenCalled();
  });
});
