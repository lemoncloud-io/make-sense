import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {store} from "../../index";
import {updateActiveImageIndex, updateActiveLabelId} from "../../store/labels/actionCreators";
import {ViewPortActions} from "./ViewPortActions";
import {EditorModel} from "../../staticModels/EditorModel";
import {LemonActions} from './LemonActions';

export class ImageActions {
    public static getPreviousImage(): void {
        const currentImageIndex: number = LabelsSelector.getActiveImageIndex();
        ImageActions.getImageByIndex(currentImageIndex - 1);
    }

    public static getNextImage(): void {
        const currentImageIndex: number = LabelsSelector.getActiveImageIndex();
        ImageActions.getImageByIndex(currentImageIndex + 1);
    }

    public static getImageByIndex(index: number): void {
        if (EditorModel.viewPortActionsDisabled) return;

        const imageCount: number = LabelsSelector.getImagesData().length;

        if (index < 0 || index > imageCount - 1) {
            return;
        } else {
            LemonActions.saveUpdatedImagesData().then();
            ViewPortActions.setZoom(1);
            store.dispatch(updateActiveImageIndex(index));
            store.dispatch(updateActiveLabelId(null));
        }
    }

}
