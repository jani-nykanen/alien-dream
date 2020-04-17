
/**
 * A very basic skeleton for game objects
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./core/vector.js";
import { updateSpeedAxis } from "./core/util.js";
import { Sprite } from "./core/sprite.js";


export class GameObject {


    constructor(w, h) {

        this.pos = new Vector2();
        this.speed = new Vector2();
        this.target = new Vector2();
        this.friction = new Vector2(1, 1);

        this.hitbox = new Vector2(w, h);
        this.center = new Vector2(0, 0);
        this.spr = new Sprite(w, h);

        this.exist = false;
        this.dying = false;
    }


    // Base movement
    baseMovement(ev) {

        this.speed.x = updateSpeedAxis(this.speed.x, 
            this.target.x, this.friction.x * ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y, 
            this.target.y, this.friction.y * ev.step);

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;

    }


    // Update
    update(ev) {

        if (!this.exist) return;

        if (this.dying) {

            if (this.die == undefined ||
                this.die(ev)) {

                this.dying = false;
                this.exist = false;
            }
            return;
        }

        if (this.updateLogic != undefined) {

            this.updateLogic(ev);
        }

        if (this.animate != undefined) {

            this.animate(ev);
        }

        this.baseMovement(ev);

        if (this.postMovementEvent != undefined) {

            this.postMovementEvent(ev);
        }
    }
    
    
    // Collision with another game object
    objectCollision(o, hostile, ev) {
        
        if (!this.exist || !o.exist ||
            this.dying || o.dying) return false;
        
        let px = this.pos.x + this.center.x;
        let py = this.pos.y + this.center.y;
        let pw = this.hitbox.x/2;
        let ph = this.hitbox.y/2;
        
        let ox = o.pos.x + o.center.x;
        let oy = o.pos.y + o.center.y;
        let ow = o.hitbox.x/2;
        let oh = o.hitbox.y/2;
        
        if (px + pw > ox - ow && 
            px - pw < ox + ow && 
            py + ph > oy - oh &&
            py - ph < oy + oh) {
            
            if (hostile && o.hostileCollision != undefined) {
                
                o.hostileCollision(this, ev);
            }
            else if (!hostile && o.friendlyCollision != undefined) {
                
                o.friendCollision(this, ev);
            }
            
            
            return true;    
        }
        
        return false;
    }


    // Check the floor collision
    floorCollision(x, y, width, ev) {

        const BOTTOM_MARGIN = 2;
        const TOP_MARGIN = 1;

        let w = this.hitbox.x;

        if (this.speed.y < 0 || 
            this.pos.x-this.center.x+w/2 < x || 
			this.pos.x-this.center.x-w/2 >= x+width)
            return false;
	
		// TODO: Hitbox height need to be taken into account!
        if (this.pos.y+this.center.y > y - TOP_MARGIN * ev.step &&
            this.pos.y+this.center.y < y + (BOTTOM_MARGIN + this.speed.y) * ev.step) {

            if (this.floorEvent != undefined) {

                this.floorEvent(ev);
            }
            this.pos.y = y - this.center.y;
            

            return true;
        }
        return false;
    }
	
	
	// Check the ceiling collision
    ceilingCollision(x, y, width, ev) {

        const BOTTOM_MARGIN = 1;
        const TOP_MARGIN = 2;

        let w = this.hitbox.x;

        if (this.speed.y > 0 || 
            this.pos.x-this.center.x+w/2 < x || 
			this.pos.x-this.center.x-w/2 >= x+width)
            return false;

        if (this.pos.y-this.center.y < y + BOTTOM_MARGIN * ev.step &&
            this.pos.y-this.center.y > y - (TOP_MARGIN - this.speed.y) * ev.step) {

            if (this.ceilingEvent != undefined) {

                this.ceilingEvent(ev);
            }
            this.pos.y = y + this.center.y;

            return true;
        }
        return false;
    }
	
	
	// Check wall collision
    wallCollision(x, y, height, dir, ev) {

        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 2;

        let h = this.hitbox.y;

        if (dir*this.speed.x < 0 || 
            this.pos.y-this.center.y+h/2 < y || 
			this.pos.y-this.center.y-h/2 >= y+height)
            return false;

        if (this.pos.x-this.center.x > dir * (x - NEAR_MARGIN) * ev.step &&
            this.pos.y-this.center.x < dir * (x + (FAR_MARGIN + this.speed.x)) * ev.step) {

            if (this.wallEvent != undefined) {

                this.wallEvent(dir, ev);
            }
            this.pos.x = x + this.center.x;

            return true;
        }
        return false;
    }
}


// Create a new game object, given an array and type
export function newGameObject(arr, type) {

    let o = null;
    for (let a of arr) {

        if (!a.exist) {

            o = a;
            break;
        }
    }
    if (o == null) {

        arr.push(o = new type.prototype.constructor);
    }

    return o;
}
