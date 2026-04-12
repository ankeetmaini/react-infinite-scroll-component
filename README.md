# react-infinite-scroll-component [![npm](https://img.shields.io/npm/dt/react-infinite-scroll-component.svg?style=flat-square)](https://www.npmjs.com/package/react-infinite-scroll-component) [![npm](https://img.shields.io/npm/v/react-infinite-scroll-component.svg?style=flat-square)](https://www.npmjs.com/package/react-infinite-scroll-component)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-27-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

A component to make all your infinite scrolling woes go away with just 4.15 kB! `Pull Down to Refresh` feature
added. An infinite-scroll that actually works and super-simple to integrate!

## Install

```bash
  npm install --save react-infinite-scroll-component

  or

  yarn add react-infinite-scroll-component

  // in code ES6
  import InfiniteScroll from 'react-infinite-scroll-component';
  // or commonjs
  var InfiniteScroll = require('react-infinite-scroll-component');
```

## Using

```jsx
<InfiniteScroll
  dataLength={items.length} //This is important field to render the next data
  next={fetchData}
  hasMore={true}
  loader={<h4>Loading...</h4>}
  endMessage={
    <p style={{ textAlign: 'center' }}>
      <b>Yay! You have seen it all</b>
    </p>
  }
  // below props only if you need pull down functionality
  refreshFunction={refresh}
  pullDownToRefresh
  pullDownToRefreshThreshold={50}
  pullDownToRefreshContent={
    <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
  }
  releaseToRefreshContent={
    <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
  }
>
  {items}
</InfiniteScroll>
```

## Using scroll on top

```jsx
<div
  id="scrollableDiv"
  style={{
    height: 300,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column-reverse',
  }}
>
  {/*Put the scroll bar always on the bottom*/}
  <InfiniteScroll
    dataLength={items.length}
    next={fetchMoreData}
    style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
    inverse={true}
    hasMore={true}
    loader={<h4>Loading...</h4>}
    scrollableTarget="scrollableDiv"
  >
    {items.map((_, index) => (
      <div style={style} key={index}>
        div - #{index}
      </div>
    ))}
  </InfiniteScroll>
</div>
```

The `InfiniteScroll` component can be used in three ways.

- Specify a value for the `height` prop if you want your **scrollable** content to have a specific height, providing scrollbars for scrolling your content and fetching more data.
- If your **scrollable** content is being rendered within a parent element that is already providing overflow scrollbars, you can set the `scrollableTarget` prop to reference the DOM element and use it's scrollbars for fetching more data.
- Without setting either the `height` or `scrollableTarget` props, the scroll will happen at `document.body` like _Facebook's_ timeline scroll.

## What's new in v7

### IntersectionObserver-based triggering

`next()` is now triggered by an `IntersectionObserver` watching an invisible sentinel element at the bottom of the list (top for `inverse` mode), rather than a scroll event listener. This means:

- The threshold is checked once when the sentinel enters the viewport, not on every scroll tick.
- No missed triggers when content loads fast enough to skip the threshold.
- Better performance — no work done while the user is scrolling through content that is far from the threshold.

### Zero runtime dependencies

`throttle-debounce` has been removed. The package now ships with **zero runtime dependencies**. The `onScroll` callback receives every scroll event directly without throttling.

### `scrollableTarget` accepts `HTMLElement` directly

Previously `scrollableTarget` only accepted a string element ID. It now accepts `HTMLElement | string | null`, so you can pass a ref value directly:

```jsx
const ref = useRef(null);
// ...
<div ref={ref} style={{ height: 300, overflow: 'auto' }}>
  <InfiniteScroll scrollableTarget={ref.current} ...>
    {items}
  </InfiniteScroll>
</div>
```

### Rewritten as a function component

The component is now a React function component. The public prop API is unchanged — no migration needed.

---

## docs version wise

[3.0.2](docs/README-3.0.2.md)

## live examples

