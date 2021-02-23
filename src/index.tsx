import React from 'react';
import { render } from 'react-dom';
import App from './App';
import Form from './Form';
import './index.less';

const hostSplit = window.location.host.split('.');
if (hostSplit.length > 1 && hostSplit[0] === 'form') {
    const path = window.location.pathname.split('/');
    if (path.length > 0 && path[1]) {
        const contractAddress = path[1];
        render(
            <Form contractAddress={contractAddress} />,
            document.getElementById('root')
        );
    }
} else {
    render(
        <App />,
        document.getElementById('root')
    );
}