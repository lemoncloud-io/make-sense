import { Action } from '../Actions';
import { LemonActionTypes } from './types';
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

