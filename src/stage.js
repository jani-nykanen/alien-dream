/**
 * Renders the stage and handles
 * collisions
 * 
 * (c) 2020 Jani Nykänen
 */

import { negMod, clamp } from "./core/util.js";
import { Coin } from "./collectable.js";


class Layer {

    constructor(data, index) {

        this.data = data.cloneLayer(index);
        this.width = data.width;
        this.height = data.height;
    }


    // Get value
    getValue(x, y, loop) {

        if (loop) {

            x = negMod(x, this.width);
            y = negMod(y, this.height);
        }
        else if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return 0;

        return this.data[y*this.width+x];
    }
}



export class Stage {


    constructor(assets, index) {

        let baseMap = assets.tilemaps["map" + String(index)];

        this.layers = new Array();
        this.layers.push(new Layer(assets.tilemaps.background, 0));
        this.layers.push(new Layer(baseMap, 0));

        this.objects = new Layer(baseMap, 1);

        this.collisionData = assets.tilemaps.collision.cloneLayer(0);
        this.collisionData[-1] = 0;

        this.width = this.layers[1].width;
        this.height = this.layers[1].height;

    }


    // Get a tile (generic)
    getTile(layer, x, y, loop) {

        return this.layers[layer].getValue(x, y, loop);
    }


    // Get solid tile info
    getSolidIndex(x, y) {

        return this.collisionData[this.getTile(1, x, y, false)-1];
    }


    // Object collision
    objectCollision(o, ev) {

        const MARGIN = 2;

        const FLOOR = [0, 4, 6, 7, 10, 11, 13, 14, 15];
        const CEILING = [2, 4, 8, 9, 11, 12, 13, 14, 15];
        const WALL_LEFT = [3, 5, 6, 9, 10, 12, 13, 14, 15];
        const WALL_RIGHT = [1, 5, 7, 8, 10, 11, 12, 14, 15];
        const SPECIAL_1 = [15];

        let startx = Math.floor(o.pos.x / 16) - MARGIN;
        let starty = Math.floor(o.pos.y / 16) - MARGIN;

        let endx = startx + MARGIN*2;
        let endy = starty + MARGIN*2;

        let sindex = 0;
        for (let y = starty; y < endy; ++ y) {

            for (let x = startx; x < endx; ++ x) {

                sindex = this.getSolidIndex(x, y);
                if (sindex == 0) continue;
                -- sindex;

                if (FLOOR.includes(sindex)) {

                    o.floorCollision(x*16, y*16, 16, ev);
                }
                if (CEILING.includes(sindex)) {

                    if (o.ceilingCollision(x*16, y*16+16, 16, ev) &&
                        SPECIAL_1.includes(sindex)) {

                        ++ this.layers[1].data[y*this.width+x];
                    }
                }
                if (WALL_LEFT.includes(sindex)) {

                    o.wallCollision(x*16, y*16, 16, 1, ev);
                }
                if (WALL_RIGHT.includes(sindex)) {

                    o.wallCollision(x*16+16, y*16, 16, -1, ev);
                }
            }
        }
    }


    // Parse objects
    parseObjects(objm) {

        for (let y = 0; y < this.objects.height; ++ y) {

            for (let x = 0; x < this.objects.width; ++ x) {

                switch(this.objects.getValue(x, y) - 256) {

                // Coin 
                case 2: 
                    objm.addItem(Coin, x*16, y*16);
                    break;

                default:
                    break;
                }
            }
        }
    }


    // Draw a tile layer
    drawLayer(c, bmp, layer, p, cam) {

        let startx = ((p.x / 16) | 0) -1;
        let starty = ((p.y / 16) | 0) -1;

        let endx = startx + ((cam.width/16) | 0) + 2;
        let endy = starty + ((cam.height/16) | 0) + 2;

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


    // Draw the stage
    draw(c, bmp, cam) {

        const SCALE = 0.5;

        // Draw the background
        cam.use(c, SCALE);
        this.drawLayer(c, bmp, 0, 
            cam.topCorner.scale(SCALE), cam);

        // Draw the base tiles
        cam.use(c);
        this.drawLayer(c, bmp, 1, cam.topCorner, cam);
    }
}
