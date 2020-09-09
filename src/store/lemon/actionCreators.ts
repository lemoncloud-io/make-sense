import { Action } from '../Actions';
import { LemonActionTypes } from './types';
import { LabelName } from '../labels/types';

export function setOriginLabels(labels: LabelName[]): LemonActionTypes {
    return {
        type: Action.SET_ORIGIN_LABELS,
        payload: {
            labels,
        }
    }
}
