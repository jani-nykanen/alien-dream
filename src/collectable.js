/**
 * Something to collect
 * 
 * (c) 2020 Jani Nykänen
 */

import { GameObject } from "./gameobject.js";
import { Vector2 } from "./core/vector.js";


export class Collectable extends GameObject {

 
    constructor(x, y, row) {
        
        super(16, 16);

        this.pos.x = x;
        this.pos.y = y;

        this.hitbox.x = 12;
        this.hitbox.y = 12;

        this.spr.row = row;

        this.exist = true;
    }   
    
    
    // Spawn a jumping item
    spawn(x, y, jumpSpeed) {
        
        const GRAVITY = 2.0;
        const SPAWN_TIME = 10;

        this.pos = new Vector2(x, y);

        this.exist = true;

        this.friction.y = 0.1;

        this.target.y = GRAVITY;
        this.speed.y = jumpSpeed;

        this.spawnTimer = SPAWN_TIME;
    }


    // Logic
    updateLogic(ev) {

        if (this.spawnTimer > 0) {

            this.spawnTimer -= ev.step;
        }
    }


    // Animate
    animate(ev) {
        
        const ANIM_SPEED = 8;
        
        this.spr.animate(this.spr.row, 0, 3, ANIM_SPEED, ev.step);;
    }


    // Animation when hidden
    hiddenAnimation(ev) {
        
        this.animate(ev);
    }
    
    
    // Hostile collision
    hostileCollision(o, ev) {
        
       if (this.spawnTimer > 0) return;

        this.dying = true;

        if (this.deathEvent != undefined) {

            this.deathEvent(o, ev);
        }

        ev.audio.playSample(
            [ev.audio.samples.coin, 
            ev.audio.samples.heart, 
            ev.audio.samples.life,
            ev.audio.samples.coin,
            ev.audio.samples.coin] [this.spr.row], 
            0.40);
    
    }

    
    // Draw
    draw(c) {

        if (!this.exist || !this.inCamera) return;
        
        c.drawSprite(this.spr, c.bitmaps.coin,
            Math.floor(this.pos.x-8), 
            Math.floor(this.pos.y-8));
    }


    floorEvent(ev) {

        this.speed.y = 0;
    }
}


export class Coin extends Collectable {


    constructor(x, y) {

        super(x, y, 0);
    }


    deathEvent(o, ev) {

        ++ o.coins;
    }
}


export class SilverCoin extends Collectable {


    constructor(x, y) {

        super(x, y, 3);
    }


    deathEvent(o, ev) {

        o.coins += 5;
    }
}


export class RainbowCoin extends Collectable {


    constructor(x, y) {

        super(x, y, 4);
    }


    deathEvent(o, ev) {

        o.coins += 10;
    }
}



export class Heart extends Collectable {


    constructor(x, y) {

        super(x, y, 1);
    }


    deathEvent(o, ev) {

        o.health = Math.min(o.maxHealth, o.health+1);
    }
}



export class LifeUp extends Collectable {


    constructor(x, y) {

        super(x, y, 2);
    }


    // Animate
    animate(ev) {
        
        const ANIM_SPEED = 6;
        const INITIAL_FRAME_SPEED = 60;
        
        this.spr.animate(this.spr.row, 
            0, 3,
            this.spr.frame == 0 ? INITIAL_FRAME_SPEED : ANIM_SPEED, 
            ev.step);;
    }


    deathEvent(o, ev) {

        o.lives = Math.min(99, o.lives+1);
    }
}

