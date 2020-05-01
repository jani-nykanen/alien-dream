/**
 * Renders the stage and handles
 * collisions
 * 
 * (c) 2020 Jani Nykänen
 */

import { negMod, clamp } from "./core/util.js";
import { Coin, Heart, LifeUp } from "./collectable.js";
import { Walker, Slime, Dog, ImpVertical, ImpHorizontal, SpikeyWalker, Jumper, Bird, Ghost, Flame, Bullet, VerticalFireball1, VerticalFireball2 } from "./enemy.js";
import { Vector2 } from "./core/vector.js";
import { Sprite } from "./core/sprite.js";
import { newGameObject } from "./gameobject.js";


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



export class BreakingWall {

    constructor() {

        this.pos = new Vector2();
        this.exist = false;
        this.spr = new Sprite(16, 16);
        this.animSpeed = 0;
    }


    // Spawn
    spawn(x, y, speed, row) {

        this.pos.x = x;
        this.pos.y = y;
        this.animSpeed = speed;
        this.spr.setFrame(row, 0);

        this.exist = true;
    }


    // Update
    update(ev) {

        if (!this.exist) return;

        this.spr.animate(this.spr.row, 0, 4, this.animSpeed, ev.step);
        if (this.spr.frame == 4) {

            this.exist = false;
        }
    }


    // Draw
    draw(c) {

        if (!this.exist) return;

        c.drawSprite(this.spr, c.bitmaps.breakingWall,
            this.pos.x, this.pos.y);
    }
}



export class Stage {


    constructor(assets, index) {

        // To make sure Closure won't go nuts
        this.baseMap = null;
        this.background = null;
        this.bgmode = null
        this.base = null;
        this.objects = null;
        this.collisionData = null;

        this.createLayers(assets, index);

        this.width = this.base.width;
        this.height = this.base.height;

        this.wallPieces = new Array();

        this.lavaSprite = new Sprite(16, 16);

        this.index = index;

        this.resetPlayer = true;
    }


    // Create layers
    createLayers(assets, index) {

        this.baseMap = assets.tilemaps["map" + String(index)];

        this.background = new Layer(
            assets.tilemaps[this.baseMap.properties.background], 
            0);
        this.bgmode = Number(this.baseMap.properties.bgmode);
        this.base = new Layer(this.baseMap, 0);
        this.objects = new Layer(this.baseMap, 1);

        this.collisionData = assets.tilemaps.collision.cloneLayer(0);
        this.collisionData[-1] = 0;

        this.width = this.base.width;
        this.height = this.base.height;
    }


    // Reset
    reset() {

        this.base = new Layer(this.baseMap, 0);
        for (let w of this.wallPieces) {

            w.exist = false;
        }
        this.resetPlayer = true;
    }


    // Switch to next
    switchNext(assets) {
        
        this.resetPlayer = false;

        ++ this.index;
        this.createLayers(assets, this.index);
    }


    // Get a tile (generic)
    getTile(layer, x, y, loop) {

        return layer.getValue(x, y, loop);
    }


    // Get solid tile info
    getSolidIndex(x, y) {

        return this.collisionData[this.getTile(this.base, x, y, false)-1];
    }


    // Create a breaking wall
    createBreakingWall(x, y) {

        (newGameObject(this.wallPieces, BreakingWall)).spawn(
            x, y, 4, 0
        );

    }


