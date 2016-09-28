import React, {Component, PropTypes} from 'react';
import debounce from './utils/debounce';

export default class InfiniteScroll extends Component {
  constructor (props) {
    super();
    this.state = {
      showLoader: false,
      lastScrollTop: 0,
      actionTriggered: false
    };
    this.onScrollListener = this.onScrollListener.bind(this);
    this.debouncedOnScrollListener = debounce(this.onScrollListener, 150).bind(this);
  }

  componentDidMount () {
    this.el = this.props.height ? this.refs.infScroll : window;
    this.el.addEventListener('scroll', this.debouncedOnScrollListener);
  }

  componentWillUnmount () {
    this.el.removeEventListener('scroll', this.debouncedOnScrollListener);
  }

  componentWillReceiveProps (props) {
    // new data was sent in
    this.setState({
      showLoader: false,
      actionTriggered: false
    });
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
      this.setState({actionTriggered: false, showLoader: true});
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
      <div className='infinite-scroll-component' ref='infScroll'
        style={style}>
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

InfiniteScroll.propTypes = {
  next: PropTypes.func,
  hasMore: PropTypes.bool,
  children: PropTypes.node,
  loader: PropTypes.node.isRequired,
  scrollThreshold: PropTypes.number,
  endMessage: PropTypes.node,
  style: PropTypes.object,
  height: PropTypes.number,
  hasChildren: PropTypes.bool
};
