/**
 * Screen transitions
 * 
 * (c) 2020 Jani Nykänen
 */

import { RGB } from "./vector.js";



const TRANSITION_TIME = 60;


export const TransitionType = {

    Empty: -1,
    Fade: 0,
}


export class Transition {


    constructor() {

        this.timer = 0;
        this.cb = null;
        this.color = new RGB();
        this.active = false;
        this.speed = 1;
        this.fadeIn = false;
        this.mode = TransitionType.Fade;
        this.param = 0;

        this.center = null;
    }


    // Make the transition active
    activate(fadeIn, mode, speed, cb, param, color) {

        if (color == null) {

            this.color = new RGB();
        }
        else {

            this.color = color.clone();
        }

        this.param = param;

        this.fadeIn = fadeIn;
        this.speed = speed;
        this.timer = TRANSITION_TIME;
        this.cb = cb;
        this.mode = mode;

        this.active = true;
    }


    // Set center
    setCenter(cx, cy) {

        if (cx == null || cy == null) {

            this.center = null;
        }
        else {

            this.center = new Vector2(cx, cy);
        }
    }


    // Update transition
    update(ev) {

        if (!this.active) return;

        // Update timer
        if ((this.timer -= this.speed * ev.step) <= 0) {

            if ((this.fadeIn = !this.fadeIn) == false) {

                this.timer += TRANSITION_TIME;
                this.cb(ev);
            }
            else {

                this.active = false;
                this.timer = 0;
            }
        }
    }


    // Draw transition
    draw(c) {

        if (!this.active || this.mode == -1) 
            return;

        let t = this.getScaledTime();

        switch(this.mode) {

        case TransitionType.Fade:

            if (this.param != null) {

                t = Math.round(t * this.param) / this.param;
            }

            c.setColor(this.color.r, this.color.g, this.color.b, t);
            c.fillRect(0, 0, c.width, c.height);
            
            break;

        default:
            break;
        }

        c.setColor();
    }


    // Get time scaled to [0,1] interval
    getScaledTime() {

        let t = this.timer / TRANSITION_TIME;
        if (this.fadeIn) t = 1.0 - t;
        return t;
    }


    // Disable
    disable() {

        this.active = false;
    }
}

