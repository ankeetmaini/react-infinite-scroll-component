import { render, cleanup, act } from '@testing-library/react';
import InfiniteScroll from '../index';
import { MockIntersectionObserver } from './setup/intersectionObserverMock';

describe('next is called when content fits viewport (no scrollbar)', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
  });

  afterEach(cleanup);

  it('calls next when IO fires on mount (sentinel immediately visible)', () => {
    const next = jest.fn();
    render(
      <InfiniteScroll
        dataLength={5}
        loader={'Loading...'}
        hasMore={true}
        next={next}
        height={400}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>{i}</div>
        ))}
      </InfiniteScroll>
    );

    // Simulate IO detecting that the sentinel is immediately visible
    // (i.e., content is shorter than the container — no scrollbar)
    act(() => {
      MockIntersectionObserver.instances[0].triggerIntersect();
    });

    expect(next).toHaveBeenCalled();
  });

  it('does not call next when IO never fires (content overflows)', () => {
    const next = jest.fn();
    render(
      <InfiniteScroll
        dataLength={20}
        loader={'Loading...'}
        hasMore={true}
        next={next}
        height={100}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ height: 30 }}>
            {i}
          </div>
        ))}
      </InfiniteScroll>
    );

    // IO hasn't fired — next should not be called
    expect(next).not.toHaveBeenCalled();
  });

  it('does not call next when hasMore is false', () => {
    const next = jest.fn();
    render(
      <InfiniteScroll
        dataLength={3}
        loader={'Loading...'}
        hasMore={false}
        next={next}
        height={400}
      >
        {[1, 2, 3].map((i) => (
          <div key={i}>{i}</div>
        ))}
      </InfiniteScroll>
    );

    expect(next).not.toHaveBeenCalled();
  });
});
