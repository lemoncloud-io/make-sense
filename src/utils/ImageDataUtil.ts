import {ImageData} from "../store/labels/types";
import uuidv1 from "uuid/v1";
import {TextTagInfo} from '../logic/actions/LemonActions';

export class ImageDataUtil {
    public static createImageDataFromFileData(fileData: File, id: string = uuidv1(), textData: TextTagInfo = null): ImageData {
        return {
            id: id,
            fileData: fileData,
            loadStatus: false,
            labelRects: [],
            labelEllipses: [],
            labelPoints: [],
            labelLines: [],
            labelPolygons: [],
            labelNameIds: [],
            isVisitedByObjectDetector: false,
            isVisitedByPoseDetector: false,
            textData: textData
        }
    }

    public static cleanAnnotations(item: ImageData): ImageData {
        return {
            ...item,
            labelRects: [],
            labelEllipses: [],
            labelPoints: [],
            labelLines: [],
            labelPolygons: [],
            labelNameIds: [],
            textData: null
        }
    }
}
