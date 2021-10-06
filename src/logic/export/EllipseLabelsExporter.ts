import {LabelFormatType} from "../../data/enums/LabelFormatType";
import {ImageData, LabelEllipse, LabelName, LabelRect} from "../../store/labels/types";
import {ImageRepository} from "../imageRepository/ImageRepository";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {XMLSanitizerUtil} from "../../utils/XMLSanitizerUtil";
import {ExporterUtil} from "../../utils/ExporterUtil";
import {GeneralSelector} from "../../store/selectors/GeneralSelector";
import {findIndex, findLast} from "lodash";

export class EllipseLabelsExporter {
    public static export(exportFormatType: LabelFormatType): void {
        switch (exportFormatType) {
            case LabelFormatType.CSV:
                EllipseLabelsExporter.exportAsCSV();
                break;
            default:
                return;
        }
    }

    private static exportAsCSV(): void {
        const content: string = LabelsSelector.getImagesData()
            .map((imageData: ImageData) => {
                return EllipseLabelsExporter.wrapEllipseLabelsIntoCSV(imageData)})
            .filter((imageLabelData: string) => {
                return !!imageLabelData})
            .join("\n");
        const fileName: string = `${ExporterUtil.getExportFileName()}.csv`;
        ExporterUtil.saveAs(content, fileName);
    }

    private static wrapEllipseLabelsIntoCSV(imageData: ImageData): string {
        if (imageData.labelRects.length === 0 || !imageData.loadStatus)
            return null;

        const image: HTMLImageElement = ImageRepository.getById(imageData.id);
        const labelNames: LabelName[] = LabelsSelector.getLabelNames();
        const labelEllipsesString: string[] = imageData.labelEllipses.map((labelEllipse: LabelEllipse) => {
            const labelName: LabelName = findLast(labelNames, {id: labelEllipse.labelId});
            const labelFields = !!labelName ? [
                labelName.name,
                Math.round(labelEllipse.ellipse.x).toString(),
                Math.round(labelEllipse.ellipse.y).toString(),
                Math.round(labelEllipse.ellipse.width).toString(),
                Math.round(labelEllipse.ellipse.height).toString(),
                imageData.fileData.name,
                image.width.toString(),
                image.height.toString()
            ] : [];
            return labelFields.join(",")
        });
        return labelEllipsesString.join("\n");
    }
}
