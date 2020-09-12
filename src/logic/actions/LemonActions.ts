import { store } from "../../index";
import { LabelsSelector } from '../../store/selectors/LabelsSelector';
import { LemonSelector } from '../../store/selectors/LemonSelector';
import { LabelName } from '../../store/labels/types';
import { AuthService } from '@lemoncloud/lemon-front-lib';
import { addImageData, updateActiveImageIndex, updateLabelNames } from '../../store/labels/actionCreators';
import { updateProjectData } from '../../store/general/actionCreators';
import { ImageDataUtil } from '../../utils/ImageDataUtil';
import { setProjectId } from '../../store/lemon/actionCreators';
import { Settings } from '../../settings/Settings';

type LemonImageUrl = {
    id: string;
    url: string;
    name: string;
}

export class LemonActions {

    private static lemonCore: AuthService = new AuthService(Settings.LEMON_OPTIONS);

    public static async initProject(projectId: string) {
        try {
            const { data: { name, labels, images: imageUrls } } = await LemonActions.getProjectData(projectId);
            store.dispatch(setProjectId(projectId));
            store.dispatch(updateLabelNames(labels));
            store.dispatch(updateProjectData({ name, type: null }));

            const imageFiles = await LemonActions.convertUrlsToFiles(imageUrls);
            const images = LemonActions.setImagesToStore(imageFiles);
            store.dispatch(updateActiveImageIndex(0));
            store.dispatch(addImageData(images));
            LemonActions.resetLemonOptions();
        } catch (e) {
            alert(e);
        }
    }

    public static saveAllUpdatedImagesData() {
        const images = LabelsSelector.getImagesData();
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('TODO: request update all images', images);
                resolve(true);
            }, 300);
        })
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
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/project/${id}`);
    }

    private static async convertUrlsToFiles(imageUrls: LemonImageUrl[]) {
        const customOptions = { responseType: 'blob' };
        LemonActions.lemonCore.setLemonOptions({ ...Settings.LEMON_OPTIONS, extraOptions: { ...customOptions } });

        return Promise.all(imageUrls.map(({ id, url, name }) => {
            return LemonActions.lemonCore.request('GET', url, '/').then(response => ({ id, file: new File([response], name) }));
        }))
    }

    private static setImagesToStore(files: any) {
        return files.map(({ file, id }) => ImageDataUtil.createImageDataFromFileData(file, id));
    }

    private static resetLemonOptions() {
        LemonActions.lemonCore.setLemonOptions(Settings.LEMON_OPTIONS);
    }

}
