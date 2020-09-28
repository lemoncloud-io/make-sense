import { Action } from '../Actions';
import { LemonActionTypes } from './types';

export function setProjectId(projectId: string): LemonActionTypes {
    return {
        type: Action.SET_PROJECT_ID,
        payload: {
            projectId,
        }
    }
}

export function setImagePagination(limit: number, page: number, total: number): LemonActionTypes {
    return {
        type: Action.SET_IMAGE_PAGINATION,
        payload: {
            limit,
            page,
            total
        }
    }
}

export function setCurrentPage(page: number): LemonActionTypes {
    return {
        type: Action.SET_CURRENT_PAGE,
        payload: {
            page
        }
    }
}

