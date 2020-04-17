/**
 * The player object
 * 
 * (c) 2020 Jani Nykänen
 */

import { GameObject } from "./gameobject.js";
import { Flip } from "./core/canvas.js";
import { State } from "./core/input.js";
import { clamp } from "./core/util.js";


const JUMP_SPEED = -2.0;


export class Player extends GameObject {


    constructor(x, y) {

        super(16, 24);

        this.pos.x = x;
        this.pos.y = y;

        this.hitbox.x = 8;
        this.hitbox.y = 16;

        this.friction.x = 0.1;
        this.friction.y = 0.15;

        this.center.x = 0;
        this.center.y = this.hitbox.y/2;
        
        this.jumpTimer = 0;
        this.jumpMargin = 0;

        this.hurtTimer = 0;

        this.flip = Flip.None;
        this.canJump = false;
        this.exist = true;
    }


    // Update player logic
    updateLogic(ev) {

        const HORIZONTAL_TARGET = 1.0;
        const GRAVITY = 4.0;
        const JUMP_TIME = 16;

        // Determine target speed
        this.target.x = ev.input.stick.x * HORIZONTAL_TARGET;
        this.target.y = GRAVITY;

        // Check jumping
        let s = ev.input.actions.fire1.state;
        if (this.stompMargin > 0 && 
            (s & State.DownOrPressed) == 1) {

            this.jumpTimer = this.stompMargin;
        }
        else if ((this.canJump || this.jumpMargin > 0) && 
            s == State.Pressed) {

            this.jumpTimer = JUMP_TIME;

            // ev.audio.playSample(ev.audio.samples.jump, 0.50);
            this.jumpMargin = 0.0;
        }
        else if ( (s & State.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }

        // Update jump timers
        if (this.jumpTimer > 0.0) {

            this.jumpTimer -= ev.step;
            this.speed.y = JUMP_SPEED;
        }
        if (this.jumpMargin > 0) {

            this.jumpMargin -= ev.step;
        }
    }


     // Post-movement events
     postMovementEvent(ev) {

        this.canJump = false;

        if (this.hurtTimer > 0) {

            this.hurtTimer -= ev.step;
        }
    }


    // Animate
    animate(ev) {

        const EPS = 0.01;
        const AIR_DELTA = 0.5;

        if (Math.abs(this.target.x) > EPS) 
            this.flip = this.target.x < 0;

        let frame = 0;
        if (this.canJump) {

            if (Math.abs(this.target.x) > EPS) {

                this.spr.animate(0, 1, 4, 12 - Math.abs(this.speed.x)*4, ev.step);
            }
            else {
                
                this.spr.setFrame(0, 0);
            }
        }
        else {

            frame = 1;
            if (this.speed.y < -AIR_DELTA)
                frame = 0;
            else if (this.speed.y > AIR_DELTA)
                frame = 2;

            this.spr.setFrame(1, frame);
        }
    }


    // Draw 
    draw(c) {

        if (!this.exist) return;
        
        c.setColor(255, 0, 0);
        c.drawSprite(this.spr, c.bitmaps.player,
            Math.round(this.pos.x)-8, Math.round(this.pos.y)-24 +1, 
            this.flip);
    }


    // Triggered when the floor is touched
    floorEvent(ev) {

        const JUMP_MARGIN_TIME = 15;

        this.speed.y = 0;
        this.jumpMargin = JUMP_MARGIN_TIME;

        this.canJump = true;
    }
}
