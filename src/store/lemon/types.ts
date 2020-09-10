import { Action } from '../Actions';

export type LemonState = {
    projectId: string;
}

interface SetProjectId {
    type: typeof Action.SET_PROJECT_ID;
    payload: {
        projectId: string
    }
}

export type LemonActionTypes = SetProjectId
