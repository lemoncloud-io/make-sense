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
        this.splitTextAsMeasuredWidth(title).forEach((text, i) => {
            const point = { x: x, y: y + (paddingY * i + 1) };
            DrawUtil.drawText(this.canvas, text, 16, point, Settings.TEXT_COLOR, true, 'left');
            this.defaultContentPoint = point;
        })
    }

    private drawContentText(content: string = '') {
        const { x, y } = this.defaultContentPoint;
        this.splitTextAsMeasuredWidth(content).forEach((text, i) => {
            const point = { x: x, y: y + (paddingY + paddingY * i + 1) };
            DrawUtil.drawText(this.canvas, text, 16, point, Settings.TEXT_COLOR, false, 'left');
        });
    }

    private splitTextAsMeasuredWidth(text: string, fontSize: number = 16): string[] {
        const paddingX = 20;
        const canvasWidth = this.canvas.width - paddingX;
        const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
        ctx.font = `${fontSize}px Arial`;

        const halfSplitter = (str: string) => {
            let middle = Math.floor(str.length / 2);
            const before = str.lastIndexOf(' ', middle);
            const after = str.indexOf(' ', middle + 1);

            if (before === -1 || (after !== -1 && middle - before >= after - middle)) {
                middle = after;
            } else {
                middle = before;
            }

            const s1 = str.substr(0, middle);
            const s2 = str.substr(middle + 1);
            return [s1, s2];
        };

        const flatDeep = (arr: any, d: number = 1) => {
            return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), []) : arr.slice();
        };

        const splits = text.replace(/\.(?!\d)|([^\d])\.(?=\d)/g, '$1.|').split('|').map(str => {
            const measureWidth = ctx.measureText(str).width;
            const isLongText = measureWidth > canvasWidth;
            if (isLongText) {
                return halfSplitter(str);
            }
            return str;
        });

        return flatDeep(splits);
    }

    isInProgress(): boolean {
        return false;
    }
}
