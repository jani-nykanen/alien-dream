

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
import { State } from "./core/input.js";


export class Game {


    constructor() {

        // Otherwise Closure compiler might
        // throw errors...
        this.cam = null;
        this.stage = null;
        this.hud = null;
        this.objm = null;

        this.paused = false;
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


    // Stage swap
    nextStage(ev) {

        let oldX = this.objm.player.pos.x;

        this.stage.switchNext(ev.assets);
        this.objm.reset(true);
        this.stage.parseObjects(this.objm);

        this.cam.pos.x -= oldX - this.objm.player.pos.x;
        this.cam.getTopCorner();
        this.cam.restrict(this.stage);
        this.objm.initialCameraCheck(this.cam);
    }


    // Activate the scene
    activate(param, ev) {

        this.stage = new Stage(ev.assets, 5);
        this.hud = new HUD();
        this.objm = new ObjectManager();
        this.stage.parseObjects(this.objm);

        this.initCamera();
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;

        let s = ev.input.actions.start.state;
        if (s == State.Pressed) {

            this.paused = !this.paused;
            ev.audio.playSample(ev.audio.samples.pause, 0.40);
        }
        if (this.paused) return;

        this.objm.update(this.stage, this.cam, this.hud, 
            (ev) => this.nextStage(ev),
            ev);
        this.hud.update(ev);
        this.stage.update(ev);

        if (this.objm.isPlayerDead()) {

            ev.tr.activate(true, TransitionType.Fade,
                2.0, (ev) => this.reset(), 3);
        }
    }


    // Draw pause screen
    drawPauseScreen(c) {

        c.setColor(0, 0, 0, 123.0/255.0);
        c.fillRect(0, 0, c.width, c.height);

        c.drawText(c.bitmaps.font, "PAUSED", 
            c.width/2, c.height/2-4, 0, 0, true);
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

        // Draw pause screen
        if (this.paused) {

            this.drawPauseScreen(c);
        }
    }


    // Dispose
    dispose() {

        // ...
    }
}
