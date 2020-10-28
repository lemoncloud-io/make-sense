import { Action } from '../Actions';
import { ImageData } from '../labels/types';

export type LemonState = {
    projectId: string;
    category: string;
    limit: number;
    total: number;
    page: number;
    originLabels: ImageData;
}

interface SetProjectInfo {
    type: typeof Action.SET_PROJECT_INFO;
    payload: {
        projectId: string,
        category: string,
    }
}

interface SetImagePagination {
    type: typeof Action.SET_IMAGE_PAGINATION;
    payload: {
        limit: number,
        total: number,
        page: number
    }
}

interface SetCurrentPage {
    type: typeof Action.SET_CURRENT_PAGE;
    payload: {
        page: number
    }
}

interface SetOriginLabels {
    type: typeof Action.SET_ORIGIN_LABELS;
    payload: {
        originLabels: ImageData;
    }
}

export type LemonActionTypes = SetProjectInfo
    | SetImagePagination
    | SetCurrentPage
    | SetOriginLabels;
