import { store } from '../..';

export class LemonSelector {

    public static getProjectId(): string {
        return store.getState().lemon.projectId;
    }
}
