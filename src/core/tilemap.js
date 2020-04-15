import { negMod } from "./util.js";

/**
 * Tilemaps
 * 
 * (c) 2020 Jani Nykänen
 */


export class Tilemap {


    constructor(s) {

        let doc = (new DOMParser()).parseFromString(s, "text/xml");

        // Get dimensions
        let root = doc.getElementsByTagName("map")[0];
        this.width = String(root.getAttribute("width"));
        this.height = String(root.getAttribute("height"));
        
        // Get layers
        let data = root.getElementsByTagName("layer");
        this.layers = new Array();
        let str, content;
        for (let i = 0; i < data.length; ++ i) {

            // Get layer data & remove newlines
            str = data[i].getElementsByTagName("data")[0].
                childNodes[0].
                nodeValue.
                replace(/(\r\n|\n|\r)/gm, "");
            // Put to an array
            content = str.split(",");

            // Create a new layer
            this.layers.push(new Array());
            for (let j = 0; j < content.length; ++ j) {

                this.layers[i][j] = parseInt(content[j]);
            }
        }
    }


    // Get a tile value in the given coordinate
    getTile(layer, x, y) {

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return 0;

        return this.layers[layer][y*this.width+x];
    }


    // Set tile value
    setTile(layer, x, y, v) {

        x = negMod(x, this.width);
        y = negMod(y, this.height);

        this.layers[layer][y*this.width+x] = v;
    }


    // Clone a layer
    cloneLayer(layer) {

        let arr = [];
        for (let i = 0; i < this.layers[layer].length; ++ i) {

            arr.push(this.layers[layer][i]);
        }
        return arr;
    }
}
