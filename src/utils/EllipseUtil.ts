import {IEllipse} from "../interfaces/IEllipse";
import {IPoint} from "../interfaces/IPoint";
import {ISize} from "../interfaces/ISize";
import {NumberUtil} from "./NumberUtil";
import {Direction} from "../data/enums/Direction";
import {EllipseAnchor} from "../data/EllipseAnchor";

export class EllipseUtil {
    public static getRatio(ellipse: IEllipse): number {
        if (!ellipse) return null;

        return ellipse.width/ellipse.height
    }

    public static intersect(r1: IEllipse, r2: IEllipse) {
        if (!r1 || !r2) return null;
        return !(
            r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y
        );
    }

    public static isPointInside(ellipse: IEllipse, point: IPoint): boolean {
        if (!ellipse || !point) return null;
        return (
            ellipse.x < point.x &&
            ellipse.x + ellipse.width > point.x &&
            ellipse.y < point.y &&
            ellipse.y + ellipse.height > point.y
        )
    }

    public static getEllipseWithCenterAndSize(centerPoint: IPoint, size: ISize): IEllipse {
        return {
            x: centerPoint.x - 0.5 * size.width,
            y: centerPoint.y - 0.5 * size.height,
            ...size
        }
    }

    public static fitInsideEllipseWithRatio(containerEllipse: IEllipse, ratio: number): IEllipse {
        const containerEllipseRatio = EllipseUtil.getRatio(containerEllipse);
        if (containerEllipseRatio < ratio) {
            const innerEllipseHeight = containerEllipse.width / ratio;
            return {
                x: containerEllipse.x,
                y: containerEllipse.y + (containerEllipse.height - innerEllipseHeight) / 2,
                width: containerEllipse.width,
                height: innerEllipseHeight
            }
        }
        else {
            const innerEllipseWidth = containerEllipse.height * ratio;
            return {
                x: containerEllipse.x + (containerEllipse.width - innerEllipseWidth) / 2,
                y: containerEllipse.y,
                width: innerEllipseWidth,
                height: containerEllipse.height
            }
        }
    }

    public static resizeEllipse(inputEllipse: IEllipse, ellipseAnchor: Direction, delta): IEllipse {
        const ellipse: IEllipse = {...inputEllipse};
        switch (ellipseAnchor) {
            case Direction.RIGHT:
                ellipse.width += delta.x;
                break;
            case Direction.BOTTOM_RIGHT:
                ellipse.width += delta.x;
                ellipse.height += delta.y;
                break;
            case Direction.BOTTOM:
                ellipse.height += delta.y;
                break;
            case Direction.TOP_RIGHT:
                ellipse.width += delta.x;
                ellipse.y += delta.y;
                ellipse.height -= delta.y;
                break;
            case Direction.TOP:
                ellipse.y += delta.y;
                ellipse.height -= delta.y;
                break;
            case Direction.TOP_LEFT:
                ellipse.x += delta.x;
                ellipse.width -= delta.x;
                ellipse.y += delta.y;
                ellipse.height -= delta.y;
                break;
            case Direction.LEFT:
                ellipse.x += delta.x;
                ellipse.width -= delta.x;
                break;
            case Direction.BOTTOM_LEFT:
                ellipse.x += delta.x;
                ellipse.width -= delta.x;
                ellipse.height += delta.y;
                break;
        }

        if (ellipse.width < 0)  {
            ellipse.x = ellipse.x + ellipse.width;
            ellipse.width = - ellipse.width;
        }

        if (ellipse.height < 0)  {
            ellipse.y = ellipse.y + ellipse.height;
            ellipse.height = - ellipse.height;
        }

        return ellipse;
    }

    public static translate(ellipse: IEllipse, delta: IPoint): IEllipse {
        return {
            ...ellipse,
            x: ellipse.x + delta.x,
            y: ellipse.y + delta.y
        }
    }

    public static expand(ellipse: IEllipse, delta: IPoint): IEllipse {
        return {
            x: ellipse.x - delta.x,
            y: ellipse.y - delta.y,
            width: ellipse.width + 2 * delta.x,
            height: ellipse.height + 2 * delta.y
        }
    }

    public static scaleEllipse(ellipse:IEllipse, scale: number): IEllipse {
        return {
            x: ellipse.x * scale,
            y: ellipse.y * scale,
            width: ellipse.width * scale,
            height: ellipse.height * scale
        }
    }

    public static mapEllipseToAnchors(ellipse: IEllipse): EllipseAnchor[] {
        return [
            {type: Direction.TOP_LEFT, position: {x: ellipse.x, y: ellipse.y}},
            {type: Direction.TOP, position: {x: ellipse.x + 0.5 * ellipse.width, y: ellipse.y}},
            {type: Direction.TOP_RIGHT, position: {x: ellipse.x + ellipse.width, y: ellipse.y}},
            {type: Direction.LEFT, position: {x: ellipse.x, y: ellipse.y + 0.5 * ellipse.height}},
            {type: Direction.RIGHT, position: {x: ellipse.x + ellipse.width, y: ellipse.y + 0.5 * ellipse.height}},
            {type: Direction.BOTTOM_LEFT, position: {x: ellipse.x, y: ellipse.y + ellipse.height}},
            {type: Direction.BOTTOM, position: {x: ellipse.x + 0.5 * ellipse.width, y: ellipse.y + ellipse.height}},
            {type: Direction.BOTTOM_RIGHT, position: {x: ellipse.x + ellipse.width, y: ellipse.y + ellipse.height}}
        ]
    }

    public static snapPointToEllipse(point: IPoint, ellipse: IEllipse): IPoint {
        if (EllipseUtil.isPointInside(ellipse, point))
            return point;

        return {
            x: NumberUtil.snapValueToRange(point.x, ellipse.x, ellipse.x + ellipse.width),
            y: NumberUtil.snapValueToRange(point.y, ellipse.y, ellipse.y + ellipse.height)
        }
    }
}
