import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
import FileList from './FileList';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<FileList />, document.getElementById('root'));
registerServiceWorker();
