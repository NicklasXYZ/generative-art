// Import local code
import View from "./core/View";

class App {

    private view: View;
    constructor() {

        const canvasBox = <HTMLCanvasElement>document.getElementById("canvas");
        this.view = new View(canvasBox);

        window.addEventListener("resize", this.resize);
    }

    resize = (): void => {
        this.view.onWindowResize(window.innerWidth, window.innerHeight);
    }
}

const app = new App();
