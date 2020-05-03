
/**
 * "Created by" screen
 * 
 * (c) 2020 Jani Nykänen
 */

import { TransitionType } from "./core/transition.js";
import { TitleScreen } from "./titlescreen.js";


export class CreatedBy {


    constructor() {

       this.timer = 0;
    }


    // Activate
    activate(param, ev) {

        this.timer = 0;

        ev.tr.activate(false, TransitionType.Fade, 2.0);
    }


    // Update
    update(ev) {

        const WAIT_TIME = 180;

        if (ev.tr.active) return;
    
        if ((this.timer += ev.step) >= WAIT_TIME ||
            ev.input.anyPressed) {

            ev.tr.activate(true, TransitionType.Fade,
                2.0, (ev) => {

                    ev.changeScene(TitleScreen);
                }, 6.2);
        }
    }


    // Draw
    draw(c) {

        let b = c.bitmaps.creator;

        c.clear(0);
    
        c.drawBitmap(b, c.width/2-b.width/2, c.height/2-b.height/2);
    }

}
