/**
 * A simple HUD
 * 
 * (c) 2020 Jani Nykänen
 */

import { createScoreString } from "./core/util.js";


export class HUD {

    constructor() {

        this.coins = 87;
        this.lives = 5;

        this.maxHealth = 3;
        this.health = this.maxHealth -1;

        this.time = 300;
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
        c.drawText(c.bitmaps.fontSmall, "\"!" + createScoreString(this.lives, 2), 
            40, 144-8, 0, 0);

        // Draw coins
        c.drawText(c.bitmaps.fontSmall, "%!" + createScoreString(this.coins, 2), 
            80, 144-8, 0, 0);

        // Draw time
        c.drawText(c.bitmaps.fontSmall, "&" + createScoreString(this.time, 3), 
            120, 144-8, 0, 0);
    }
}