import { LemonActionTypes, LemonState } from './types';
import { Action } from '../Actions';

const initialState: LemonState = {
    projectId: null,
    category: null,
    limit: null,
    totalPage: null,
    page: null,
    originLabels: null,
    taskStartTime: null,
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
        case Action.SET_TASK_CURRENT_PAGE: {
            return {
                ...state,
                page: action.payload.page
            }
        }
        case Action.SET_TASK_LIMIT: {
            return {
                ...state,
                limit: action.payload.limit
            }
        }
        case Action.SET_TASK_TOTAL_PAGE: {
            return {
                ...state,
                totalPage: action.payload.totalPage
            }
        }
        case Action.SET_ORIGIN_LABELS: {
            return {
                ...state,
                originLabels: { ...action.payload.originLabels }
            }
        }
        case Action.SET_TASK_START_TIME: {
            return {
                ...state,
                taskStartTime: action.payload.taskStartTime
            }
        }
        default:
            return state;
    }
}
