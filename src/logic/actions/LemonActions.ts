import {store} from "../../index";
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {
    ImageData,
    LabelEllipse,
    LabelLine,
    LabelName,
    LabelPoint,
    LabelPolygon,
    LabelRect
} from '../../store/labels/types';
import {AuthService} from '@lemoncloud/lemon-front-lib';
import {
    updateActiveImageIndex,
    updateImageData,
    updateImageDataById,
    updateLabelNames,
} from '../../store/labels/actionCreators';
import {updateActivePopupType, updateProjectData} from '../../store/general/actionCreators';
import {ImageDataUtil} from '../../utils/ImageDataUtil';
import {setProjectInfo, setTaskCurrentPage, setTaskState, setTaskTotalPage, setTaskLimit} from '../../store/lemon/actionCreators';
import {Settings} from '../../settings/Settings';
import {LemonSelector} from '../../store/selectors/LemonSelector';
import _, {cloneDeep, isEqual} from 'lodash';
import axios, {AxiosRequestConfig} from 'axios';
import {fromPromise} from 'rxjs/internal-compatibility';
import {delay, map, mergeMap} from 'rxjs/operators';
import {ImageActions} from './ImageActions';
import uuidv1 from 'uuid/v1';
import {LabelStatus} from '../../data/enums/LabelStatus';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {TaskState} from "../../store/lemon/types";
import {PopupWindowType} from "../../data/enums/PopupWindowType";
import {GetProjectImagesResult, ImageBody, ImageView, ProjectView,
    LabelPoint as LemonLabelPoint,
    LabelName as LemonLabelName,
    LabelRect as LemonLabelRect,
    LabelLine as LemonLabelLine,
} from "@lemoncloud/ade-backend-api";
import {ProjectCategory} from "../../data/enums/ProjectType";
import {from, Observable, of} from "rxjs";
import {ILine} from "../../interfaces/ILine";
import {IPoint} from "../../interfaces/IPoint";

// TODO: modify types
export interface TextTagInfo {
    title?: string;
    content: string;
}

type Task = any;

interface LemonImageUrl extends ImageView {
    id: string;
    url: string;
    width?: number;
    height?: number;
    textData?: TextTagInfo;
}

export interface LemonFileImage {
    id: string;
    file?: File;
    textData?: TextTagInfo;
    imageView?: ImageView;
}

interface MakeSenseAnnotation {
    labelLines: LabelLine[];
    labelPoints: LabelPoint[];
    labelRects: LabelRect[];
    labelEllipses: LabelEllipse[];
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
        const ellipses = annotations.filter(annotation => !!annotation.ellipse);
        const tags = annotations.filter(annotation => {
            return !!annotation.label
                && !annotation.rect
                && !annotation.point
                && !annotation.vertices
                && !annotation.rect
                && !annotation.ellipse;
        });

