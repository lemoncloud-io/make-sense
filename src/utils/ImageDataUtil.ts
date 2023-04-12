import {ImageData, LabelName, LabelRect} from "../store/labels/types";
import uuidv1 from "uuid/v1";
import {LemonFileImage, TextTagInfo} from '../logic/actions/LemonActions';
import {IRect} from "../interfaces/IRect";
import {LabelStatus} from "../data/enums/LabelStatus";
import {ImageView} from "@lemoncloud/ade-backend-api";

export class ImageDataUtil {
    public static createImageDataFromFileData(fileData: File, id: string = uuidv1(), imageView: ImageView = null): ImageData {
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
            imageView,
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
            textData: null,
            imageView: null,
        }
    }
}
