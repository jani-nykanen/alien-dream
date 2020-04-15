/**
 * Handles event data
 * 
 * (c) 2020 Jani Nykänen
 */


export class RunnerEvent {

    constructor(framerate, assets, input, tr, audio, core) {

        this.step = 60.0 / framerate;

        this.assets = assets;
        this.input = input;
        this.tr = tr;
        this.audio = audio;
        this.core = core;
    }


    // Change the scene
    changeScene(newScene) {

        this.core.changeScene(newScene);
    }
}
