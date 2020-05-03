

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
import { RGB, Vector2 } from "./core/vector.js";
import { Ending } from "./ending.js";
import { GameOver } from "./gameover.js";


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
    reset(ev) {

        if (this.hud.lives <= 0) {

            ev.changeScene(GameOver);
            return;
        }

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

        this.hud.addTime(100);
    }


    // Trigger the ending sequence
    triggerEnding(ev) {

        this.stage.missileTileShift();
        ev.tr.activate(true, TransitionType.Empty, 2.0,
            (ev) => {

                ev.tr.disable();
                ev.audio.playSample(ev.audio.samples.explosion, 0.80);

                ev.tr.activate(true, TransitionType.Fade,
                    1.0, (ev) => {

                        ev.tr.speed = 2.0;
                        ev.changeScene(Ending);
                    }, 6.2, new RGB(255, 255, 255));
        });
    }


    // Activate the scene
    activate(param, ev) {

        

        this.stage = new Stage(ev.assets, 1);
        this.hud = new HUD();
        this.objm = new ObjectManager();
        this.stage.parseObjects(this.objm);

        this.initCamera();

        ev.tr.activate(false, TransitionType.CircleOutside,
            1.0, null, this.objm.getRelativePlayerPosition(this.cam));
    }


    // Update
    update(ev) {

        if (ev.tr.active) {

            this.objm.updateCamOnly(this.cam, this.stage, ev);
            return;
        }

        let s = ev.input.actions.start.state;
        if (s == State.Pressed) {

            this.paused = !this.paused;
            ev.audio.playSample(ev.audio.samples.pause, 0.40);
        }
        if (this.paused) return;

        this.objm.update(this.stage, this.cam, this.hud, 
            (ev) => this.nextStage(ev),
            (ev) => this.triggerEnding(ev),
            ev);
        this.hud.update(ev);
        this.stage.update(ev);

        if (this.objm.isPlayerDead()) {

            ev.tr.activate(true, TransitionType.Fade,
                2.0, (ev) => this.reset(ev), 6.2);
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
