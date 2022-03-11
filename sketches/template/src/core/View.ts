// Import library code
import * as DAT from "dat.gui";
import Two from "two.js";
// Import local code
import * as UTIL from "./Utilities";
import { Shape } from "./Shape";
// import Shape from "./Shape";

// Main class. This is the topmost class!
export default class View {
    // Variables: GUI controls
    gui: DAT.GUI;

    // Variables: GUI option folders
    f1: DAT.GUI; // Contains
    f2: DAT.GUI; // Contains
    f3: DAT.GUI; // Contains

    // Variable: Paper size
    canvasSize: UTIL.CanvasSize;

    // Main canvas elements
    two: Two;
    canvasElem: HTMLCanvasElement;

    // Variable: The main object that is renderered in on the canvas
    shape: Shape;

    // Variable: Shape parameters
    lineParameters: UTIL.LineParameters;

    // Re-usable random number generator
    rng: UTIL.RandomNumberGenerator;

    // Class constructor
    constructor(canvasElem: HTMLCanvasElement) {
        // Set default values for the canvas
        this.canvasElem = canvasElem;
        this.canvasSize = UTIL.initialzeCanvasSize();

        // Set a random seed
        this.rng = new UTIL.RandomNumberGenerator(123);

        // Setup canvas
        this.two = this.setupSketch();

        // Intialize essential parametervalues
        this.lineParameters = UTIL.initialzeLineParameters();

        // Setup: create a shape to add to the canvas
        this.shape = new Shape(
            this.two,
             this.lineParameters,
             this.canvasSize.padding,
            );

        // Setup: a GUI for the different options and shape parameter settings
        this.setupGUI();

        // Setup: the initial canvas size
        this.onWindowResize(
            window.innerWidth,
            window.innerHeight,
        );
    }

    public setupSketch(): Two {
        let two: Two = new Two({
            width: this.canvasSize.width,
            height: this.canvasSize.height,
            type: Two.Types.svg,
            domElement: this.canvasElem,
        });
        two.update();
        return two;
    };

    private _adjustCanvasSize(): void {
        // Adjust canvas width and height size
        this.canvasSize.width = (
            UTIL.paperSizes[this.canvasSize.paperSize]["width"] - this.canvasSize.widthMargin
            ) / this.canvasSize.cols * UTIL.PX;
        this.canvasSize.height = (
            UTIL.paperSizes[this.canvasSize.paperSize]["height"] - this.canvasSize.heightMargin
            ) / this.canvasSize.rows * UTIL.PX;
        // Redraw content
        this._redraw();
    }

    public setupGUI(): void {
        // Setup: new GUI object
        this.gui = new DAT.GUI();

        // Create folders for each group of settings and options
        this.f1 = this.gui.addFolder("Canvas Size");
        this.f2 = this.gui.addFolder("Shape parameters");
        this.f3 = this.gui.addFolder("Utils");

        // Folder f1: Paper and canvas size options
        let paperSizes: Record<number, number> = {}
        for (let key in UTIL.paperSizes) {
            paperSizes["A" + key] = key;
        }
        this.canvasSize.gui_canvasSize = this.f1.add(
            this.canvasSize, "paperSize",
            paperSizes,
        );
        // If the paper size is changed, then update the size of
        // the canvas as well
        this.canvasSize.gui_canvasSize.onChange( () => {this._adjustCanvasSize()});
        this.canvasSize.gui_rows = this.f1.add(
            this.canvasSize, "rows",
        );
        this.canvasSize.gui_rows.onChange( () => {this._adjustCanvasSize()});

        this.canvasSize.gui_cols = this.f1.add(
            this.canvasSize, "cols",
        );
        this.canvasSize.gui_cols.onChange( () => {this._adjustCanvasSize()});

        this.canvasSize.gui_widthMargin = this.f1.add(
            this.canvasSize, "widthMargin",
        );
        this.canvasSize.gui_widthMargin.onChange( () => {this._adjustCanvasSize()});

        this.canvasSize.gui_heightMargin = this.f1.add(
            this.canvasSize, "heightMargin",
        );
        this.canvasSize.gui_heightMargin.onChange( () => {this._adjustCanvasSize()});

        this.canvasSize.gui_padding = this.f1.add(
            this.canvasSize, "padding",
            this.canvasSize.padding_min,
            this.canvasSize.padding_max,
            this.canvasSize.padding_step,
        ).name("canvasPadding");
        this.canvasSize.gui_padding.onChange( () => {this._adjustCanvasSize()});

        // Folder f2: LineGrid parameters
        this.lineParameters.gui_randomSeed = this.f2.add(
            this.shape.lineParameters, "randomSeed",
        ).name("randomSeed (int)")
        this.lineParameters.gui_lineWidth = this.f2.add(
            this.shape.lineParameters, "lineWidth",
            this.lineParameters.lineWidth_min,
            this.lineParameters.lineWidth_max,
            this.lineParameters.lineWidth_step,
        ).name("lineWidth (mm)");

        // Folder f4: Utils
        // Randomize button
        var randomize = {
            randomize: () => this._randomize(),
        }
        this.gui.add(randomize, "randomize").name("Randomize");

        // Redraw button
        var redrawButton = {
            redraw: () => this._redraw(),
        }
        this.gui.add(redrawButton, "redraw").name("Redraw");

        // Export button
        var exportButton = {
            add: () => this._export(),
        };
        this.gui.add(exportButton, "add").name("Export SVG");
    }

    // Export the shape drawn on the canvas
    private _export(): void {
        let canvasBox: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
        let content: HTMLCanvasElement = canvasBox;
        content.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        let svgData: string = content.outerHTML;
        let preface: string = '<?xml version="1.0" standalone="no"?>\r\n';
        let svgBlob: Blob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
        let svgUrl: string = URL.createObjectURL(svgBlob);
        let downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    // Clear and redraw a shape on the canvas
    private _redraw(): void {
        console.log("Redrawing...");

        // Clear the current canvas
        this.two.clear();

        // Change the height and width of the canvas
        this.two.height = this.canvasSize.height
        this.two.width = this.canvasSize.width

        // Create a new shape to draw
        this.shape = new Shape(
            this.two,
            this.lineParameters,
            this.canvasSize.padding,
        );
        this.shape.draw();
    }

    // Randomize parameters
    private _randomize(): void {
        this.two.clear();
        this.setupSketch();

        // START: Randomize some parameters here
        //
        //
        // END  : Randomize some parameters here

        this.shape.draw();
    }

    onWindowResize(windowWidth: number, windowHeight: number): void {
        this.setupSketch();
        this.two.clear();
    }
}
