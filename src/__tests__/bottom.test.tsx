import { render, cleanup } from '@testing-library/react';
import InfiniteScroll from '../index';

describe('bottom detection triggers next', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('calls next when scrolled to bottom (height container)', () => {
    const next = jest.fn();
    const { container } = render(
      <InfiniteScroll
        dataLength={0}
        loader={'Loading...'}
        hasMore={true}
        next={next}
        height={100}
        scrollThreshold="0px"
      >
        <div />
      </InfiniteScroll>
    );

    const node = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;

    Object.defineProperty(node, 'clientHeight', {
      configurable: true,
      get: () => 100,
    });
    Object.defineProperty(node, 'scrollHeight', {
      configurable: true,
      get: () => 200,
    });
    Object.defineProperty(node, 'scrollTop', {
      configurable: true,
      get: () => 100,
    });

    node.dispatchEvent(new Event('scroll'));

    jest.advanceTimersByTime(200);

    expect(next).toHaveBeenCalled();
  });
});
