import type { Meta, StoryObj } from '@storybook/react-webpack5';
import InfiniteScrollWithHeight from './InfiniteScrollWithHeight';

const meta: Meta<typeof InfiniteScrollWithHeight> = {
  component: InfiniteScrollWithHeight,
  title: 'Components/InfiniteScrollWithHeight',
};

export default meta;
type Story = StoryObj<typeof InfiniteScrollWithHeight>;

export const Default: Story = {};
