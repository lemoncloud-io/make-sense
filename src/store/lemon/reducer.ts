import { LemonActionTypes, LemonState } from './types';
import { Action } from '../Actions';

const initialState: LemonState = {
    projectId: null,
    category: null,
    limit: null,
    total: null,
    page: null,
    originLabels: null,
};

export function lemonReducer(
    state = initialState,
    action: LemonActionTypes
): LemonState {
    switch (action.type) {
        case Action.SET_PROJECT_INFO: {
            return {
                ...state,
                projectId: action.payload.projectId,
                category: action.payload.category,
            }
        }
        case Action.SET_IMAGE_PAGINATION: {
            return {
                ...state,
                limit: action.payload.limit,
                page: action.payload.page,
                total: action.payload.total,
            }
        }
        case Action.SET_CURRENT_PAGE: {
            return {
                ...state,
                page: action.payload.page
            }
        }
        case Action.SET_ORIGIN_LABELS: {
            return {
                ...state,
                originLabels: { ...action.payload.originLabels }
            }
        }
        default:
            return state;
    }
}
