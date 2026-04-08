import { render, cleanup, act } from '@testing-library/react';
import InfiniteScroll from '../index';
import { MockIntersectionObserver } from './setup/intersectionObserverMock';

describe('scrollableTarget as element id', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
  });

  afterEach(() => {
    cleanup();
  });

  it('uses the provided scrollable target as the IO root', () => {
    const next = jest.fn();

    const target = document.createElement('div');
    target.id = 'scrollableDiv';
    document.body.appendChild(target);

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

    // IO root should be the resolved scrollable element
    expect(MockIntersectionObserver.instances[0].options.root).toBe(target);

    // Triggering intersection calls next
    act(() => {
      MockIntersectionObserver.instances[0].triggerIntersect();
    });

    expect(next).toHaveBeenCalled();

    document.body.removeChild(target);
  });

  it('accepts an HTMLElement directly as scrollableTarget', () => {
    const next = jest.fn();

    const target = document.createElement('div');
    document.body.appendChild(target);

    render(
      <InfiniteScroll
        dataLength={0}
        loader={'Loading...'}
        hasMore={true}
        next={next}
        scrollableTarget={target}
      >
        <div />
      </InfiniteScroll>
    );

    expect(MockIntersectionObserver.instances[0].options.root).toBe(target);

    document.body.removeChild(target);
  });
});
