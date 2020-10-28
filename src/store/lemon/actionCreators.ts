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

export function setOriginLabels(originLabels: ImageData): LemonActionTypes {
    return {
        type: Action.SET_ORIGIN_LABELS,
        payload: {
            originLabels: { ...originLabels }
        }
    }
}

