# react-infinite-scroll-component [![npm](https://img.shields.io/npm/dt/react-infinite-scroll-component.svg?style=flat-square)](https://www.npmjs.com/package/react-infinite-scroll-component) [![npm](https://img.shields.io/npm/v/react-infinite-scroll-component.svg?style=flat-square)](https://www.npmjs.com/package/react-infinite-scroll-component)

A component to make all your infinite scrolling woes go away with just 4.15 kB! `Pull Down to Refresh` feature
added. An infinite-scroll that actually works and super-simple to integrate!

# install
```bash
  npm install --save react-infinite-scroll-component

  // in code ES6
  import InfiniteScroll from 'react-infinite-scroll-component';
  // or commonjs
  var InfiniteScroll = require('react-infinite-scroll-component');
```

# demos
The code for demos is in the `demos/` directory. Open `lib/index.html` in your browser to see the demos in action.

# using
The `InfiniteScroll` component can be used in two ways.

- Without giving any height to your **scrollable** content. In which case the scroll will happen at `document.body` like *Facebook's* timeline scroll.
- If you want your **scrollable** content to have a definite height then your content will be scrollable with the height specified in the props.

```js
  <InfiniteScroll
    next={functionToLoadNextData}
    hasMore={true}
    loader={<h4>Loading...</h4>}>
    {items} // your long array goes in here
  </InfiniteScroll>
```

- **Pull Down to Refresh** support added.

```js
<InfiniteScroll
    pullDownToRefresh // to enable the feature
    pullDownToRefreshContent={<h3 style={{textAlign: 'center'}}>&#8595; Pull down to refresh</h3>}
    releaseToRefreshContent={<h3 style={{textAlign: 'center'}}>&#8593; Release to refresh</h3>}
    refreshFunction={this.refresh} // function which will be called, this should send the refreshed children down
    // rest of the usual props
    next={this.generateDivs}
    hasMore={true}
    loader={<h4>Loading...</h4>}>
    {this.state.divs}
  </InfiniteScroll>
```

# props
name | type | description
-----|------|------------
**next** | function | a function which must be called after reaching the bottom. It must trigger some sort of action which fetches the next data. **The data is passed as `children` to the `InfiniteScroll` component and the data should contain previous items too.** e.g. *Initial data = [1, 2, 3]* and then next load of data should be *[1, 2, 3, 4, 5, 6]*.
**hasMore** | boolean | it tells the InfiniteScroll component on whether to call `next` function on reaching the bottom and shows an `endMessage` to the user
**children** | node (list) | the data items which you need to scroll.
**loader** | node | you can send a loader component to show while the component waits for the next load of data. e.g. `<h3>Loading...</h3>` or any fancy loader element
**scrollThreshold** | number | a threshold value after that the InfiniteScroll will call `next`. By default it's `0.8`. It means the `next` will be called when the user comes below 80% of the total height.
**endMessage** | node |  this message is shown to the user when he has seen all the records which means he's at the bottom and `hasMore` is `false`
**style** | object | any style which you want to override
**height** | number | optional, give only if you want to have a fixed height scrolling content
**hasChildren** | bool | `children` is by default assumed to be of type array and it's length is used to determine if loader needs to be shown or not, if your `children` is not an array, specify this prop to tell if your items are 0 or more.
**pullDownToRefresh** | bool | to enable **Pull Down to Refresh** feature
**pullDownToRefreshContent** | node | any JSX that you want to show the user, __default={<h3>Pull down to refresh</h3>}__
**releaseToRefreshContent** | node | any JSX that you want to show the user, __default={<h3>Release to refresh</h3>}__
**pullDownToRefreshThreshold** | number | minimum distance the user needs to pull down to trigger the refresh, __default=100px__
**refreshFunction** | function | this function will be called, it should return the fresh data that you want to show the user
