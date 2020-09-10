import { store } from "../../index";
import { LabelsSelector } from '../../store/selectors/LabelsSelector';

export class LemonActions {

    public static saveUpdatedImagesData() {
        const imageIndex: number = LabelsSelector.getActiveImageIndex();
        return new Promise(resolve => {
            console.log('TODO: request updated', LabelsSelector.getImageDataByIndex(imageIndex));
            resolve(true);
        })
    }

}
