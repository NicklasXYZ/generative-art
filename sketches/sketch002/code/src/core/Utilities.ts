// Import library code
import * as DAT from "dat.gui";


// Define a constant for converting mm to pixels
export const PX: number = 3.7795275591

// Random number generator utility class
export class RandomNumberGenerator {
    private static readonly a = 16807;
    private static readonly m = 2147483647;
    private static readonly q = 127773;
    private static readonly r = 2836;

    constructor(private _seed: number) {
        if (this._seed <= 0 || this._seed === Number.MAX_VALUE) {
            throw new Error("Seed out of range.");
        }
    }
    public nextDouble(): number {
        const hi = this._seed / RandomNumberGenerator.q;
        const lo = this._seed % RandomNumberGenerator.q;
        this._seed = (RandomNumberGenerator.a * lo) - (RandomNumberGenerator.r * hi);
        if (this._seed <= 0) {
            this._seed = this._seed + RandomNumberGenerator.m;
        }
        return (this._seed * 1.0) / RandomNumberGenerator.m;
    }

    public randomNormal(): number {
        let u: number = 0.0;
        let v: number = 0.0;
        while(u === 0) u = this.nextDouble();
        while(v === 0) v = this.nextDouble();
        return Math.sqrt(
            -2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v
        );
    }
    public nextInt(min: number, max: number): number {
        const range = Math.round(max) - Math.round(min);
        return min + Math.round(range * this.nextDouble());
    }
}


//// Define interfaces for organizing the different
//// categories of options and settings

// GUI controller and parameter settings for adjusting
// the size of the canvas
export interface CanvasSize {
    // CanvasSize GUI controller
    gui_canvasSize: DAT.GUIController | undefined;
    // Canvas width in pixels
    width: number;
    // Canvas max width in pixels
    width_max: number;
    // Canvas min width in pixels
    width_min: number;
    // Canvas width step size in pixels
    width_step: number;

    // Canvas height in pixels
    height: number;
    // Canvas max height in pixels
    height_max: number;
    // Canvas min height in pixels
    height_min: number;
    // Adjustment step size of the Canvas height in pixels

    height_step: number;


    // Paper size A0, A1, A2, A3,... that should be used
    // to determine the canvas width and height
    paperSize: number;

    gui_rows: DAT.GUIController | undefined;
    // The number of rows the paper should be divided
    // into
    rows: number;

    gui_cols: DAT.GUIController | undefined;
    // The number of columns the paper should be divided
    // into
    cols: number;

    gui_widthMargin: DAT.GUIController | undefined;
    // The combined width margin (left + right) of the
    // paper in pixels
    widthMargin: number;

    gui_heightMargin: DAT.GUIController | undefined;
    // The combined height margin (top + bottom) of the
    // paper in pixels
    heightMargin: number;

    gui_padding: DAT.GUIController | undefined;
    // The space to fill, in pixels, between drawn
    // content and the edge of the canvas
    padding: number;
    // Canvas max padding in pixels
    padding_max: number;
    // Canvas min padding in pixels
    padding_min: number;
    // Adjustment step size of the Canvas padding in pixels
    padding_step: number;
}


// Define different standardized paper sizes
export const paperSizes: Record<number, Record<string, number>>  = {
    // Paper size (in mm): A2
    2: {
        width: 420.0,
        height: 594.0,
    },
    // Paper size (in mm): A3
    3: {
        width: 297.0,
        height: 420.0,
    },
    // Paper size (in mm): A4
    4: {
        width: 210.0,
        height: 297.0,
    },
    // Paper size (in mm): A5
    5: {
        width: 148.0,
        height: 210.0,
    },
}


