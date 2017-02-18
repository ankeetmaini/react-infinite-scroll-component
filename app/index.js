import React, {Component, PropTypes} from 'react';
import debounce from './utils/debounce';

export default class InfiniteScroll extends Component {
  constructor (props) {
    super();
    this.state = {
      showLoader: false,
      lastScrollTop: 0,
      actionTriggered: false,
      dragging: false
    };
    // variables to keep track of pull down behaviour
    this.startY = 0;
    this.currentY = 0;

    this.onScrollListener = this.onScrollListener.bind(this);
    this.debouncedOnScrollListener = debounce(this.onScrollListener, 150).bind(this);
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd= this.onEnd.bind(this);
  }

  componentDidMount () {
    this.el = this.props.height ? this._infScroll : window;
    this.el.addEventListener('scroll', this.debouncedOnScrollListener);

    if (this.props.pullDownToRefresh) {
      document.addEventListener('touchstart', this.onStart);
      document.addEventListener('touchmove', this.onMove);
      document.addEventListener('touchend', this.onEnd);

      document.addEventListener('mousedown', this.onStart);
      document.addEventListener('mousemove', this.onMove);
      document.addEventListener('mouseup', this.onEnd);
    }
  }

  componentWillUnmount () {
    this.el.removeEventListener('scroll', this.debouncedOnScrollListener);
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
    this.setState({dragging: true});
    this.startY = evt.pageY || evt.touches[0].pageY;
    this.currentY = this.startY;
    
    this._pullDown.style.willChange = 'transform';
    this._pullDown.style.height = '1px';
    evt.preventDefault();
  }

  onMove (evt) {
    if (!this.state.dragging) return;
    this.currentY = evt.pageY || evt.touches[0].pageY;

    if ((this.currentY - this.startY) >= this.props.pullDownToRefreshThreshold) {
      this.setState({
        pullToRefreshThresholdBreached: true
      });
    }

    if (this.currentY - this.startY > 200) return;

    this._pullDown.style.height = `${this.currentY - this.startY}px`;
    this._pullDown.style.background = '#eee';
  }

  onEnd () {
    this.startY = 0;
    this.currentY = 0;

    this.setState({dragging: false});

    if (this.state.pullToRefreshThresholdBreached) {
      this.props.refreshFunction();
    }

    this._pullDown.style.transition = `height 0.01s cubic-bezier(0,0,0.31,1)`;
    this._pullDown.style.height = '0px';
  }

  isElementAtBottom (target, scrollThreshold = 0.8) {
    const clientHeight = (target === document.body || target === document.documentElement)
    ? window.screen.availHeight : target.clientHeight;

    const scrolled = scrollThreshold * (target.scrollHeight - target.scrollTop);
    return scrolled < clientHeight;
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
    return (
      <div
        className='infinite-scroll-component'
        ref={infScroll => this._infScroll = infScroll}
        style={style}
      >
        {this.props.pullDownToRefresh && (
          <div
            ref={pullDown => this._pullDown = pullDown}
          >
            {this.state.dragging && !this.state.pullToRefreshThresholdBreached &&
              this.props.pullDownToRefreshContent}
            {this.state.dragging && this.state.pullToRefreshThresholdBreached &&
              this.props.releaseToRefreshContent}
          </div>
        )}
        {this.props.children}
        {!this.state.showLoader && !hasChildren && this.props.hasMore &&
          this.props.loader}
        {this.state.showLoader && this.props.loader}
        {!this.props.hasMore && (
          <p style={{textAlign: 'center'}}>
            {this.props.endMessage || <b>Yay! You have seen it all</b>}
          </p>
        )}
      </div>
    );
  }
}

InfiniteScroll.defaultProps = {
  pullDownToRefreshContent: <h3>Pull down to refresh</h3>,
  releaseToRefreshContent: <h3>Release to refresh</h3>,
  pullDownToRefreshThreshold: 100
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
  refreshFunction: PropTypes.func
};
