import {store} from "../../index";
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {ImageData, LabelLine, LabelName, LabelPoint, LabelPolygon, LabelRect} from '../../store/labels/types';
import {AuthService} from '@lemoncloud/lemon-front-lib';
import {
    updateActiveImageIndex,
    updateLabelNames,
    updateImageData, updateImageDataById,
} from '../../store/labels/actionCreators';
import {updateProjectData} from '../../store/general/actionCreators';
import {ImageDataUtil} from '../../utils/ImageDataUtil';
import {setProjectInfo, setTaskCurrentPage, setTaskTotalPage} from '../../store/lemon/actionCreators';
import {Settings} from '../../settings/Settings';
import {LemonSelector} from '../../store/selectors/LemonSelector';
import {isEqual} from 'lodash';
import axios, {AxiosRequestConfig} from 'axios';
import {fromPromise} from 'rxjs/internal-compatibility';
import {map } from 'rxjs/operators';
import {ImageActions} from './ImageActions';
import uuidv1 from 'uuid/v1';
import {LabelStatus} from '../../data/enums/LabelStatus';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';

type LemonImageUrl = {
    id: string;
    url: string;
    width?: number;
    height?: number;
}

interface LemonFileImage {
    id: string;
    file?: File;
}

export class LemonActions {

    private static lemonCore: AuthService = new AuthService(Settings.LEMON_OPTIONS);

    public static getLabelsFromAnnotations(annotations: any[]): { labelLines: LabelLine[], labelPoints: LabelPoint[], labelRects: LabelRect[], labelPolygons: LabelPolygon[] } {
        const lines = annotations.filter(annotation => !!annotation.line);
        const points = annotations.filter(annotation => !!annotation.point);
        const vertices = annotations.filter(annotation => !!annotation.vertices);
        const rects = annotations.filter(annotation => !!annotation.rect);

        // set label info from server
        const labelLines = lines.map(({ label, line }) => ({ id: uuidv1(), labelId: label.id, line }));
        const labelPoints = points.map(({ label, point }) => ({ id: uuidv1(), labelId: label.id, point, isCreatedByAI: false, status: LabelStatus.ACCEPTED, suggestedLabel: null }));
        const labelRects = rects.map(({ label, rect }) => ({ id: uuidv1(), labelId: label.id, rect, isCreatedByAI:false, status: LabelStatus.ACCEPTED, suggestedLabel: null }));
        const labelPolygons = vertices.map(({ label, vertices }) => ({ id: uuidv1(), labelId: label.id, vertices }));
        return { labelLines, labelPoints, labelRects, labelPolygons };
    }

    public static async setupProject(projectId: string) {
        try {
            // TODO: set category for tagging or labeling
            const { name, category } = await LemonActions.getProjectData(projectId);
            store.dispatch(setProjectInfo(projectId, category));
            store.dispatch(updateProjectData({ name, type: null }));

            const { list: labels } = await LemonActions.getLabelData(projectId);
            store.dispatch(updateLabelNames(labels));
        } catch (e) {
            alert(`${e}`);
            window.history.back();
        }
    }

