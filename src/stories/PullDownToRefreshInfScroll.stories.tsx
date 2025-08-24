import type { Meta, StoryObj } from '@storybook/react-webpack5';
import PullDownToRefreshInfScroll from './PullDownToRefreshInfScroll';

const meta: Meta<typeof PullDownToRefreshInfScroll> = {
  component: PullDownToRefreshInfScroll,
  title: 'Components/PullDownToRefreshInfScroll',
};

export default meta;
type Story = StoryObj<typeof PullDownToRefreshInfScroll>;

export const Default: Story = {};
