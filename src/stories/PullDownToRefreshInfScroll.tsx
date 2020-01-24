import React from 'react';
import { render } from 'react-dom';
import InfiniteScroll from '../index';

const style = {
  height: 30,
  border: '1px solid green',
  margin: 6,
  padding: 8,
  backgroundColor: 'white',
};

export default class App extends React.Component {
  state = {
    items: Array.from({ length: 20 }),
  };

  fetchMoreData = () => {
    // a fake async api call like which sends
    // 20 more records in 1.5 secs
    setTimeout(() => {
      this.setState({
        items: this.state.items.concat(Array.from({ length: 20 })),
      });
    }, 1500);
  };

  render() {
    return (
      <div>
        <h1>demo: Pull down to refresh</h1>
        <hr />
        <InfiniteScroll
          dataLength={this.state.items.length}
          next={this.fetchMoreData}
          hasMore={true}
          loader={<h4>Loading...</h4>}
          pullDownToRefresh
          pullDownToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>
              &#8595; Pull down to refresh
            </h3>
          }
          // pullDownToRefreshContentOnTop
          releaseToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
          }
          refreshFunction={this.fetchMoreData}
        >
          {this.state.items.map((_, index) => (
            <div style={style} key={index}>
              div - #{index}
            </div>
          ))}
        </InfiniteScroll>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
