import type { Meta, StoryObj } from '@storybook/react-webpack5';
import ScrollableTargetInfScroll from './ScrollableTargetInfScroll';

const meta: Meta<typeof ScrollableTargetInfScroll> = {
  component: ScrollableTargetInfScroll,
  title: 'Components/ScrollableTargetInfScroll',
};

export default meta;
type Story = StoryObj<typeof ScrollableTargetInfScroll>;

export const Default: Story = {};
