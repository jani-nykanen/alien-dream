

/**
 * The game scene
 * 
 * (c) 2020 Jani Nykänen
 */

import { Camera } from "./camera.js";
import { Stage } from "./stage.js";
import { HUD } from "./hud.js";


export class Game {


    constructor() {

        this.cam = null;
        this.stage = null;
        this.hud = null;
    }


    // Reset
    reset() {

    }


    // Activate the scene
    activate(param, ev) {

        this.stage = new Stage(ev.assets, 1);
        this.cam = new Camera(0, this.stage.height*16-144, 160, 144);
        this.hud = new HUD();
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;
    }


    // Draw
    draw(c) {

        c.clear(170);

        this.cam.use(c);

        // Draw stage & background
        this.stage.draw(c, c.bitmaps.tilesetPresent, this.cam);

        // Draw the game objects
        // ...

        // Draw HUD
        c.moveTo();
        this.hud.draw(c);
    }


    // Dispose
    dispose() {

        // ...
    }
}
