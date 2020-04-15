import { Vector2 } from "./vector.js";
import { GamePadListener } from "./gamepad.js";

/**
 * Input manager
 * 
 * (c) 2020 Jani Nykänen
 */



export const State = {

    Up : 0, 
    Released : 2,

    Down : 1, 
    Pressed : 3, 

    DownOrPressed : 1,
    UpOrReleased : 0,
}


class Action {


    constructor(key, button1, button2) {

        this.key = key;
        this.button1 = button1;
        this.button2 = button2;
        this.state = State.Up;
    }

}


export class InputManager {


    constructor() {

        this.keyStates = new Array();
        this.prevent = new Array();
        this.actions = new Array();

        // Push some actions
        this.addAction("left", "ArrowLeft", 14)
        this.addAction("up", "ArrowUp", 12)
        this.addAction("right", "ArrowRight", 15)
        this.addAction("down", "ArrowDown", 13)

        this.stick = new Vector2();
        this.oldStick = new Vector2();
        this.stickDelta = new Vector2();
        this.pad = new GamePadListener();

        this.anyPressed = false;

        // Set listeners
        window.addEventListener("keydown", 
            (e) => {

                if (this.keyPressed(e.code)) 
                    e.preventDefault();
            });
        window.addEventListener("keyup", 
            (e) => {

                if (this.keyReleased(e.code))
                    e.preventDefault();
            });   
    

        // Disable context menu
        window.addEventListener("contextmenu", (e) => {

            e.preventDefault();
        });

        // To get focus only
        window.addEventListener("mousemove", (e) => {

            window.focus();
        });
        window.addEventListener("mousedown", (e) => {

            window.focus();
        });

    }


    // Add an action
    addAction(name, key, button1, button2) {

        this.actions[name] = new Action(key, button1, button2);
        this.prevent[key] = true;

        return this;
    }


    // Called when a key pressed
    keyPressed(key) {

        if (this.keyStates[key] != State.Down) {

            this.anyPressed = true;
            this.keyStates[key] = State.Pressed;
        }

        return this.prevent[key];
    }


    // Called when a key released
    keyReleased(key) {

        if (this.keyStates[key] != State.Up)
            this.keyStates[key] = State.Released;

        return this.prevent[key];
    }


    // Update an array of states
    updateStateArray(arr) {

        for (let k in arr) {

            if (arr[k] == State.Pressed)
                arr[k] = State.Down;

            else if(arr[k] == State.Released) 
                arr[k] = State.Up;
        }
    }


    // Update input states
    update() {

        const EPS = 0.01;

        this.anyPressed = false;

        // Update actions
        for (let k in this.actions) {

            // Check keyboard
            this.actions[k].state = this.getKeyState(this.actions[k].key);

            // Check gamepad
            if (this.actions[k].state == State.Up) {

                this.actions[k].state = this.pad.getButtonState(this.actions[k].button1);
                if (this.actions[k].state == State.Up) {

                    this.actions[k].state = this.pad.getButtonState(this.actions[k].button2);
                }
            }
        }

        // Update stick
        this.oldStick = this.stick.clone();
        this.stick = new Vector2();
        if ((this.actions.left.state & State.DownOrPressed) == 1) {

            this.stick.x = -1.0;
        }
        else if ((this.actions.right.state & State.DownOrPressed) == 1) {

            this.stick.x = 1.0;
        }

        if ((this.actions.up.state & State.DownOrPressed) == 1) {

            this.stick.y = -1.0;
        }
        else if ((this.actions.down.state & State.DownOrPressed) == 1) {

            this.stick.y = 1.0;
        }

        // Normalize to get emulated "analogue stick"
        // behavior
        // this.stick.normalize();

        if (Math.hypot(this.stick.x, this.stick.y) < EPS &&
            Math.hypot(this.pad.stick.x, this.pad.stick.y) > EPS) {

            this.stick.x = this.pad.stick.x;
            this.stick.y = this.pad.stick.y;
        }
        
        // Update state array(s)
        this.updateStateArray(this.keyStates);
        // Update gamepad
        this.pad.update();

        this.stickDelta = new Vector2(
            this.stick.x - this.oldStick.x,
            this.stick.y - this.oldStick.y
        );
    }


    // Prevent a key
    preventDefault(key) {

        this.prevent[key] = true;
    }


    // Getters
    isAnyPressed = () => this.anyPressed;
    getKeyState = (key) => this.keyStates[key] | State.Up;
    getMouseButtonState = (b) => this.mouse.buttons[b] | State.Up;
}
