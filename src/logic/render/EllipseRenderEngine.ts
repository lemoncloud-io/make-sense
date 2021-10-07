import {IPoint} from "../../interfaces/IPoint";
import {IRect} from "../../interfaces/IRect";
import {RectUtil} from "../../utils/RectUtil";
import {DrawUtil} from "../../utils/DrawUtil";
import {store} from "../..";
import {ImageData, LabelEllipse} from "../../store/labels/types";
import {
    updateActiveLabelId,
    updateFirstLabelCreatedFlag,
    updateHighlightedLabelId,
    updateImageDataById
} from "../../store/labels/actionCreators";
import {PointUtil} from "../../utils/PointUtil";
import {RectAnchor} from "../../data/RectAnchor";
import {RenderEngineConfig} from "../../settings/RenderEngineConfig";
import {updateCustomCursorStyle} from "../../store/general/actionCreators";
import {CustomCursorStyle} from "../../data/enums/CustomCursorStyle";
import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {EditorData} from "../../data/EditorData";
import {BaseRenderEngine} from "./BaseRenderEngine";
import {RenderEngineUtil} from "../../utils/RenderEngineUtil";
import {LabelType} from "../../data/enums/LabelType";
import {EditorActions} from "../actions/EditorActions";
import {GeneralSelector} from "../../store/selectors/GeneralSelector";
import {LabelStatus} from "../../data/enums/LabelStatus";
import {LabelUtil} from "../../utils/LabelUtil";
import {IEllipse} from "../../interfaces/IEllipse";
import {EllipseAnchor} from "../../data/EllipseAnchor";
import {EllipseUtil} from "../../utils/EllipseUtil";

export class EllipseRenderEngine extends BaseRenderEngine {
    private config: RenderEngineConfig = new RenderEngineConfig();

    // =================================================================================================================
    // STATE
    // =================================================================================================================

    private startCreateEllipsePoint: IPoint;
    private startResizeEllipseAnchor: RectAnchor;

