import { Action } from '../Actions';
import { LabelName } from '../labels/types';

export type LemonState = {
    labels: LabelName[];
}

interface SetOriginLabels {
    type: typeof Action.SET_ORIGIN_LABELS;
    payload: {
        labels: LabelName[]
    }
}

export type LemonActionTypes = SetOriginLabels;
