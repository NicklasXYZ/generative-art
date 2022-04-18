// Import library code
import Two from "two.js";
// Import local code
import * as UTIL from "./Utilities";


class Line {
    lineWidth: number;
    rng: UTIL.RandomNumberGenerator;

    terrainSize: number; 
    randomness: number;
    surface: number;
    angle: number;

    constructor(
        terrainSize: number,
        randomness: number,
        surface: number,
        angle: number,
        lineWidth: number,
        randomSeed: number,
    ) {
        
        this.terrainSize = Number(terrainSize);
        this.randomness = Number(randomness);
        this.surface = Number(surface);
        this.angle = Number(angle);
        this.lineWidth = Number(lineWidth);
        this.rng = new UTIL.RandomNumberGenerator(randomSeed);
    }

    private _createTerrain() {
        let randomness = this.randomness;
        let terrain = [];
        for (let i = 0; i <= this.terrainSize; i++) {
            terrain[i] = new Float32Array(this.terrainSize + 1);
        }
        let nbits = this.terrainSize.toString(2).length - 1;
        let random = () => randomness * (-1 + 2 * this.rng.randomInt());
        let t = 1;
        let x = this.terrainSize / 2;
        for (let s = 1; s <= nbits; s++) {
            for (let v = 0; v <= this.terrainSize; v += 2 * x) {
                for (let n = 1; n <= t; n += 2) {
                    terrain[n * x][v] = ((terrain[(n - 1) * x][v] + terrain[(n + 1) * x][v]) / 2) + random();
                    terrain[v][n * x] = ((terrain[v][(n - 1) * x] + terrain[v][(n + 1) * x]) / 2) + random();
                }
            }
            for (let n = 1; n <= t; n += 2) {
                for (let m = 1; m <= t; m += 2) {
                    terrain[n * x][m * x] = (0.25 * (
                        terrain[n * x + x][m * x] + 
                        terrain[n * x - x][m * x] + 
                        terrain[n * x][m * x + x] + 
                        terrain[n * x][m * x - x])
                    ) + random();
                }
            }
            t = 2 * t + 1;
            x /= 2;
            randomness /= 2;
        }
        for (let w = 0; w <= this.terrainSize; w++) {
            for (let z = 0; z <= this.terrainSize; z++) {
                if (terrain[w][z] < 0) terrain[w][z] = 0;
            }
        }
        return terrain;
    }

    public getLines(canvasWidth: number, canvasHeight: number) {
        let r = this.angle / this.terrainSize;
        let terrain = this._createTerrain();
        let pen = false;
        let lastLine = [] 
        let line = []
        let dummyLine = new Float32Array(this.terrainSize + 1);
        for (let w = 0; w <= this.terrainSize; w++) {
            pen = false;
            for (let z = 0; z <= this.terrainSize; z++) {
                let xe = r * z;
                let ye = r * 0.66 * w + terrain[z][w] * 1;
                if (ye <= dummyLine[z] || (terrain[z][w] === 0 && w / this.surface !== ((w / this.surface) | 0))) {
                    if (pen === true) {
                        pen = false;
                        if (line.length > 0) {
                            lastLine.push(line.slice());
                            line = [];                        
                        }
                    }
                } else {
                    if (pen === false) {
                        pen = true;
                    }
                    line.push([-100 + xe, 100 - ye])
                    dummyLine[z] = ye;
                }
            }
            if (line.length > 0) {
                lastLine.push(line.slice());
                line = [];                        
            }
        }
        return lastLine;
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
        
        // Scale coordinates to fit the format
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
            this.lineParameters.terrainSize,
            this.lineParameters.randomness,
            this.lineParameters.surface,
            this.lineParameters.angle,
            this.lineParameters.lineWidth,
            this.lineParameters.randomSeed,
        );
        this._draw(curve);
    }
}
