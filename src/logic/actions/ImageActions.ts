import { store } from "../../index";

import { ViewPortActions } from "./ViewPortActions";
import { LemonActions } from './LemonActions';
import { LabelsSelector } from "../../store/selectors/LabelsSelector";
import { updateActiveImageIndex, updateActiveLabelId } from "../../store/labels/actionCreators";
import { setOriginLabels } from "../../store/lemon/actionCreators";
import { EditorModel } from "../../staticModels/EditorModel";

import { cloneDeep } from 'lodash';

export class ImageActions {
    public static getPreviousImage(): void {
        const currentImageIndex: number = LabelsSelector.getActiveImageIndex();
        ImageActions.getImageByIndex(currentImageIndex - 1);
    }

    public static getNextImage(): void {
        const currentImageIndex: number = LabelsSelector.getActiveImageIndex();
        ImageActions.getImageByIndex(currentImageIndex + 1);
    }

    public static getImageByIndex(index: number) {
        if (EditorModel.viewPortActionsDisabled) return;

        const imageCount: number = LabelsSelector.getImagesData().length;

        if (index < 0 || index > imageCount - 1) {
            return;
        } else {
            LemonActions.saveUpdatedImagesData().then(() => {
                ViewPortActions.setZoom(1);
                store.dispatch(updateActiveImageIndex(index));
                store.dispatch(updateActiveLabelId(null));
                this.getOriginLabelByIndex(index);
            });
        }
    }

    public static getOriginLabelByIndex(index: number, loadStatus = true): void {
        const originLabels = cloneDeep(LabelsSelector.getImageDataByIndex(index));
        store.dispatch(setOriginLabels({ ...originLabels, loadStatus })); // storing origin labels..
    }

}
