import { render, cleanup, act } from '@testing-library/react';
import InfiniteScroll from '../index';
import { MockIntersectionObserver } from './setup/intersectionObserverMock';

describe('inverse mode triggers next near top', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
  });

  afterEach(cleanup);

  it('calls next when sentinel intersects in inverse mode', () => {
    const next = jest.fn();
    render(
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

    act(() => {
      MockIntersectionObserver.instances[0].triggerIntersect();
    });

    expect(next).toHaveBeenCalled();
  });

  it('applies top rootMargin in inverse mode', () => {
    const next = jest.fn();
    render(
      <InfiniteScroll
        dataLength={5}
        loader={'Loading...'}
        hasMore={true}
        next={next}
        inverse
        scrollThreshold={0.8}
      >
        <div />
      </InfiniteScroll>
    );

    const { options } = MockIntersectionObserver.instances[0];
    // inverse mode: margin applies to top, so rootMargin starts with a non-zero value
    expect(options.rootMargin).toBe('20% 0px 0px 0px');
  });
});
