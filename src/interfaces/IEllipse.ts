export interface IEllipse {
    x:number,
    y:number,
    height:number,
    width:number
}

// refer: https://stackoverflow.com/a/2173084
export interface EllipseRenderPoints {
    ox: number; // control point offset horizontal
    oy: number; // control point offset vertical
    xe: number; // x-end
    ye: number; // y-end
    xm: number; // x-middle
    ym: number; // y-middle
}