// Define a function to initialize and set properties
// of a "CanvasSize" object
export function initialzeCanvasSize(): CanvasSize {
    let canvasSize = {
        "gui_canvasSize": undefined,
        "paperSize": 4,

        "widthMargin": 30,
        "cols": 2,
        // A4 paper width - margin in pixels.
        // * 30 is a width buffer to make the plot fit in
        // a row together with other plots seperated by a gap
        // * 2 is the number of columns
        "width": (paperSizes[4]["width"] - 30) / 2 * PX,
        "width_max": 10000,
        "width_min": 100,
        "width_step": 1,

        "rows": 3,
        "heightMargin": 50,
        // A4 paper height - margin in pixels
        // * 50 is a height buffer to make the plot fit in
        // a column together with other plots seperated by a gap
        // * 3 is the number of rows
        "height": (paperSizes[4]["height"] - 50) / 3 * PX,
        "height_max": 10000,
        "height_min": 100,
        "height_step": 1,

        "padding": 0,
        "padding_max": 1000,
        "padding_min": 0,
        "padding_step": 1,
    };
    return canvasSize as CanvasSize;
}


// Define interfaces related to the different parameters and
// settings associated with a "LineGrid" object
export interface ShapeParameters {

    // Linewidth GUI controller
    gui_lineWidth: DAT.GUIController;
    // Max linewidth in pixels
    lineWidth_max: number;
    // Min linewidth in pixels
    lineWidth_min: number;
    // Adjustment step size of the linewidth in pixels
    lineWidth_step: number;
    // The currently set linewidth to draw with
    lineWidth: number;

    gui_radiusOne: DAT.GUIController;
    radiusOne_max: number;
    radiusOne_min: number;
    radiusOne_step: number;
    radiusOne: number;

    gui_radiusTwo: DAT.GUIController;
    radiusTwo_max: number;
    radiusTwo_min: number;
    radiusTwo_step: number;
    radiusTwo: number;

    gui_distance: DAT.GUIController;
    distance_max: number;
    distance_min: number;
    distance_step: number;
    distance: number;

    gui_segmentMultiplier: DAT.GUIController;
    segmentMultiplier_max: number;
    segmentMultiplier_min: number;
    segmentMultiplier_step: number;
    segmentMultiplier: number;

    // nPoints GUI controller
    gui_nPoints: DAT.GUIController;
    // Max possible number of points that can be plotted
    // in a line on the canvas
    nPoints_max: number;
    // Min possible number of points that can be plotted
    // in a line on the canvas
    nPoints_min: number;
    // Point number adjustment step size
    nPoints_step: number;
    // The currently set number points to draw each line with
    nPoints: number;

    gui_shapeType: DAT.GUIController;
    shapeType: number;
}

// Define a function to initialize and set properties
// of a "Shape" object
export function initialzeShapeParameters(): ShapeParameters {
    let shapeParameters = {
        "gui_lineWidth": undefined,
        "lineWidth_max": 1.00,
        "lineWidth_min":  0.005,
        "lineWidth_step": 0.001,
        "lineWidth": 0.20,

        "gui_radiusOne": undefined,
        "radiusOne_max": 10.00,
        "radiusOne_min":  0.001,
        "radiusOne_step":  0.001,
        "radiusOne": 0.001,

        "gui_radiusTwo": undefined,
        "radiusTwo_max": 10.00,
        "radiusTwo_min":  0.001,
        "radiusTwo_step": 0.001,
        "radiusTwo": 0.1,

        "gui_distance": undefined,
        "distance_max": 100.0,
        "distance_min":  0.001,
        "distance_step": 0.001,
        "distance": 0.001,

        "gui_segmentMultiplier": undefined,
        "segmentMultiplier_max": 1000.00,
        "segmentMultiplier_min":  1.00,
        "segmentMultiplier_step": 1.00,
        "segmentMultiplier": 100.00,

        "gui_nPoints": undefined,
        "nPoints_max": 500,
        "nPoints_min":  2,
        "nPoints_step":  1,
        "nPoints": 6,

        "gui_shapeType": undefined,
        "shapeType": 0,
    };
    return shapeParameters as ShapeParameters;
}
