import { LemonActionTypes, LemonState } from './types';
import { Action } from '../Actions';

const initialState: LemonState = {
    projectId: null
};

export function lemonReducer(
    state = initialState,
    action: LemonActionTypes
): LemonState {
    switch (action.type) {
        case Action.SET_PROJECT_ID: {
            return {
                ...state,
                projectId: action.payload.projectId
            }
        }
        default:
            return state;
    }
}
