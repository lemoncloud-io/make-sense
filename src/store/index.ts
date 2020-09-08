import { combineReducers } from 'redux';
import { labelsReducer } from './labels/reducer';
import { generalReducer } from './general/reducer';
import { aiReducer } from './ai/reducer';
import { lemonReducer } from './lemon/reducer';

export const rootReducer = combineReducers({
    general: generalReducer,
    labels: labelsReducer,
    ai: aiReducer,
    lemon: lemonReducer,
});

export type AppState = ReturnType<typeof rootReducer>;