    public constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.labelType = LabelType.ELLIPSE;
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    public mouseDownHandler = (data: EditorData) => {
        const isMouseOverImage: boolean = RenderEngineUtil.isMouseOverImage(data);
        const isMouseOverCanvas: boolean = RenderEngineUtil.isMouseOverCanvas(data);

        if (!isMouseOverCanvas) {
            return;
        }

        const ellipseUnderMouse: LabelEllipse = this.getEllipseUnderMouse(data);
        if (!!ellipseUnderMouse) {
            const ellipse: IEllipse = this.calculateEllipseRelativeToActiveImage(ellipseUnderMouse.ellipse, data);
            const anchorUnderMouse: EllipseAnchor = this.getAnchorUnderMouseByEllipse(ellipse, data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            if (!!anchorUnderMouse && ellipseUnderMouse.status === LabelStatus.ACCEPTED) {
                store.dispatch(updateActiveLabelId(ellipseUnderMouse.id));
                this.startRectResize(anchorUnderMouse);
            } else {
                if (!!LabelsSelector.getHighlightedLabelId()) {
                    store.dispatch(updateActiveLabelId(LabelsSelector.getHighlightedLabelId()));
                } else {
                    this.startEllipseCreation(data.mousePositionOnViewPortContent);
                }
            }
        } else if (isMouseOverImage) {
            this.startEllipseCreation(data.mousePositionOnViewPortContent);
        }
    };

    public mouseUpHandler = (data: EditorData) => {
        if (!!data.viewPortContentImageRect) {
            const mousePositionSnapped: IPoint = EllipseUtil.snapPointToEllipse(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const activeLabelEllipse: LabelEllipse = LabelsSelector.getActiveEllipseLabel();

            if (!!this.startCreateEllipsePoint && !PointUtil.equals(this.startCreateEllipsePoint, mousePositionSnapped)) {
                const minX: number = Math.min(this.startCreateEllipsePoint.x, mousePositionSnapped.x);
                const minY: number = Math.min(this.startCreateEllipsePoint.y, mousePositionSnapped.y);
                const maxX: number = Math.max(this.startCreateEllipsePoint.x, mousePositionSnapped.x);
                const maxY: number = Math.max(this.startCreateEllipsePoint.y, mousePositionSnapped.y);

                const ellipse = {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
                this.addEllipseLabel(RenderEngineUtil.transferRectFromImageToViewPortContent(ellipse, data));
            }

            if (!!this.startResizeEllipseAnchor && !!activeLabelEllipse) {
                const ellipse: IEllipse = this.calculateEllipseRelativeToActiveImage(activeLabelEllipse.ellipse, data);
                const startAnchorPosition: IPoint = PointUtil.add(this.startResizeEllipseAnchor.position, data.viewPortContentImageRect);
                const delta: IPoint = PointUtil.subtract(mousePositionSnapped, startAnchorPosition);
                const resizeEllipse: IEllipse = EllipseUtil.resizeEllipse(ellipse, this.startResizeEllipseAnchor.type, delta);
                const scale: number = RenderEngineUtil.calculateImageScale(data);
                const scaledEllipse: IEllipse = EllipseUtil.scaleEllipse(resizeEllipse, scale);

                const imageData = LabelsSelector.getActiveImageData();
                imageData.labelEllipses = imageData.labelEllipses.map((labelEllipse: LabelEllipse) => {
                    if (labelEllipse.id === activeLabelEllipse.id) {
                        return {
                            ...labelEllipse,
                            ellipse: scaledEllipse
                        };
                    }
                    return labelEllipse;
                });
                store.dispatch(updateImageDataById(imageData.id, imageData));
            }
        }
        this.endRectTransformation();
    };

    public mouseMoveHandler = (data: EditorData) => {
        if (!!data.viewPortContentImageRect && !!data.mousePositionOnViewPortContent) {
            const isOverImage: boolean = RenderEngineUtil.isMouseOverImage(data);
            if (isOverImage && !this.startResizeEllipseAnchor) {
                const labelEllipse: LabelEllipse = this.getEllipseUnderMouse(data);
                if (!!labelEllipse && !this.isInProgress()) {
                    if (LabelsSelector.getHighlightedLabelId() !== labelEllipse.id) {
                        store.dispatch(updateHighlightedLabelId(labelEllipse.id))
                    }
                } else {
                    if (LabelsSelector.getHighlightedLabelId() !== null) {
                        store.dispatch(updateHighlightedLabelId(null))
                    }
                }
            }
        }
    };

    // =================================================================================================================
    // RENDERING
    // =================================================================================================================

    public render(data: EditorData) {
        const activeLabelId: string = LabelsSelector.getActiveLabelId();
        const imageData: ImageData = LabelsSelector.getActiveImageData();

        if (imageData) {
            imageData.labelEllipses.forEach((labelEllipse: LabelEllipse) => {
                const displayAsActive: boolean =
                    labelEllipse.status === LabelStatus.ACCEPTED && labelEllipse.id === activeLabelId;
                displayAsActive ? this.drawActiveEllipse(labelEllipse, data) : this.drawInactiveEllipse(labelEllipse, data);
            });
            this.drawCurrentlyCreatedEllipse(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            this.updateCursorStyle(data);
        }
    }

    private drawCurrentlyCreatedEllipse(mousePosition: IPoint, imageRect: IRect) {
        if (!!this.startCreateEllipsePoint) {
            const imageEllipse: IEllipse = imageRect; // TODO: refactor
            const mousePositionSnapped: IPoint = EllipseUtil.snapPointToEllipse(mousePosition, imageEllipse);
            const activeEllipse: IEllipse = {
                x: this.startCreateEllipsePoint.x,
                y: this.startCreateEllipsePoint.y,
                width: mousePositionSnapped.x - this.startCreateEllipsePoint.x,
                height: mousePositionSnapped.y - this.startCreateEllipsePoint.y
            };
            const activeEllipseBetweenPixels = RenderEngineUtil.setEllipseBetweenPixels(activeEllipse);
            DrawUtil.drawEllipse(this.canvas, activeEllipseBetweenPixels, this.config.lineActiveColor, this.config.lineThickness);
        }
    }

    private drawInactiveEllipse(labelEllipse: LabelEllipse, data: EditorData) {
        const ellipseOnImage: IEllipse = RenderEngineUtil.transferEllipseFromViewPortContentToImage(labelEllipse.ellipse, data);
        const highlightedLabelId: string = LabelsSelector.getHighlightedLabelId();
        const displayAsActive: boolean = labelEllipse.status === LabelStatus.ACCEPTED && labelEllipse.id === highlightedLabelId;
        this.renderEllipse(ellipseOnImage, displayAsActive);
    }

    private drawActiveEllipse(labelEllipse: LabelEllipse, data: EditorData) {
        let ellipse: IEllipse = this.calculateEllipseRelativeToActiveImage(labelEllipse.ellipse, data);
        if (!!this.startResizeEllipseAnchor) {
            const startAnchorPosition: IPoint = PointUtil.add(this.startResizeEllipseAnchor.position, data.viewPortContentImageRect);
            const endAnchorPositionSnapped: IPoint = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const delta = PointUtil.subtract(endAnchorPositionSnapped, startAnchorPosition);
            ellipse = EllipseUtil.resizeEllipse(ellipse, this.startResizeEllipseAnchor.type, delta);
        }
        const ellipseOnImage: IEllipse = EllipseUtil.translate(ellipse, data.viewPortContentImageRect);
        this.renderEllipse(ellipseOnImage, true);
    }

    private renderEllipse(ellipseOnImage: IEllipse, isActive: boolean) {
        const ellipseBetweenPixels = RenderEngineUtil.setEllipseBetweenPixels(ellipseOnImage);
        const lineColor: string = isActive ? this.config.lineActiveColor : this.config.lineInactiveColor;
        DrawUtil.drawEllipse(this.canvas, ellipseBetweenPixels, lineColor, this.config.lineThickness);
        if (isActive) {
            const handleCenters: IPoint[] = EllipseUtil.mapEllipseToAnchors(ellipseOnImage).map((ellipseAnchor: EllipseAnchor) => ellipseAnchor.position);
            handleCenters.forEach((center: IPoint) => {
                const handleEllipse: IEllipse = EllipseUtil.getEllipseWithCenterAndSize(center, this.config.anchorSize);
                const handleEllipseBetweenPixels: IEllipse = RenderEngineUtil.setEllipseBetweenPixels(handleEllipse);
                DrawUtil.drawEllipseWithFill(this.canvas, handleEllipseBetweenPixels, this.config.activeAnchorColor);
            })
        }
    }

    private updateCursorStyle(data: EditorData) {
        if (!!this.canvas && !!data.mousePositionOnViewPortContent && !GeneralSelector.getImageDragModeStatus()) {
            const ellipseUnderMouse: LabelEllipse = this.getEllipseUnderMouse(data);
            const ellipseAnchorUnderMouse: EllipseAnchor = this.getAnchorUnderMouse(data);
            if ((!!ellipseAnchorUnderMouse && ellipseUnderMouse && ellipseUnderMouse.status === LabelStatus.ACCEPTED) || !!this.startResizeEllipseAnchor) {
                store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                return;
            }
            else if (RenderEngineUtil.isMouseOverCanvas(data)) {
                if (!RenderEngineUtil.isMouseOverImage(data) && !!this.startCreateEllipsePoint)
                    store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                else
                    RenderEngineUtil.wrapDefaultCursorStyleInCancel(data);
                this.canvas.style.cursor = "none";
            } else {
                this.canvas.style.cursor = "default";
            }
        }
    }

    // =================================================================================================================
    // HELPERS
    // =================================================================================================================

    public isInProgress(): boolean {
        return !!this.startCreateEllipsePoint || !!this.startResizeEllipseAnchor;
    }

    private calculateEllipseRelativeToActiveImage(ellipse: IEllipse, data: EditorData):IEllipse {
        const scale: number = RenderEngineUtil.calculateImageScale(data);
        return EllipseUtil.scaleEllipse(ellipse, 1/scale);
    }

    private addEllipseLabel = (ellipse: IEllipse) => {
        const activeLabelId = LabelsSelector.getActiveLabelNameId();
        const imageData: ImageData = LabelsSelector.getActiveImageData();
        const labelEllipse: LabelEllipse = LabelUtil.createLabelEllipse(activeLabelId, ellipse);
        imageData.labelEllipses.push(labelEllipse);
        store.dispatch(updateImageDataById(imageData.id, imageData));
        store.dispatch(updateFirstLabelCreatedFlag(true));
        store.dispatch(updateActiveLabelId(labelEllipse.id));
    };

    private getEllipseUnderMouse(data: EditorData): LabelEllipse {
        const activeEllipseLabel: LabelEllipse = LabelsSelector.getActiveEllipseLabel();
        if (!!activeEllipseLabel && this.isMouseOverEllipseEdges(activeEllipseLabel.ellipse, data)) {
            return activeEllipseLabel;
        }

        const labelEllipses: LabelEllipse[] = LabelsSelector.getActiveImageData().labelEllipses;
        for (let i = 0; i < labelEllipses.length; i++) {
            if (this.isMouseOverEllipseEdges(labelEllipses[i].ellipse, data)) {
                return labelEllipses[i];
            }
        }
        return null;
    }

    private isMouseOverEllipseEdges(ellipse: IEllipse, data: EditorData): boolean {
        const ellipseOnImage: IEllipse = EllipseUtil.translate(
            this.calculateEllipseRelativeToActiveImage(ellipse, data), data.viewPortContentImageRect);

        const outerEllipseDelta: IPoint = {
            x: this.config.anchorHoverSize.width / 2,
            y: this.config.anchorHoverSize.height / 2
        };
        const outerEllipse: IEllipse = EllipseUtil.expand(ellipseOnImage, outerEllipseDelta);

        const innerEllipseDelta: IPoint = {
            x: - this.config.anchorHoverSize.width / 2,
            y: - this.config.anchorHoverSize.height / 2
        };
        const innerEllipse: IEllipse = EllipseUtil.expand(ellipseOnImage, innerEllipseDelta);

        return (EllipseUtil.isPointInside(outerEllipse, data.mousePositionOnViewPortContent) &&
            !EllipseUtil.isPointInside(innerEllipse, data.mousePositionOnViewPortContent));
    }

    private getAnchorUnderMouseByEllipse(ellipse: IEllipse, mousePosition: IPoint, imageRect: IRect): RectAnchor {
        const ellipseAnchors: EllipseAnchor[] = EllipseUtil.mapEllipseToAnchors(ellipse);
        for (let i = 0; i < ellipseAnchors.length; i++) {
            const anchorEllipse: IEllipse = EllipseUtil
                .translate(EllipseUtil.getEllipseWithCenterAndSize(ellipseAnchors[i].position, this.config.anchorHoverSize), imageRect);
            if (!!mousePosition && EllipseUtil.isPointInside(anchorEllipse, mousePosition)) {
                return ellipseAnchors[i];
            }
        }
        return null;
    }

    private getAnchorUnderMouse(data: EditorData): EllipseAnchor {
        const labelEllipses: LabelEllipse[] = LabelsSelector.getActiveImageData().labelEllipses;
        for (let i = 0; i < labelEllipses.length; i++) {
            const ellipse: IEllipse = this.calculateEllipseRelativeToActiveImage(labelEllipses[i].ellipse, data);
            const ellipseAnchor = this.getAnchorUnderMouseByEllipse(ellipse, data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            if (!!ellipseAnchor) return ellipseAnchor;
        }
        return null;
    }

    private startEllipseCreation(mousePosition: IPoint) {
        this.startCreateEllipsePoint = mousePosition;
        store.dispatch(updateActiveLabelId(null));
        EditorActions.setViewPortActionsDisabledStatus(true);
    }

    private startRectResize(activatedAnchor: RectAnchor) {
        this.startResizeEllipseAnchor = activatedAnchor;
        EditorActions.setViewPortActionsDisabledStatus(true);
    }

    private endRectTransformation() {
        this.startCreateEllipsePoint = null;
        this.startResizeEllipseAnchor = null;
        EditorActions.setViewPortActionsDisabledStatus(false);
    }
}
