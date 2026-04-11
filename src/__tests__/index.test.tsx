import { render, cleanup, act } from '@testing-library/react';
import InfiniteScroll from '../index';
import { MockIntersectionObserver } from './setup/intersectionObserverMock';

describe('React Infinite Scroll Component', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
  });

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
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
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
    expect(setTimeoutSpy).toHaveBeenCalled();
    expect(onScrollMock).toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
    jest.useRealTimers();
  });

  it('calls scroll handler via window when no height or scrollableTarget', () => {
    jest.useFakeTimers();
    const onScrollMock = jest.fn();

    render(
      <InfiniteScroll
        onScroll={onScrollMock}
        dataLength={4}
        loader={'Loading...'}
        hasMore={false}
        next={() => {}}
      >
        <div />
      </InfiniteScroll>
    );

    window.dispatchEvent(new Event('scroll'));
    jest.runOnlyPendingTimers();
    expect(onScrollMock).toHaveBeenCalled();
    jest.useRealTimers();
  });

  describe('When missing the dataLength prop', () => {
    it('throws an error', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const props = { loader: 'Loading...', hasMore: false, next: () => {} };

      // @ts-ignore
      expect(() => render(<InfiniteScroll {...props} />)).toThrow(
        'mandatory prop "dataLength" is missing'
      );
      consoleSpy.mockRestore();
    });
  });

  describe('When pullDownToRefresh is true but refreshFunction is missing', () => {
    it('throws an error', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() =>
        render(
          <InfiniteScroll
            dataLength={0}
            loader={'Loading...'}
            hasMore={false}
            next={() => {}}
            pullDownToRefresh
          >
            <div />
          </InfiniteScroll>
        )
      ).toThrow('Mandatory prop "refreshFunction" missing');

      consoleSpy.mockRestore();
    });
  });

  describe('initialScrollY', () => {
    it('calls scrollTo on mount when scrollHeight exceeds initialScrollY', () => {
      const scrollToSpy = jest.fn();
      const originalScrollTo = HTMLElement.prototype.scrollTo;
      HTMLElement.prototype.scrollTo = scrollToSpy as any;

      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        get: () => 500,
      });

      render(
        <InfiniteScroll
          dataLength={0}
          loader={'Loading...'}
          hasMore={false}
          next={() => {}}
          height={100}
          initialScrollY={200}
        >
          <div />
        </InfiniteScroll>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 200);

      HTMLElement.prototype.scrollTo = originalScrollTo;
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        get: () => 0,
      });
    });

    it('does not call scrollTo when scrollHeight is insufficient', () => {
      const scrollToSpy = jest.fn();
      const originalScrollTo = HTMLElement.prototype.scrollTo;
      HTMLElement.prototype.scrollTo = scrollToSpy as any;

      // scrollHeight defaults to 0 in jsdom — less than initialScrollY
      render(
        <InfiniteScroll
          dataLength={0}
          loader={'Loading...'}
          hasMore={false}
          next={() => {}}
          height={100}
          initialScrollY={200}
        >
          <div />
        </InfiniteScroll>
      );

      expect(scrollToSpy).not.toHaveBeenCalled();

      HTMLElement.prototype.scrollTo = originalScrollTo;
    });

    it('scrolls scrollableTarget to initialScrollY when scrollHeight is sufficient', () => {
      const target = document.createElement('div');
      const scrollToSpy = jest.fn();
      target.scrollTo = scrollToSpy as unknown as typeof target.scrollTo;
      Object.defineProperty(target, 'scrollHeight', {
        configurable: true,
        get: () => 500,
      });
      document.body.appendChild(target);

      render(
        <InfiniteScroll
          dataLength={0}
          loader={'Loading...'}
          hasMore={false}
          next={() => {}}
          scrollableTarget={target}
          initialScrollY={200}
        >
          <div />
        </InfiniteScroll>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 200);

      document.body.removeChild(target);
    });
  });

  describe('When user scrolls to the bottom', () => {
    it('does not show loader if hasMore is false', () => {
      const { queryByText } = render(
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
      // No IO observer created, loader never shown
      expect(queryByText('Loading...')).toBeFalsy();
    });

    it('shows loader if hasMore is true after IO fires', () => {
      const { getByText } = render(
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

      act(() => {
        MockIntersectionObserver.instances[0].triggerIntersect();
      });

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
