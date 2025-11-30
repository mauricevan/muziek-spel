import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './components/App';

const MOUNT_NODE = document.getElementById('app');

if (!MOUNT_NODE) {
  throw new Error('Root element not found');
}

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  MOUNT_NODE
);

