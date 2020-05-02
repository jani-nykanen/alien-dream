
/**
 * Ending
 * 
 * (c) 2020 Jani Nykänen
 */


const ENDING_TEXT = "You were never\nseen again.\n\nThe End.";
const CHAR_TIME = 6;


export class Ending {


    constructor() {

       this.timer = 0;
       this.charCount = 0;
    }


    // Activate
    activate(param, ev) {

        this.timer = 0;
        this.charCount = 0;
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;
    
        if (this.charCount < ENDING_TEXT.length &&
            (this.timer += ev.step) >= CHAR_TIME) {

            this.timer -= CHAR_TIME;
            ++ this.charCount;
        }
    }


    // Draw
    draw(c) {

        c.clear(0);
    
        c.drawText(c.bitmaps.font, ENDING_TEXT.substr(0, this.charCount),
            16, 56, 0, 0, false);
    }

}
