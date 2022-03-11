// Import library code
import Two from "two.js";
// Import local code
import * as UTIL from "./Utilities";

class Line {
    lineWidth: number;
    rng: UTIL.RandomNumberGenerator;

    constructor(
        lineWidth: number,
        randomSeed: number,
    ) {
        this.lineWidth = lineWidth;
        this.rng = new UTIL.RandomNumberGenerator(randomSeed);
    }

    public getLines(canvasWidth: number, canvasHeight: number): Array<Array<Array<number>>> {
        let pointArray= new Array<Array<number>>(2);
        pointArray[0] = new Array<number>(0, canvasHeight / 2)
        pointArray[2] = new Array<number>(canvasWidth, canvasHeight / 2)
        let lineArray= new Array<Array<Array<number>>>(1);
        lineArray[0] = pointArray;
        return lineArray;
    }
}

export class Shape {

    // Variables: Pertaining to the scene where the main shape is rendered and shown
    scene: Two;

    // Variables: Pertaining to the main shape which is rendered and shown on the canvas
    lineParameters: UTIL.LineParameters;

    padding: number;

    // Class constructor
    constructor(parentScene: Two, lineParameters: UTIL.LineParameters, padding: number) {
        this.lineParameters = lineParameters;
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
    private _draw(lines: Line): void {
        let datapoints: Array<Array<Array<number>>> = lines.getLines(
            this.scene.width,
            this.scene.height,
        );
        let arrX: Array<number> = this._minmax(datapoints, 0);
        let xMin = arrX[0];
        let xMax = arrX[1];

        let arrY: Array<number> = this._minmax(datapoints, 1);
        let yMin = arrY[0];
        let yMax = arrY[1];

        for (let lineIndex = 0; lineIndex < datapoints.length; lineIndex++) {
            for (let pointIndex = 0; pointIndex < datapoints[lineIndex].length; pointIndex++) {
                let p: Array<number> = datapoints[lineIndex][pointIndex];
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
                datapoints[lineIndex][pointIndex] = _p;
            }
        }

        // Flatten array of x, y coordinates
        for (let index = 0; index < datapoints.length; index++) {
            let result: Array<number> = datapoints[index].reduce(
                (
                    accumulator,
                    value
                ) => accumulator.concat(value),
                []
            );
            // Plot the complete path on the canvas
            let path = this.scene.makePath(...result);
            // Convert linewidth in mm to px (pixels)
            path.linewidth = this.lineParameters.lineWidth * UTIL.PX;
            path.scale = 1.0;
            path.closed = false;
            path.fill = "none";
            this.scene.update();
        }
    }

    // Main drawing method
    public draw(): void {
        let curve = new Line(
            this.lineParameters.lineWidth,
            this.lineParameters.randomSeed,
        );
        this._draw(curve);
    }
}
