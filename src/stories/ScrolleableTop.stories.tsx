import type { Meta, StoryObj } from '@storybook/react-webpack5';
import ScrolleableTop from './ScrolleableTop';

const meta: Meta<typeof ScrolleableTop> = {
  component: ScrolleableTop,
  title: 'Components/ScrolleableTop',
};

export default meta;
type Story = StoryObj<typeof ScrolleableTop>;

export const Default: Story = {};
