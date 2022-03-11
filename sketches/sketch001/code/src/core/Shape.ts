// Import library code
import Two from "two.js";
// Import local code
import * as UTIL from "./Utilities";


class LineGrid {
    nLines: number;
    nPoints: number;
    lineWidth: number;
    scaleNoise: number;
    orientation: string;
    rng: UTIL.RandomNumberGenerator;

    constructor(
        nLines: number,
        nPoints: number,
        lineWidth: number,
        scaleNoise: number,
        randomSeed: number,
        orientation: string,
    ) {
        this.nLines = nLines;
        this.nPoints = nPoints;
        this.lineWidth = lineWidth;
        this.scaleNoise = scaleNoise;
        this.rng = new UTIL.RandomNumberGenerator(randomSeed);
        this.orientation = orientation;
    }

    // Generate a set of horizontal lines that is to be drawn on a canvas element
    private _getHorizontalLines(increment: number, widthIncrement: number, heightIncrement: number): Array<Array<Array<number>>> {
        let lineArray= new Array<Array<Array<number>>>(this.nLines + 1);
        for (let lineIndex = 0; lineIndex < lineArray.length; lineIndex++) {
            let pointArray= new Array<Array<number>>(2 * this.nPoints + 2);
            for (let pointIndex = 0; pointIndex < pointArray.length; pointIndex++) {
                if (pointIndex % 2 == 0) {
                    pointArray[pointIndex] = new Array<number>(
                        pointIndex * widthIncrement,
                        (lineIndex + 0) * heightIncrement,
                    );
                } else {
                    pointArray[pointIndex] = new Array<number>(
                        pointIndex * widthIncrement,
                        (lineIndex + 0) * heightIncrement + this.scaleNoise * Math.sin(
                            pointIndex * increment + this.rng.randomNormal()
                        ),
                    );
                }
            }
            lineArray[lineIndex] = pointArray;
        }
        return lineArray;
    }

    // Generate a set of vertical lines that is to be drawn on a canvas element
    private _getVerticalLines(increment: number, widthIncrement: number, heightIncrement: number): Array<Array<Array<number>>> {
        let lineArray= new Array<Array<Array<number>>>(this.nLines + 1);
        for (let lineIndex = 0; lineIndex < lineArray.length; lineIndex++) {
            let pointArray= new Array<Array<number>>(2 * this.nPoints + 2);
            for (let pointIndex = 0; pointIndex < pointArray.length; pointIndex++) {
                if (pointIndex % 2 == 0) {
                    pointArray[pointIndex] = new Array<number>(
                        (lineIndex + 0) * widthIncrement,
                        pointIndex * heightIncrement,
                    );
                } else {
                    pointArray[pointIndex] = new Array<number>(
                        (lineIndex + 0) * widthIncrement + this.scaleNoise * Math.sin(
                            pointIndex * increment + this.rng.randomNormal()
                        ),
                        pointIndex * heightIncrement,
                    );
                }
            }
            lineArray[lineIndex] = pointArray;
        }
        return lineArray
    }

    public getLines(canvasWidth: number, canvasHeight: number): Array<Array<Array<number>>> {
        let increment: number = 2 * this.nPoints / 360.0
        let widthIncrement: number;
        let heightIncrement: number;
        if (this.orientation == "vertical") {
            widthIncrement = canvasWidth / (this.nLines);
            heightIncrement = canvasHeight / (2 * this.nPoints);
            return this._getVerticalLines(increment, widthIncrement, heightIncrement);
        } else if (this.orientation == "horizontal") {
            widthIncrement = canvasWidth / (2 * this.nPoints);
            heightIncrement = canvasHeight / (this.nLines);
            return this._getHorizontalLines(increment, widthIncrement, heightIncrement);
        } else if (this.orientation == "both") {
            // Get vertival lines
            widthIncrement = canvasWidth / (this.nLines);
            heightIncrement = canvasHeight / (2 * this.nPoints + 1);
            let lineArray0 = this._getVerticalLines(
                increment,
                widthIncrement,
                heightIncrement
            );
            // Get horizontal lines
            widthIncrement = canvasWidth / (2 * this.nPoints + 1);
            heightIncrement = canvasHeight / (this.nLines);
            let lineArray1 = this._getHorizontalLines(
                increment,
                widthIncrement,
                heightIncrement
            );
            // Concatenate the two arrays containing vertical
            // and horizontal arrays
            return lineArray0.concat(lineArray1);
        } else {
            throw new Error(`Orientation ${this.orientation} does not exist`);
        }
    }
}

export class Shape {

    // Variables: Pertaining to the scene where the main shape is rendered and shown
    scene: Two;

    // Variables: Pertaining to the main shape which is rendered and shown on the canvas
    lineGridParameters: UTIL.LineGridParameters;

    padding: number;

    // Class constructor
    constructor(parentScene: Two, gridLineParameters: UTIL.LineGridParameters, padding: number) {
        this.lineGridParameters = gridLineParameters;
        this.scene = parentScene;
        this.padding = padding;
    }

    // Min-max scaling. Rescale a coordinate pair into a certain range.
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
    private _draw(gridLines: LineGrid): void {
        let lines: Array<Array<Array<number>>> = gridLines.getLines(
            this.scene.width,
            this.scene.height,
        );
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
            path.linewidth = this.lineGridParameters.lineWidth * UTIL.PX;
            path.scale = 1.0;
            path.closed = false;
            path.fill = "none";
            this.scene.update();
        }
    }

    // Main drawing method
    public draw(): void {
        let curve = new LineGrid(
            this.lineGridParameters.nLines,
            this.lineGridParameters.nPoints,
            this.lineGridParameters.lineWidth,
            this.lineGridParameters.scaleNoise,
            this.lineGridParameters.randomSeed,
            this.lineGridParameters.orientation,
        );
        this._draw(curve);
    }
}
