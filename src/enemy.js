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
        this.harmful = false;

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
            if (!this.harmful &&
                o.speed.y > this.speed.y &&
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


    // Deal with player, mostly to get the position
    checkPlayer(o) { }


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

        this.spr.animate(this.spr.row, 0, 3, 8, ev.step);
        this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;
    }


    wallEvent(ev) {

        this.target.x *= -1;
        this.speed.x *= -1;
    }
}



const SLIME_JUMP_TIME = 60;

export class Slime extends Enemy {

    constructor(x, y) {

        super(x, y);

        this.spr.setFrame(2, 0);

        this.friction.y = 0.075;

        this.target.y = 2;
        this.center.y = -2;

        this.colbox.x = 8;

        this.jumpTimer = SLIME_JUMP_TIME;
    }


    // Logic
    updateLogic(ev) {

        const JUMP_HEIGHT = -2.25;
        const HORIZONTAL_SPEED = 0.5;

        if (this.canJump) {

            this.target.x = 0;
            if ((this.jumpTimer -= ev.step) <= 0) {

                this.jumpTimer += SLIME_JUMP_TIME;
                this.speed.y = JUMP_HEIGHT;

                this.target.x = (this.flip == Flip.None ? -1 : 1) *
                    HORIZONTAL_SPEED;
                this.speed.x = this.target.x;
            }
        }
    }


    checkPlayer(o) {

        if (this.canJump) {

            this.flip = o.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;
        }
    }


    // Animate
    animate(ev) {

        if (this.canJump) {

            this.spr.setFrame(2, 0);
        }
        else {

            this.spr.setFrame(2, this.speed.y < 0 ? 1 : 2);
        }
    }


    wallEvent(ev) {

        this.target.x *= -1;
        this.speed.x *= -1;
    }
}



export class Dog extends Enemy {

    constructor(x, y) {

        super(x, y);

        this.spr.setFrame(1, 0);

        this.target.y = 2;
        this.center.y = -2;

        this.friction.x = 0.025;

        this.colbox.x = 4;

    }


    // Logic
    updateLogic(ev) { }


    // Deal with player, mostly to get the position
    checkPlayer(o) {

        const SPEED = 0.75;

        if (this.canJump) {

            this.target.x = (o.pos.x < this.pos.x ? -1 : 1) * SPEED;
        }
    }


    // Animate
    animate(ev) {

        if (this.canJump) {

            this.spr.animate(3, 0, 3, 4, ev.step);
            this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;
        }
        else {

            this.spr.setFrame(3, 4);
        }
    }


    wallEvent(ev) {

        this.speed.x *= -1;
    }
}



export class GenericImp extends Enemy {

    constructor(x, y, horizontal, row) {

        super(x, y);

        this.spr.setFrame(3, 0);

        this.startPos = this.pos.clone();
        this.horizontal = horizontal;

        let compare = horizontal ? x : y;

        this.waveTimer = (((compare/16)|0) % 2) * Math.PI;

        this.spr.row = row;
    }


    // Logic
    updateLogic(ev) { 

        const AMPLITUDE = 16.0;
        const WAVE_SPEED = 0.025;

        this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI*2);

        if (this.horizontal) {

            this.pos.x = this.startPos.x + 
                Math.round(Math.sin(this.waveTimer) * AMPLITUDE);
        }
        else {

            this.pos.y = this.startPos.y + 
                Math.round(Math.sin(this.waveTimer) * AMPLITUDE);
        }
    }


    // Animate
    animate(ev) {

        this.spr.animate(this.spr.row, 0, 3, 6, ev.step);
    }
}



export class ImpVertical extends GenericImp {

    constructor(x, y) {

        super(x, y, false, 4);
    }
}


export class ImpHorizontal extends GenericImp {

    constructor(x, y) {

        super(x, y, true, 5);
    }
}

export class SpikeyWalker extends Walker {

    constructor(x, y) {

        super(x, y);
        this.harmful = true;

        this.spr.row = 6;
    }
}
