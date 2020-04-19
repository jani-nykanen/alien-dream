/**
 * Renders the stage and handles
 * collisions
 * 
 * (c) 2020 Jani Nykänen
 */

import { negMod, clamp } from "./core/util.js";
import { Coin, Heart } from "./collectable.js";
import { Walker, Slime, Dog } from "./enemy.js";
import { Vector2 } from "./core/vector.js";


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

        // Create layers
        this.background = new Layer(assets.tilemaps.background, 0);
        this.base = new Layer(baseMap, 0);
        this.objects = new Layer(baseMap, 1);

        this.collisionData = assets.tilemaps.collision.cloneLayer(0);
        this.collisionData[-1] = 0;

        this.width = this.base.width;
        this.height = this.base.height;

    }


    // Get a tile (generic)
    getTile(layer, x, y, loop) {

        return layer.getValue(x, y, loop);
    }


    // Get solid tile info
    getSolidIndex(x, y) {

        return this.collisionData[this.getTile(this.base, x, y, false)-1];
    }


    // Object collision
    objectCollision(o, objm, ev) {

        if (!o.exist || o.dying) return;

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
                        objm != null &&
                        SPECIAL_1.includes(sindex)) {

                        ++ this.base.data[y*this.width+x];
                        objm.spawnItem(
                            (this.objects.getValue(x, y, false)-256) == 4 ? Heart : Coin, 
                            x*16+8, y*16)
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

        // Border collisions
        o.wallCollision(0, 0, this.height*16, -1, ev);
        o.wallCollision(this.width*16, 0, this.height*16, 1, ev);
    }


    // Parse objects
    parseObjects(objm) {

        let t = 0;
        for (let y = 0; y < this.objects.height; ++ y) {

            for (let x = 0; x < this.objects.width; ++ x) {

                t = this.objects.getValue(x, y) - 256;
                switch(t) {

                // Player
                case 1:

                    objm.player.pos = new Vector2(x*16+8, (y+1)*16);
                    break;

                // Coin 
                case 2: 
                    objm.addItem(Coin, x*16, y*16);
                    break;

                // Walker
                case 17:
                case 18:
                case 19:
                    objm.addEnemy( [Walker, Slime, Dog] [t-17], x*16, y*16);
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
        this.drawLayer(c, bmp, this.background, 
            cam.topCorner.scale(SCALE), cam);

        // Draw the base tiles
        cam.use(c);
        this.drawLayer(c, bmp, this.base, cam.topCorner, cam);
    }
}
