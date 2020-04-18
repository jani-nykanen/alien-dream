/**
 * Handles game objects
 * 
 * (c) 2020 Jani Nykänen
 */

import { Player } from "./player.js";
import { newGameObject } from "./gameobject.js";


export class ObjectManager {


    constructor(stage) {

        this.player = new Player(32, stage.height*16-48);
        this.items = new Array();
    }


    // Add an item
    addItem(type, x, y) {

        this.items.push(new type.prototype.constructor(x+8, y+8));
    }


    // Spawn an item
    spawnItem(type, x, y) {

        const SPEED = -2.0;

        let o = newGameObject(this.items, type);
        if (o == null) return;

        o.spawn(x, y, SPEED);
    }


    // Update
    update(stage, cam, hud, ev) {

        // Update player
        this.player.update(ev);
        stage.objectCollision(this.player, this, ev);
        stage.objectCollision(this.player.boomerang, null, ev);
        cam.followObject(this.player, stage, ev);
        this.player.checkIfInCamera(cam);

        // Update collectables
        for (let o of this.items) {
            
            o.update(ev);
            o.checkIfInCamera(cam);

            if (!o.inCamera) continue;

            this.player.objectCollision(o, true, ev);
            stage.objectCollision(o, null, ev); 
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

