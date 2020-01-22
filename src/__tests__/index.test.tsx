import React from 'react';
import { render, cleanup } from '@testing-library/react';
import InfiniteScroll from '../index';

describe('React Infinite Scroll Component', () => {
  const originalConsoleError = console.error;

  afterEach(() => {
    cleanup();
    console.error = originalConsoleError;
  });

  it('renders .infinite-scroll-component', () => {
    const { container } = render(
      <InfiniteScroll
        dataLength={4}
        loader={'Loading...'}
        hasMore={false}
        next={() => {}}
      >
        <div />
      </InfiniteScroll>
    );
    expect(
      container.querySelectorAll('.infinite-scroll-component').length
    ).toBe(1);
  });

  it('renders custom class', () => {
    const { container } = render(
      <InfiniteScroll
        dataLength={4}
        loader={'Loading...'}
        className="custom-class"
        hasMore={false}
        next={() => {}}
      >
        <div />
      </InfiniteScroll>
    );
    expect(container.querySelectorAll('.custom-class').length).toBe(1);
  });

  it('renders custom id', () => {
    const { container } = render(
      <InfiniteScroll
        dataLength={4}
        loader={'Loading...'}
        id="custom-id"
        hasMore={false}
        next={() => {}}
      >
        <div />
      </InfiniteScroll>
    );
    expect(container.querySelectorAll('#custom-id').length).toBe(1);
  });

  it('renders children when passed in', () => {
    const { container } = render(
      <InfiniteScroll
        dataLength={4}
        loader={'Loading...'}
        hasMore={false}
        next={() => {}}
      >
        <div className="child" />
      </InfiniteScroll>
    );
    expect(container.querySelectorAll('.child').length).toBe(1);
  });

  it('calls scroll handler if provided, when user scrolls', () => {
    jest.useFakeTimers();
    const onScrollMock = jest.fn();

    const { container } = render(
      <InfiniteScroll
        onScroll={onScrollMock}
        dataLength={4}
        loader={'Loading...'}
        height={100}
        hasMore={false}
        next={() => {}}
      >
        <div />
      </InfiniteScroll>
    );

    const scrollEvent = new Event('scroll');
    const node = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;

    node.dispatchEvent(scrollEvent);
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(onScrollMock).toHaveBeenCalled();
  });

  describe('When missing the dataLength prop', () => {
    it('throws an error', () => {
      console.error = jest.fn();
      const props = { loader: 'Loading...', hasMore: false, next: () => {} };

      // @ts-ignore
      expect(() => render(<InfiniteScroll {...props} />)).toThrow(Error);
      // @ts-ignore
      expect(console.error.mock.calls[0][0]).toContain(
        '"dataLength" is missing'
      );
    });
  });

  describe('When user scrolls to the bottom', () => {
    it('does not show loader if hasMore is false', () => {
      const { container, queryByText } = render(
        <InfiniteScroll
          dataLength={4}
          loader={'Loading...'}
          hasMore={false}
          scrollThreshold={0}
          next={() => {}}
        >
          <div />
        </InfiniteScroll>
      );

      const scrollEvent = new Event('scroll');
      const node = container.querySelector(
        '.infinite-scroll-component'
      ) as HTMLElement;
      node.dispatchEvent(scrollEvent);
      expect(queryByText('Loading...')).toBeFalsy();
    });

    it('shows loader if hasMore is true', () => {
      const { container, getByText } = render(
        <InfiniteScroll
          dataLength={4}
          loader={'Loading...'}
          hasMore={true}
          scrollThreshold={0}
          next={() => {}}
          height={100}
        >
          <div />
        </InfiniteScroll>
      );

      const scrollEvent = new Event('scroll');
      const node = container.querySelector(
        '.infinite-scroll-component'
      ) as HTMLElement;
      node.dispatchEvent(scrollEvent);
      expect(getByText('Loading...')).toBeTruthy();
    });
  });

  it('shows end message', () => {
    const { queryByText } = render(
      <InfiniteScroll
        dataLength={4}
        loader={'Loading...'}
        endMessage={'Reached end.'}
        hasMore={false}
        next={() => {}}
      >
        <div />
      </InfiniteScroll>
    );
    expect(queryByText('Reached end.')).toBeTruthy();
  });

  it('adds a classname to the outer div', () => {
    const { container } = render(
      <InfiniteScroll
        hasMore={true}
        dataLength={10}
        next={() => {}}
        loader={<div>Loading...</div>}
      >
        <div />
      </InfiniteScroll>
    );
    const outerDiv = container.getElementsByClassName(
      'infinite-scroll-component__outerdiv'
    );
    expect(outerDiv.length).toBeTruthy();
  });
});
