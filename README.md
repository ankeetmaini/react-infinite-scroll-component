# react-infinite-scroll-component [![npm](https://img.shields.io/npm/dt/react-infinite-scroll-component.svg?style=flat-square)](https://www.npmjs.com/package/react-infinite-scroll-component) [![npm](https://img.shields.io/npm/v/react-infinite-scroll-component.svg?style=flat-square)](https://www.npmjs.com/package/react-infinite-scroll-component) [![bundlephobia](https://img.shields.io/bundlephobia/minzip/react-infinite-scroll-component?style=flat-square)](https://bundlephobia.com/package/react-infinite-scroll-component)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-27-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

Infinite scroll for React. Zero runtime dependencies, [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)-based, TypeScript-first. ~4 kB gzipped.

Works with window scroll, fixed-height containers, and custom scrollable parents. Pull-to-refresh and inverse (chat) scroll included. React 17, 18, and 19 compatible.

## Install

```bash
npm install react-infinite-scroll-component
# or
yarn add react-infinite-scroll-component
# or
pnpm add react-infinite-scroll-component
```

## Two APIs

| API                                                     | When to use                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`InfiniteScroll`](#infinitescroll-component) component | Most cases, handles loader, endMessage, pull-to-refresh, inverse scroll UI |
| [`useInfiniteScroll`](#useinfinitescroll-hook) hook     | Custom UI, you own the markup, the hook manages the observer               |

---

## `InfiniteScroll` component

### Basic usage (TypeScript)

```tsx
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

type Item = { id: number; name: string };

function Feed() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = async () => {
    const next = await api.getItems({ offset: items.length });
    if (next.length === 0) {
      setHasMore(false);
      return;
    }
    setItems((prev) => [...prev, ...next]);
  };

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={fetchMore}
      hasMore={hasMore}
      loader={<p>Loading...</p>}
      endMessage={<p style={{ textAlign: 'center' }}>All items loaded.</p>}
    >
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </InfiniteScroll>
  );
}
```

### Scroll inside a fixed-height container

```tsx
<div id="scrollableDiv" style={{ height: 400, overflow: 'auto' }}>
  <InfiniteScroll
    dataLength={items.length}
    next={fetchMore}
    hasMore={hasMore}
    loader={<p>Loading...</p>}
    scrollableTarget="scrollableDiv"
  >
    {items.map((item) => (
      <div key={item.id}>{item.name}</div>
    ))}
  </InfiniteScroll>
</div>
```

Pass a `ref` value directly instead of a string id:

```tsx
const containerRef = useRef<HTMLDivElement>(null);

<div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
  <InfiniteScroll
    dataLength={items.length}
    next={fetchMore}
    hasMore={hasMore}
    loader={<p>Loading...</p>}
    scrollableTarget={containerRef.current}
  >
    {items.map((item) => (
      <div key={item.id}>{item.name}</div>
    ))}
  </InfiniteScroll>
</div>;
```

### Inverse scroll (chat / messaging UIs)

```tsx
<div
  id="chatBox"
  style={{
    height: 500,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column-reverse',
  }}
>
  <InfiniteScroll
    dataLength={messages.length}
    next={loadOlderMessages}
    hasMore={hasMore}
    loader={<p>Loading older messages...</p>}
    inverse={true}
    scrollableTarget="chatBox"
    style={{ display: 'flex', flexDirection: 'column-reverse' }}
  >
    {messages.map((msg) => (
      <div key={msg.id}>{msg.text}</div>
    ))}
  </InfiniteScroll>
</div>
```

### Pull-to-refresh

```tsx
<InfiniteScroll
  dataLength={items.length}
  next={fetchMore}
  hasMore={hasMore}
  loader={<p>Loading...</p>}
  pullDownToRefresh
  pullDownToRefreshThreshold={50}
  refreshFunction={refreshList}
  pullDownToRefreshContent={
    <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
  }
  releaseToRefreshContent={
    <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
  }
>
  {items.map((item) => (
    <div key={item.id}>{item.name}</div>
  ))}
</InfiniteScroll>
```

---

## `useInfiniteScroll` hook

For when you need full control over your markup. Place the `sentinelRef` div at the end of your list, the hook fires `next()` when it enters the viewport.

```tsx
import { useState } from 'react';
import { useInfiniteScroll } from 'react-infinite-scroll-component';

type Item = { id: number; name: string };

function CustomFeed() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [hasMore, setHasMore] = useState(true);

  const { sentinelRef, isLoading } = useInfiniteScroll({
    next: async () => {
      const more = await api.getItems({ offset: items.length });
      if (more.length === 0) {
        setHasMore(false);
        return;
      }
      setItems((prev) => [...prev, ...more]);
    },
    hasMore,
    dataLength: items.length,
  });

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
      <li ref={sentinelRef} aria-hidden="true" />
      {isLoading && <li>Loading...</li>}
      {!hasMore && <li>All items loaded.</li>}
    </ul>
  );
}
```

---

## Framework recipes

### Next.js App Router

InfiniteScroll is a client component. Fetch initial data in a Server Component, pass it down.

```tsx
// app/feed/page.tsx, Server Component
import { FeedClient } from './feed-client';
import { db } from '@/lib/db';

export default async function FeedPage() {
  const initialItems = await db.items.findMany({
    take: 20,
    orderBy: { id: 'desc' },
  });
  return <FeedClient initialItems={initialItems} />;
}
```

```tsx
// app/feed/feed-client.tsx, Client Component
'use client';

import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

type Item = { id: string; title: string };

export function FeedClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = async () => {
    const res = await fetch(`/api/items?cursor=${items[items.length - 1].id}`);
    const next: Item[] = await res.json();
    if (next.length === 0) {
      setHasMore(false);
      return;
    }
    setItems((prev) => [...prev, ...next]);
  };

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={fetchMore}
      hasMore={hasMore}
      loader={<p>Loading...</p>}
      endMessage={<p>You have seen everything.</p>}
    >
      {items.map((item) => (
        <article key={item.id}>{item.title}</article>
      ))}
    </InfiniteScroll>
  );
}
```

### With TanStack Query

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';

function PostFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['posts'],
      queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === 20 ? pages.length : undefined,
    });

  const posts = data?.pages.flat() ?? [];

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={isFetchingNextPage ? <p>Loading...</p> : null}
      endMessage={<p>All posts loaded.</p>}
    >
      {posts.map((post) => (
        <article key={post.id}>{post.title}</article>
      ))}
    </InfiniteScroll>
  );
}
```

### With SWR

```tsx
import useSWRInfinite from 'swr/infinite';
import InfiniteScroll from 'react-infinite-scroll-component';

