import { StrictMode } from 'react';
import { render, cleanup, act } from '@testing-library/react';
import InfiniteScroll from '../index';

afterEach(cleanup);

it('calls refresh once per gesture in StrictMode', () => {
  const refresh = jest.fn();
  const { container } = render(
    <StrictMode>
      <InfiniteScroll
        dataLength={1}
        loader="Loading"
        next={() => {}}
        hasMore={false}
        height={200}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        refreshFunction={refresh}
        pullDownToRefreshContent={<div>Pull</div>}
      >
        <div />
      </InfiniteScroll>
    </StrictMode>
  );
  const node = container.querySelector('.infinite-scroll-component')!;
  const dispatch = (type: string, pageY: number) => {
    const event = new MouseEvent(type, { bubbles: true });
    Object.defineProperty(event, 'pageY', { value: pageY });
    act(() => {
      node.dispatchEvent(event);
    });
  };
  dispatch('mousedown', 0);
  dispatch('mousemove', 60);
  dispatch('mouseup', 60);
  expect(refresh).toHaveBeenCalledTimes(1);
  dispatch('mouseup', 60);
  expect(refresh).toHaveBeenCalledTimes(1);
  dispatch('mousedown', 0);
  dispatch('mousemove', 60);
  dispatch('mouseup', 60);
  expect(refresh).toHaveBeenCalledTimes(2);
});
