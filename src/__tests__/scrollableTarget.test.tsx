import React from 'react';
import { render, cleanup } from '@testing-library/react';
import InfiniteScroll from '../index';

describe('scrollableTarget as element id', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('listens on the provided scrollable target', () => {
    const next = jest.fn();

    const target = document.createElement('div');
    target.id = 'scrollableDiv';
    document.body.appendChild(target);

    Object.defineProperty(target, 'clientHeight', {
      configurable: true,
      get: () => 100,
    });
    Object.defineProperty(target, 'scrollHeight', {
      configurable: true,
      get: () => 200,
    });
    Object.defineProperty(target, 'scrollTop', {
      configurable: true,
      get: () => 100,
    });

    render(
      <InfiniteScroll
        dataLength={0}
        loader={'Loading...'}
        hasMore={true}
        next={next}
        scrollThreshold="0px"
        scrollableTarget="scrollableDiv"
      >
        <div />
      </InfiniteScroll>
    );

    target.dispatchEvent(new Event('scroll'));

    jest.advanceTimersByTime(200);

    expect(next).toHaveBeenCalled();

    document.body.removeChild(target);
  });
});
