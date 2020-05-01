
/**
 * A very basic skeleton for game objects
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./core/vector.js";
import { updateSpeedAxis } from "./core/util.js";
import { Sprite } from "./core/sprite.js";
import { Flip } from "./core/canvas.js";


export class GameObject {


    constructor(w, h) {

        this.pos = new Vector2();
        this.oldPos = this.pos.clone();
        this.speed = new Vector2();
        this.target = new Vector2();
        this.friction = new Vector2(1, 1);

        this.hitbox = new Vector2(w, h);
        this.center = new Vector2(0, 0);
        this.spr = new Sprite(w, h);

        // In general these two things are the same
        this.colbox = this.hitbox;

        this.flip = Flip.None;
        this.exist = false;
        this.dying = false;

        this.takeCollision = true;
        this.inCamera = true;
        this.killIfOutsideCamera = false;
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

        this.oldPos = this.pos.clone();

        if (this.dying) {

            if (this.die == undefined ||
                this.die(ev)) {

                this.dying = false;
                this.exist = false;
            }
            return;
        }
        
        if (!this.inCamera) {

            if (this.hiddenAnimation != undefined) {

                this.hiddenAnimation(ev);
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
        
        let px = this.pos.x - this.center.x;
        let py = this.pos.y - this.center.y;
        let pw = this.colbox.x/2;
        let ph = this.colbox.y/2;
        
        let ox = o.pos.x - o.center.x;
        let oy = o.pos.y - o.center.y;
        let ow = o.colbox.x/2;
        let oh = o.colbox.y/2;
        
        if (px + pw >= ox - ow && 
            px - pw <= ox + ow && 
            py + ph >= oy - oh &&
            py - ph <= oy + oh) {
            
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

        let w = this.colbox.x;

        if (!this.takeCollision ||
            this.speed.y < 0 || 
            this.pos.x-this.center.x+w/2 < x || 
			this.pos.x-this.center.x-w/2 >= x+width)
            return false;
    
        let bottom = this.pos.y - this.center.y + this.colbox.y/2;
        
        if (bottom > y - TOP_MARGIN * ev.step &&
            bottom < y + (BOTTOM_MARGIN + this.speed.y) * ev.step) {

            if (this.floorEvent != undefined) {

                this.floorEvent(ev);
            }
            this.pos.y = y + this.center.y - this.colbox.y/2;
            
            return true;
        }
        return false;
    }
	
	
	// Check the ceiling collision
    ceilingCollision(x, y, width, ev) {

        const BOTTOM_MARGIN = 1;
        const TOP_MARGIN = 2;

        let w = this.colbox.x;

        if (!this.takeCollision ||
            this.speed.y > 0 || 
            this.pos.x-this.center.x+w/2 < x || 
			this.pos.x-this.center.x-w/2 >= x+width)
            return false;

        let top = this.pos.y - this.center.y - this.colbox.y/2;

        if (top < y + BOTTOM_MARGIN * ev.step &&
            top > y - (TOP_MARGIN - this.speed.y) * ev.step) {

            if (this.ceilingEvent != undefined) {

                this.ceilingEvent(ev);
            }
            this.pos.y = y + this.center.y + this.colbox.y/2;

            return true;
        }
        return false;
    }
	
	
	// Check wall collision
    wallCollision(x, y, height, dir, ev) {

        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 2;

        const SAFE_MARGIN = 1;

        let h = this.colbox.y;

        if (!this.takeCollision ||
            dir*this.speed.x < 0 || 
            this.pos.y-this.center.y+h/2 < y+SAFE_MARGIN || 
			this.pos.y-this.center.y-h/2 >= y+height)
            return false;

        let shift = -this.center.x + this.colbox.x/2 * dir;
        let middle = this.pos.x + shift;
        let middleOld = this.oldPos.x + shift;

        let near = x - dir * NEAR_MARGIN * ev.step;
        let far = x + dir * (FAR_MARGIN + Math.abs(this.speed.x)) * ev.step;

        if ((dir > 0 && middle > near && middleOld < far) ||
            (dir < 0 && middle < near && middleOld > far)) {

            if (this.wallEvent != undefined) {

                this.wallEvent(dir, ev);
            }
            this.pos.x = x + this.center.x - this.colbox.x/2 * dir;

            return true;
        }
        return false;
    }


    // Is in camera
    checkIfInCamera(cam) {

        const MARGIN = 8;

        let topx = this.pos.x+this.center.x - this.spr.width/2 - MARGIN;
        let topy = this.pos.y+this.center.y - this.spr.height/2 - MARGIN;
        let bottomx = topx + this.spr.width + MARGIN*2;
        let bottomy = topy + this.spr.height + MARGIN*2;

        this.inCamera = (bottomx >= cam.topCorner.x &&
            bottomy >= cam.topCorner.y &&
            topx <= cam.topCorner.x + cam.width &&
            topy <= cam.topCorner.y + cam.height);
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
