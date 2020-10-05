import { store } from '../..';

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
}
