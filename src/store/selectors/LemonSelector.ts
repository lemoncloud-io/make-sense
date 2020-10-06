import { store } from '../..';
import { ImageData } from '../labels/types';


export class LemonSelector {

    public static getProjectId(): string {
        return store.getState().lemon.projectId;
    }

    public static getCurrentPage(): number {
        return store.getState().lemon.page;
    }

    public static getTotalPage(): number {
        return Math.ceil(store.getState().lemon.total / store.getState().lemon.limit) - 1;
    }

    public static getOriginLabels(): ImageData {
        return store.getState().lemon.originLabels;
    }
}
