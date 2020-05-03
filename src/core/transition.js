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
    CircleOutside: 1,
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

        let maxRadius = 0;
        let r;

        let cx = c.width/2;
        let cy = c.height/2;

        switch(this.mode) {

        case TransitionType.Fade:

            if (this.param != null) {

                t = Math.round(t * this.param) / this.param;
            }

            c.setColor(this.color.r, this.color.g, this.color.b, t);
            c.fillRect(0, 0, c.width, c.height);
            
            break;

        case TransitionType.CircleOutside:

            if (this.param != null &&
                this.param.x != undefined &&
                this.param.y != undefined) {

                cx += this.param.x;
                cy += this.param.y;
            }
            maxRadius = Math.max(
                Math.hypot(cx, cy),
                Math.hypot(c.width-cx, cy),
                Math.hypot(c.width-cx, c.height-cy),
                Math.hypot(cx, c.height-cy)
            );
            
            r = (1-t) * maxRadius;

            c.setColor(this.color.r, this.color.g, this.color.b);
            c.fillCircleOutside(r, cx, cy);

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

