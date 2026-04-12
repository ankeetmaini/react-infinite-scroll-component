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

  it('renders sentinel as first child in inverse mode', () => {
    const { container } = render(
      <InfiniteScroll
        dataLength={5}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={100}
        inverse
      >
        <div id="child" />
      </InfiniteScroll>
    );

    const inner = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;
    // sentinel must be the first DOM child so the IO top-margin fires correctly
    expect(inner.firstElementChild).toBe(
      MockIntersectionObserver.instances[0].observedElements[0]
    );
  });

  it('renders sentinel as last child in normal (non-inverse) mode', () => {
    const { container } = render(
      <InfiniteScroll
        dataLength={5}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={100}
      >
        <div id="child" />
      </InfiniteScroll>
    );

    const inner = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;
    // sentinel must be the last DOM child for the IO bottom-margin to work
    expect(inner.lastElementChild).toBe(
      MockIntersectionObserver.instances[0].observedElements[0]
    );
  });
});
