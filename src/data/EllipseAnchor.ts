import {IPoint} from "../interfaces/IPoint";
import {Direction} from "./enums/Direction";

export interface EllipseAnchor {
    type: Direction,
    position: IPoint
}
