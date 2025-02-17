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


    // Multiply with a real number
    scale(s) {

        return new Vector2(this.x*s, this.y*s);
    }


    // Dot product
    static dot(a, b) {

        return a.x*b.x + a.y*b.y;
    }
    

}


export class Vector3 {


    constructor(x, y, z) {

        this.x = x == null ? 0 : x; 
        this.y = y == null ? 0 : y;
        this.z = z == null ? 0 : z;
    }


    // Normalize the vector
    normalize() {

        const EPS = 0.001;

        let len = Math.hypot(this.x, this.y, this.z);
        if (len < EPS) return;

        this.x /= len;
        this.y /= len;

        return this;
    }


    // Return a (deep?) copy of the vector
    clone() { return new Vector3(this.x, this.y, this.z); }


    // Clone and normalize
    cloneNormalized() {

        return this.clone().normalize();
    }


    // Values as an array
    asArray() {

        return [this.x, this.y, this.z];
    }


    // Length
    length() {

        return Math.hypot(this.x, this.y, this.z);
    }


    // Multiply with a real number
    scale(s) {

        return new Vector3(this.x*s, this.y*s, this.z*s);
    }


    // Dot product
    static dot(a, b) {

        return a.x*b.x + a.y*b.y + a.z*b.z;
    }


    // Create from vector2
    static fromVector2(v, z) {

        return new Vector3(v.x, v.y, z);
    }
    

}


export class RGB {


    constructor(r, g, b) {

        this.r = r == null ? 0 : r; 
        this.g = g == null ? 0 : g;
        this.b = b == null ? 0 : b;
    }


    // Return a (deep?) copy of the vector
    clone() { return new RGB(this.r, this.g, this.b) }
    

}
