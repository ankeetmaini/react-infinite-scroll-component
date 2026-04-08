import { render, cleanup } from '@testing-library/react';
import InfiniteScroll from '../index';
import { MockIntersectionObserver } from './setup/intersectionObserverMock';

describe('hasChildren logic and loader visibility', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
  });

  afterEach(cleanup);

  it('shows loader when hasMore and no children', () => {
    const { getByText } = render(
      <InfiniteScroll
        dataLength={0}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={100}
      >
        {[]}
      </InfiniteScroll>
    );
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('does not show loader when hasChildren=true and non-array child', () => {
    // With IO the loader is only shown synchronously when there are no children.
    // hasChildren=true suppresses the immediate loader render — IO must fire first.
    const { queryByText } = render(
      <InfiniteScroll
        dataLength={1}
        loader={'Loading...'}
        hasMore={true}
        next={() => {}}
        height={100}
        hasChildren
      >
        <div>child</div>
      </InfiniteScroll>
    );
    // IO has not fired yet, so showLoader=false AND hasChildren=true suppresses the immediate render
    expect(queryByText('Loading...')).toBeNull();
  });
});
