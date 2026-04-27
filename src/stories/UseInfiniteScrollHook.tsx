import React, { useState } from 'react';
import { useInfiniteScroll } from '../index';

const itemStyle = {
  height: 30,
  border: '1px solid steelblue',
  margin: 6,
  padding: 8,
  borderRadius: 4,
};

const containerStyle: React.CSSProperties = {
  height: 400,
  overflow: 'auto',
  border: '2px solid steelblue',
  borderRadius: 4,
};

export default function UseInfiniteScrollHook() {
  const [items, setItems] = useState<number[]>(() =>
    Array.from({ length: 20 }, (_, i) => i)
  );
  const [hasMore, setHasMore] = useState(true);

  const { sentinelRef, isLoading } = useInfiniteScroll({
    next: () => {
      setTimeout(() => {
        setItems((prev) => {
          const next = Array.from({ length: 20 }, (_, i) => prev.length + i);
          if (prev.length + next.length >= 200) setHasMore(false);
          return [...prev, ...next];
        });
      }, 800);
    },
    hasMore,
    dataLength: items.length,
  });

  return (
    <div>
      <h1>useInfiniteScroll hook, custom UI</h1>
      <p style={{ color: '#666', fontSize: 13 }}>
        Fully custom markup. The hook manages the observer; you own the layout.
      </p>
      <hr />
      <div id="hookScrollTarget" style={containerStyle}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((n) => (
            <li key={n} style={itemStyle}>
              item #{n + 1}
            </li>
          ))}
          <li
            ref={sentinelRef}
            aria-hidden="true"
            style={{ height: 1, padding: 0 }}
          />
          {isLoading && (
            <li style={{ textAlign: 'center', padding: 12, color: '#888' }}>
              Loading more items...
            </li>
          )}
          {!hasMore && (
            <li style={{ textAlign: 'center', padding: 12, color: '#aaa' }}>
              All items loaded.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
