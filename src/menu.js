/**
 * The good ol' menu
 * 
 * (c) 2020 Jani Nykänen
 */

import { negMod } from "./core/util.js";
import { State } from "./core/input.js";


export class MenuButton {

    constructor(text, cb) {

        this.text = text;
        this.cb = cb;
    }
}


export class Menu {

    constructor(offset, madeActive, buttons) {

        const CHAR_WIDTH = 8; // This is assumed

        this.buttons = new Array();
        for (let b of buttons) {

            this.buttons.push(b);
        }

        // Compute dimensions
        this.width = (Math.max(...(this.buttons.map(b => b.text.length))) +1)
            * CHAR_WIDTH;
        this.height = (this.buttons.length) * offset;

        this.cpos = 0;
        this.active = Boolean(madeActive);

        this.offset = offset;
    }


    // Activate
    activate(p) {

        if (p != null) this.cpos = p;

        this.active = true;
    }


    // Disable
    disable() {

        this.active = false;
    }


    // Update menu
    update(ev) {

        const EPS = 0.25;

        if (!this.active || ev.tr.active) return;

        let opos = this.cpos;
        if (ev.input.stick.y < 0 && ev.input.stickDelta.y < -EPS) {

            -- this.cpos;
        }
        else if (ev.input.stick.y > 0 && ev.input.stickDelta.y > EPS) {

            ++ this.cpos;
        }
        this.cpos = negMod(this.cpos, this.buttons.length);

        if (this.cpos != opos) {

            ev.audio.playSample(ev.audio.samples.next, 0.60);
        }

        let b = this.buttons[this.cpos];
        if (ev.input.actions.start.state == State.Pressed ||
            ev.input.actions.fire1.state == State.Pressed) {

            if (b.cb != null) {

                b.cb(ev);
            }
            ev.audio.playSample(ev.audio.samples.accept, 0.60);
        }
    }


    // Draw
    draw(c, dx, dy) {

        if (!this.active) return;

        let tx = dx - this.width/2;
        let ty = dy - this.height/2;

        // Draw buttons
        let str;
        for (let i = 0; i < this.buttons.length; ++ i) {

            str = this.cpos == i ? "@" : " ";
            str += this.buttons[i].text;

            c.drawText(c.bitmaps.font, str,
                tx, ty + i*this.offset,
                0, 0, 
                false);
        }
    }
}
