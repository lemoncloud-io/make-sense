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

const BASE_HREF = process.env.REACT_APP_BASE_REF;

ReactDOM.render(
    (<Provider store={store}>
        <Router basename={BASE_HREF}>
            <Route path="/" component={App} />
        </Router>
    </Provider>),
    document.getElementById('root') || document.createElement('div') // fix for testing purposes
);

serviceWorker.unregister();
