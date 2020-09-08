import { Action } from '../Actions';
import { AuthService, LemonOptions } from '@lemoncloud/lemon-front-lib';

export type LemonState = {
    lemonCore: AuthService;
}

interface InitLemonCore {
    type: typeof Action.INIT_LEMON_CORE;
    payload: {
        options: LemonOptions
    }
}

interface UpdateLemonCoreOptions {
    type: typeof Action.UPDATE_LEMON_CORE_OPTIONS;
    payload: {
        options: LemonOptions
    }
}


export type LemonActionTypes = InitLemonCore
    | UpdateLemonCoreOptions;
