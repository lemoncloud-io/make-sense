import { store } from '../..';
import { ImageData } from '../labels/types';
import {TaskState} from "../lemon/types";

export class LemonSelector {

    public static getProjectId(): string {
        return store.getState().lemon.projectId;
    }

    public static getProjectCategory(): string {
        return store.getState().lemon.category;
    }

    public static getCurrentPage(): number {
        return store.getState().lemon.page;
    }

    public static getTotalPage(): number {
        return store.getState().lemon.totalPage;
    }

    public static getTaskLimit(): number {
        return store.getState().lemon.limit;
    }

    public static getOriginLabels(): ImageData {
        return store.getState().lemon.originLabels;
    }

    public static getTaskStartTime(): Date {
        return store.getState().lemon.taskStartTime;
    }

    public static getTaskState(): TaskState {
        return store.getState().lemon.taskState;
    }
}
