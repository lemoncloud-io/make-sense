import { Action } from '../Actions';

export type LemonState = {
    projectId: string;
    limit: number;
    total: number;
    page: number;
}

interface SetProjectId {
    type: typeof Action.SET_PROJECT_ID;
    payload: {
        projectId: string
    }
}

interface SetPagination {
    type: typeof Action.SET_IMAGE_PAGINATION;
    payload: {
        limit: number,
        total: number,
        page: number
    }
}

export type LemonActionTypes = SetProjectId
    | SetPagination;
