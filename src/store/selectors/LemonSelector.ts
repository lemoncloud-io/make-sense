import { store } from '../..';
import { AuthService } from '@lemoncloud/lemon-front-lib';

export class LemonSelector {
    public static getLemonCore(): AuthService {
        return store.getState().lemon.lemonCore;
    }
}
