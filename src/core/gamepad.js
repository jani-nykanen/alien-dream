import { Vector2 } from "./vector.js";
import { State } from "./input.js";

/**
 * Handles gamepads
 * 
 * (c) 2020 Jani Nykänen
 */


export class GamePadListener {


    constructor() {

        this.stick = new Vector2();

        this.buttons = new Array ();

        this.pad = null;
        this.index = 0;

        window.addEventListener("gamepadconnected", (ev) => {

            let e = ev;
            let n = navigator;

            let func = n.getGamepads ?  
                n.getGamepads : 
                n.webkitGetGamepad;
            if (func == null)
                return;

            let gp = n.getGamepads()[e.gamepad.index];
            this.index = e.gamepad.index;
            this.pad = gp;

            // Update stuff
            this.updateGamepad(this.pad);
        });

    }


    // Get gamepads available
    pollGamepads() {

        let n = navigator;

        // Just in case...
        if (n == null)
            return null;

        return n.getGamepads ? 
            n.getGamepads() : 
            (n.webkitGetGamepads ? 
            n.webkitGetGamepads : 
                null);
    }


    // Update buttons
    updateButtons(pad) {

        if (pad == null) {

            for (let i = 0; i < this.buttons.length; ++ i) {

                this.buttons[i] = State.Up;
            }
            return;
        }

        // Go through all the buttons in the gamepad
        for (let i = 0; i < pad.buttons.length; ++ i) {

            // Make sure the button exists in the array
            if (i >= this.buttons.length) {

                for (let j = 0; j < i-this.buttons.length; ++ j) {

                    this.buttons.push(State.Up);
                }
            }

            if (pad.buttons[i].pressed) {

                if (this.buttons[i] == State.Up ||
                    this.buttons[i] == State.Released) {
                    
                    this.buttons[i] = State.Pressed;
                    // this.anyPressed = true;
                }
                else {

                    this.buttons[i] = State.Down;
                }
            }
            else {

                if (this.buttons[i] == State.Down ||
                    this.buttons[i] == State.Pressed) {

                    this.buttons[i] = State.Released;
                }
                else {

                    this.buttons[i] = State.Up;
                }
            }
        }
    }


    // Update "analogue" stick
    updateStick(pad) {
        
        const EPS1 = 0.1;
        const EPS2 = 0.05;

        if (pad != null) {
            
            this.stick.x = 0;
            this.stick.y = 0;

            if (Math.hypot(pad.axes[0], pad.axes[1]) > EPS2) {

                this.stick.x = pad.axes[0];
                this.stick.y = pad.axes[1];
            }

            // On Firefox dpad is considered
            // axes, not buttons
            if (pad.axes.length >= 8 &&
                Math.hypot(this.stick.x, this.stick.y) < EPS1 &&
                Math.hypot(pad.axes[6], pad.axes[7]) > EPS2) {

                this.stick.x = pad.axes[6];
                this.stick.y = pad.axes[7];
            }
        }
    }


    // Update gamepad
    updateGamepad(pad) {
        
        this.updateStick(pad);
        this.updateButtons(pad);
    }


    // Refresh state
    refresh() {

        // No gamepad available, quit
        if (this.pad == null) return;

        // Poll gamepads
        let pads = this.pollGamepads();
        if (pads == null) 
            return;
        this.pad = pads[this.index];
    }


    // Update
    update() {

        // this.anyPressed = false;

        // Reset stick
        this.stick.x = 0.0;
        this.stick.y = 0.0;

        // Refresh available gamepads
        this.refresh();

        // Update the current gamepad
        this.updateGamepad(this.pad);
    }


    // Get button state
    getButtonState(id) {

        if (id == null ||
            id < 0 || 
            id >= this.buttons.length)
            return State.Up;

        return this.buttons[id];
    }
}
