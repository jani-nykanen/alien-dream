

/**
 * The game scene
 * 
 * (c) 2020 Jani Nykänen
 */

import { Camera } from "./camera.js";
import { Stage } from "./stage.js";


export class Game {


    constructor() {

        this.cam = null;
        this.stage = null;
    }


    // Reset
    reset() {

    }


    // Activate the scene
    activate(param, ev) {

        this.cam = new Camera(0, 144, 160, 144);
        this.stage = new Stage(ev.assets, 1);
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;
    }


    // Draw
    draw(c) {

        c.clear(170);

        // this.cam.use(c);

        this.stage.draw(c, c.bitmaps.tilesetPresent, this.cam);

        c.moveTo();
    }


    // Dispose
    dispose() {

        // ...
    }
}
