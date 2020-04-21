/**
 * Handles game objects
 * 
 * (c) 2020 Jani Nykänen
 */

import { Player } from "./player.js";
import { Coin } from "./collectable.js";


export class ObjectManager {


    constructor() {

        this.player = new Player(0, 0);
        this.items = new Array();
        this.enemies = new Array();
    }


    // Reset
    reset() {

        let lives = this.player.lives;
        this.player = new Player(0, 0);
        this.player.lives = lives;

        this.items = new Array();
        this.enemies = new Array();
    }


    // Do the initial camera check
    initialCameraCheck(cam) {

        for (let e of this.enemies) {

            e.checkIfInCamera(cam);
        }
        for (let i of this.items) {

            i.checkIfInCamera(cam);
        }
    }


    // Add an item
    addItem(type, x, y) {

        this.items.push(new type.prototype.constructor(x+8, y+8));
    }


    // Add an enemy
    // TODO: Merge with the above
    addEnemy(type, x, y) {

        this.enemies.push(new type.prototype.constructor(x+8, y+8));
    }


    // Spawn an item
    spawnItem(type, x, y, speed) {

        const DEF_SPEED = -2.0;

        if (speed == undefined) speed = DEF_SPEED;

        let o = new type.prototype.constructor(x, y);
        o.spawn(x, y, speed);
        
        // Set animation to correspond with the other items
        for (let i of this.items) {

            if (o == i) continue;

            if (o.exist) {

                o.spr.frame = i.spr.frame;
                o.spr.count = i.spr.count;
                break;
            }
        }

        for (let i = 0; i < this.items.length; ++ i) {

            if (!this.items[i].exist) {

                this.items[i] = o;
                return;
            }
        }
        this.items.push(o);
    }


    // Update
    update(stage, cam, hud, ev) {

        // Update player
        this.player.update(ev);
        if (!this.player.dying && this.player.exist) {

            stage.objectCollision(this.player, this, ev);
            stage.objectCollision(this.player.boomerang, null, ev);
            cam.followObject(this.player, stage, ev);
        }

        // Update collectables
        for (let o of this.items) {
            
            o.update(ev);
            o.checkIfInCamera(cam);

            if (!o.inCamera) continue;

            this.player.objectCollision(o, true, ev);
            stage.objectCollision(o, null, ev); 
        }

        // Update enemies
        for (let o of this.enemies) {

            if (o.inCamera) {

                o.checkPlayer(this.player);
                o.checkCamera(cam);
            }
            o.update(ev);
            o.checkIfInCamera(cam);

            if (!o.inCamera) continue;

            if (!o.dying) {

                this.player.objectCollision(o, true, ev);
                this.player.boomerang.objectCollision(o, true, ev);

                // I don't want to pass object manager
                // to collision effects, so this works fine enough
                if (o.dying) {

                    this.spawnItem(Coin, o.pos.x, o.pos.y, 0.0);
                }
            }

            stage.objectCollision(o, null, ev); 
        }

        hud.updateStats(this.player);
    }


    // Is the player dead
    isPlayerDead = () => !this.player.exist;


    // Draw
    draw(c) {

        // Draw collectables
        for (let o of this.items) {

            o.draw(c);
        }

        // Draw objects
        for (let o of this.enemies) {

            o.draw(c);
        }

        // Draw player
        this.player.draw(c);
    }
}