        // set label info from server
        const labelLines = lines.map(({ label, line }) => ({ id: uuidv1(), labelId: label.id, line }));
        const labelPoints = points.map(({ label, point }) => ({ id: uuidv1(), labelId: label.id, point, isCreatedByAI: false, status: LabelStatus.ACCEPTED, suggestedLabel: null }));
        const labelRects = rects.map(({ label, rect }) => ({ id: uuidv1(), labelId: label.id, rect, isCreatedByAI:false, status: LabelStatus.ACCEPTED, suggestedLabel: null }));
        const labelEllipses = ellipses.map(({ label, ellipse }) => ({ id: uuidv1(), labelId: label.id, ellipse, isCreatedByAI:false, status: LabelStatus.ACCEPTED, suggestedLabel: null }));
        const labelPolygons = vertices.map(({ label, vertices }) => ({ id: uuidv1(), labelId: label.id, vertices }));
        const labelNameIds = tags.map(({ label }) => label.id);
        return { labelLines, labelPoints, labelRects, labelPolygons, labelNameIds, labelEllipses };
    }

    public static getLabelsFromImageView(imageView: ImageView): MakeSenseAnnotation {
        const labelNameIds = !imageView.names ? [] : imageView.names.map(name => name.labelId);
        const labelLines = !imageView.lines ? [] : imageView.lines.map(line => {
            return {
                id: uuidv1(),
                labelId: line.labelId,
                line: {
                    start: { x: line.left, y: line.top },
                    end: { x: line.right, y: line.bottom }
                }
            }
        });
        const labelPoints = !imageView.points ? [] : imageView.points.map(lemonPoint => {
            return {
                id: uuidv1(),
                labelId: lemonPoint.labelId,
                point: { x: lemonPoint.left, y: lemonPoint.top },
                isCreatedByAI: false,
                status: LabelStatus.ACCEPTED,
                suggestedLabel: null,
            }
        });
        const labelRects = !imageView.rects ? [] : imageView.rects.map(lemonRect => {
            return {
                id: uuidv1(),
                labelId: lemonRect.labelId,
                rect: {
                    x: lemonRect.left,
                    y: lemonRect.top,
                    height: lemonRect.height,
                    width: lemonRect.width
                },
                isCreatedByAI: false,
                status: LabelStatus.ACCEPTED,
                suggestedLabel: null,
            }
        });

        return {
            labelPolygons: [],
            labelEllipses: [],
            labelNameIds,
            labelLines,
            labelPoints,
            labelRects,
        };
    }

    // @ts-ignore
    public static async setupProject(projectId: string): Promise<ProjectView> {
        try {
            const projectView = await LemonActions.getProjectData(projectId);
            const category = projectView.useName ? ProjectCategory.RECOGNITION : ProjectCategory.IMAGE_TAG;
            store.dispatch(setProjectInfo(projectId, category, projectView));
            store.dispatch(updateProjectData({name: projectView.name, type: null}));

            const labels = projectView.label$ as LabelName[];
            store.dispatch(updateLabelNames(labels));

            return projectView;
        } catch (e) {
            alert(`${e}`);
            window.history.back();
        }
    }

    public static async setupOneImage(imageId: string = '') {
        try {
            store.dispatch(setTaskTotalPage(0));
            store.dispatch(updateActiveImageIndex(0)); // select initial image!

            const project: ProjectView = LemonSelector.getProjectView();
            const imageView = await LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/images/${imageId}`);
            const url: LemonImageUrl = {
                id: imageId,
                url: `${project.baseUrl}${imageView.key}`,
                ...imageView,
            };

            const files = await LemonActions.convertUrlsToFiles([url]);
            const images = LemonActions.getImageDataFromLemonFiles(files);
            store.dispatch(updateImageData(images));
            store.dispatch(setTaskTotalPage(1));
            // set active image index
            store.dispatch(updateActiveImageIndex(0)); // select initial image!
            store.dispatch(setTaskCurrentPage(0));
            store.dispatch(setTaskLimit(10));
            LemonActions.resetLemonOptions();

            return {
                projectId: LemonSelector.getProjectId(),
                name: GeneralSelector.getProjectName(),
                category: LemonSelector.getProjectCategory()
            };
        } catch (e) {
            alert(`${e}`);
            return {projectId: null, name: null, category: null};
        }
    }

    public static async setupImagesByProject(project: ProjectView) {
        try {
            store.dispatch(setTaskTotalPage(0));
            store.dispatch(updateActiveImageIndex(0)); // select initial image!

            const { list, total, page , limit } = await LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/projects/${project.id}/images`, { detail: 1 }) as GetProjectImagesResult;

            // set images
            let urls: LemonImageUrl[] = list.map((imageView: ImageView) => {
                return {
                    id: imageView.id,
                    url: `${project.baseUrl}${imageView.key}`,
                    ...imageView,
                }
            });

            const files = await LemonActions.convertUrlsToFiles(urls);
            const images = LemonActions.getImageDataFromLemonFiles(files);
            store.dispatch(updateImageData(images));

            // set total page
            let totalPage = Math.ceil(Math.max(total || 0, 1) / Math.max(limit || 10, 1));
            store.dispatch(setTaskTotalPage(totalPage));

            // set active image index
            store.dispatch(updateActiveImageIndex(0)); // select initial image!
            store.dispatch(setTaskCurrentPage(0));
            store.dispatch(setTaskLimit(limit || 10));
            LemonActions.resetLemonOptions();

            return {
                projectId: LemonSelector.getProjectId(),
                name: GeneralSelector.getProjectName(),
                category: LemonSelector.getProjectCategory()
            };
        } catch (e) {
            alert(`${e}`);
            return {projectId: null, name: null, category: null};
        }
    }

    public static async initTaskData(projectId: string, limit: number) {
        try {
            // load images
            const {list, total} = await LemonActions.getTaskList(projectId, limit);
            if (total === 0) {
                store.dispatch(updateActivePopupType(PopupWindowType.NO_TASKS_POPUP));
            }
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
            return {projectId: null, name: null, category: null};
        }
    }

    private static async getImagesByTaskList(tasks: Task[]) {
        const urls = setTaskUrls(tasks);
        const files = await LemonActions.convertUrlsToFiles(urls);
        return LemonActions.getImageDataFromLemonFiles(files);
    }

    public static async saveUpdatedImagesData(index: number) {
        const originLabels = LemonSelector.getOriginLabels();
        const targetLabels = LabelsSelector.getImageDataByIndex(index);
        if (isEqual(originLabels, targetLabels)) {
            return Promise.resolve();
        }

        const {
            id,
            fileData,
            labelLines,
            labelPoints,
            labelRects,
            labelNameIds,
            labelPolygons,
            labelEllipses,
        } = targetLabels;
        const { width, height } = await this.getImageDimensions(fileData);

        // TODO: refactor below
        // const filteredLabelPolygons = labelPolygons.filter(polygon => !!polygon.labelId);
        // const filteredLabelEllipses = labelEllipses.filter(ellipse => !!ellipse.labelId);

        const filteredLabelIds = labelNameIds.filter(labelId => !!labelId);
        const filteredLabelPoints = labelPoints.filter(point => !!point.labelId);
        const filteredLabelRects = labelRects.filter(rect => !!rect.labelId);
        const filteredLabelLines = labelLines.filter(line => !!line.labelId);

        const names: LemonLabelName[] = filteredLabelIds.map(labelId => ({ labelId })); // 이미지 레코그니션
        const points: LemonLabelPoint[] = filteredLabelPoints.map(({ labelId, point }) => ({ labelId, top: point.y, left: point.x }));
        const rects: LemonLabelRect[] = filteredLabelRects.map(({ labelId, rect }) => ({ labelId, top: rect.y, left: rect.x, height: rect.height, width: rect.width }));
        const lines: LemonLabelLine[] = filteredLabelLines.map(({ labelId, line }) => {
            const { start, end } = line;
            return {
                labelId,
                left: start.x,
                top: start.y,
                right: end.x,
                bottom: end.y,
            }
        });

        const imageBody: ImageBody = {
            width,
            height,
            names,
            points,
            rects,
            lines,
        };
        return LemonActions.lemonCore.request(
            'PUT',
            Settings.LEMONADE_API,
            `/images/${id}`,
            null,
            { ...imageBody }
        );
    }

    public static async getImageDimensions(file: File): Promise<{ width: number, height: number }> {
        let img = new Image();
        img.src = URL.createObjectURL(file);
        await img.decode();
        return {
            width: img.width,
            height: img.height,
        }
    }

    public static async pageChanged(page: number) {
        const currentIndex = LabelsSelector.getActiveImageIndex();
        await LemonActions.saveUpdatedImagesData(currentIndex);
        return await this.resetTasks(page);
    }

    public static async updateTaskState(state: TaskState) {
        store.dispatch(setTaskState(state));
        return await this.resetTasks();
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

    public static async resetTasks(page: number = 0): Promise<number> {
        const projectId = LemonSelector.getProjectId();
        const project: ProjectView = LemonSelector.getProjectView();
        const limit = LemonSelector.getTaskLimit();
        const { list, total } = await LemonActions.lemonCore.request(
            'GET',
            Settings.LEMONADE_API,
            `/projects/${projectId}/images`,
            { detail: 1, page, limit }
        ) as GetProjectImagesResult;

        // set total page
        const totalPage = Math.ceil(Math.max(total || 0, 1) / Math.max(limit, 1));
        store.dispatch(setTaskTotalPage(totalPage));
        // set active image index
        store.dispatch(updateActiveImageIndex(0)); // select initial image!

        // set images
        const urls: LemonImageUrl[] = list.map((imageView: ImageView) => {
            return {
                id: imageView.id,
                url: `${project.baseUrl}${imageView.key}`,
                ...imageView,
            }
        });
        const files = await LemonActions.convertUrlsToFiles(urls);
        const images = LemonActions.getImageDataFromLemonFiles(files);
        store.dispatch(updateImageData(images));

        // get first image info
        if (images.length > 0) {
            const firstImage = images[0];
            const detailImage: ImageView = await LemonActions.getDetailImageData(firstImage);
            const labels = LemonActions.getLabelsFromImageView(detailImage);
            store.dispatch(updateImageDataById(firstImage.id, {...firstImage, ...labels}));
        }

        store.dispatch(setTaskCurrentPage(page));
        ImageActions.setOriginLabelByIndex(0);
        return total;
    }

    public static getTaskByImageData(image: ImageData) {
        const {id} = image;
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks/${id}`);
    }

    public static getDetailImageData(image: ImageData): Promise<ImageView> {
        if (!!image.imageView) {
            const result = cloneDeep(image.imageView);
            return new Promise(resolve => setTimeout(() => resolve(result), 100));
        }
        const {id} = image;
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/images/${id}`);
    }

    public static getDetailImageData$(image: ImageData): Observable<ImageView> {
        return fromPromise(this.getDetailImageData(image));
        // const {id} = image;
        // return fromPromise(LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/images/${id}`));
    }

    public static getProjectData(id: string): Promise<ProjectView> {
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/projects/${id}`, {});
    }

    public static getLabelData(projectId: string) {
        const param = {projectId};
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/labels/`, param);
    }

    public static isAuthenticated() {
        return LemonActions.lemonCore.isAuthenticated();
    }

    public static getCredentials() {
        return LemonActions.lemonCore.getCredentials();
    }

    public static fetchTasks(projectId: string, limit: number = 5, page: number = 0, view: string = 'workspace') {
        let param = {limit, projectId, page, view};
        const state = LemonSelector.getTaskState();
        if (state === 'all') {
            return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks`, param);
        }
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks`, {...param, state});
    }

    public static assignTasks(projectId: string, limit: number = 5) {
        const param = {limit, projectId};
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks/0/assign`, param);
    }

    private static async convertUrlsToFiles(imageUrls: LemonImageUrl[]): Promise<LemonFileImage[]> {
        return Promise.all(imageUrls.map(async (imageView) => {
            const { url, id } = imageView;
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
                    const file = blobToFile(response.data, name);
                    return ({ id, file, imageView });
                })
                .catch(() => ({id, file: null, imageView: null }));
        }));
    }

    private static getImageDataFromLemonFiles(files: LemonFileImage[]): ImageData[] {
        return files
            .filter(({file}) => !!file)
            .map(({ file, id, imageView }) => ImageDataUtil.createImageDataFromFileData(file, id, imageView));
    }

    private static resetLemonOptions() {
        LemonActions.lemonCore.setLemonOptions(Settings.LEMON_OPTIONS);
    }

    private static async assignAndFetchTask(projectId: string, limit: number, page: number = 0): Promise<{ list: Task[], total: number }> {
        const { assignedTo, tasks } = await LemonActions.assignTasks(projectId, limit);
        console.log('Assigned to ', assignedTo, tasks);
        return await LemonActions.fetchTasks(projectId, limit, page);
    }

    private static async getTaskList(projectId: string, limit: number, page: number = 0): Promise<{ list: Task[], total: number }> {
        const { total: assignedTaskTotal } = await LemonActions.getMyAssignedTasks(projectId);
        const shouldAssign = assignedTaskTotal <= 0;
        if (shouldAssign) {
            console.log('should assign');
            return await LemonActions.assignAndFetchTask(projectId, limit, page);
        }
        return await LemonActions.fetchTasks(projectId, limit, page);
    }

    private static getMyAssignedProject() {
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/projects`, { state: 'my_assigned', limit: 20 });
    }

    private static getMyAssignedTasks(projectId: string) {
        const param = { limit: 0, projectId, view: 'workspace', state: 'open' };
        return LemonActions.lemonCore.request('GET', Settings.LEMONADE_API, `/tasks`, param);
    }
}
