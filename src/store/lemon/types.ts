import { Action } from '../Actions';
import { ImageData } from '../labels/types';

export type LemonState = {
    projectId: string;
    category: string;
    limit: number;
    page: number;
    totalPage: number;
    originLabels: ImageData;
}

interface SetProjectInfo {
    type: typeof Action.SET_PROJECT_INFO;
    payload: {
        projectId: string,
        category: string,
    }
}

interface SetTaskCurrentPage {
    type: typeof Action.SET_TASK_CURRENT_PAGE;
    payload: {
        page: number
    }
}

interface SetTaskTotalPage {
    type: typeof Action.SET_TASK_TOTAL_PAGE;
    payload: {
        totalPage: number
    }
}

interface SetTaskLimit {
    type: typeof Action.SET_TASK_LIMIT;
    payload: {
        limit: number
    }
}

interface SetOriginLabels {
    type: typeof Action.SET_ORIGIN_LABELS;
    payload: {
        originLabels: ImageData;
    }
}

export type LemonActionTypes = SetProjectInfo
    | SetTaskCurrentPage
    | SetOriginLabels
    | SetTaskTotalPage
    | SetTaskLimit;
