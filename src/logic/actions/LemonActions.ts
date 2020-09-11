import { store } from "../../index";
import { LabelsSelector } from '../../store/selectors/LabelsSelector';
import { LemonSelector } from '../../store/selectors/LemonSelector';
import { LabelName } from '../../store/labels/types';
import {AuthService, LemonOptions} from '@lemoncloud/lemon-front-lib';
import {addImageData, updateActiveImageIndex, updateLabelNames} from '../../store/labels/actionCreators';
import {updateActivePopupType, updateProjectData} from '../../store/general/actionCreators';
import {ImageDataUtil} from '../../utils/ImageDataUtil';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {setProjectId} from '../../store/lemon/actionCreators';

type LemonImageUrl = {
    id: string;
    url: string;
    name: string;
}

export class LemonActions {

    private static lemonOptions: LemonOptions = { project: 'lemonade', oAuthEndpoint: 'TODO: add env' };
    private static lemonCore: AuthService = new AuthService(LemonActions.lemonOptions);

    public static async initProject(projectId: string) {
        const { data: { name, labels, images } } = await LemonActions.getProjectData(projectId);
        store.dispatch(setProjectId(projectId));
        store.dispatch(updateLabelNames(labels));
        store.dispatch(updateProjectData({ name, type: null }));

        const fileDatas = await LemonActions.convertUrlsToFiles(images);
        LemonActions.setImagesToStore(fileDatas);
        store.dispatch(updateActivePopupType(PopupWindowType.CHOOSE_LABEL_TYPE));
    }

    public static saveUpdatedImagesData() {
        const imageIndex: number = LabelsSelector.getActiveImageIndex();
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('TODO: request update images', LabelsSelector.getImageDataByIndex(imageIndex));
                resolve(true);
            }, 300);
        })
    }

    public static saveUpdatedLabels(updatedLabels: LabelName[]): Promise<LabelName[]> {
        const projectId = LemonSelector.getProjectId();
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('TODO: request update labels', projectId, updatedLabels);
                resolve(updatedLabels);
            }, 300);
        })
    }

    private static async getProjectData(id: string) {
        return LemonActions.lemonCore.request('GET', 'http://localhost:8200', `/project/${id}`);
    }

    private static async convertUrlsToFiles(imageUrls: LemonImageUrl[]) {
        const customOptions = { responseType: 'blob' };
        LemonActions.lemonCore.setLemonOptions({ ...LemonActions.lemonOptions, extraOptions: { ...customOptions } });

        return Promise.all(imageUrls.map(({ id, url, name }) => {
            return LemonActions.lemonCore.request('GET', url, '/').then(response => ({ id, file: new File([response], name) }));
        }))
    }

    private static setImagesToStore(datas: any) {
        const imageDatas = datas.map(fileData => {
            const { id, file } = fileData;
            return ImageDataUtil.createImageDataFromFileData(file, id);
        });
        store.dispatch(updateActiveImageIndex(0));
        store.dispatch(addImageData(imageDatas));
    }

}
