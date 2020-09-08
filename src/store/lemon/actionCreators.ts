import { Action } from '../Actions';
import { LemonActionTypes } from './types';
import { LemonOptions } from '@lemoncloud/lemon-front-lib';

export function initLemonCore(options: LemonOptions): LemonActionTypes {
    return {
        type: Action.INIT_LEMON_CORE,
        payload: {
            options,
        }
    }
}

export function updateLemonCoreOptions(options: LemonOptions): LemonActionTypes {
    return {
        type: Action.UPDATE_LEMON_CORE_OPTIONS,
        payload: {
            options,
        }
    }
}
