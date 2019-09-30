import React from 'react';
import { render } from '@testing-library/react'
import InfiniteScroll from '../index';

describe('React Infinite Scroll Component', () => {

  it('renders .infinite-scroll-component', () => {
    const { container } = render(
      <InfiniteScroll 
        dataLength={4} 
        loader={"Loading..."}
      />
    );
    expect(container.querySelectorAll('.infinite-scroll-component').length).toBe(1)
  });

  it('renders custom class', () => {
    const { container } = render(
      <InfiniteScroll 
        dataLength={4} 
        loader={"Loading..."}
        className="custom-class"
      />
    );
    expect(container.querySelectorAll('.custom-class').length).toBe(1);
  });

  it('renders children when passed in', () => {
    const { container } = render(
      <InfiniteScroll
        dataLength={4} 
        loader={"Loading..."}
      >
        <div className="child" />
      </InfiniteScroll>
    );
    expect(container.querySelectorAll('.child').length).toBe(1)
  });

  describe('When user scrolls', () => {

    it('calls scroll handler', () => {
      jest.useFakeTimers();
      const onScrollMock = jest.fn();

      const { container } = render(
        <InfiniteScroll 
          onScroll={onScrollMock} 
          dataLength={4} 
          loader={"Loading..."}
          height={100}
        />
      );

      const scrollEvent = new Event('scroll');
      const node = container.querySelector('.infinite-scroll-component') as HTMLElement;

      node.dispatchEvent(scrollEvent);
      jest.runOnlyPendingTimers();
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(onScrollMock).toHaveBeenCalled();
    })
  });

  describe('When user scrolls to the bottom', () => {

    it('shows loader if hasMore is true', () => {
      const { container, getByText } = render(
        <InfiniteScroll 
          dataLength={4} 
          loader={"Loading..."}
          hasMore={true}
          scrollThreshold={0}
        />
      );

      const scrollEvent = new Event('scroll');
      const node = container.querySelector('.infinite-scroll-component') as HTMLElement;
      node.dispatchEvent(scrollEvent);
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('does not show loader if hasMore is false', () => {
      const { container, queryByText } = render(
        <InfiniteScroll 
          dataLength={4} 
          loader={"Loading..."}
          hasMore={false}
          scrollThreshold={0}
        />
      );

      const scrollEvent = new Event('scroll');
      const node = container.querySelector('.infinite-scroll-component') as HTMLElement;
      node.dispatchEvent(scrollEvent);
      expect(queryByText('Loading...')).toBeFalsy();
    });
  });

  it('shows end message', () => {
    const { queryByText } = render(
      <InfiniteScroll
        dataLength={4} 
        loader={"Loading..."}
        endMessage={"Reached end."}
      /> 
    );
    expect(queryByText('Reached end.')).toBeTruthy();
  })
});