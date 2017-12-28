(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["InfiniteScroll"] = factory(require("react"));
	else
		root["InfiniteScroll"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_7__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _react = __webpack_require__(7);

	var _react2 = _interopRequireDefault(_react);

	var _propTypes = __webpack_require__(5);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _utilsThrottle = __webpack_require__(1);

	var _utilsThrottle2 = _interopRequireDefault(_utilsThrottle);

	var InfiniteScroll = (function (_Component) {
	  _inherits(InfiniteScroll, _Component);

	  function InfiniteScroll(props) {
	    _classCallCheck(this, InfiniteScroll);

	    _get(Object.getPrototypeOf(InfiniteScroll.prototype), 'constructor', this).call(this);
	    this.state = {
	      showLoader: false,
	      lastScrollTop: 0,
	      actionTriggered: false,
	      pullToRefreshThresholdBreached: false
	    };
	    // variables to keep track of pull down behaviour
	    this.startY = 0;
	    this.currentY = 0;
	    this.dragging = false;
	    // will be populated in componentDidMount
	    // based on the height of the pull down element
	    this.maxPullDownDistance = 0;

	    this.onScrollListener = this.onScrollListener.bind(this);
	    this.throttledOnScrollListener = (0, _utilsThrottle2['default'])(this.onScrollListener, 150).bind(this);
	    this.onStart = this.onStart.bind(this);
	    this.onMove = this.onMove.bind(this);
	    this.onEnd = this.onEnd.bind(this);
	  }

	  _createClass(InfiniteScroll, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      this.el = this.props.height ? this._infScroll : window;
	      this.el.addEventListener('scroll', this.throttledOnScrollListener);

	      if (typeof this.props.initialScrollY === 'number' && this.el.scrollHeight > this.props.initialScrollY) {
	        this.el.scrollTo(0, this.props.initialScrollY);
	      }

	      if (this.props.pullDownToRefresh) {
	        this.el.addEventListener('touchstart', this.onStart);
	        this.el.addEventListener('touchmove', this.onMove);
	        this.el.addEventListener('touchend', this.onEnd);

	        this.el.addEventListener('mousedown', this.onStart);
	        this.el.addEventListener('mousemove', this.onMove);
	        this.el.addEventListener('mouseup', this.onEnd);

	        // get BCR of pullDown element to position it above
	        this.maxPullDownDistance = this._pullDown.firstChild.getBoundingClientRect().height;
	        this.forceUpdate();

	        if (typeof this.props.refreshFunction !== 'function') {
	          throw new Error('Mandatory prop "refreshFunction" missing.\n          Pull Down To Refresh functionality will not work\n          as expected. Check README.md for usage\'');
	        }
	      }
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      this.el.removeEventListener('scroll', this.throttledOnScrollListener);

	      if (this.props.pullDownToRefresh) {
	        this.el.removeEventListener('touchstart', this.onStart);
	        this.el.removeEventListener('touchmove', this.onMove);
	        this.el.removeEventListener('touchend', this.onEnd);

	        this.el.removeEventListener('mousedown', this.onStart);
	        this.el.removeEventListener('mousemove', this.onMove);
	        this.el.removeEventListener('mouseup', this.onEnd);
	      }
	    }
	  }, {
	    key: 'componentWillReceiveProps',
	    value: function componentWillReceiveProps(props) {
	      // new data was sent in
	      this.setState({
	        showLoader: false,
	        actionTriggered: false,
	        pullToRefreshThresholdBreached: false
	      });
	    }
	  }, {
	    key: 'onStart',
	    value: function onStart(evt) {
	      if (this.state.lastScrollTop) return;

	      this.dragging = true;
	      this.startY = evt.pageY || evt.touches[0].pageY;
	      this.currentY = this.startY;

	      this._infScroll.style.willChange = 'transform';
	      this._infScroll.style.transition = 'transform 0.2s cubic-bezier(0,0,0.31,1)';
	    }
	  }, {
	    key: 'onMove',
	    value: function onMove(evt) {
	      if (!this.dragging) return;
	      this.currentY = evt.pageY || evt.touches[0].pageY;

	      // user is scrolling down to up
	      if (this.currentY < this.startY) return;

	      if (this.currentY - this.startY >= this.props.pullDownToRefreshThreshold) {
	        this.setState({
	          pullToRefreshThresholdBreached: true
	        });
	      }

	      // so you can drag upto 1.5 times of the maxPullDownDistance
	      if (this.currentY - this.startY > this.maxPullDownDistance * 1.5) return;

	      this._infScroll.style.overflow = 'visible';
	      this._infScroll.style.transform = 'translate3d(0px, ' + (this.currentY - this.startY) + 'px, 0px)';
	    }
	  }, {
	    key: 'onEnd',
	    value: function onEnd(evt) {
	      var _this = this;

	      this.startY = 0;
	      this.currentY = 0;

	      this.dragging = false;

	      if (this.state.pullToRefreshThresholdBreached) {
	        this.props.refreshFunction && this.props.refreshFunction();
	      }

	      requestAnimationFrame(function () {
	        _this._infScroll.style.overflow = 'auto';
	        _this._infScroll.style.transform = 'none';
	        _this._infScroll.style.willChange = 'none';
	      });
	    }
	  }, {
	    key: 'isElementAtBottom',
	    value: function isElementAtBottom(target) {
	      var scrollThreshold = arguments.length <= 1 || arguments[1] === undefined ? 0.8 : arguments[1];

	      var clientHeight = target === document.body || target === document.documentElement ? window.screen.availHeight : target.clientHeight;

	      var scrolled = scrollThreshold * (target.scrollHeight - target.scrollTop);
	      return scrolled <= clientHeight;
	    }
	  }, {
	    key: 'onScrollListener',
	    value: function onScrollListener(event) {
	      var _this2 = this;

	      if (typeof this.props.onScroll === 'function') {
	        // Execute this callback in next tick so that it does not affect the
	        // functionality of the library.
	        setTimeout(function () {
	          return _this2.props.onScroll(event);
	        }, 0);
	      }

	      var target = this.props.height ? event.target : document.documentElement.scrollTop ? document.documentElement : document.body;

	      // if user scrolls up, remove action trigger lock
	      if (target.scrollTop < this.state.lastScrollTop) {
	        this.setState({
	          actionTriggered: false,
	          lastScrollTop: target.scrollTop
	        });
	        return; // user's going up, we don't care
	      }

	      // return immediately if the action has already been triggered,
	      // prevents multiple triggers.
	      if (this.state.actionTriggered) return;

	      var atBottom = this.isElementAtBottom(target, this.props.scrollThreshold);

	      // call the `next` function in the props to trigger the next data fetch
	      if (atBottom && this.props.hasMore) {
	        this.props.next();
	        this.setState({ actionTriggered: true, showLoader: true });
	      }
	      this.setState({ lastScrollTop: target.scrollTop });
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var _this3 = this;

	      var style = _extends({
	        height: this.props.height || 'auto',
	        overflow: 'auto',
	        WebkitOverflowScrolling: 'touch'
	      }, this.props.style);
	      var hasChildren = this.props.hasChildren || !!(this.props.children && this.props.children.length);

	      // because heighted infiniteScroll visualy breaks
	      // on drag down as overflow becomes visible
	      var outerDivStyle = this.props.pullDownToRefresh && this.props.height ? { overflow: 'auto' } : {};
	      return _react2['default'].createElement(
	        'div',
	        { style: outerDivStyle },
	        _react2['default'].createElement(
	          'div',
	          {
	            className: 'infinite-scroll-component',
	            ref: function (infScroll) {
	              return _this3._infScroll = infScroll;
	            },
	            style: style
	          },
	          this.props.pullDownToRefresh && _react2['default'].createElement(
	            'div',
	            {
	              style: { position: 'relative' },
	              ref: function (pullDown) {
	                return _this3._pullDown = pullDown;
	              }
	            },
	            _react2['default'].createElement(
	              'div',
	              { style: {
	                  position: 'absolute',
	                  left: 0,
	                  right: 0,
	                  top: -1 * this.maxPullDownDistance
	                } },
	              !this.state.pullToRefreshThresholdBreached && this.props.pullDownToRefreshContent,
	              this.state.pullToRefreshThresholdBreached && this.props.releaseToRefreshContent
	            )
	          ),
	          this.props.children,
	          !this.state.showLoader && !hasChildren && this.props.hasMore && this.props.loader,
	          this.state.showLoader && this.props.loader,
	          !this.props.hasMore && this.props.endMessage
	        )
	      );
	    }
	  }]);

	  return InfiniteScroll;
	})(_react.Component);

	exports['default'] = InfiniteScroll;

	InfiniteScroll.defaultProps = {
	  pullDownToRefreshContent: _react2['default'].createElement(
	    'h3',
	    null,
	    'Pull down to refresh'
	  ),
	  releaseToRefreshContent: _react2['default'].createElement(
	    'h3',
	    null,
	    'Release to refresh'
	  ),
	  pullDownToRefreshThreshold: 100,
	  disableBrowserPullToRefresh: true
	};

	InfiniteScroll.propTypes = {
	  next: _propTypes2['default'].func,
	  hasMore: _propTypes2['default'].bool,
	  children: _propTypes2['default'].node,
	  loader: _propTypes2['default'].node.isRequired,
	  scrollThreshold: _propTypes2['default'].number,
	  endMessage: _propTypes2['default'].node,
	  style: _propTypes2['default'].object,
	  height: _propTypes2['default'].number,
	  hasChildren: _propTypes2['default'].bool,
	  pullDownToRefresh: _propTypes2['default'].bool,
	  pullDownToRefreshContent: _propTypes2['default'].node,
	  releaseToRefreshContent: _propTypes2['default'].node,
	  pullDownToRefreshThreshold: _propTypes2['default'].number,
	  refreshFunction: _propTypes2['default'].func,
	  onScroll: _propTypes2['default'].func
	};
	module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	// https://remysharp.com/2010/07/21/throttling-function-calls
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = throttle;

	function throttle(fn, threshhold, scope) {
	  threshhold || (threshhold = 250);
	  var last, deferTimer;
	  return function () {
	    var context = scope || this;

	    var now = +new Date(),
	        args = arguments;
	    if (last && now < last + threshhold) {
	      // hold on to it
	      clearTimeout(deferTimer);
	      deferTimer = setTimeout(function () {
	        last = now;
	        fn.apply(context, args);
	      }, threshhold);
	    } else {
	      last = now;
	      fn.apply(context, args);
	    }
	  };
	}

	module.exports = exports["default"];

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	function makeEmptyFunction(arg) {
	  return function () {
	    return arg;
	  };
	}

	/**
	 * This function accepts and discards inputs; it has no side effects. This is
	 * primarily useful idiomatically for overridable function endpoints which
	 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
	 */
	var emptyFunction = function emptyFunction() {};

	emptyFunction.thatReturns = makeEmptyFunction;
	emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
	emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
	emptyFunction.thatReturnsNull = makeEmptyFunction(null);
	emptyFunction.thatReturnsThis = function () {
	  return this;
	};
	emptyFunction.thatReturnsArgument = function (arg) {
	  return arg;
	};

	module.exports = emptyFunction;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var validateFormat = function validateFormat(format) {};

	if (false) {
	  validateFormat = function validateFormat(format) {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  };
	}

	function invariant(condition, format, a, b, c, d, e, f) {
	  validateFormat(format);

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	      error.name = 'Invariant Violation';
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	}

	module.exports = invariant;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';

	var emptyFunction = __webpack_require__(2);
	var invariant = __webpack_require__(3);
	var ReactPropTypesSecret = __webpack_require__(6);

	module.exports = function() {
	  function shim(props, propName, componentName, location, propFullName, secret) {
	    if (secret === ReactPropTypesSecret) {
	      // It is still safe when called from React.
	      return;
	    }
	    invariant(
	      false,
	      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
	      'Use PropTypes.checkPropTypes() to call them. ' +
	      'Read more at http://fb.me/use-check-prop-types'
	    );
	  };
	  shim.isRequired = shim;
	  function getShim() {
	    return shim;
	  };
	  // Important!
	  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
	  var ReactPropTypes = {
	    array: shim,
	    bool: shim,
	    func: shim,
	    number: shim,
	    object: shim,
	    string: shim,
	    symbol: shim,

	    any: shim,
	    arrayOf: getShim,
	    element: shim,
	    instanceOf: getShim,
	    node: shim,
	    objectOf: getShim,
	    oneOf: getShim,
	    oneOfType: getShim,
	    shape: getShim
	  };

	  ReactPropTypes.checkPropTypes = emptyFunction;
	  ReactPropTypes.PropTypes = ReactPropTypes;

	  return ReactPropTypes;
	};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	if (false) {
	  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
	    Symbol.for &&
	    Symbol.for('react.element')) ||
	    0xeac7;

	  var isValidElement = function(object) {
	    return typeof object === 'object' &&
	      object !== null &&
	      object.$$typeof === REACT_ELEMENT_TYPE;
	  };

	  // By explicitly using `prop-types` you are opting into new development behavior.
	  // http://fb.me/prop-types-in-prod
	  var throwOnDirectAccess = true;
	  module.exports = require('./factoryWithTypeCheckers')(isValidElement, throwOnDirectAccess);
	} else {
	  // By explicitly using `prop-types` you are opting into new production behavior.
	  // http://fb.me/prop-types-in-prod
	  module.exports = __webpack_require__(4)();
	}


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';

	var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

	module.exports = ReactPropTypesSecret;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ })
/******/ ])
});
;