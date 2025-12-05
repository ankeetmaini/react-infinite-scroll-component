import React from 'react';
import { render, cleanup } from '@testing-library/react';
import InfiniteScroll from '../index';

describe('inverse mode triggers next near top', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('calls next when at top (inverse)', () => {
    const next = jest.fn();
    const { container } = render(
      <InfiniteScroll
        dataLength={10}
        loader={'Loading...'}
        hasMore={true}
        next={next}
        height={100}
        inverse
        scrollThreshold="9999px"
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
      get: () => 1000,
    });
    Object.defineProperty(node, 'scrollTop', {
      configurable: true,
      get: () => 0,
    });

    node.dispatchEvent(new Event('scroll'));

    jest.advanceTimersByTime(200);

    expect(next).toHaveBeenCalled();
  });
});
