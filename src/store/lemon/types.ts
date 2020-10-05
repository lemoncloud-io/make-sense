import { Action } from '../Actions';
import { ImageData } from '../labels/types';

export type LemonState = {
    projectId: string;
    limit: number;
    total: number;
    page: number;
    originLabels: ImageData;
}

interface SetProjectId {
    type: typeof Action.SET_PROJECT_ID;
    payload: {
        projectId: string
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

export type LemonActionTypes = SetProjectId
    | SetImagePagination
    | SetCurrentPage
    | SetOriginLabels;
