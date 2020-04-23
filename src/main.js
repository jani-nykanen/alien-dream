import { Runner } from "./core/runner.js"
import { Game } from "./game.js";
import { AudioIntro } from "./audiointro.js";

/**
 * (c) 2020 Jani Nykänen
 */


window.onload = () => {

    const CANVAS_WIDTH = 160;
    const CANVAS_HEIGHT = 144;

    (new Runner({
            canvasWidth: CANVAS_WIDTH, 
            canvasHeight: CANVAS_HEIGHT,
            frameRate: 60
        }))
        .loadAssets("assets/assets.json")
        .addInputActions(
            {name : "fire1", key : "KeyZ", button1 : 0},
            {name : "fire2", key : "KeyX", button1 : 1, button2: 2},
            {name : "start", key : "Enter", button1 : 9, button2 : 7},
        )
        .run(AudioIntro);
}

