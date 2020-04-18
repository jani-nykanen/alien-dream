

/**
 * The game scene
 * 
 * (c) 2020 Jani Nykänen
 */

import { Camera } from "./camera.js";
import { Stage } from "./stage.js";
import { HUD } from "./hud.js";
import { ObjectManager } from "./objectmanager.js";


export class Game {


    constructor() {

        // Otherwise Closure compiler might
        // throw errors...
        this.cam = null;
        this.stage = null;
        this.hud = null;
        this.objm = null;
    }


    // Reset
    reset() {

    }


    // Activate the scene
    activate(param, ev) {

        this.stage = new Stage(ev.assets, 1);
        this.cam = new Camera(0, this.stage.height*16-144, 160, 144);
        this.hud = new HUD();
        this.objm = new ObjectManager(this.stage);
        this.stage.parseObjects(this.objm);
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;

        this.objm.update(this.stage, this.cam, this.hud, ev);
        this.cam.restrict(this.stage);
        this.hud.update(ev);
    }


    // Draw
    draw(c) {

        c.clear(170);

        // Draw stage & background
        this.stage.draw(c, c.bitmaps.tilesetPresent, this.cam);

        // Draw the game objects
        this.cam.use(c);
        this.objm.draw(c);

        // Draw HUD
        c.moveTo();
        this.hud.draw(c);
    }


    // Dispose
    dispose() {

        // ...
    }
}
