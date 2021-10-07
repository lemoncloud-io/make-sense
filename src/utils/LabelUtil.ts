import {LabelEllipse, LabelName, LabelPolygon, LabelRect} from "../store/labels/types";
import uuidv1 from 'uuid/v1';
import {find} from "lodash";
import {IRect} from "../interfaces/IRect";
import {LabelStatus} from "../data/enums/LabelStatus";
import {IPoint} from "../interfaces/IPoint";
import {IEllipse} from "../interfaces/IEllipse";

export class LabelUtil {
    public static createLabelName(name: string): LabelName {
        return {
            id: uuidv1(),
            name: name
        }
    }

    public static createLabelRect(labelId: string, rect: IRect): LabelRect {
        return {
            id: uuidv1(),
            labelId: labelId,
            rect,
            isCreatedByAI: false,
            status: LabelStatus.ACCEPTED,
            suggestedLabel: null
        }
    }

    public static createLabelEllipse(labelId: string, ellipse: IEllipse): LabelEllipse {
        return {
            id: uuidv1(),
            labelId: labelId,
            ellipse,
            isCreatedByAI: false,
            status: LabelStatus.ACCEPTED,
            suggestedLabel: null
        }
    }

    public static createLabelPolygon(labelId: string, vertices: IPoint[]): LabelPolygon {
        return {
            id: uuidv1(),
            labelId: labelId,
            vertices: vertices
        }
    }

    public static convertLabelNamesListToMap(labelNames: LabelName[]): any {
        return labelNames.reduce((map: any, labelNameRecord: LabelName) => {
            const isEditable = labelNameRecord.hasOwnProperty('isEditable') ? labelNameRecord.isEditable : true;
            map[labelNameRecord.id] = { name: labelNameRecord.name, isEditable };
            return map;
        }, {})
    }

    public static convertMapToLabelNamesList(object: any): LabelName[] {
        const labelNamesList: LabelName[] = [];
        Object.keys(object).forEach((key) => {
            if (!!object[key]) {
                const isEditable = object[key].hasOwnProperty('isEditable') ? object[key].isEditable : true;
                labelNamesList.push({
                    id: key,
                    name: object[key].name,
                    isEditable
                })
            }
        });
        return labelNamesList;
    }

    public static labelNamesIdsDiff(oldLabelNames: LabelName[], newLabelNames: LabelName[]): string[] {
        return oldLabelNames.reduce((missingIds: string[], labelName: LabelName) => {
            if (!find(newLabelNames, { 'id': labelName.id })) {
                missingIds.push(labelName.id);
            }
            return missingIds
        }, [])
    }
}
