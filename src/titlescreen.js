
/**
 * Title screen
 * 
 * (c) 2020 Jani Nykänen
 */

import { TransitionType } from "./core/transition.js";
import { State } from "./core/input.js";
import { Game } from "./game.js";


export class TitleScreen {


    constructor() {

       this.timer = 1.0;
       this.flickerTimer = 0.0;
    }


    // Activate
    activate(param, ev) {

        this.timer = 1.0;
        this.flickerTimer = 0.0;
    }


    // Update
    update(ev) {

        const TIME_SPEED = 1.0 / 60.0;;
        const FLICKER_TIME = 60;

        if (ev.tr.active) return;

        if (this.flickerTimer > 0) {

            this.flickerTimer -= ev.step;
            if (this.flickerTimer <= 0.0) {

                ev.tr.activate(true, TransitionType.CircleOutside,
                    2.0, (ev) => {
                        ev.changeScene(Game)
                    });
            }
            return;
        }
    
        this.timer = (this.timer += TIME_SPEED) % 1.0;

        if (ev.input.actions.start.state == State.Pressed ||
            ev.input.actions.fire1.state == State.Pressed) {

            this.flickerTimer = FLICKER_TIME;
            ev.audio.playSample(ev.audio.samples.start, 0.50);
        }
    }


    // Draw
    draw(c) {

        let b = c.bitmaps.logo;

        c.clear(0, 132, 173);
    
        c.drawBitmap(b, c.width/2-b.width/2, 24);

        if ((this.flickerTimer <= 0.0 && this.timer < 0.5) ||
            (this.flickerTimer > 0.0 &&
            Math.floor(this.flickerTimer/4) % 2 == 0)) {

            c.drawText(c.bitmaps.font,
                "PRESS ENTER", 
                c.width/2, 108, 0, 0, true);
        }

        c.drawText(c.bitmaps.font,
            "©2020 Jani Nykänen", 
            c.width/2, 135, 0, 0, true);
    }

}
