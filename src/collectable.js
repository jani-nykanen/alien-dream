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
    hiddenAnimation = (ev) => this.animate(ev);
    
    
    // Hostile collision
    hostileCollision(o, ev) {
        
       if (this.spawnTimer > 0) return;

        this.dying = true;

        if (this.deathEvent != undefined) {

            this.deathEvent(o, ev);
        }
    
    }

    
    // Draw
    draw(c) {

        if (!this.exist || !this.inCamera) return;
        
        c.drawSprite(this.spr, c.bitmaps.coin,
            Math.round(this.pos.x-8), Math.round(this.pos.y-8));
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


export class Heart extends Collectable {


    constructor(x, y) {

        super(x, y, 1);
    }


    deathEvent(o, ev) {

        o.health = Math.min(o.maxHealth, o.health+1);
    }
}
