import { LemonActionTypes, LemonState } from './types';
import { Action } from '../Actions';

const initialState: LemonState = {
    labels: []
};

export function lemonReducer(
    state = initialState,
    action: LemonActionTypes
): LemonState {
    switch (action.type) {
        case Action.SET_ORIGIN_LABELS: {
            return {
                ...state,
                labels: action.payload.labels
            }
        }
        default:
            return state;
    }
}
