import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import configureStore from "./configureStore";
import {Provider} from "react-redux";
import {AppInitializer} from "./logic/initializer/AppInitializer";
import { BrowserRouter as Router, Route } from 'react-router-dom'

export const store = configureStore();
AppInitializer.inti();

ReactDOM.render(
    (<Provider store={store}>
        <Router>
            <Route path="/" component={App} />
        </Router>
    </Provider>),
    document.getElementById('root') || document.createElement('div') // fix for testing purposes
);

serviceWorker.unregister();
