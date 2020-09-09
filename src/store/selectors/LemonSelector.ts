import { store } from '../..';
import { LabelName } from '../labels/types';

export class LemonSelector {
    public static getOriginLabels(): LabelName[] {
        return store.getState().lemon.labels;
    }

    public static getProjectId(): string {
        return store.getState().lemon.projectId;
    }
}
