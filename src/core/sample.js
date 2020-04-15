/**
 * An audio sample
 * (an abstraction layer between Howler.js and
 * the audio interface, kind of)
 * 
 * (c) 2020 Jani Nykänen
 */


export class Sample {


    constructor(data) {

        this.sound = data;
    }


    // Play once
    play(vol) {

        if (!this.sound.playID) {

            this.sound.playID = this.sound.play();

            this.sound.volume(vol, this.sound.playID );
            this.sound.loop(false, this.sound.playID );
        }
        else {

            this.sound.stop(this.sound.playID);
            this.sound.volume(vol, this.sound.playID );
            this.sound.loop(false, this.sound.playID );
            this.sound.play(this.sound.playID);
        }
    }
}
