var InfiniteScroll = (function (React) {
    'use strict';

    var React__default = 'default' in React ? React['default'] : React;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /* eslint-disable no-undefined,no-param-reassign,no-shadow */

    /**
     * Throttle execution of a function. Especially useful for rate limiting
     * execution of handlers on events like resize and scroll.
     *
     * @param  {Number}    delay          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
     * @param  {Boolean}   [noTrailing]   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
     *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
     *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
     *                                    the internal counter is reset)
     * @param  {Function}  callback       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
     *                                    to `callback` when the throttled-function is executed.
     * @param  {Boolean}   [debounceMode] If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
     *                                    schedule `callback` to execute after `delay` ms.
     *
     * @return {Function}  A new, throttled, function.
     */
    function throttle (delay, noTrailing, callback, debounceMode) {
      /*
       * After wrapper has stopped being called, this timeout ensures that
       * `callback` is executed at the proper times in `throttle` and `end`
       * debounce modes.
       */
      var timeoutID;
      var cancelled = false; // Keep track of the last time `callback` was executed.

      var lastExec = 0; // Function to clear existing timeout

      function clearExistingTimeout() {
        if (timeoutID) {
          clearTimeout(timeoutID);
        }
      } // Function to cancel next exec


      function cancel() {
        clearExistingTimeout();
        cancelled = true;
      } // `noTrailing` defaults to falsy.


      if (typeof noTrailing !== 'boolean') {
        debounceMode = callback;
        callback = noTrailing;
        noTrailing = undefined;
      }
      /*
       * The `wrapper` function encapsulates all of the throttling / debouncing
       * functionality and when executed will limit the rate at which `callback`
       * is executed.
       */


      function wrapper() {
        var self = this;
        var elapsed = Date.now() - lastExec;
        var args = arguments;

        if (cancelled) {
          return;
        } // Execute `callback` and update the `lastExec` timestamp.


        function exec() {
          lastExec = Date.now();
          callback.apply(self, args);
        }
        /*
         * If `debounceMode` is true (at begin) this is used to clear the flag
         * to allow future `callback` executions.
         */


        function clear() {
          timeoutID = undefined;
        }

        if (debounceMode && !timeoutID) {
          /*
           * Since `wrapper` is being called for the first time and
           * `debounceMode` is true (at begin), execute `callback`.
           */
          exec();
        }

        clearExistingTimeout();

        if (debounceMode === undefined && elapsed > delay) {
          /*
           * In throttle mode, if `delay` time has been exceeded, execute
           * `callback`.
           */
          exec();
        } else if (noTrailing !== true) {
          /*
           * In trailing throttle mode, since `delay` time has not been
           * exceeded, schedule `callback` to execute `delay` ms after most
           * recent execution.
           *
           * If `debounceMode` is true (at begin), schedule `clear` to execute
           * after `delay` ms.
           *
           * If `debounceMode` is false (at end), schedule `callback` to
           * execute after `delay` ms.
           */
          timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
        }
      }

      wrapper.cancel = cancel; // Return the wrapper function.

      return wrapper;
    }

    var ThresholdUnits = {
        Pixel: 'Pixel',
        Percent: 'Percent',
    };
    var defaultThreshold = {
        unit: ThresholdUnits.Percent,
        value: 0.8,
    };
    function parseThreshold(scrollThreshold) {
        if (typeof scrollThreshold === 'number') {
            return {
                unit: ThresholdUnits.Percent,
                value: scrollThreshold * 100,
            };
        }
        if (typeof scrollThreshold === 'string') {
            if (scrollThreshold.match(/^(\d*(\.\d+)?)px$/)) {
                return {
                    unit: ThresholdUnits.Pixel,
                    value: parseFloat(scrollThreshold),
                };
            }
            if (scrollThreshold.match(/^(\d*(\.\d+)?)%$/)) {
                return {
                    unit: ThresholdUnits.Percent,
                    value: parseFloat(scrollThreshold),
                };
            }
            console.warn('scrollThreshold format is invalid. Valid formats: "120px", "50%"...');
            return defaultThreshold;
        }
        console.warn('scrollThreshold should be string or number');
        return defaultThreshold;
    }

    var InfiniteScroll = /** @class */ (function (_super) {
        __extends(InfiniteScroll, _super);
        function InfiniteScroll(props) {
            var _this = _super.call(this, props) || this;
            _this.lastScrollTop = 0;
            _this.actionTriggered = false;
            // variables to keep track of pull down behaviour
            _this.startY = 0;
            _this.currentY = 0;
            _this.dragging = false;
            // will be populated in componentDidMount
            // based on the height of the pull down element
            _this.maxPullDownDistance = 0;
            _this.getScrollableTarget = function () {
                if (_this.props.scrollableTarget instanceof HTMLElement)
                    return _this.props.scrollableTarget;
                if (typeof _this.props.scrollableTarget === 'string') {
                    return document.getElementById(_this.props.scrollableTarget);
                }
                if (_this.props.scrollableTarget === null) {
                    console.warn("You are trying to pass scrollableTarget but it is null. This might\n        happen because the element may not have been added to DOM yet.\n        See https://github.com/ankeetmaini/react-infinite-scroll-component/issues/59 for more info.\n      ");
                }
                return null;
            };
            _this.onStart = function (evt) {
                if (_this.lastScrollTop)
                    return;
                _this.dragging = true;
                if (evt instanceof MouseEvent) {
                    _this.startY = evt.pageY;
                }
                else if (evt instanceof TouchEvent) {
                    _this.startY = evt.touches[0].pageY;
                }
                _this.currentY = _this.startY;
                if (_this._infScroll) {
                    _this._infScroll.style.willChange = 'transform';
                    _this._infScroll.style.transition = "transform 0.2s cubic-bezier(0,0,0.31,1)";
                }
            };
            _this.onMove = function (evt) {
                if (!_this.dragging)
                    return;
                if (evt instanceof MouseEvent) {
                    _this.currentY = evt.pageY;
                }
                else if (evt instanceof TouchEvent) {
                    _this.currentY = evt.touches[0].pageY;
                }
                // user is scrolling down to up
                if (_this.currentY < _this.startY)
                    return;
                if (_this.currentY - _this.startY >=
                    Number(_this.props.pullDownToRefreshThreshold)) {
                    _this.setState({
                        pullToRefreshThresholdBreached: true,
                    });
                }
                // so you can drag upto 1.5 times of the maxPullDownDistance
                if (_this.currentY - _this.startY > _this.maxPullDownDistance * 1.5)
                    return;
                if (_this._infScroll) {
                    _this._infScroll.style.overflow = 'visible';
                    _this._infScroll.style.transform = "translate3d(0px, " + (_this.currentY -
                        _this.startY) + "px, 0px)";
                }
            };
            _this.onEnd = function () {
                _this.startY = 0;
                _this.currentY = 0;
                _this.dragging = false;
                if (_this.state.pullToRefreshThresholdBreached) {
                    _this.props.refreshFunction && _this.props.refreshFunction();
                    _this.setState({
                        pullToRefreshThresholdBreached: false,
                    });
                }
                requestAnimationFrame(function () {
                    // this._infScroll
                    if (_this._infScroll) {
                        _this._infScroll.style.overflow = 'auto';
                        _this._infScroll.style.transform = 'none';
                        _this._infScroll.style.willChange = 'unset';
                    }
                });
            };
            _this.onScrollListener = function (event) {
                if (typeof _this.props.onScroll === 'function') {
                    // Execute this callback in next tick so that it does not affect the
                    // functionality of the library.
                    setTimeout(function () { return _this.props.onScroll && _this.props.onScroll(event); }, 0);
                }
                var target = _this.props.height || _this._scrollableNode
                    ? event.target
                    : document.documentElement.scrollTop
                        ? document.documentElement
                        : document.body;
                // return immediately if the action has already been triggered,
                // prevents multiple triggers.
                if (_this.actionTriggered)
                    return;
                var atBottom = _this.props.inverse
                    ? _this.isElementAtTop(target, _this.props.scrollThreshold)
                    : _this.isElementAtBottom(target, _this.props.scrollThreshold);
                // call the `next` function in the props to trigger the next data fetch
                if (atBottom && _this.props.hasMore) {
                    _this.actionTriggered = true;
                    _this.setState({ showLoader: true });
                    _this.props.next && _this.props.next();
                }
                _this.lastScrollTop = target.scrollTop;
            };
            _this.state = {
                showLoader: false,
                pullToRefreshThresholdBreached: false,
                prevDataLength: props.dataLength,
            };
            _this.throttledOnScrollListener = throttle(150, _this.onScrollListener).bind(_this);
            _this.onStart = _this.onStart.bind(_this);
            _this.onMove = _this.onMove.bind(_this);
            _this.onEnd = _this.onEnd.bind(_this);
            return _this;
        }
        InfiniteScroll.prototype.componentDidMount = function () {
            if (typeof this.props.dataLength === 'undefined') {
                throw new Error("mandatory prop \"dataLength\" is missing. The prop is needed" +
                    " when loading more content. Check README.md for usage");
            }
            this._scrollableNode = this.getScrollableTarget();
            this.el = this.props.height
                ? this._infScroll
                : this._scrollableNode || window;
            if (this.el) {
                this.el.addEventListener('scroll', this
                    .throttledOnScrollListener);
            }
            if (typeof this.props.initialScrollY === 'number' &&
                this.el &&
                this.el instanceof HTMLElement &&
                this.el.scrollHeight > this.props.initialScrollY) {
                this.el.scrollTo(0, this.props.initialScrollY);
            }
            if (this.props.pullDownToRefresh && this.el) {
                this.el.addEventListener('touchstart', this.onStart);
                this.el.addEventListener('touchmove', this.onMove);
                this.el.addEventListener('touchend', this.onEnd);
                this.el.addEventListener('mousedown', this.onStart);
                this.el.addEventListener('mousemove', this.onMove);
                this.el.addEventListener('mouseup', this.onEnd);
                // get BCR of pullDown element to position it above
                this.maxPullDownDistance =
                    (this._pullDown &&
                        this._pullDown.firstChild &&
                        this._pullDown.firstChild.getBoundingClientRect()
                            .height) ||
                        0;
                this.forceUpdate();
                if (typeof this.props.refreshFunction !== 'function') {
                    throw new Error("Mandatory prop \"refreshFunction\" missing.\n          Pull Down To Refresh functionality will not work\n          as expected. Check README.md for usage'");
                }
            }
        };
        InfiniteScroll.prototype.componentWillUnmount = function () {
            if (this.el) {
                this.el.removeEventListener('scroll', this
                    .throttledOnScrollListener);
                if (this.props.pullDownToRefresh) {
                    this.el.removeEventListener('touchstart', this.onStart);
                    this.el.removeEventListener('touchmove', this.onMove);
                    this.el.removeEventListener('touchend', this.onEnd);
                    this.el.removeEventListener('mousedown', this.onStart);
                    this.el.removeEventListener('mousemove', this.onMove);
                    this.el.removeEventListener('mouseup', this.onEnd);
                }
            }
        };
        InfiniteScroll.prototype.componentDidUpdate = function (prevProps) {
            // do nothing when dataLength is unchanged
            if (this.props.dataLength === prevProps.dataLength || this.props.dataLength === 0)
                return;
            var fetchAgain = this._infScroll &&
                this._scrollableNode &&
                this._scrollableNode.clientHeight * 1.1 > this._infScroll.scrollHeight;
            if (fetchAgain) {
                this.actionTriggered = true;
                this.setState({ showLoader: true });
                this.props.next();
            }
            else {
                this.actionTriggered = false;
                // update state when new data was sent in
                this.setState({
                    showLoader: false,
                });
            }
        };
        InfiniteScroll.getDerivedStateFromProps = function (nextProps, prevState) {
            var dataLengthChanged = nextProps.dataLength !== prevState.prevDataLength;
            // reset when data changes
            if (dataLengthChanged) {
                return __assign(__assign({}, prevState), { prevDataLength: nextProps.dataLength });
            }
            return null;
        };
        InfiniteScroll.prototype.isElementAtTop = function (target, scrollThreshold) {
            if (scrollThreshold === void 0) { scrollThreshold = 0.8; }
            var clientHeight = target === document.body || target === document.documentElement
                ? window.screen.availHeight
                : target.clientHeight;
            var threshold = parseThreshold(scrollThreshold);
            if (threshold.unit === ThresholdUnits.Pixel) {
                return (target.scrollTop <=
                    threshold.value + clientHeight - target.scrollHeight + 1);
            }
            return (target.scrollTop <=
                threshold.value / 100 + clientHeight - target.scrollHeight + 1);
        };
        InfiniteScroll.prototype.isElementAtBottom = function (target, scrollThreshold) {
            if (scrollThreshold === void 0) { scrollThreshold = 0.8; }
            var clientHeight = target === document.body || target === document.documentElement
                ? window.screen.availHeight
                : target.clientHeight;
            var threshold = parseThreshold(scrollThreshold);
            if (threshold.unit === ThresholdUnits.Pixel) {
                return (target.scrollTop + clientHeight >= target.scrollHeight - threshold.value);
            }
            return (target.scrollTop + clientHeight >=
                (threshold.value / 100) * target.scrollHeight);
        };
        InfiniteScroll.prototype.render = function () {
            var _this = this;
            var style = __assign({ height: this.props.height || 'auto', overflow: 'auto', WebkitOverflowScrolling: 'touch' }, this.props.style);
            var hasChildren = this.props.hasChildren ||
                !!(this.props.children &&
                    this.props.children instanceof Array &&
                    this.props.children.length);
            // because heighted infiniteScroll visualy breaks
            // on drag down as overflow becomes visible
            var outerDivStyle = this.props.pullDownToRefresh && this.props.height
                ? { overflow: 'auto' }
                : {};
            return (React__default.createElement("div", { style: outerDivStyle, className: "infinite-scroll-component__outerdiv" },
                React__default.createElement("div", { className: "infinite-scroll-component " + (this.props.className || ''), ref: function (infScroll) { return (_this._infScroll = infScroll); }, style: style },
                    this.props.pullDownToRefresh && (React__default.createElement("div", { style: { position: 'relative' }, ref: function (pullDown) { return (_this._pullDown = pullDown); } },
                        React__default.createElement("div", { style: {
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: -1 * this.maxPullDownDistance,
                            } }, this.state.pullToRefreshThresholdBreached
                            ? this.props.releaseToRefreshContent
                            : this.props.pullDownToRefreshContent))),
                    this.props.children,
                    !this.state.showLoader &&
                        !hasChildren &&
                        this.props.hasMore &&
                        this.props.loader,
                    this.state.showLoader && this.props.hasMore && this.props.loader,
                    !this.props.hasMore && this.props.endMessage)));
        };
        return InfiniteScroll;
    }(React.Component));

    return InfiniteScroll;

}(React));
//# sourceMappingURL=index.umd.js.map