    public static async initTaskByTaskId(taskId: string) {
        try {
            store.dispatch(setTaskTotalPage(0));
            store.dispatch(updateActiveImageIndex(0)); // select initial image!

            const { image: rawImage, projectId } = await LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks/${taskId}`);
            const imageUrls = [rawImage].map(({ _, url }) => ({ id: taskId, url }));
            const imageFiles = await LemonActions.convertUrlsToFiles(imageUrls);
            const images = LemonActions.getImageDataFromLemonFiles(imageFiles);

            store.dispatch(updateImageData(images));

            LemonActions.resetLemonOptions();

            return {
                projectId: projectId,
                name: GeneralSelector.getProjectName(),
                category: LemonSelector.getProjectCategory(),
            };
        } catch (e) {
            alert(`${e}`);
            return { projectId: null, name: null, category: null };
        }
    }

    public static async initTaskData(projectId: string, limit: number) {
        try {
            // load images
            const page = 0;
            const { list: taskList, total } = await LemonActions.fetchTasks(projectId, limit, page);

            // set images
            const imageUrls = taskList.map(task => ({ id: task.id, url: task.image.url }));
            const imageFiles = await LemonActions.convertUrlsToFiles(imageUrls);
            const images = LemonActions.getImageDataFromLemonFiles(imageFiles);
            store.dispatch(updateImageData(images));

            // set total page
            const totalPage = Math.ceil(Math.max(total, 1) / Math.max(limit, 1));
            store.dispatch(setTaskTotalPage(totalPage));

            // set active image index
            store.dispatch(updateActiveImageIndex(0)); // select initial image!
            LemonActions.resetLemonOptions();

            return {
                projectId: LemonSelector.getProjectId(),
                name: GeneralSelector.getProjectName(),
                category: LemonSelector.getProjectCategory()
            };
        } catch (e) {
            alert(`${e}`);
            return { projectId: null, name: null, category: null };
        }
    }

    public static saveUpdatedImagesData(index: number) {
        const originLabels = LemonSelector.getOriginLabels();
        const targetLabels = LabelsSelector.getImageDataByIndex(index);

        console.log(originLabels, targetLabels);
        if (isEqual(originLabels, targetLabels)) {
            return Promise.resolve();
        }

        const { id, labelLines, labelPoints, labelPolygons, labelRects } = targetLabels;
        // TODO: refactor below
        const filteredLabelLines = labelLines.filter(line => !!line.labelId);
        const filteredLabelPoints = labelPoints.filter(point => !!point.labelId);
        const filteredLabelPolygons = labelPolygons.filter(polygon => !!polygon.labelId);
        const filteredLabelRects = labelRects.filter(rect => !!rect.labelId);
        const annotations = [...filteredLabelLines, ...filteredLabelPoints, ...filteredLabelPolygons, ...filteredLabelRects];
        return LemonActions.lemonCore.request('POST', Settings.LEMONADE_API, `/tasks/${id}/submit`, null, { annotations });
    }

    public static async pageChanged(page: number) {
        // refresh token
        const credentials = await LemonActions.getCredentials();
        if (!credentials) {
            // TODO: add something
        }

        const currentIndex = LabelsSelector.getActiveImageIndex();
        await LemonActions.saveUpdatedImagesData(currentIndex);

        store.dispatch(updateActiveImageIndex(0)); // select initial image!

        const projectId = LemonSelector.getProjectId();
        const limit = LemonSelector.getTaskLimit();
        const { list } = await LemonActions.fetchTasks(projectId, limit, page);

        // set images
        const imageUrls = list.map(task => ({ id: task.id, imageUrl: task.image.imageUrl }));
        const imageFiles = await LemonActions.convertUrlsToFiles(imageUrls);
        const images = LemonActions.getImageDataFromLemonFiles(imageFiles);
        store.dispatch(updateImageData(images));

        // get first image info
        if (images.length > 0) {
            const firstImage = images[0];
            const task = await LemonActions.getTaskByImageData(firstImage);
            const { annotations } = task;
            const labels = LemonActions.getLabelsFromAnnotations(annotations);
            store.dispatch(updateImageDataById(firstImage.id, { ...firstImage, ...labels }));
        }

        store.dispatch(setTaskCurrentPage(page));
        ImageActions.setOriginLabelByIndex(0);
        return;
    }

    // TODO: todo feature to modify label on editor
    public static saveUpdatedLabels(updatedLabels: LabelName[]): Promise<LabelName[]> {
        const projectId = LemonSelector.getProjectId();
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('TODO: request update labels', projectId, updatedLabels);
                resolve(updatedLabels);
            }, 300);
        })
    }

    public static getTaskByImageData(image: ImageData) {
        const { id } = image;
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks/${id}`);
    }

    public static getTaskByImageData$(image: ImageData) {
        const { id } = image;
        return fromPromise(LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks/${id}`)).pipe(
            map(task => ({ task, origin: image }))
        );
    }

    public static getProjectData(id: string) {
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/projects/${id}`);
    }

    public static getLabelData(projectId: string) {
        const param = { projectId };
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/labels/`, param);
    }

    public static isAuthenticated() {
        return LemonActions.lemonCore.isAuthenticated();
    }

    public static getCredentials() {
        return LemonActions.lemonCore.getCredentials();
    }

    public static fetchTasks(projectId: string, limit: number = 5, page: number = 0) {
        const param = { limit, projectId, page };
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks`, param);
    }

    private static async convertUrlsToFiles(imageUrls: LemonImageUrl[]): Promise<LemonFileImage[]> {
        // const customOptions = { responseType: 'blob' };
        // LemonActions.lemonCore.setLemonOptions({ ...Settings.LEMON_OPTIONS, extraOptions: { ...customOptions } });

        return Promise.all(imageUrls.map(async ({ id, url }) => {
            const name = url.split('/') ? url.split('/').pop() : 'null';

            const config: AxiosRequestConfig = { responseType: 'blob' };
            return axios.get(url, config)
                .then(response => ({ id, file: new File([response.data], name) }))
                .catch(() => ({ id, file: null, name }));

            // TODO: use below
            // return LemonActions.lemonCore.request('GET', imageUrl, '')
            //     .then(response => ({ id, file: new File([response], name) }))
            //     .catch(() => ({ id, file: new File([], name) }));
        }))
    }

    private static getImageDataFromLemonFiles(files: LemonFileImage[]): ImageData[] {
        return files
            .filter(({ file }) => !!file)
            .map(({ file, id }) => ImageDataUtil.createImageDataFromFileData(file, id));
    }

    private static resetLemonOptions() {
        LemonActions.lemonCore.setLemonOptions(Settings.LEMON_OPTIONS);
    }

}
