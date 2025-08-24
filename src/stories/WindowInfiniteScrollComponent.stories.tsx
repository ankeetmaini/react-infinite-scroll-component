import type { Meta, StoryObj } from '@storybook/react-webpack5';
import WindowInfiniteScrollComponent from './WindowInfiniteScrollComponent';

const meta: Meta<typeof WindowInfiniteScrollComponent> = {
  component: WindowInfiniteScrollComponent,
  title: 'Components/WindowInfiniteScrollComponent',
};

export default meta;
type Story = StoryObj<typeof WindowInfiniteScrollComponent>;

export const Default: Story = {};
