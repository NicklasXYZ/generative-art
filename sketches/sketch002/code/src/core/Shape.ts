// Import library code
import Two from "two.js";
// Import local code
import * as UTIL from "./Utilities";


// Abstract base class for generating different kinds of roulette curves
abstract class RouletteCurve {
    radiusOne: number;
    radiusTwo: number;
    distance: number;
    nPoints: number;
    multiplier: number;

    constructor(radiusOne: number, radiusTwo: number, distance: number, nPoints: number, multiplier: number) {
        this.radiusOne = radiusOne;
        this.radiusTwo = radiusTwo;
        this.distance = distance;
        this.nPoints = nPoints;
        this.multiplier = multiplier;
    }

    public abstract getPoint(t: number): Array<number>;

    public getPoints(n: number, multiplier: number): Array<Array<number>> {
        let array= new Array<Array<number>>(multiplier * n + 1);
        for (let index = 0; index < array.length; index++) {
            array[index] = this.getPoint(index / n);
        }
        return array;
    }

    public getLines(canvasWidth: number, canvasHeight: number): Array<Array<Array<number>>> {
        let pointArray= this.getPoints(this.nPoints, this.multiplier);
        let lineArray= new Array<Array<Array<number>>>(1);
        lineArray[0] = pointArray;
        return lineArray;
    }
}


// Roulette curve: Hypotrochoid
class Hypotrochoid extends RouletteCurve {
    radiusDifference: number;
    constructor(radiusOne: number, radiusTwo: number, distance: number, nPoints: number, multiplier: number) {
        super(radiusOne, radiusTwo, distance, nPoints, multiplier);
        this.radiusDifference = Math.abs(radiusOne - radiusTwo);
    }

    // Extend abstract base class
    public getPoint(t: number): Array<number> {
        // Main formulas for generating a hypotrochoid curve
        let angle : number = (Math.PI / 180.0) * t * 360.0;
        let tx : number = this.radiusDifference * Math.cos(angle) + this.distance * Math.cos(this.radiusDifference * angle / this.radiusTwo);
        let ty : number = this.radiusDifference * Math.sin(angle) - this.distance * Math.sin(this.radiusDifference * angle / this.radiusTwo);
        return new Array<number>( tx, ty);
    }
}

// Roulette curve: Epitrochoid
class Epitrochoid extends RouletteCurve {
    radiusSum: number;

    constructor(radiusOne: number, radiusTwo: number, distance: number, nPoints: number, multiplier: number) {
        super(radiusOne, radiusTwo, distance, nPoints, multiplier);
        this.radiusSum = radiusOne + radiusTwo;
    }

    // Extend abstract base class
    getPoint(t: number): Array<number> {
        // Main formulas for generating a epitrochoid curve
        let angle : number = (Math.PI / 180.0) * t * 360.0;
        let tx = this.radiusSum * Math.cos(angle) - this.distance * Math.cos(this.radiusSum * angle / this.radiusTwo);
        let ty = this.radiusSum * Math.sin(angle) - this.distance * Math.sin(this.radiusSum * angle / this.radiusTwo);
        return new Array<number>( tx, ty);
    }

}

export class Shape {

    // Variables: Pertaining to the scene where the main shape is rendered and shown
    scene: Two;

    // Variables: Pertaining to the main shape which is rendered and shown on the canvas
    shapeParameters: UTIL.ShapeParameters;

    padding: number;

    // Class constructor
    constructor(parentScene: Two, shapeParameters: UTIL.ShapeParameters, padding: number) {
        this.shapeParameters = shapeParameters;
        this.scene = parentScene;
        this.padding = padding;
    }

    // Min-max scaling. Rescale a coordinate pair into a certain range
    private _rescaleCoord(coord: number, minCoord: number, maxCoord: number, aCoord: number, bCoord: number): number {
        if (maxCoord - minCoord == 0){
            return 0;
        }
        else {
            return aCoord + (coord - minCoord) * (bCoord - aCoord) / (maxCoord - minCoord);
        }
    }

    // Determine the min/max range
    private _minmax(array: Array<Array<Array<number>>>, i: number): Array<number> {
        let points: Array<number> = [];
        for (let index = 0; index < array.length; index++) {
            let arr = array[index].map(
                item => item[i]
            )
            points = points.concat(arr);
        }
        let max: number = Math.max(...points);
        let min: number = Math.min(...points);
        return Array<number>(min, max);
    }

    // Normalize the generated x, y coordinate pairs of the plot
    // to make it fit perfectly onto the canvas
    private _draw(curve: RouletteCurve): void {
        let lines: Array<Array<Array<number>>> = curve.getLines(
            this.scene.width,
            this.scene.height,
        );
        console.log(lines)

        let arrX: Array<number> = this._minmax(lines, 0);
        let xMin = arrX[0];
        let xMax = arrX[1];

        let arrY: Array<number> = this._minmax(lines, 1);
        let yMin = arrY[0];
        let yMax = arrY[1];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            for (let pointIndex = 0; pointIndex < lines[lineIndex].length; pointIndex++) {
                let p: Array<number> = lines[lineIndex][pointIndex];
                let _p: Array<number> = new Array<number>(
                    this._rescaleCoord(
                        p[0],
                        xMin, xMax,
                        this.padding, this.scene.width - this.padding
                    ),
                    this._rescaleCoord(
                        p[1],
                        yMin, yMax,
                        this.padding, this.scene.height - this.padding
                    )
                )
                lines[lineIndex][pointIndex] = _p;
            }
        }

        // Flatten array of x, y coordinates
        for (let index = 0; index < lines.length; index++) {
            let result: Array<number> = lines[index].reduce(
                (
                    accumulator,
                    value
                ) => accumulator.concat(value),
                []
            );

            // Plot the complete path on the canvas
            let path = this.scene.makePath(...result);
            // Convert linewidth in mm to px (pixels)
            path.linewidth = this.shapeParameters.lineWidth * UTIL.PX;
            path.scale = 1.0;
            path.closed = false;
            path.fill = "none";
            this.scene.update();
        }
    }

    // Main drawing method
    public draw(): void {
        // Generate shape data
        console.log("Type: " + this.shapeParameters.shapeType);
        if (this.shapeParameters.shapeType == 0) {
            console.log("---> Drawing Hypotrochoid " + this.shapeParameters.shapeType);
            let curve = new Hypotrochoid(
                this.shapeParameters.radiusOne,
                this.shapeParameters.radiusTwo,
                this.shapeParameters.distance,
                this.shapeParameters.nPoints,
                this.shapeParameters.segmentMultiplier,
            );
            this._draw(curve);
        } else if (this.shapeParameters.shapeType == 1) {
            console.log("---> Drawing Epitrochoid " + this.shapeParameters.shapeType);
            let curve = new Epitrochoid(
                this.shapeParameters.radiusOne,
                this.shapeParameters.radiusTwo,
                this.shapeParameters.distance,
                this.shapeParameters.nPoints,
                this.shapeParameters.segmentMultiplier,
            );
            this._draw(curve)
        } else {
            console.log("---> No curve of type: " + this.shapeParameters.shapeType + "  exists!");
        }
    }
}
