/**
 * Handles game objects
 * 
 * (c) 2020 Jani Nykänen
 */

import { Player } from "./player.js";


export class ObjectManager {


    constructor(stage) {

        this.player = new Player(32, stage.height*16-48);
        this.items = new Array();
    }


    // Add an item
    addItem(type, x, y) {

        this.items.push(new type.prototype.constructor(x+8, y+8));
    }


    // Update
    update(stage, cam, hud, ev) {

        // Update player
        this.player.update(ev);
        stage.objectCollision(this.player, ev);
        stage.objectCollision(this.player.boomerang, ev);
        cam.followObject(this.player, ev);

        // Update collectables
        for (let o of this.items) {

            o.update(ev);
            this.player.objectCollision(o, true, ev);
        }

        hud.updateStats(this.player);
    }


    // Draw
    draw(c) {

        // Draw collectables
        for (let o of this.items) {

            o.draw(c);
        }

        // Draw player
        this.player.draw(c);
    }
}

