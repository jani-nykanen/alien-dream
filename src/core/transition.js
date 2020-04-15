/**
 * Screen transitions
 * 
 * (c) 2020 Jani Nykänen
 */



const TRANSITION_TIME = 60;


export const TransitionType = {

    Empty: -1,
    Fade: 0,
}


export class Transition {


    constructor() {

        this.timer = 0;
        this.cb = null;
        this.color = {r: 0, g: 0, b: 0};
        this.active = false;
        this.speed = 1;
        this.fadeIn = false;
        this.mode = TransitionType.Fade;

        this.center = null;
    }


    // Make the transition active
    activate(fadeIn, mode, speed, cb, r, g, b) {

        if (r == null) {

            r = 0; g = 0; b = 0;
        }

        this.fadeIn = fadeIn;
        this.speed = speed;
        this.color.r = r;
        this.color.g = g;
        this.color.b = b;
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

                this.cb(ev);
                this.timer += TRANSITION_TIME;
            }
            else {

                this.active = false;
                this.timer = 0;
            }
        }
    }


    // Draw transition
    draw(c) {

        if (!this.active || this.delayTimer > 0 || this.mode == -1) 
            return;

        let t = this.getScaledTime();

        switch(this.mode) {

        case TransitionType.Fade:

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

