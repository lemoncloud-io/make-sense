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

type LemonImageUrl = {
    id: string;
    imageUrl: string;
}

export class LemonActions {

    private static lemonCore: AuthService = new AuthService(Settings.LEMON_OPTIONS);

    public static async initProject(projectId: string): Promise<ProjectData> {
        try {
            // init project
            const { name, labels, type } = await LemonActions.getProjectData(projectId);
            store.dispatch(setProjectId(projectId));
            store.dispatch(updateLabelNames(labels));
            store.dispatch(updateProjectData({ name, type: null }));

            // load images and save into `labels` store
            await this.loadProjectImages(projectId);

            LemonActions.resetLemonOptions();

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

    public static saveUpdatedImagesData() {
        const imageIndex: number = LabelsSelector.getActiveImageIndex();
        const { id, labelLines, labelPoints, labelPolygons, labelRects } = LabelsSelector.getImageDataByIndex(imageIndex);
        const mergeItmes = [ ...labelLines, ...labelPoints, ...labelPolygons, ...labelRects ];

        console.table(mergeItmes);
        // id, shape, label name 
        return LemonActions.lemonCore.request('POST', Settings.LEMONADE_API, `/annotations/${id}`, null, mergeItmes);
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

    private static getProjectData(id: string) {
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/projects/${id}`);
    }

    public static async loadProjectImages(id:string, pages?: number){
        pages = pages ? pages : 0;
        const { limit, list: imageUrls, page, total } = await LemonActions.getProjectImages(id, pages);
        const imageFiles = await LemonActions.convertUrlsToFiles(imageUrls);
        const images = LemonActions.setImagesToStore(imageFiles);

        store.dispatch(updateActiveImageIndex(0));
        store.dispatch(addImageData(images));
        // limit, page, total
        // store.dispatch(null);
        return;
    }
    
    private static getProjectImages(id: string, page?: number){
        const param = { limit: 10, page };
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/projects/${id}/images`, param);
    }

    private static async convertUrlsToFiles(imageUrls: LemonImageUrl[]) {
        const customOptions = { responseType: 'blob' };
        LemonActions.lemonCore.setLemonOptions({ ...Settings.LEMON_OPTIONS, extraOptions: { ...customOptions } });

        return Promise.all(imageUrls.map(async ({ id, imageUrl }) => {
            const name = imageUrl.split('/') ? imageUrl.split('/').pop() : 'null';
            return LemonActions.lemonCore.request('GET', imageUrl, '').then(response => ({ id, file: new File([response], name) }));
        }))
    }

    private static setImagesToStore(files: any) {
        return files.map(({ file, id }) => ImageDataUtil.createImageDataFromFileData(file, id));
    }

    

    private static resetLemonOptions() {
        LemonActions.lemonCore.setLemonOptions(Settings.LEMON_OPTIONS);
    }

}
