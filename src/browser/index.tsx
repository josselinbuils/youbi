import React from 'react';
import ReactDOM from 'react-dom';
import './main.scss'; // Has to be first to override its external imports
import { App } from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
