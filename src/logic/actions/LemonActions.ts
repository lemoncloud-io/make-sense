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
import {setProjectInfo, setTaskCurrentPage, setTaskState, setTaskTotalPage} from '../../store/lemon/actionCreators';
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
import {TaskState} from "../../store/lemon/types";

// TODO: modify types
export interface TextTagInfo {
    title?: string;
    content: string;
}

type Task = any;

type LemonImageUrl = {
    id: string;
    url: string;
    width?: number;
    height?: number;
    textData?: TextTagInfo;
}

interface LemonFileImage {
    id: string;
    file?: File;
    textData?: TextTagInfo;
}

interface MakeSenseAnnotation {
    labelLines: LabelLine[];
    labelPoints: LabelPoint[];
    labelRects: LabelRect[];
    labelPolygons: LabelPolygon[];
    labelNameIds: string[];
}

const WHITE_IMAGE_URL = 'img/white-bg.jpg';

const blobToFile = (theBlob: Blob, fileName: string): File => {
    return new File([theBlob], fileName, {
        type: "image/jpeg",
    });
}

const setTaskUrls = (tasks: Task[]) => {
    return tasks.map(task => {
        const { id, context } = task;
        const { type } = context;
        if (type === 'image' || !type) { // TODO: refactor this line
            return { id, url: context.image.url };
        }
        if (type === 'text') {
            return { id, url: WHITE_IMAGE_URL, textData: context.text };
        }
        return { id, url: WHITE_IMAGE_URL };
    });
};

export class LemonActions {

    private static lemonCore: AuthService = new AuthService(Settings.LEMON_OPTIONS);

    public static getLabelsFromAnnotations(annotations: any[]): MakeSenseAnnotation {
        const lines = annotations.filter(annotation => !!annotation.line);
        const points = annotations.filter(annotation => !!annotation.point);
        const vertices = annotations.filter(annotation => !!annotation.vertices);
        const rects = annotations.filter(annotation => !!annotation.rect);
        const tags = annotations.filter(annotation => !!annotation.label && !annotation.rect && !annotation.point && !annotation.vertices && !annotation.rect);

        // set label info from server
        const labelLines = lines.map(({ label, line }) => ({ id: uuidv1(), labelId: label.id, line }));
        const labelPoints = points.map(({ label, point }) => ({ id: uuidv1(), labelId: label.id, point, isCreatedByAI: false, status: LabelStatus.ACCEPTED, suggestedLabel: null }));
        const labelRects = rects.map(({ label, rect }) => ({ id: uuidv1(), labelId: label.id, rect, isCreatedByAI:false, status: LabelStatus.ACCEPTED, suggestedLabel: null }));
        const labelPolygons = vertices.map(({ label, vertices }) => ({ id: uuidv1(), labelId: label.id, vertices }));
        const labelNameIds = tags.map(({ label }) => label.id);
        return { labelLines, labelPoints, labelRects, labelPolygons, labelNameIds };
    }

