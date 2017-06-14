import React, {Component} from 'react';
import PropTypes from 'prop-types';
import throttle from './utils/throttle';

export default class InfiniteScroll extends Component {
  constructor (props) {
    super();
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
    this.throttledOnScrollListener = throttle(this.onScrollListener, 150).bind(this);
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }

  componentDidMount () {
    this.el = this.props.height ? this._infScroll : window;
    this.el.addEventListener('scroll', this.throttledOnScrollListener);

    if (this.props.pullDownToRefresh) {
      document.addEventListener('touchstart', this.onStart);
      document.addEventListener('touchmove', this.onMove);
      document.addEventListener('touchend', this.onEnd);

      document.addEventListener('mousedown', this.onStart);
      document.addEventListener('mousemove', this.onMove);
      document.addEventListener('mouseup', this.onEnd);

      // get BCR of pullDown element to position it above
      this.maxPullDownDistance = this._pullDown.firstChild.getBoundingClientRect().height;
      this.forceUpdate();

      if (typeof this.props.refreshFunction !== 'function') {
        throw new Error(
          `Mandatory prop "refreshFunction" missing.
          Pull Down To Refresh functionality will not work
          as expected. Check README.md for usage'`
        );
      }
    }
  }

  componentWillUnmount () {
    this.el.removeEventListener('scroll', this.throttledOnScrollListener);

    if (this.props.pullDownToRefresh) {
      document.removeEventListener('touchstart', this.onStart);
      document.removeEventListener('touchmove', this.onMove);
      document.removeEventListener('touchend', this.onEnd);

      document.removeEventListener('mousedown', this.onStart);
      document.removeEventListener('mousemove', this.onMove);
      document.removeEventListener('mouseup', this.onEnd);
    }
  }

  componentWillReceiveProps (props) {
    // new data was sent in
    this.setState({
      showLoader: false,
      actionTriggered: false,
      pullToRefreshThresholdBreached: false
    });
  }

  onStart (evt) {
    if (this.state.lastScrollTop) return;

    this.dragging = true;
    this.startY = evt.pageY || evt.touches[0].pageY;
    this.currentY = this.startY;

    this._infScroll.style.willChange = 'transform';
    this._infScroll.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
  }

  onMove (evt) {
    if (!this.dragging) return;
    this.currentY = evt.pageY || evt.touches[0].pageY;

    // user is scrolling down to up
    if (this.currentY < this.startY) return;

    if ((this.currentY - this.startY) >= this.props.pullDownToRefreshThreshold) {
      this.setState({
        pullToRefreshThresholdBreached: true
      });
    }

    // so you can drag upto 1.5 times of the maxPullDownDistance
    if (this.currentY - this.startY > this.maxPullDownDistance * 1.5) return;

    this._infScroll.style.overflow = 'visible';
    this._infScroll.style.transform = `translate3d(0px, ${this.currentY - this.startY}px, 0px)`;
  }

  onEnd (evt) {
    this.startY = 0;
    this.currentY = 0;

    this.dragging = false;

    if (this.state.pullToRefreshThresholdBreached) {
      this.props.refreshFunction && this.props.refreshFunction();
    }

    requestAnimationFrame(() => {
      this._infScroll.style.overflow = 'auto';
      this._infScroll.style.transform = 'none';
      this._infScroll.style.willChange = 'none';
    });
  }

  isElementAtBottom (target, scrollThreshold = 0.8) {
    const clientHeight = (target === document.body || target === document.documentElement)
    ? window.screen.availHeight : target.clientHeight;

    const scrolled = scrollThreshold * (target.scrollHeight - target.scrollTop);
    return scrolled <= clientHeight;
  }

  onScrollListener (event) {
    let target = this.props.height
      ? event.target
      : (document.documentElement.scrollTop ? document.documentElement : document.body);

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

    let atBottom = this.isElementAtBottom(target, this.props.scrollThreshold);

    // call the `next` function in the props to trigger the next data fetch
    if (atBottom && this.props.hasMore) {
      this.props.next();
      this.setState({actionTriggered: true, showLoader: true});
    }
    this.setState({lastScrollTop: target.scrollTop});
  }

  render () {
    const style = {
      height: this.props.height || 'auto',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      ...this.props.style
    };
    const hasChildren = this.props.hasChildren || !!(this.props.children && this.props.children.length);

    // because heighted infiniteScroll visualy breaks
    // on drag down as overflow becomes visible
    const outerDivStyle = (this.props.pullDownToRefresh && this.props.height)
      ? {overflow: 'auto'} : {};
    return (
      <div style={outerDivStyle}>
        <div
          className='infinite-scroll-component'
          ref={infScroll => this._infScroll = infScroll}
          style={style}
        >
          {this.props.pullDownToRefresh && (
            <div
              style={{ position: 'relative' }}
              ref={pullDown => this._pullDown = pullDown}
            >
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: (-1 * this.maxPullDownDistance),
              }}>
                {!this.state.pullToRefreshThresholdBreached &&
                  this.props.pullDownToRefreshContent}
                {this.state.pullToRefreshThresholdBreached &&
                  this.props.releaseToRefreshContent}
              </div>
            </div>
          )}
          {this.props.children}
          {!this.state.showLoader && !hasChildren && this.props.hasMore &&
            this.props.loader}
          {this.state.showLoader && this.props.loader}
          {!this.props.hasMore && this.props.endMessage}
        </div>
      </div>
    );
  }
}

InfiniteScroll.defaultProps = {
  pullDownToRefreshContent: <h3>Pull down to refresh</h3>,
  releaseToRefreshContent: <h3>Release to refresh</h3>,
  pullDownToRefreshThreshold: 100,
  disableBrowserPullToRefresh: true
}

InfiniteScroll.propTypes = {
  next: PropTypes.func,
  hasMore: PropTypes.bool,
  children: PropTypes.node,
  loader: PropTypes.node.isRequired,
  scrollThreshold: PropTypes.number,
  endMessage: PropTypes.node,
  style: PropTypes.object,
  height: PropTypes.number,
  hasChildren: PropTypes.bool,
  pullDownToRefresh: PropTypes.bool,
  pullDownToRefreshContent: PropTypes.node,
  releaseToRefreshContent: PropTypes.node,
  pullDownToRefreshThreshold: PropTypes.number,
  refreshFunction: PropTypes.func,
};
