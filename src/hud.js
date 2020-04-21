/**
 * A simple HUD
 * 
 * (c) 2020 Jani Nykänen
 */

import { createScoreString } from "./core/util.js";


const INITIAL_TIME = 300;


export class HUD {

    constructor() {

        this.coins = 0;
        this.lives = 5;
        this.maxHealth = 3;
        this.health = this.maxHealth;

        this.time = INITIAL_TIME;
    }


    // Reset
    reset() {

        this.health = this.maxHealth;
        this.time = INITIAL_TIME;
    }


    // Update
    update(ev) {

        this.time -= (1.0/60.0 * ev.step);
    }


    // Update stats
    updateStats(player) {

        this.coins = player.coins;
        this.health = player.health;
        this.maxHealth = player.maxHealth;
        this.lives = player.lives;
    }


    // Draw
    draw(c) {

        c.setColor(0);
        c.fillRect(0, 144-8, 160, 8);

        // Draw lives
        let sx = 0;
        for (let i = 0; i < this.maxHealth; ++ i) {

            sx = this.health > i ? 24 : 32;

            c.drawBitmapRegion(c.bitmaps.fontSmall, sx, 16, 8, 8,
                8 + i*8, 144-8);
        }

        // Draw lives
        c.drawText(c.bitmaps.fontSmall, 
            "\"!" + createScoreString(this.lives, 2), 
            40, 144-8, 0, 0);

        // Draw coins
        c.drawText(c.bitmaps.fontSmall, 
            "%!" + createScoreString(this.coins, 2), 
            80, 144-8, 0, 0);

        // Draw time
        c.drawText(c.bitmaps.fontSmall, 
            "&" + createScoreString(Math.ceil(this.time), 3), 
            120, 144-8, 0, 0);
    }
}