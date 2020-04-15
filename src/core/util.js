/**
 * Utility functions
 * 
 * (c) 2020 Jani Nykänen
 */


// Negative modulo
export function negMod(m, n) {

    if(m < 0) {

        return n - (-m % n);
    }
    return m % n;
}


// Clamp a number to the range [min, max]
export function clamp(x, min, max) {

    return Math.max(min, Math.min(x, max));
}


// Toggle fullscreen
export function toggleFullscreen(canvas) {

    if(document.webkitIsFullScreen || 
        document.mozFullScreen) {

        if(document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        
        else if(document.mozCancelFullScreen)
            document.mozCancelFullScreen();

        else if(document.exitFullscreen)
            document.exitFullscreen();    
    }
    else {

        if(canvas.webkitRequestFullscreen)
            canvas.webkitRequestFullscreen();

        else if(canvas.requestFullscreen) 
            canvas.requestFullscreen();

        else if(canvas.mozRequestFullScreen) 
            canvas.mozRequestFullScreen();
        
    }
}


// Is a point inside a triangle
export function isInsideTriangle(
    px, py, x1, y1, x2, y2, x3, y3) {

    let as_x = px-x1;
    let as_y = py-y1;
    let s_ab = (x2-x1)*as_y-(y2-y1)*as_x > 0;

    return !(((x3-x1)*as_y-(y3-y1)*as_x > 0) == s_ab || 
        ((x3-x2)*(py-y2)-(y3-y2)*(px-x2) > 0) != s_ab);
}


// A helper function that updates a 
// "speed axis", like actual speed or
// angle speed
export function updateSpeedAxis(speed, target, d) {

    if (speed < target) {

         speed = Math.min(speed + d, target);
    }
    else if (speed > target) {

        speed = Math.max(speed - d, target);
    }
    return speed;
}


// Convert RGBA values to a string that is 
// understood by Html5
export function getColorString(r, g, b, a) {

    if (r == null) r = 255;
    if (g == null) g = r;
    if (b == null) b = g;

    if (a == null) 
        a = 1.0;
    
    return "rgba("
        + String(r | 0) + ","
        + String(g | 0) + ","
        + String(b | 0) + ","
         + String(a) + ")";
}


// Create a "score string", that is, convert
// an integer to string and add '0's in front of 
// it, if not long enough
export function createScoreString(v, len) {

    let s = String( clamp(v, 0, Math.pow(10, len)-1 ));
    return "0".repeat(Math.max(0, len-s.length)) + s;
}
