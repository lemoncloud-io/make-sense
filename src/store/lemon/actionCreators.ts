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

