/**
 * Plays audio (samples & music)
 * 
 * (c) 2020 Jani Nykänen
 */

import { clamp } from "./util.js";


export class AudioPlayer {


    constructor(samples) {

        this.samples = samples;

        this.sampleVol = 1.0;
        this.musicVol = 1.0;

        this.musicID = null;
        this.musicSound = null;
        this.volCache = 0.0;

        this.enabled = false;
    }


    // Set global sample volume
    setGlobalSampleVolume(vol) {

        vol = clamp(vol, 0.0, 1.0);
        this.sampleVol = vol;
    }


    // Toggle
    toggle(state) {

        let musicExist = this.musicSound != null && 
            this.musicID != null;

        this.enabled = state;

        if (!musicExist) return;

        // Silent/unsilent music, if any
        if (!state) {

            this.musicSound.volume(0.0, this.musicID);
        }
        else {

            this.musicSound.volume(this.volCache, this.musicID);
        }
    }


    // Play a sample
    playSample(sample, vol) {

        if (!this.enabled) return;

        sample.play(vol * this.sampleVol);
    }
}
