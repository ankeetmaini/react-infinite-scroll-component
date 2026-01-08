import React from 'react';
export default class App extends React.Component {
    state: {
        items: unknown[];
        hasMore: boolean;
    };
    fetchMoreData: () => void;
    render(): JSX.Element;
}
