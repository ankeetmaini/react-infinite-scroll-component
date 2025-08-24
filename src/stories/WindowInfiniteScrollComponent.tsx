import React from 'react';
import InfiniteScroll from '../index';
type State = {
  data: number[];
};
export default class WindowInfiniteScrollComponent extends React.Component<
  object,
  State
> {
  state = {
    data: new Array(100).fill(1),
  };

  next = () => {
    setTimeout(() => {
      const newData = [...this.state.data, new Array(100).fill(1)];
      this.setState({ data: newData });
    }, 2000);
  };
  render() {
    return (
      <>
        <InfiniteScroll
          hasMore={true}
          next={this.next}
          loader={<h1>Loading...</h1>}
          dataLength={this.state.data.length}
        >
          {this.state.data.map((_, i) => (
            <div
              key={i}
              style={{ height: 30, margin: 4, border: '1px solid hotpink' }}
            >
              #{i + 1} row
            </div>
          ))}
        </InfiniteScroll>
      </>
    );
  }
}