- infinite scroll (never ending) example using react (body/window scroll)
  - [![Edit yk7637p62z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/yk7637p62z)
- infinte scroll till 500 elements (body/window scroll)
  - [![Edit 439v8rmqm0](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/439v8rmqm0)
- infinite scroll in an element (div of height 400px)
  - [![Edit w3w89k7x8](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/w3w89k7x8)
- infinite scroll with `scrollableTarget` (a parent element which is scrollable)
  - [![Edit r7rp40n0zm](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/r7rp40n0zm)

## props

| name                           | type                 | description                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **next**                       | function             | a function which must be called after reaching the bottom. It must trigger some sort of action which fetches the next data. **The data is passed as `children` to the `InfiniteScroll` component and the data should contain previous items too.** e.g. _Initial data = [1, 2, 3]_ and then next load of data should be _[1, 2, 3, 4, 5, 6]_. |
| **hasMore**                    | boolean              | it tells the `InfiniteScroll` component on whether to call `next` function on reaching the bottom and shows an `endMessage` to the user                                                                                                                                                                                                       |
| **children**                   | node (list)          | the data items which you need to scroll.                                                                                                                                                                                                                                                                                                      |
| **dataLength**                 | number               | set the length of the data.This will unlock the subsequent calls to next.                                                                                                                                                                                                                                                                     |
| **loader**                     | node                 | you can send a loader component to show while the component waits for the next load of data. e.g. `<h3>Loading...</h3>` or any fancy loader element                                                                                                                                                                                           |
| **scrollThreshold**            | number &#124; string | A threshold value defining when `InfiniteScroll` will call `next`. Default value is `0.8`. It means the `next` will be called when user comes below 80% of the total height. If you pass threshold in pixels (`scrollThreshold="200px"`), `next` will be called once you scroll at least (100% - scrollThreshold) pixels down.                |
| **onScroll**                   | function             | a function that will listen to the scroll event on the scrolling container.                                                                                                                                                                                                                                                                   |
| **endMessage**                 | node                 | this message is shown to the user when he has seen all the records which means he's at the bottom and `hasMore` is `false`                                                                                                                                                                                                                    |
| **className**                  | string               | add any custom class you want                                                                                                                                                                                                                                                                                                                 |
| **style**                      | object               | any style which you want to override                                                                                                                                                                                                                                                                                                          |
| **height**                     | number               | optional, give only if you want to have a fixed height scrolling content                                                                                                                                                                                                                                                                      |
| **scrollableTarget**           | node or string       | optional, reference to a (parent) DOM element that is already providing overflow scrollbars to the `InfiniteScroll` component. _You should provide the `id` of the DOM node preferably._                                                                                                                                                      |
| **hasChildren**                | bool                 | `children` is by default assumed to be of type array and it's length is used to determine if loader needs to be shown or not, if your `children` is not an array, specify this prop to tell if your items are 0 or more.                                                                                                                      |
| **pullDownToRefresh**          | bool                 | to enable **Pull Down to Refresh** feature                                                                                                                                                                                                                                                                                                    |
| **pullDownToRefreshContent**   | node                 | any JSX that you want to show the user, `default={<h3>Pull down to refresh</h3>}`                                                                                                                                                                                                                                                             |
| **releaseToRefreshContent**    | node                 | any JSX that you want to show the user, `default={<h3>Release to refresh</h3>}`                                                                                                                                                                                                                                                               |
| **pullDownToRefreshThreshold** | number               | minimum distance the user needs to pull down to trigger the refresh, `default=100px` , a lower value may be needed to trigger the refresh depending your users browser.                                                                                                                                                                       |
| **refreshFunction**            | function             | this function will be called, it should return the fresh data that you want to show the user                                                                                                                                                                                                                                                  |
| **initialScrollY**             | number               | set a scroll y position for the component to render with.                                                                                                                                                                                                                                                                                     |
| **inverse**                    | bool                 | set infinite scroll on top                                                                                                                                                                                                                                                                                                                    |

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://ankeetmaini.dev/"><img src="https://avatars.githubusercontent.com/u/6652823?v=4?s=80" width="80px;" alt="Ankeet Maini"/><br /><sub><b>Ankeet Maini</b></sub></a><br /><a href="#question-ankeetmaini" title="Answering Questions">💬</a> <a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=ankeetmaini" title="Documentation">📖</a> <a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=ankeetmaini" title="Code">💻</a> <a href="https://github.com/ankeetmaini/react-infinite-scroll-component/pulls?q=is%3Apr+reviewed-by%3Aankeetmaini" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-ankeetmaini" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/iamdarshshah"><img src="https://avatars.githubusercontent.com/u/25670841?v=4?s=80" width="80px;" alt="Darsh Shah"/><br /><sub><b>Darsh Shah</b></sub></a><br /><a href="#infra-iamdarshshah" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=iamdarshshah" title="Code">💻</a> <a href="https://github.com/ankeetmaini/react-infinite-scroll-component/pulls?q=is%3Apr+reviewed-by%3Aiamdarshshah" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-iamdarshshah" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Newbie012"><img src="https://avatars.githubusercontent.com/u/10504365?v=4?s=80" width="80px;" alt="Eliya Cohen"/><br /><sub><b>Eliya Cohen</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=Newbie012" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nitkuk"><img src="https://avatars.githubusercontent.com/u/13234984?v=4?s=80" width="80px;" alt="Nitin Kukreja"/><br /><sub><b>Nitin Kukreja</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=nitkuk" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TheBearSO"><img src="https://avatars.githubusercontent.com/u/11039845?v=4?s=80" width="80px;" alt="Bruno Sabetta"/><br /><sub><b>Bruno Sabetta</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=TheBearSO" title="Code">💻</a> <a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=TheBearSO" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/osmarpb97"><img src="https://avatars.githubusercontent.com/u/36203999?v=4?s=80" width="80px;" alt="Osmar Pérez Bautista"/><br /><sub><b>Osmar Pérez Bautista</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=osmarpb97" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/squgeim"><img src="https://avatars.githubusercontent.com/u/4996818?v=4?s=80" width="80px;" alt="Shreya Dahal"/><br /><sub><b>Shreya Dahal</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=squgeim" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vladik7244"><img src="https://avatars.githubusercontent.com/u/7922368?v=4?s=80" width="80px;" alt="Vlad Harahan"/><br /><sub><b>Vlad Harahan</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=vladik7244" title="Code">💻</a> <a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=vladik7244" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/danielcaldas"><img src="https://avatars.githubusercontent.com/u/11733994?v=4?s=80" width="80px;" alt="Daniel Caldas"/><br /><sub><b>Daniel Caldas</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=danielcaldas" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AlaDouagi"><img src="https://avatars.githubusercontent.com/u/42475664?v=4?s=80" width="80px;" alt="Alaeddine Douagi"/><br /><sub><b>Alaeddine Douagi</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=AlaDouagi" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/echoulen"><img src="https://avatars.githubusercontent.com/u/6993621?v=4?s=80" width="80px;" alt="Carlos"/><br /><sub><b>Carlos</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=echoulen" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Ishaan28malik"><img src="https://avatars.githubusercontent.com/u/27343592?v=4?s=80" width="80px;" alt="Championrunner"/><br /><sub><b>Championrunner</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=Ishaan28malik" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/danielsogl"><img src="https://avatars.githubusercontent.com/u/15234844?v=4?s=80" width="80px;" alt="Daniel Sogl"/><br /><sub><b>Daniel Sogl</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=danielsogl" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/daggmano"><img src="https://avatars.githubusercontent.com/u/290460?v=4?s=80" width="80px;" alt="Darren Oster"/><br /><sub><b>Darren Oster</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=daggmano" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ipanasenko"><img src="https://avatars.githubusercontent.com/u/576152?v=4?s=80" width="80px;" alt="Illia Panasenko"/><br /><sub><b>Illia Panasenko</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=ipanasenko" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Kikobeats"><img src="https://avatars.githubusercontent.com/u/2096101?v=4?s=80" width="80px;" alt="Kiko Beats"/><br /><sub><b>Kiko Beats</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=Kikobeats" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Meberem"><img src="https://avatars.githubusercontent.com/u/441023?v=4?s=80" width="80px;" alt="Matt Trussler"/><br /><sub><b>Matt Trussler</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=Meberem" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ethaizone"><img src="https://avatars.githubusercontent.com/u/1168777?v=4?s=80" width="80px;" alt="Nimit Suwannagate"/><br /><sub><b>Nimit Suwannagate</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=ethaizone" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rajatsan"><img src="https://avatars.githubusercontent.com/u/22559537?v=4?s=80" width="80px;" alt="Rajat"/><br /><sub><b>Rajat</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=rajatsan" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nero120"><img src="https://avatars.githubusercontent.com/u/4236238?v=4?s=80" width="80px;" alt="Rich"/><br /><sub><b>Rich</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=nero120" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rgoyal1405"><img src="https://avatars.githubusercontent.com/u/6737628?v=4?s=80" width="80px;" alt="Ritesh Goyal"/><br /><sub><b>Ritesh Goyal</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=rgoyal1405" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/babycannotsay"><img src="https://avatars.githubusercontent.com/u/17975694?v=4?s=80" width="80px;" alt="babycannotsay"/><br /><sub><b>babycannotsay</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=babycannotsay" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/cescoferraro"><img src="https://avatars.githubusercontent.com/u/6259987?v=4?s=80" width="80px;" alt="cesco"/><br /><sub><b>cesco</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=cescoferraro" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/h18n"><img src="https://avatars.githubusercontent.com/u/2870584?v=4?s=80" width="80px;" alt="Harry"/><br /><sub><b>Harry</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=h18n" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/leonh"><img src="https://avatars.githubusercontent.com/u/57818?v=4?s=80" width="80px;" alt="ludwig404"/><br /><sub><b>ludwig404</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=leonh" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fooki"><img src="https://avatars.githubusercontent.com/u/196968708?v=4?s=80" width="80px;" alt="Karl Johansson"/><br /><sub><b>Karl Johansson</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=fooki" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/geoffreyteng"><img src="https://avatars.githubusercontent.com/u/8918254?v=4?s=80" width="80px;" alt="Geoffrey Teng"/><br /><sub><b>Geoffrey Teng</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=geoffreyteng" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://allcontributors.org) specification. Contributions of any kind are welcome!

## LICENSE

[MIT](LICENSE)
