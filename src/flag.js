/**
 * a.k.a checkpoint
 * 
 * (c) 2020 Jani Nykänen
 */

import { GameObject } from "./gameobject.js";


export class Flag extends GameObject {


    constructor(x, y, active) {

        super(16, 32);

        this.pos.x = x;
        this.pos.y = y;

        this.active = active;
        this.exist = true;
    }


    // Animate
    animate(ev) {

        if (this.active) {

            this.spr.animate(0, 1, 4, 8, ev.step);
        }
        else {

            this.spr.setFrame(0, 0);
        }
    }


    // Player collision
    playerCollision(o, cb, ev) {

        if (this.active || 
            o.dying || !o.exist) return;

        if (o.pos.x > this.pos.x) {

            // Useless since this object
            // is destroyed right after this
            this.active = true;

            cb(ev); 
        }
    }


    // Draw
    draw(c) {

        if (!this.inCamera) return;

        c.drawSprite(this.spr, c.bitmaps.flag,
            this.pos.x-8, this.pos.y);
    }
}
