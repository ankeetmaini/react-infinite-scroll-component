import React from 'react';
import ReactDOM from 'react-dom';

import Height from './height';
import NoHeight from './no-height';


const toggle = function () {
  var mode = 'noHeight';
  return () => {
    if (mode === 'noHeight') {
      mode = 'height';
      document.getElementById('app').innerHTML = '';
      ReactDOM.render(<Height/>, document.getElementById('app'));
    } else {
      mode = 'noHeight';
      document.getElementById('app').innerHTML = '';
      ReactDOM.render(<NoHeight/>, document.getElementById('app'));
    }
  };
}();

ReactDOM.render(
  <button onClick={toggle}>Toggle between Height and No Height versions</button>,
  document.getElementById('button')
);

// initial render
ReactDOM.render(<NoHeight/>, document.getElementById('app'));
