import { Action } from '../Actions';
import { LabelName } from '../labels/types';

export type LemonState = {
    labels: LabelName[];
    projectId: string;
}

interface SetOriginLabels {
    type: typeof Action.SET_ORIGIN_LABELS;
    payload: {
        labels: LabelName[]
    }
}

interface SetProjectId {
    type: typeof Action.SET_PROJECT_ID;
    payload: {
        projectId: string
    }
}

export type LemonActionTypes = SetOriginLabels
    | SetProjectId
