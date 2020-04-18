/**
 * Enemies
 * 
 * (c) 2020 Jani Nykänen
 */

import { GameObject } from "./gameobject.js";
import { Flip } from "./core/canvas.js";


export class Enemy extends GameObject {


    constructor(x, y) {

        super(16, 16);

        this.pos.x = x;
        this.pos.y = y;

        this.hitbox.x = 12;
        this.hitbox.y = 12;

        this.canJump = true;

        this.friction.x = 0.1;
        this.friction.y = 0.1;

        this.exist = true;
    }


    postMovementEvent(ev) {

        this.canJump = false;
    }


    // Die
    die(ev) {

        const DEATH_SPEED = 5;

        this.spr.animate(0, 0, 4, DEATH_SPEED, ev.step);
        return this.spr.frame >= 4;
    }


    // Draw
    draw(c) {

        if (!this.exist || !this.inCamera) return;

        c.drawSprite(this.spr, c.bitmaps.enemies,
            Math.round(this.pos.x-8),
            Math.round(this.pos.y-8)+1, this.flip);
    }


    // Kill
    kill(ev) {

        this.dying = true;
        this.spr.setFrame(0, 0);
        this.flip = Flip.None;
    }


    // Hostile collision
    hostileCollision(o, ev) {

        const HURT_MARGIN = 8;
        const JUMP_SPEED_Y = -2.0;
        const JUMP_MARGIN = 16;

        let py;

        if (o.isPlayer) {

            py = this.pos.y + this.center.y - this.hitbox.y / 2;
            if (o.speed.y > this.speed.y &&
                o.pos.y >= py &&
                o.pos.y < py + (HURT_MARGIN + Math.max(0, o.speed.y)) * ev.step) {
    
                this.kill(ev);
    
                o.speed.y = JUMP_SPEED_Y;
                o.stompMargin = JUMP_MARGIN;
            }
            else {

                o.hurt(1, ev);
            }
        }
        else {

            if (o.phase < 2) {

                o.speed.x = 0;
                o.speed.y = 0;
            }
            o.phase = 2;

            this.kill(ev);
        }
    }


    floorEvent(ev) {

        this.canJump = true;
        this.speed.y = 0;
    }
}


export class Walker extends Enemy {

    constructor(x, y) {

        super(x, y);

        const SPEED = 0.5;

        this.spr.setFrame(1, 0);

        this.target.y = 2;
        this.center.y = -2;

        this.colbox.x = 4;

        this.target.x = (((x/16)|0) % 2 == 0 ? 1 : -1) * SPEED;
    }


    // Logic
    updateLogic(ev) {

        if (!this.canJump) {

            this.target.x *= -1;
            this.speed.x *= -1;

            this.pos.x += this.speed.x * ev.step;
        }
    }


    // Animate
    animate(ev) {

        this.spr.animate(1, 0, 3, 8, ev.step);
        this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;
    }


    wallEvent(ev) {

        this.target.x *= -1;
        this.speed.x *= -1;
    }
}
