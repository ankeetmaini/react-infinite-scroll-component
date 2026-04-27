import { RefObject } from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { useInfiniteScroll, UseInfiniteScrollOptions } from '../index';
import { MockIntersectionObserver } from './setup/intersectionObserverMock';

function HookWrapper(props: UseInfiniteScrollOptions) {
  const { sentinelRef, isLoading } = useInfiniteScroll(props);
  return (
    <div>
      <div
        ref={sentinelRef as RefObject<HTMLDivElement>}
        data-testid="sentinel"
      />
      {isLoading && <div data-testid="loader" />}
    </div>
  );
}

describe('useInfiniteScroll hook', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
  });

  afterEach(cleanup);

  it('calls next when sentinel intersects', () => {
    const next = jest.fn();
    render(<HookWrapper next={next} hasMore={true} dataLength={10} />);

    act(() => {
      MockIntersectionObserver.instances[0].triggerIntersect();
    });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not create an observer when hasMore is false', () => {
    render(<HookWrapper next={jest.fn()} hasMore={false} dataLength={10} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('does not call next twice before dataLength changes (load guard)', () => {
    const next = jest.fn();
    render(<HookWrapper next={next} hasMore={true} dataLength={10} />);

    const observer = MockIntersectionObserver.instances[0];
    act(() => {
      observer.triggerIntersect();
      observer.triggerIntersect();
    });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('isLoading is true after sentinel fires and false after dataLength changes', () => {
    const next = jest.fn();
    const { getByTestId, queryByTestId, rerender } = render(
      <HookWrapper next={next} hasMore={true} dataLength={10} />
    );

    expect(queryByTestId('loader')).toBeNull();

    act(() => {
      MockIntersectionObserver.instances[0].triggerIntersect();
    });

    expect(getByTestId('loader')).toBeTruthy();

    rerender(<HookWrapper next={next} hasMore={true} dataLength={20} />);

    expect(queryByTestId('loader')).toBeNull();
  });

  it('resets load guard after dataLength changes so next can fire again', () => {
    const next = jest.fn();
    const { rerender } = render(
      <HookWrapper next={next} hasMore={true} dataLength={10} />
    );

    act(() => {
      MockIntersectionObserver.instances[0].triggerIntersect();
    });
    expect(next).toHaveBeenCalledTimes(1);

    rerender(<HookWrapper next={next} hasMore={true} dataLength={20} />);

    act(() => {
      MockIntersectionObserver.instances[0].triggerIntersect();
    });
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('uses scrollableTarget string id as the IO root', () => {
    const target = document.createElement('div');
    target.id = 'hookScroll';
    document.body.appendChild(target);

    render(
      <HookWrapper
        next={jest.fn()}
        hasMore={true}
        dataLength={5}
        scrollableTarget="hookScroll"
      />
    );

    expect(MockIntersectionObserver.instances[0].options.root).toBe(target);
    document.body.removeChild(target);
  });

  it('accepts an HTMLElement directly as scrollableTarget', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    render(
      <HookWrapper
        next={jest.fn()}
        hasMore={true}
        dataLength={5}
        scrollableTarget={target}
      />
    );

    expect(MockIntersectionObserver.instances[0].options.root).toBe(target);
    document.body.removeChild(target);
  });

  it('applies top rootMargin in inverse mode', () => {
    render(
      <HookWrapper
        next={jest.fn()}
        hasMore={true}
        dataLength={5}
        inverse={true}
        scrollThreshold={0.8}
      />
    );

    const { rootMargin } = MockIntersectionObserver.instances[0].options;
    expect(rootMargin).toBe('20% 0px 0px 0px');
  });

  it('applies bottom rootMargin in normal (non-inverse) mode', () => {
    render(
      <HookWrapper
        next={jest.fn()}
        hasMore={true}
        dataLength={5}
        scrollThreshold={0.8}
      />
    );

    const { rootMargin } = MockIntersectionObserver.instances[0].options;
    expect(rootMargin).toBe('0px 0px 20% 0px');
  });

  it('does not create an observer when sentinel ref is not attached', () => {
    function NoRefWrapper(props: UseInfiniteScrollOptions) {
      useInfiniteScroll(props);
      return <div />;
    }
    render(<NoRefWrapper next={jest.fn()} hasMore={true} dataLength={5} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('does not throw when IntersectionObserver is unavailable (SSR)', () => {
    const g = globalThis as Record<string, unknown>;
    const original = g['IntersectionObserver'];
    delete g['IntersectionObserver'];

    expect(() => {
      render(<HookWrapper next={jest.fn()} hasMore={true} dataLength={5} />);
    }).not.toThrow();

    g['IntersectionObserver'] = original;
  });
});
