import React from 'react';
import { render } from 'react-dom';
import TzForm from '~components/TzForm';
import App from './App';
import './index.less';

const hostSplit = window.location.host.split('.');
if (hostSplit.length > 1) {
    const subdomain = hostSplit[0];

    render(
        <p>TODO: load form</p>,
        document.getElementById('root')
    );
} else {
    render(
        <App />,
        document.getElementById('root')
    );
}