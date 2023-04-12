import { Action } from '../Actions';
import { ImageData } from '../labels/types';
import {ProjectView} from "@lemoncloud/ade-backend-api";

export type TaskState = 'open' | 'submitted' | 'rejected' | 'closed' | 'all';

export type LemonState = {
    projectId: string;
    category: string;
    limit: number;
    page: number;
    totalPage: number;
    originLabels: ImageData;
    taskStartTime: Date;
    taskState: TaskState; // /tasks 요청 시 state 쿼리
    project: ProjectView;
}

interface SetProjectInfo {
    type: typeof Action.SET_PROJECT_INFO;
    payload: {
        projectId: string,
        category: string,
        project: ProjectView,
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

interface SetTaskStartTime {
    type: typeof Action.SET_TASK_START_TIME;
    payload: {
        taskStartTime: Date;
    }
}

interface SetTaskState {
    type: typeof Action.SET_TASK_STATE;
    payload: {
        taskState: TaskState;
    }
}


export type LemonActionTypes = SetProjectInfo
    | SetTaskCurrentPage
    | SetOriginLabels
    | SetTaskTotalPage
    | SetTaskStartTime
    | SetTaskState
    | SetTaskLimit;

