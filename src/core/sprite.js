/**
 * An animated sprite
 * 
 * (c) 2020 Jani Nykänen
 */

export class Sprite {


    constructor(w, h) {

        this.width = w;
        this.height = h;
    
        this.frame = 0;
        this.row = 0;
        this.count = 0.0;
    }


    // Animate the sprite
    animate(row, start, end, speed, step) {

        row |= 0;
        start |= 0;
        end |= 0;
        speed |= 0;

        // Nothing to animate
        if (start == end) {
    
            this.count = 0;
            this.frame = start;
            this.row = row;
            return;
        }
    
        // Swap row
        if (this.row != row) {
    
            this.count = 0;
            this.frame = end > start ? start : end;
            this.row = row;
        }
    
        // If outside the animation interval
        if (start < end && 
            (this.frame < start || this.frame > end)) {
    
            this.frame = start;
            this.count = 0;
        }
        else if (end < start && 
            (this.frame < end || this.frame > start)) {
    
            this.frame = end;
            this.count = 0;
        }
    
        // Animate
        this.count += 1.0 * step;
        if (this.count > speed) {
    
            if (start < end) {
    
                if (++this.frame > end) {
    
                    this.frame = start;
                }
                if (speed < 0) {

                    this.frame = Math.min(this.frame-speed, end);
                }   
            }
            else {
    
                if (--this.frame < end) {
    
                    this.frame = start;
                }
                if (speed < 0) {

                    this.frame = Math.max(this.frame+speed, start);
                } 
            }
    
            this.count -= speed;
        }
    }


    // Set frame
    setFrame(row, frame) {

        this.row = row;
        this.frame = frame;

        this.count = 0;
    }


    // Draw a frame
    drawFrame(c, bmp, frame, row, dx, dy, flip) {
    
        c.drawBitmapRegion(bmp, 
            this.width * frame, this.height * row, 
            this.width, this.height, 
            dx, dy, flip);
    }


    // Draw the current frame
    draw(c, bmp, dx, dy, flip) {

        this.drawFrame(c, bmp, 
            this.frame, this.row,
            dx, dy, flip);
    }
}