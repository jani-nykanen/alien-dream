/**
 * Renders the stage and handles
 * collisions
 * 
 * (c) 2020 Jani Nykänen
 */

import { negMod, clamp } from "./core/util.js";


export class Stage {


    constructor(assets, index) {

        let map = assets.tilemaps["map" + String(index)];
        let bg = assets.tilemaps.background;

        this.data = map.cloneLayer(0);
        this.bgData = bg.cloneLayer(0);

        this.width = map.width;
        this.height = map.height;

        this.bgWidth = bg.width;
        this.bgHeight = bg.height;
    }


    // Get a tile
    getTile(x, y) {

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return 0;

        return this.data[y*this.width+x];
    }

    
    // Get a background tile
    getBackgroundTile(x, y) {

        x = negMod(x, this.bgWidth);
        y = clamp(y, 0, this.bgHeight-1);

        return this.bgData[y*this.bgWidth+x];
    }


    // Draw the stage
    draw(c, bmp, cam) {

        let startx = ((cam.pos.x / 16) | 0) -1;
        let starty = ((cam.pos.y / 16) | 0) -1;

        let endx = startx + ((cam.width/16) | 0) + 2;
        let endy = starty + ((cam.height/16) | 0) + 2;

        c.moveTo();

        // Draw the background
        let tid = 0;
        let sx, sy;
        for (let y = 0; y < c.height/16; ++ y) {

            for (let x = 0; x < c.width/16; ++ x) {

                tid = this.getBackgroundTile(x, y);
                if (tid == 0) continue;

                -- tid;
                sx = tid % 16;
                sy = (tid / 16) | 0;

                c.drawBitmapRegion(bmp, 
                    sx*16, sy*16, 16, 16,
                    x*16, y*16);
            }
        }

        // Use camera for base tiles
        cam.use(c);

        // Draw the base layer
        tid = 0;
        for (let y = starty; y < endy; ++ y) {

            for (let x = startx; x < endx; ++ x) {

                tid = this.getTile(x, y);
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
}
