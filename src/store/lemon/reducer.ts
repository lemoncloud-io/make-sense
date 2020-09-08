import { LemonActionTypes, LemonState } from './types';
import { Action } from '../Actions';
import { AuthService } from '@lemoncloud/lemon-front-lib';

const initialState: LemonState = {
    lemonCore: null
};

export function lemonReducer(
    state = initialState,
    action: LemonActionTypes
): LemonState {
    switch (action.type) {
        case Action.INIT_LEMON_CORE: {
            return {
                ...state,
                lemonCore: new AuthService(action.payload.options)
            }
        }
        case Action.UPDATE_LEMON_CORE_OPTIONS: {
            return {
                ...state,
                lemonCore: new AuthService(action.payload.options)
            }
        }
        default:
            return state;
    }
}