    // Object collision
    objectCollision(o, objm, ev) {

        if (!o.exist || o.dying) return;

        const MARGIN = 2;
        const LAVA_MARGIN = 6;

        const FLOOR = [0, 4, 6, 7, 10, 11, 13, 14, 15, 16];
        const CEILING = [2, 4, 8, 9, 11, 12, 13, 14, 15, 16];
        const WALL_LEFT = [3, 5, 6, 9, 10, 12, 13, 14, 15, 16];
        const WALL_RIGHT = [1, 5, 7, 8, 10, 11, 12, 14, 15, 16];
        const SPECIAL_1 = [15];
        const SPECIAL_2 = [16];
        const HURT = [17];

        let startx = Math.floor(o.pos.x / 16) - MARGIN;
        let starty = Math.floor(o.pos.y / 16) - MARGIN;

        let endx = startx + MARGIN*2;
        let endy = starty + MARGIN*2;

        let sindex = 0;
        let special = 0;
        for (let y = starty; y < endy; ++ y) {

            for (let x = startx; x < endx; ++ x) {

                sindex = this.getSolidIndex(x, y);
                if (sindex == 0) continue;
                -- sindex;

                special = 0;
                if (SPECIAL_1.includes(sindex))
                    special = 1;
                else if (SPECIAL_2.includes(sindex))
                    special = 2;

                if (FLOOR.includes(sindex)) {

                    o.floorCollision(x*16, y*16, 16, ev);
                }
                if (CEILING.includes(sindex)) {

                    if (o.ceilingCollision(x*16, y*16+16, 16, ev) &&
                        objm != null &&
                        special > 0) {

                        if (special == 1)
                            ++ this.base.data[y*this.width+x];

                        else {

                            this.createBreakingWall(x*16, y*16);
                            this.base.data[y*this.width+x] = 0;
                        }
                        
                        ev.audio.playSample(ev.audio.samples.breakWall, 0.45);

                        objm.spawnItem(
                            [Coin, LifeUp, Heart] [clamp(this.objects.getValue(x, y, false)-258, 0, 2)],
                            x*16+8, y*16)
                    }
                }
                if (WALL_LEFT.includes(sindex)) {

                    o.wallCollision(x*16, y*16, 16, 1, ev);
                }
                if (WALL_RIGHT.includes(sindex)) {

                    o.wallCollision(x*16+16, y*16, 16, -1, ev);
                }

                if (HURT.includes(sindex) && o.hurtCollision != undefined) {

                    o.hurtCollision(x*16, y*16+LAVA_MARGIN, 
                        16, 16-LAVA_MARGIN, ev);
                }
            }
        }

        // Border collisions
        o.wallCollision(0, 0, this.height*16, -1, ev);
        o.wallCollision(this.width*16, 0, this.height*16, 1, ev);

        if (o.hurtCollision != undefined) {

            o.hurtCollision(0, this.height*16, 
                this.width*16, 256, ev, true);
        }
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

                    objm.addFlag(x*16, y*16, true);

                    if (this.resetPlayer)
                        objm.player.pos = new Vector2(x*16+8, (y+1)*16);
                    else {

                        objm.player.boomerang.pos.x -= objm.player.pos.x - (x*16+8);
                        objm.player.pos.x = x*16 + 8;
                    }

                    break;

                // Coin 
                case 2: 
                    objm.addItem(Coin, x*16, y*16);
                    break;

                // Flag
                case 5:
                    objm.addFlag(x*16, y*16, false);
                    break;

                // TODO: Replace with 'if', please...
                case 17:
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 23:
                case 24:
                case 25:
                case 26:
                case 27:
                case 28:
                case 29:
                    objm.addEnemy( 
                        [Walker, Slime, Dog, 
                        ImpVertical, ImpHorizontal, SpikeyWalker,
                        Jumper, Bird, Ghost, Flame, Bullet, 
                        VerticalFireball1, VerticalFireball2] [t-17], 
                        x*16, y*16);
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

                // If animated
                if (this.getSolidIndex(x, y) == 18) {

                    sx += this.lavaSprite.frame;
                }

                c.drawBitmapRegion(bmp, 
                    sx*16, sy*16, 16, 16,
                    x*16, y*16);
            }
        }
    }


    // Update (general)
    update(ev) {

        const LAVA_ANIM_SPEED = 10;

        this.lavaSprite.animate(0, 0, 2, LAVA_ANIM_SPEED, ev.step);

        for (let w of this.wallPieces) {

            w.update(ev);
        }
    }


    // Draw the stage
    draw(c, bmp, cam) {

        const SCALE = 0.5;

        let bgScale = this.bgmode == 0 ? SCALE : 1.0;

        // Draw the background
        cam.use(c, bgScale);
        this.drawLayer(c, bmp, this.background, 
            cam.topCorner.scale(bgScale), cam);

        // Draw the base tiles
        cam.use(c);
        this.drawLayer(c, bmp, this.base, cam.topCorner, cam);

        // Draw the breaking tiles
        for (let w of this.wallPieces) {

            w.draw(c);
        }
    }
}
