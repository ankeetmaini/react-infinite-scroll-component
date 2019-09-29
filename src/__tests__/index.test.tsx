import Enzyme, { shallow , mount } from 'enzyme';
import InfiniteScroll from '../index';
import React from 'react';
import Adapter from 'enzyme-adapter-react-15';

Enzyme.configure({ adapter: new Adapter() })

describe('React Infinite Scroll Component', () => {

  it('renders an `.infinite-scroll-component`', () => {
    const wrapper = shallow(
      <InfiniteScroll dataLength={4} loader={"Loading..."}/>
    );
    expect(wrapper.find(`.infinite-scroll-component`)).toHaveLength(1);
  });

  it('renders custom class', () => {
    const wrapper = shallow(
      <InfiniteScroll dataLength={4} loader={"Loading..."} className="custom-class"/>
    );
    expect(wrapper.find(`.custom-class`)).toHaveLength(1);
  });

  it('renders children when passed in', () => {
    const wrapper = shallow((
      <InfiniteScroll
        dataLength={4} 
        loader={"Loading..."}
      >
        <div className="child" />
      </InfiniteScroll>
    ));
    expect(wrapper.contains(<div className="child" />));
  });

  describe('When user scrolls', () => {
    it('calls scroll handler', () => {

      jest.useFakeTimers();

      const onScrollMock = jest.fn();
      const wrapper = mount(
        <InfiniteScroll 
          onScroll={onScrollMock} 
          dataLength={4} 
          loader={"Loading..."}
          height={100}
        />
      );

      const scrollEvent = new Event('scroll');
      const node = wrapper.find('.infinite-scroll-component').instance() as unknown as EventTarget;
      node.dispatchEvent(scrollEvent);
      jest.runOnlyPendingTimers();
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(onScrollMock).toHaveBeenCalled();
    })
  })
});