/**
 * Enemies
 * 
 * (c) 2020 Jani Nykänen
 */

import { GameObject } from "./gameobject.js";
import { Flip } from "./core/canvas.js";
import { Vector2 } from "./core/vector.js";


export class Enemy extends GameObject {


    constructor(x, y) {

        super(16, 16);

        this.pos.x = x;
        this.pos.y = y;

        this.hitbox.x = 12;
        this.hitbox.y = 12;

        this.canJump = true;
        this.harmful = false;
        this.immortal = false;
        this.harmless = false;

        this.inCamera = false;

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
            Math.floor(this.pos.x-8),
            Math.floor(this.pos.y-8)+1, this.flip);
    }


    // Kill
    kill(ev) {

        this.dying = true;
        this.spr.setFrame(0, 0);
        this.flip = Flip.None;

        ev.audio.playSample(ev.audio.samples.hit, 0.70);
    }


    // Hostile collision
    hostileCollision(o, ev) {

        const HURT_MARGIN = 8;
        const JUMP_SPEED_Y = -2.0;
        const JUMP_MARGIN = 16;
        const SPEED_MARGIN = 0.5;

        let py;

        let dir = o.pos.x < this.pos.x ? -1 : 1;

        if (this.immortal || this.harmless) {

            if (o.isPlayer && !this.harmless)
                o.hurt(1, dir, ev);

            return;
        }

        if (o.isPlayer) {

            py = this.pos.y + this.center.y - this.hitbox.y / 2;
            if (!this.harmful &&
                o.speed.y > this.speed.y - SPEED_MARGIN &&
                o.pos.y >= py &&
                o.pos.y < py + (HURT_MARGIN + Math.max(0, o.speed.y)) * ev.step) {
    
                this.kill(ev);
    
                o.speed.y = JUMP_SPEED_Y;
                o.stompMargin = JUMP_MARGIN;
            }
            else {

                o.hurt(1, dir, ev);
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


    // Deal with the camera
    checkCamera(cam) { }


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


    wallEvent(dir, ev) {

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

                ev.audio.playSample(ev.audio.samples.jump, 0.40);
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


    wallEvent(dir, ev) {

        this.target.x *= -1;
        this.speed.x *= -1;
    }


    ceilingEvent(ev) {

        this.speed.y = 0;
    }
}


// Dog no more
export class Dog extends Enemy {

    constructor(x, y) {

        super(x, y);

        this.spr.setFrame(3, 0);

        this.target.y = 2;
        this.center.y = -2;

        this.friction.x = 0.025;

        this.colbox.x = 4;

    }


    // Logic
    updateLogic(ev) { }


    // Deal with player, mostly to get the position
    checkPlayer(o) {

        const SPEED = 0.5;

        if (this.canJump) {

            this.target.x = (o.pos.x < this.pos.x ? -1 : 1) * SPEED;
        }
    }


    // Animate
    animate(ev) {

        if (this.canJump) {

            this.spr.animate(3, 0, 3, 6, ev.step);
            this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;
        }
        else {

            this.spr.setFrame(3, 4);
        }
    }


    wallEvent(dir, ev) {

        this.speed.x = 0;
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


export class Jumper extends Enemy {

    constructor(x, y) {

        super(x, y);

        this.spr.setFrame(2, 0);

        this.friction.y = 0.075;

        this.target.x = 0.5;
        this.target.y = 3;
        this.center.y = -3;

        this.colbox.x = 8;

        this.speedSet = false;
    }


    // Logic
    updateLogic(ev) {  }


    checkPlayer(o) {

        const BASE_SPEED = 0.5;

        if (!this.speedSet) {

            this.target.x = (o.pos.x < this.pos.x ? -1 : 1) * BASE_SPEED;
            this.speed.x = this.target.x;
            this.speedSet = true;
        }
    }


    // Animate
    animate(ev) {

        const EPS = 0.33;

        let frame = 1;
        if (this.speed.y < -EPS)
            frame = 0;
        else if (this.speed.y > EPS)
            frame = 2;

        this.spr.setFrame(7, frame);
    
        this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;
    }


    wallEvent(dir, ev) {

        this.target.x *= -1;
        this.speed.x *= -1;
    }


    floorEvent(ev) {

        const JUMP_HEIGHT = -1.75;

        this.speed.y = JUMP_HEIGHT;
    }
}


export class Bird extends Enemy {

    constructor(x, y) {

        super(x, y);

        this.spr.setFrame(8, 0);

        this.colbox.y = 16;

        this.speedSet = false;
    }


    checkPlayer(o) {

        const BASE_SPEED = 0.5;

        if (!this.speedSet) {

            this.target.x = (o.pos.x < this.pos.x ? -1 : 1) * BASE_SPEED;
            this.speed.x = this.target.x;
            this.speedSet = true;
        }
    }


    // Logic
    updateLogic(ev) { }


    // Animate
    animate(ev) {

        this.spr.animate(this.spr.row, 0, 3, 6, ev.step);
        this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;
    }


    wallEvent(dir, ev) {

        this.target.x *= -1;
        this.speed.x *= -1;
    }
}


export class Ghost extends Enemy {

    constructor(x, y) {

        super(x, y);

        this.spr.setFrame(9, 0);

        this.colbox.y = 16;

        this.active = false;

        this.friction.x = 0.01;
        this.friction.y = 0.01;

        this.takeCollision = false;
        this.immortal = true;
    }


    checkPlayer(o) {

        const BASE_SPEED = 0.5;

        this.flip = o.pos.x < this.pos.x ? Flip.None : Flip.Horizontal;

        let dir = new Vector2();
        if (this.active = (this.flip != o.flip)) {

            dir.x = o.pos.x - this.pos.x;
            dir.y = o.pos.y - this.pos.y;
            dir.normalize();

            this.target.x = dir.x * BASE_SPEED;
            this.target.y = dir.y * BASE_SPEED;
        }
        else {

            this.target.x = 0;
            this.target.y = 0;
        }
    }


    // Logic
    updateLogic(ev) { 

    }


    // Animate
    animate(ev) {

        if (this.active) {

            this.spr.animate(this.spr.row, 0, 3, 6, ev.step);
        }
        else {

            this.spr.setFrame(this.spr.row, 4);
        }
    }

}


export class Flame extends Enemy {

    constructor(x, y) {

        super(x, y);

        this.startPos = this.pos.clone();

        this.spr.setFrame(10, 0);

        this.colbox.y = 8;

        this.friction.y = 0.05;

        this.speedSet = false;
        this.harmful = true;

        this.waveTimer = 0;
    }


    checkCamera(cam) {

        const GRAVITY = 0.5;

        if (!this.speedSet) {

            this.target.y = GRAVITY;
            this.speed.y = 0;
            this.pos.y = cam.topCorner.y-8;

            this.speedSet = true;
        }
    }


    // Logic
    updateLogic(ev) { 

        const WAVE_SPEED = 0.05;
        const AMPLITUDE = 16;

        this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI*2);

        this.pos.x = this.startPos.x + 
            Math.round(Math.sin(this.waveTimer) * AMPLITUDE);

    }


    // Animate
    animate(ev) {

        this.spr.animate(this.spr.row, 0, 3, 4, ev.step);
    }


    floorEvent(ev) {

        this.kill(ev);
    }
}


export class Bullet extends Enemy {

    constructor(x, y) {

        super(x, y);

        this.spr.setFrame(11, 1);

        this.dirSet = false;
        this.speedSet = false;
        this.harmless = true;

        this.dir = 0;
    }


    hiddenAnimation(ev) {

        if (this.speedSet) {

            this.exist = false;
        }
    }


    checkCamera(cam) {

        const SPEED = 1.5;

        if (this.dirSet && !this.speedSet) {

            this.target.x = SPEED * (1 - 2 * this.dir);
            this.speed.x = this.target.x;
            this.pos.x = cam.topCorner.x-8 + 172*this.dir;

            this.speedSet = true;

            this.spr.setFrame(11, 0);

            this.harmless = false;
        }
    }


    checkPlayer(o, ev) {

        if (!this.dirSet) {

            this.dir = o.pos.x > this.pos.x ? 0 : 1;
            this.dirSet = true;

            this.flip = this.dir == 1 ? Flip.None : Flip.Horizontal;

            ev.audio.playSample(ev.audio.samples.bullet, 0.50);
        }
    }


    // Logic
    updateLogic(ev) { }


    // Animate
    animate(ev) {}


    wallEvent(dir, ev) {

        this.kill(ev);
    }
}
