/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import '@tailwindcss/browser';

import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './Home';
import ErrorBoundary from './ErrorModal.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  </React.StrictMode>
);