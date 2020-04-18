/**
 * Something to collect
 * 
 * (c) 2020 Jani Nykänen
 */

import { GameObject } from "./gameobject.js";
import { Vector2 } from "./core/vector.js";


export class Collectable extends GameObject {
 
 
    constructor(x, y) {
        
        super(16, 16);

        this.pos.x = x;
        this.pos.y = y;

        this.hitbox = new Vector2(12, 12);

        this.exist = true;
    }   
    
    
    // Spawn a jumping item
    spawn(x, y, jumpSpeed) {
        
        // const SPAWN_WAIT = 10;

        this.pos = new Vector2(x, y);

        this.exist = true;
    }

    
    // Animate
    animate(ev) {
        
        const ANIM_SPEED = 8;
        
        this.spr.animate(0, 0, 3, ANIM_SPEED, ev.step);;
    }
    
    
    // Hostile collision
    hostileCollision(o, ev) {
        
        this.dying = true;

        if (this.deathEvent != undefined) {

            this.deathEvent(o, ev);
        }
    }

    
    // Draw
    draw(c) {

        if (!this.exist) return;
        
        c.drawSprite(this.spr, c.bitmaps.coin,
            Math.round(this.pos.x-8), Math.round(this.pos.y-8));
    }
}


export class Coin extends Collectable {


    constructor(x, y) {

        super(x, y);
    }


    deathEvent(o, ev) {

        ++ o.coins;
    }
}