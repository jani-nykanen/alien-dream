
/**
 * Game Over! screen
 * 
 * (c) 2020 Jani Nykänen
 */

import { TransitionType } from "./core/transition.js";
import { Game } from "./game.js";


export class GameOver {


    constructor() {

       this.timer = 0;
    }


    // Activate
    activate(param, ev) {

        this.timer = 0;
    }


    // Update
    update(ev) {

        const END_TIME = 180;

        if (ev.tr.active) return;
    
        if ((this.timer += ev.step) >= END_TIME) {

            ev.tr.activate(true, TransitionType.Fade,
                2.0, (ev) => {

                    ev.changeScene(Game);
                }, 6.2);
        }
    }


    // Draw
    draw(c) {

        let b = c.bitmaps.gameover;

        c.clear(0);
    
        c.drawBitmap(b, c.width/2-b.width/2, c.height/2-b.height/2);
    }

}