const PAGE_SIZE = 20;

function PostList() {
  const { data, size, setSize } = useSWRInfinite(
    (index) => `/api/posts?page=${index}&limit=${PAGE_SIZE}`,
    fetcher
  );

  const posts = data ? data.flat() : [];
  const hasMore = data ? data[data.length - 1].length === PAGE_SIZE : true;

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={() => setSize(size + 1)}
      hasMore={hasMore}
      loader={<p>Loading...</p>}
    >
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </InfiniteScroll>
  );
}
```

---

## Three scroll modes

| Mode                         | How to use                              | Use case                              |
| ---------------------------- | --------------------------------------- | ------------------------------------- |
| **Window scroll**            | Omit `height` and `scrollableTarget`    | Social feeds, blogs, product listings |
| **Fixed-height container**   | Pass `height` prop                      | Embedded lists, sidebars              |
| **Custom scrollable parent** | Pass `scrollableTarget` (element or id) | Existing overflow containers          |

---

## Props, `InfiniteScroll`

| Prop                         | Type                            | Required | Default | Description                                                                      |
| ---------------------------- | ------------------------------- | -------- | ------- | -------------------------------------------------------------------------------- |
| `dataLength`                 | `number`                        | yes      |         | Length of the full rendered list. Resets the load guard when it changes.         |
| `next`                       | `() => void`                    | yes      |         | Append the next page to your list state. Called at most once per load.           |
| `hasMore`                    | `boolean`                       | yes      |         | When false, stops the observer and shows `endMessage`.                           |
| `loader`                     | `ReactNode`                     | yes      |         | Shown while the next page is loading.                                            |
| `endMessage`                 | `ReactNode`                     | no       |         | Shown when `hasMore` is false.                                                   |
| `height`                     | `number \| string`              | no       |         | Fixed height for the scroll container. Omit for window scroll.                   |
| `scrollableTarget`           | `HTMLElement \| string \| null` | no       |         | Scrollable parent element or its DOM id.                                         |
| `scrollThreshold`            | `number \| string`              | no       | `0.8`   | Trigger distance: fraction `0.8` = 80% scrolled, or pixel string `"200px"`.      |
| `inverse`                    | `boolean`                       | no       | `false` | Reverse scroll direction. Use with `flexDirection: column-reverse` for chat UIs. |
| `pullDownToRefresh`          | `boolean`                       | no       | `false` | Enable pull-to-refresh. Requires `refreshFunction`.                              |
| `refreshFunction`            | `() => void`                    | no       |         | Called when pull threshold is breached.                                          |
| `pullDownToRefreshThreshold` | `number`                        | no       | `100`   | Pixels to pull before `refreshFunction` fires.                                   |
| `pullDownToRefreshContent`   | `ReactNode`                     | no       |         | Shown while pulling.                                                             |
| `releaseToRefreshContent`    | `ReactNode`                     | no       |         | Shown when threshold is breached.                                                |
| `onScroll`                   | `(e: UIEvent) => void`          | no       |         | Scroll event listener on the container.                                          |
| `className`                  | `string`                        | no       | `''`    | CSS class on the inner scroll container.                                         |
| `style`                      | `CSSProperties`                 | no       |         | Inline styles on the inner scroll container.                                     |
| `hasChildren`                | `boolean`                       | no       |         | Set when `children` is not a plain array (single node, fragment).                |
| `initialScrollY`             | `number`                        | no       |         | Restore scroll Y position on mount.                                              |

## Props, `useInfiniteScroll`

| Prop               | Type                            | Required | Default | Description                             |
| ------------------ | ------------------------------- | -------- | ------- | --------------------------------------- |
| `dataLength`       | `number`                        | yes      |         | Length of the full rendered list.       |
| `next`             | `() => void`                    | yes      |         | Called when sentinel enters viewport.   |
| `hasMore`          | `boolean`                       | yes      |         | When false, disconnects the observer.   |
| `scrollThreshold`  | `number \| string`              | no       | `0.8`   | Trigger distance.                       |
| `scrollableTarget` | `HTMLElement \| string \| null` | no       |         | Observer root element.                  |
| `inverse`          | `boolean`                       | no       | `false` | Observe from the top instead of bottom. |

Returns `{ sentinelRef, isLoading }`.

---

## What's new in v7

- **IntersectionObserver-based triggering**, `next()` fires once when the sentinel enters the viewport, not on every scroll tick. No missed triggers, better performance.
- **`useInfiniteScroll` hook**, low-level hook for building fully custom UIs.
- **Zero runtime dependencies**, `throttle-debounce` removed.
- **`scrollableTarget` accepts `HTMLElement`**, pass a ref value directly, not just a string id.
- **Function component rewrite**, same public API, no migration needed.
- **React 17, 18, 19** compatible.

---

## live examples

- infinite scroll (never ending), window scroll
  - [![Edit yk7637p62z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/yk7637p62z)
- infinite scroll till 500 elements, window scroll
  - [![Edit 439v8rmqm0](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/439v8rmqm0)
- infinite scroll in an element (height 400px)
  - [![Edit w3w89k7x8](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/w3w89k7x8)
- infinite scroll with `scrollableTarget`
  - [![Edit r7rp40n0zm](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/r7rp40n0zm)

---

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
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vladik7244"><img src="https://avatars.githubusercontent.com/u/vladik7244?v=4?s=80" width="80px;" alt="Vlad Harahan"/><br /><sub><b>Vlad Harahan</b></sub></a><br /><a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=vladik7244" title="Code">💻</a> <a href="https://github.com/ankeetmaini/react-infinite-scroll-component/commits?author=vladik7244" title="Documentation">📖</a></td>
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
