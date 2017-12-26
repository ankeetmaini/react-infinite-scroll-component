import React from 'react';
import ReactDOM from 'react-dom';

import Height from './height';
import NoHeight from './no-height';
import AncestorScroll from './ancestor-scroll';

const buttonStyle = {
  padding: 10,
  margin: 10,
  cursor: 'pointer',
};

const renderNoHeight = () => {
  const appEl = document.getElementById('app');
  appEl.innerHTML = '';
  appEl.style.height = '';ReactDOM.render(<NoHeight/>, document.getElementById('app'));
}

const renderHeight = () => {
  const appEl = document.getElementById('app');
  appEl.innerHTML = '';
  appEl.style.height = '';ReactDOM.render(<Height/>, document.getElementById('app'));
};

const renderAncestorScroll = () => {
  const appEl = document.getElementById('app');
  appEl.innerHTML = '';
  appEl.style.height = '300px';
  ReactDOM.render(<AncestorScroll/>, document.getElementById('app'));
};


ReactDOM.render(
  <div>
    <button onClick={renderNoHeight} onTouchStart={renderNoHeight} style={buttonStyle}>Body scroll, no height, like Facebook timeline!</button>
    <button onClick={renderAncestorScroll} onTouchStart={renderAncestorScroll} style={buttonStyle}>Ancestor scroll, no height</button>
    <button onClick={renderHeight} onTouchStart={renderHeight} style={buttonStyle}>Fixed container height</button>
  </div>,
  document.getElementById('button')
);

// initial render
ReactDOM.render(<NoHeight/>, document.getElementById('app'));
