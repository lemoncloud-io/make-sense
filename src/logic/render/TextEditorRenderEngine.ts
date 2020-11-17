import {BaseRenderEngine} from "./BaseRenderEngine";
import {EditorData} from "../../data/EditorData";
import {DrawUtil} from "../../utils/DrawUtil";
import {ImageData} from '../../store/labels/types';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {IPoint} from '../../interfaces/IPoint';
import {Settings} from '../../settings/Settings';

const paddingX = 10;
const paddingY = 20;

export class TextEditorRenderEngine extends BaseRenderEngine {

    private defaultTitlePoint: IPoint;
    private defaultContentPoint: IPoint;

    public constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    public mouseMoveHandler(data: EditorData): void {}
    public mouseDownHandler(data: EditorData): void {}
    public mouseUpHandler(data: EditorData): void {}

    // =================================================================================================================
    // RENDERING
    // =================================================================================================================

    public render(data: EditorData): void {
        this.setDefaultTitlePoint(data);
        this.drawText();
    }

    private setDefaultTitlePoint(data: EditorData) {
        if (!data.defaultRenderImageRect || !data.defaultRenderImageRect.x || !data.defaultRenderImageRect.y) {
            this.defaultTitlePoint = { x: paddingX, y: paddingY };
            return;
        }
        const { defaultRenderImageRect } = data;
        const { x, y } = defaultRenderImageRect;
        this.defaultTitlePoint = { x: x + paddingX, y: y + paddingY };
    }

    private drawText() {
        const imageData: ImageData = LabelsSelector.getActiveImageData();
        if (imageData.textData) {
            this.drawTitleText(imageData.textData.title);
            this.drawContentText(imageData.textData.content);
        }
    }

    private drawTitleText(title: string = '') {
        const { x, y } = this.defaultTitlePoint;
        // for multi-line text
        title.split('\n').forEach((text, i) => {
            const point = { x: x, y: y + (paddingY * i + 1) };
            DrawUtil.drawText(this.canvas, text, 16, point, Settings.TEXT_COLOR, true, 'left');
            this.defaultContentPoint = point;
        });
    }

    private drawContentText(content: string = '') {
        const { x, y } = this.defaultContentPoint;
        content.split('\n').forEach((text, i) => {
            const point = { x: x, y: y + (paddingY + paddingY * i + 1) };
            DrawUtil.drawText(this.canvas, text, 16, point, Settings.TEXT_COLOR, false, 'left');
        });
    }

    isInProgress(): boolean {
        return false;
    }
}
