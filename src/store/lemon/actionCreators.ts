import { Action } from '../Actions';
import {LemonActionTypes, TaskState} from './types';
import { ImageData } from '../labels/types';

export function setProjectInfo(projectId: string, category: string = ''): LemonActionTypes {
    return {
        type: Action.SET_PROJECT_INFO,
        payload: {
            projectId,
            category,
        }
    }
}

export function setTaskCurrentPage(page: number): LemonActionTypes {
    return {
        type: Action.SET_TASK_CURRENT_PAGE,
        payload: {
            page
        }
    }
}

export function setTaskLimit(limit: number): LemonActionTypes {
    return {
        type: Action.SET_TASK_LIMIT,
        payload: {
            limit
        }
    }
}

export function setTaskTotalPage(totalPage: number): LemonActionTypes {
    return {
        type: Action.SET_TASK_TOTAL_PAGE,
        payload: {
            totalPage
        }
    }
}

export function setOriginLabels(originLabels: ImageData): LemonActionTypes {
    return {
        type: Action.SET_ORIGIN_LABELS,
        payload: {
            originLabels: { ...originLabels }
        }
    }
}

export function setTaskStartTime(taskStartTime: Date | null): LemonActionTypes {
    return {
        type: Action.SET_TASK_START_TIME,
        payload: {
            taskStartTime
        }
    }
}

export function setTaskState(taskState: TaskState = 'open'): LemonActionTypes {
    return {
        type: Action.SET_TASK_STATE,
        payload: {
            taskState
        }
    }
}



