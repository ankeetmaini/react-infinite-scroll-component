import React from 'react';
declare type State = {
    data: number[];
};
export default class WindowInfiniteScrollComponent extends React.Component<{}, State> {
    state: {
        data: any[];
    };
    next: () => void;
    render(): JSX.Element;
}
export {};
