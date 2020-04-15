/**
 * Vector classes
 * 
 * (c) 2020 Jani Nykänen
 */



export class Vector2 {


    constructor(x, y) {

        this.x = x == null ? 0 : x; 
        this.y = y == null ? 0 : y;
    }


    // Normalize the vector
    normalize() {

        const EPS = 0.001;

        let len = Math.hypot(this.x, this.y);
        if (len < EPS) return;

        this.x /= len;
        this.y /= len;

        return this;
    }


    // Return a (deep?) copy of the vector
    clone() { return new Vector2(this.x, this.y); }


    // Clone and normalize
    cloneNormalized() {

        return this.clone().normalize();
    }


    // Values as an array
    asArray() {

        return [this.x, this.y];
    }


    // Length
    length() {

        return Math.hypot(this.x, this.y);
    }


    // Dot product
    static dot(a, b) {

        return a.x*b.x + a.y*b.y;
    }
    

}

