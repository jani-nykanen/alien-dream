/**
 * A simple camera
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./core/vector.js";


export class Camera {

    constructor(x, y, w, h) {

        this.pos = new Vector2(x, y);
        this.width = w;
        this.height = h;
    }


    // Use the camera
    use(c) {

        c.moveTo(-this.pos.x, -this.pos.y);
    }
}