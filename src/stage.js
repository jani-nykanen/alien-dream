/**
 * Renders the stage and handles
 * collisions
 * 
 * (c) 2020 Jani Nykänen
 */

import { negMod, clamp } from "./core/util.js";


class Layer {

    constructor(data, index) {

        this.data = data.cloneLayer(index);
        this.width = data.width;
        this.height = data.height;
    }
}



export class Stage {


    constructor(assets, index) {

        this.layers = new Array();
        this.layers.push(new Layer(assets.tilemaps.background, 0));
        this.layers.push(new Layer(assets.tilemaps["map" + String(index)], 0));

        this.collisionData = assets.tilemaps.collision.cloneLayer(0);
        this.collisionData[-1] = 0;

        this.width = this.layers[1].width;
        this.height = this.layers[1].height;
    }


    // Get a tile (generic)
    getTile(layer, x, y, loop) {

        let l = this.layers[layer];

        if (loop) {

            x = negMod(x, l.width);
            y = negMod(y, l.height);
        }
        else if (x < 0 || y < 0 || x >= l.width || y >= l.height)
            return 0;

        return l.data[y*l.width+x];
    }


    // Draw a tile layer
    drawLayer(c, bmp, layer, startx, starty, endx, endy) {

        let tid = 0;
        let sx = 0;
        let sy = 0;
        for (let y = starty; y < (endy | 0); ++ y) {

            for (let x = startx; x < (endx | 0); ++ x) {

                tid = this.getTile(layer, x, y, true);
                if (tid == 0) continue;

                -- tid;
                sx = tid % 16;
                sy = (tid / 16) | 0;

                c.drawBitmapRegion(bmp, 
                    sx*16, sy*16, 16, 16,
                    x*16, y*16);
            }
        }
    }


    // Get solid tile info
    getSolidIndex(x, y) {

        return this.collisionData[this.getTile(1, x, y, false)-1];
    }


    // Object collision
    objectCollision(o, ev) {

        const MARGIN = 2;

        let startx = Math.floor(o.pos.x / 16) - MARGIN;
        let starty = Math.floor(o.pos.y / 16) - MARGIN;

        let endx = startx + MARGIN*2;
        let endy = starty + MARGIN*2;

        let sindex = 0;
        for (let y = starty; y < endy; ++ y) {

            for (let x = startx; x < endx; ++ x) {

                sindex = this.getSolidIndex(x, y);
                if (sindex == 0) continue;

                if (sindex == 1) {

                    o.floorCollision(x*16, y*16, 16, ev);
                }
            }
        }
    }


    // Draw the stage
    draw(c, bmp, cam) {

        let startx = ((cam.pos.x / 16) | 0) -1;
        let starty = ((cam.pos.y / 16) | 0) -1;

        let endx = startx + ((cam.width/16) | 0) + 2;
        let endy = starty + ((cam.height/16) | 0) + 2;

        // Draw the background
        this.drawLayer(c, bmp, 0, startx, starty, endx, endy);
        // Draw the base tiles
        this.drawLayer(c, bmp, 1, startx, starty, endx, endy);
    }
}
