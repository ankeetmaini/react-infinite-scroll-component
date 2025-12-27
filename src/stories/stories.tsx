import type { Meta, StoryObj } from '@storybook/react';

import WindowInf from './WindowInfiniteScrollComponent';
import PullDownToRefreshInfScroll from './PullDownToRefreshInfScroll';
import InfiniteScrollWithHeight from './InfiniteScrollWithHeight';
import ScrollableTargetInfiniteScroll from './ScrollableTargetInfScroll';
import ScrolleableTop from './ScrolleableTop';

const meta: Meta = {
  title: 'Components',
};

export default meta;

type Story = StoryObj;

export const InfiniteScrollStory: Story = {
  name: 'InfiniteScroll',
  render: () => <WindowInf />,
};

export const PullDownToRefresh: Story = {
  name: 'PullDownToRefresh',
  render: () => <PullDownToRefreshInfScroll />,
};

export const InfiniteScrollWithHeightStory: Story = {
  name: 'InfiniteScrollWithHeight',
  render: () => <InfiniteScrollWithHeight />,
};

export const ScrollableTargetInfiniteScrollStory: Story = {
  name: 'ScrollableTargetInfiniteScroll',
  render: () => <ScrollableTargetInfiniteScroll />,
};

export const InfiniteScrollTop: Story = {
  name: 'InfiniteScrollTop',
  render: () => <ScrolleableTop />,
};
