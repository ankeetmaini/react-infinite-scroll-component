import React from 'react';
import { render, cleanup } from '@testing-library/react';
import InfiniteScroll from '../index';

describe('hasChildren logic and loader visibility', () => {
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
    expect(queryByText('Loading...')).toBeNull();
  });
});
