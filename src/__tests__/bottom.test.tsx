import { render, cleanup, act } from '@testing-library/react';
import InfiniteScroll from '../index';
import { MockIntersectionObserver } from './setup/intersectionObserverMock';

describe('bottom detection triggers next', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
  });

  afterEach(cleanup);

  it('calls next when sentinel intersects (height container)', () => {
    const next = jest.fn();
    render(
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

    act(() => {
      MockIntersectionObserver.instances[0].triggerIntersect();
    });

    expect(next).toHaveBeenCalled();
  });

  it('does not call next when hasMore is false', () => {
    const next = jest.fn();
    render(
      <InfiniteScroll
        dataLength={0}
        loader={'Loading...'}
        hasMore={false}
        next={next}
        height={100}
      >
        <div />
      </InfiniteScroll>
    );

    // No observer is created when hasMore=false (no sentinel rendered)
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(next).not.toHaveBeenCalled();
  });

  it('does not call next twice before dataLength changes', () => {
    const next = jest.fn();
    render(
      <InfiniteScroll
        dataLength={0}
        loader={'Loading...'}
        hasMore={true}
        next={next}
        height={100}
      >
        <div />
      </InfiniteScroll>
    );

    const observer = MockIntersectionObserver.instances[0];

    act(() => {
      observer.triggerIntersect();
      observer.triggerIntersect(); // second fire before dataLength changes
    });

    expect(next).toHaveBeenCalledTimes(1);
  });
});
