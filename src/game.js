

/**
 * The game scene
 * 
 * (c) 2020 Jani Nykänen
 */

import { Camera } from "./camera.js";
import { Stage } from "./stage.js";
import { HUD } from "./hud.js";
import { ObjectManager } from "./objectmanager.js";
import { TransitionType } from "./core/transition.js";


export class Game {


    constructor() {

        // Otherwise Closure compiler might
        // throw errors...
        this.cam = null;
        this.stage = null;
        this.hud = null;
        this.objm = null;
    }


    // Initialize the camera
    initCamera() {

        this.cam = new Camera(this.objm.player, 
            160, 144, this.stage);
        this.objm.initialCameraCheck(this.cam);
    }


    // Reset
    reset() {

        this.objm.reset();
        this.stage.reset();
        this.hud.reset();
        this.stage.parseObjects(this.objm);

        this.initCamera();
    }


    // Activate the scene
    activate(param, ev) {

        this.stage = new Stage(ev.assets, 1);
        this.hud = new HUD();
        this.objm = new ObjectManager();
        this.stage.parseObjects(this.objm);

        this.initCamera();
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;

        this.objm.update(this.stage, this.cam, this.hud, ev);
        this.hud.update(ev);
        this.stage.update(ev);

        if (this.objm.isPlayerDead()) {

            ev.tr.activate(true, TransitionType.Fade,
                2.0, (ev) => this.reset());
        }
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