    public static async setupProject(projectId: string) {
        try {
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

            const task = await LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks/${taskId}`);
            const { project: { id: projectId } } = task;
            const images = await LemonActions.getImagesByTaskList([task]);
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
            const { list: assignedProjects } = await LemonActions.getMyAssignedProject();
            const isAssigned = assignedProjects && assignedProjects.filter(project => project.id === projectId).length > 0;
            if (isAssigned) {
                const [assignedProject] = assignedProjects.filter(project => project.id === projectId);
                if (!!assignedProject.userProgress && assignedProject.userProgress.complete >= assignedProject.userProgress.total) {
                    const { assignedTo, tasks } = await LemonActions.assignTasks(projectId, limit);
                    console.log('assigned to ', assignedTo, tasks);
                }
            }
            const view = 'workspace'; // TODO: modify this line
            const { list, total } = await LemonActions.fetchTasks(projectId, limit, page, view);

            // set images
            const images = await LemonActions.getImagesByTaskList(list);
            store.dispatch(updateImageData(images));

            // set total page
            const totalPage = Math.ceil(Math.max(total || 0, 1) / Math.max(limit, 1));
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

    private static async getImagesByTaskList(tasks: Task[]) {
        const urls = setTaskUrls(tasks);
        const files = await LemonActions.convertUrlsToFiles(urls);
        return LemonActions.getImageDataFromLemonFiles(files);
    }

    public static saveWorkingTimeByImageIndex(index: number, submittedAt: number | null) {
        const startTime = LemonSelector.getTaskStartTime();
        if (!submittedAt || !startTime) {
            return Promise.resolve();
        }

        // log working time
        const time = submittedAt - startTime.getTime();
        const targetLabels = LabelsSelector.getImageDataByIndex(index);
        const { id } = targetLabels;
        return LemonActions.lemonCore.request('POST', Settings.LEMONADE_API, `/tasks/${id}/log`, null, { time });
    }

    public static saveUpdatedImagesData(index: number) {
        const originLabels = LemonSelector.getOriginLabels();
        const targetLabels = LabelsSelector.getImageDataByIndex(index);
        if (isEqual(originLabels, targetLabels)) {
            return Promise.resolve({ submittedAt: null }); // TODO: fix it. just workaround
        }

        const { id, labelLines, labelPoints, labelPolygons, labelRects, labelNameIds } = targetLabels;
        // TODO: refactor below
        const filteredLabelLines = labelLines.filter(line => !!line.labelId);
        const filteredLabelPoints = labelPoints.filter(point => !!point.labelId);
        const filteredLabelPolygons = labelPolygons.filter(polygon => !!polygon.labelId);
        const filteredLabelRects = labelRects.filter(rect => !!rect.labelId);
        const filteredLabelIds = labelNameIds.filter(labelId => !!labelId).map(labelId => ({ labelId })); // 이미지 태깅일 때
        const annotations = [...filteredLabelLines, ...filteredLabelPoints, ...filteredLabelPolygons, ...filteredLabelRects, ...filteredLabelIds];
        return LemonActions.lemonCore.request('POST', Settings.LEMONADE_API, `/tasks/${id}/submit`, null, { annotations });
    }

    public static async pageChanged(page: number) {
        const currentIndex = LabelsSelector.getActiveImageIndex();
        const { submittedAt } = await LemonActions.saveUpdatedImagesData(currentIndex);
        await LemonActions.saveWorkingTimeByImageIndex(currentIndex, submittedAt);
        await this.resetTasks(page);
        return;
    }

    public static async updateTaskState(state: TaskState) {
        store.dispatch(setTaskState(state));
        await this.resetTasks();
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

    public static async resetTasks(page: number = 0) {
        store.dispatch(updateActiveImageIndex(0)); // select initial image!

        const projectId = LemonSelector.getProjectId();
        const limit = LemonSelector.getTaskLimit();
        const view = 'workspace'; // TODO: modify this line
        const { list } = await LemonActions.fetchTasks(projectId, limit, page, view);
        // set images
        const images = await LemonActions.getImagesByTaskList(list);
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

    public static getMyAssignedProject() {
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/projects`, { state: 'my_assigned' });
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

    public static fetchTasks(projectId: string, limit: number = 5, page: number = 0, view: string = 'workspace') {
        let param = { limit, projectId, page, view };
        const state = LemonSelector.getTaskState();
        if (state === 'all') {
            return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks`, param);
        }
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks`, { ...param, state });
    }

    public static assignTasks(projectId: string, limit: number = 5) {
        const param = { limit, projectId };
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks/0/assign`, param);
    }

    private static async convertUrlsToFiles(imageUrls: LemonImageUrl[]): Promise<LemonFileImage[]> {
        // TODO: refactor lemon-core
        // const customOptions = { header: {...}, responseType: 'blob' };
        // LemonActions.lemonCore.setLemonOptions({ ...Settings.LEMON_OPTIONS, extraOptions: { ...customOptions } });
        // return LemonActions.lemonCore.request('GET', imageUrl, '')
        //     .then(response => ({ id, file: new File([response], name) }))
        //     .catch(() => ({ id, file: new File([], name) }));

        return Promise.all(imageUrls.map(async ({ id, url, textData }) => {
            const name = url.split('/') ? url.split('/').pop() : 'null';
            const config: AxiosRequestConfig = {
                headers: {
                    'Accept': 'image/*',
                    'Content-Type': 'image/jpeg',
                },
                responseType: 'blob',
            };
            return axios.get(url, config)
                .then(response => {
                    // return ({ id, file: new File([response.data], name), textData });
                    const file = blobToFile(response.data, name);
                    return ({ id, file, textData })
                })
                .catch(() => ({ id, file: null, textData }));
        }));
    }

    private static getImageDataFromLemonFiles(files: LemonFileImage[]): ImageData[] {
        return files
            .filter(({ file }) => !!file)
            .map(({ file, id, textData }) => ImageDataUtil.createImageDataFromFileData(file, id, textData));
    }

    private static resetLemonOptions() {
        LemonActions.lemonCore.setLemonOptions(Settings.LEMON_OPTIONS);
    }

}
