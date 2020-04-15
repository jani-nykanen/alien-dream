import { Canvas } from "./canvas.js";
import { Assets } from "./assets.js";
import { InputManager } from "./input.js";
import { RunnerEvent } from "./event.js";
import { Transition } from "./transition.js";
import { AudioPlayer } from "./audioplayer.js";

/**
 * Contains everything that runs
 * "behind the scenes"
 * 
 * (c) 2020 Jani Nykänen
 */


export class Runner {


    constructor(cfg) {

        this.assets = new Assets();
        this.canvas = new Canvas(
            cfg.canvasWidth, cfg.canvasHeight, 
            this.assets);
        this.input = new InputManager(this.canvas);
        this.tr = new Transition();
        this.audio = new AudioPlayer(this.assets.samples);

        this.ev = new RunnerEvent(
            cfg.frameRate != null ? cfg.frameRate : 60.0, 
            this.assets, this.input,
            this.tr, this.audio , this);

        this.activeScene = null;
        this.initialized = false;

        this.oldTime = 0;
        this.timeSum = 0;

        // Define some event listeners
        window.addEventListener("resize",
        () => {
            this.canvas.resize(window.innerWidth, 
                window.innerHeight)
        });
    }


    // Set assets loading
    loadAssets(path) {

        this.assets.loadAssets(path);

        return this;
    }


    // Draw the loading screen
    drawLoadingScreen(c) {

        let barHeight = c.height / 16;
        let barWidth = barHeight * 8;
    
        let outline = (barHeight / 8) | 0;

        c.clear(0);
        c.moveTo();

        let t = this.assets.dataLoadedPercentage();
        let x = c.width/2 - barWidth/2;
        let y = c.height/2 - barHeight/2;

        x |= 0;
        y |= 0;
    
        // Draw outlines
        c.setColor(255);
        c.fillRect(x-2*outline, y-2*outline, 
            barWidth+4*outline, barHeight+4*outline);
        c.setColor(0);
        c.fillRect(x-outline, y-outline, 
            barWidth+outline*2, barHeight+outline*2);
    
        // Draw bar
        let w = (barWidth*t) | 0;
        c.setColor(1);
        c.fillRect(x, y, w, barHeight);
    }


    // The main loop
    loop(ts) {

        // In the case refresh rate gets too low,
        // we don't want the game update its logic
        // more than 5 times (i.e. the minimum fps
        // is 60 / 5 = 12)
        const MAX_REFRESH = 5;

        let target = (1000.0 / 60.0) / this.ev.step;

        this.timeSum += ts - this.oldTime;

        // Compute target loop count
        let loopCount = Math.floor(this.timeSum / target) | 0;
        if (loopCount > MAX_REFRESH) {

            this.timeSum = MAX_REFRESH * target;
            loopCount = MAX_REFRESH;
        }

        // Update game logic
        while ( (loopCount --) > 0) {

            if (this.assets.hasLoaded()) {

                if (!this.initialized) {

                    // Initialize the initial scene
                    if (this.activeScene != null &&
                        this.activeScene.activate != null) {

                        this.activeScene.activate(null, this.ev);
                    }
                    this.initialized = true;
                }

                // Update the active scene
                if (this.activeScene != null &&
                    this.activeScene.update != null) {

                    this.activeScene.update(this.ev);
                }

                // Update the transition
                this.tr.update(this.ev);
                // Update canvas
                this.canvas.update(this.ev);
            }

            // Update input
            this.input.update();

            this.timeSum -= target;
        }

        // (Re)draw the scene
        if (this.assets.hasLoaded()) {

            if (this.initialized &&
                this.activeScene != null &&
                this.activeScene.draw != null) {

                this.activeScene.draw(this.canvas);
            }
        }
        else {

             // Draw the loading screen
            this.drawLoadingScreen(this.canvas);
        }

        // Draw transition
        this.tr.draw(this.canvas);

        this.oldTime = ts;

        // Next frame
        window.requestAnimationFrame( 
            (ts) => this.loop(ts) 
        );
    }


    // Add actions to the input manager
    addInputActions() {

        for (let a of arguments) {

            this.input.addAction(
                a.name, a.key, a.button1, a.button2
            );
        }

        return this;
    }


    // Start the application with the initial scene
    run(scene) {

        this.activeScene = new scene.prototype.constructor();
        this.loop(0);
    }


    // Change the scene
    changeScene(newScene) {

        let s = new newScene.prototype.constructor();
        let param = this.activeScene.dispose != undefined ? 
            this.activeScene.dispose() : null;
        if (s.activate != undefined) {

            s.activate(param, this.ev);
        }

        this.activeScene = s;
    }
}
