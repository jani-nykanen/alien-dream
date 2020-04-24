import { Menu, MenuButton } from "./menu.js";
import { Game } from "./game.js";

/**
 * "Enable audio" scene
 * 
 * (c) 2020 Jani Nykänen
 */


export class AudioIntro {


    constructor() {

        this.menu = new Menu(12, true,
            [
                new MenuButton(
                    "YES", (ev) => {

                        ev.audio.toggle(true);
                        ev.audio.setGlobalSampleVolume(0.70);
                        ev.changeScene(Game);
                    }
                ),
                new MenuButton(
                    "NO", (ev) => {

                        ev.audio.toggle(false);
                        ev.changeScene(Game);
                    }
                )
            ]);
    }


    // Update
    update(ev) {

        this.menu.update(ev);
    }


    // Draw
    draw(c) {

        c.clear(0, 132, 173);

        c.drawText(c.bitmaps.font,
            "ENABLE AUDIO?\nPRESS ENTER\nTO CONFIRM.",
            32, c.height/2 - 32, 0, 2, false);

        this.menu.draw(c, c.width/2, c.height/2+16);
    }

}