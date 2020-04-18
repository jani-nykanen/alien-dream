/**
 * Handles game objects
 * 
 * (c) 2020 Jani Nykänen
 */

import { Player } from "./player.js";


export class ObjectManager {


    constructor(stage) {

        this.player = new Player(32, stage.height*16-48);
    }


    // Update
    update(stage, cam, ev) {

        this.player.update(ev);
        stage.objectCollision(this.player, ev);
        stage.objectCollision(this.player.boomerang, ev);

        this.player.floorCollision(0, 256-8, 160, ev);

        cam.followObject(this.player, ev);
    }


    // Draw
    draw(c) {

        this.player.draw(c);
    }
}
