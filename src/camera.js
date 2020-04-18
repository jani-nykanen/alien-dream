/**
 * A simple camera
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./core/vector.js";
import { updateSpeedAxis } from "./core/util.js";


export class Camera {

    constructor(x, y, w, h) {

        this.pos = new Vector2(x, y);
        this.width = w;
        this.height = h;

        this.look = new Vector2();
        this.lookTarget = new Vector2();

        this.topCorner = this.getTopCorner();
    }


    // Follow an object
    followObject(o, stage, ev) {

        const LOOK_RANGE_X = 24;
        const LOOK_SPEED_X = 0.5;

        const RANGE_Y = 16;

        this.pos.x = o.pos.x;
        this.pos.x -= o.center.x;

        // Vertical
        let y = o.pos.y - o.center.y;
        if (Math.abs(this.pos.y - y) > RANGE_Y) {

            this.pos.y += Math.sign(y - this.pos.y) * 
                (Math.abs(y - this.pos.y) - RANGE_Y);
        }

        // Horizontal
        if (this.pos.x > this.width/2 &&
            this.pos.x < stage.width*16 - this.width/2) {

            this.lookTarget.x = LOOK_RANGE_X * o.target.x;
            this.look.x = updateSpeedAxis(this.look.x, 
                this.lookTarget.x, LOOK_SPEED_X * ev.step); 

            this.pos.x += this.look.x;
        }
        else {

            this.look.x = 0;
        }

        this.restrict(stage);
        this.topCorner = this.getTopCorner();
    }


    // Restrict camera to the stage dimensions
    restrict(stage) {

        if (this.pos.x < this.width/2) {

            this.look.x -= (this.pos.x - this.width/2);
            this.pos.x = this.width/2;
        }
        if (this.pos.x + this.width/2 > stage.width*16) {

            this.look.x -= this.pos.x - (stage.width*16 - this.width/2);
            this.pos.x = stage.width*16 - this.width/2;
        }

        if (this.pos.y < this.height/2) 
            this.pos.y = this.height/2;
        
        if (this.pos.y + this.height/2 > stage.height*16)
            this.pos.y = stage.height*16 - this.height/2;   
 
    }


    // Use the camera
    use(c, scale, shiftx, shifty) {

        this.topCorner = this.getTopCorner();
        let sx = 1;
        let sy = 1;
        if (scale != undefined) {

            sx = scale;
            sy = scale;
        }

        if (shiftx == undefined) shiftx = 0;
        if (shifty == undefined) shifty = 0;

        c.moveTo(-Math.round(sx * this.topCorner.x + shiftx), 
            -Math.round(sy * this.topCorner.y + shifty));
    }


    // Get top corner
    getTopCorner() {

        return new Vector2(
            this.pos.x - this.width/2,
            this.pos.y - this.height/2 
        );
    }
}