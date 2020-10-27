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
import { GeneralSelector } from '../../store/selectors/GeneralSelector';
import { ProjectData } from '../../store/general/types';
import { ImageData } from '../../store/labels/types';
import { isEqual } from 'lodash';
import axios, {AxiosRequestConfig} from 'axios';
import {fromPromise} from 'rxjs/internal-compatibility';
import {map} from 'rxjs/operators';


type LemonImageUrl = {
    id: string;
    imageUrl: string;
}

interface LemonFileImage {
    id: string;
    file?: File;
}

export class LemonActions {

    private static lemonCore: AuthService = new AuthService(Settings.LEMON_OPTIONS);

    public static async initProject(projectId: string): Promise<ProjectData> {
        try {
            // init project
            const { name, type } = await LemonActions.getProjectData(projectId);
            const { list: labels } = await LemonActions.getLabelData(projectId);

            // load images and save into `labels` store
            await this.loadProjectImages(projectId);
            LemonActions.resetLemonOptions();
            store.dispatch(setProjectId(projectId));
            store.dispatch(updateLabelNames(labels));
            store.dispatch(updateProjectData({ name, type: null }));

            const projectData = GeneralSelector.getProjectData();
            return { ...projectData, type: type ? type : null };
        } catch (e) {
            alert(e);
            return GeneralSelector.getProjectData();
        }
    }

    // NOTE: 안써도 될듯?
    public static saveAllUpdatedImagesData() {
        const images = LabelsSelector.getImagesData();
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('TODO: request update all images', images);
                resolve(true);
            }, 300);
        })
    }

    public static saveUpdatedImagesData(index: number) {
        const originLabels = LemonSelector.getOriginLabels();
        const targetLabels = LabelsSelector.getImageDataByIndex(index);

        console.log(originLabels, targetLabels);
        if (isEqual(originLabels, targetLabels)) {
            return Promise.resolve();
        }

        const { id, labelLines, labelPoints, labelPolygons, labelRects } = targetLabels;
        const mergeItems = [...labelLines, ...labelPoints, ...labelPolygons, ...labelRects];
        return LemonActions.lemonCore.request('POST', Settings.LEMONADE_API, `/tasks/${id}/submit`, null, { annotations: mergeItems });
    }

    // NOTE: Admin에서 사용할듯?
    public static saveUpdatedLabels(updatedLabels: LabelName[]): Promise<LabelName[]> {
        const projectId = LemonSelector.getProjectId();
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('TODO: request update labels', projectId, updatedLabels);
                resolve(updatedLabels);
            }, 300);
        })
    }

    public static getTaskByImageData$(image: ImageData) {
        const { id } = image;
        return fromPromise(LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks/${id}`)).pipe(
            map(task => ({ task, origin: image }))
        );
    }

    private static getProjectData(id: string) {
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/projects/${id}`);
    }

    private static getLabelData(projectId: string) {
        const param = { projectId };
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/labels/`, param);
    }

    public static async loadProjectImages(id: string, pages?: number){
        pages = pages ? pages : 0;
        const { list } = await LemonActions.getProjectImages(id, pages);
        const imageUrls = list.map(task => ({ id: task.id, imageUrl: task.image.imageUrl }));
        const imageFiles = await LemonActions.convertUrlsToFiles(imageUrls);
        const images = LemonActions.setImagesToStore(imageFiles);

        store.dispatch(updateActiveImageIndex(0)); // select initial image!
        store.dispatch(addImageData(images));
        // store.dispatch(setImagePagination(limit, page, total));
        return;
    }

    public static isAuthenticated() {
        return LemonActions.lemonCore.isAuthenticated();
    }

    public static isAuthenticated$() {
        return fromPromise(LemonActions.lemonCore.isAuthenticated());
    }

    public static getCredentials() {
        return LemonActions.lemonCore.getCredentials();
    }

    private static getProjectImages(projectId: string, page?: number){
        const param = { limit: 10, page, projectId };
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks`, param);
    }

    private static async convertUrlsToFiles(imageUrls: LemonImageUrl[]): Promise<LemonFileImage[]> {
        const customOptions = { responseType: 'blob' };
        LemonActions.lemonCore.setLemonOptions({ ...Settings.LEMON_OPTIONS, extraOptions: { ...customOptions } });

        return Promise.all(imageUrls.map(async ({ id, imageUrl }) => {
            const name = imageUrl.split('/') ? imageUrl.split('/').pop() : 'null';

            const config: AxiosRequestConfig = { responseType: 'blob' };
            return axios.get(imageUrl, config)
                .then(response => ({ id, file: new File([response.data], name) }))
                .catch(() => ({ id, file: null, name }));

            // TODO: use below
            // return LemonActions.lemonCore.request('GET', imageUrl, '')
            //     .then(response => ({ id, file: new File([response], name) }))
            //     .catch(() => ({ id, file: new File([], name) }));
        }))
    }

    private static setImagesToStore(files: LemonFileImage[]) {
        return files
            .filter(({ file }) => !!file)
            .map(({ file, id }) => ImageDataUtil.createImageDataFromFileData(file, id));
    }

    private static resetLemonOptions() {
        LemonActions.lemonCore.setLemonOptions(Settings.LEMON_OPTIONS);
    }


}
