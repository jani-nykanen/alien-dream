import { negMod } from "./util.js";

/**
 * Tilemaps
 * 
 * (c) 2020 Jani Nykänen
 */


export class TilemapProperty {

    constructor(key, value) {

        this.key = key;
        this.value = value;
    }
}


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

        // Find the minimal id
        let min = 9999;
        for (let d of data) {

            if (d.id < min) {

                min = d.id;
            }
        }

        let str, content;
        let id;
        for (let i = 0; i < data.length; ++ i) {

            id = data[i].id-min;

            // Get layer data & remove newlines
            str = data[i].getElementsByTagName("data")[0].
                childNodes[0].
                nodeValue.
                replace(/(\r\n|\n|\r)/gm, "");
            // Put to an array
            content = str.split(",");

            // Create a new layer
            this.layers[id] = new Array();
            for (let j = 0; j < content.length; ++ j) {

                this.layers[id][j] = parseInt(content[j]);
            }
        }

        // Get properties
        this.properties = new Array();
        let prop = root.getElementsByTagName("properties")[0];

        if (prop != undefined) {

            for (let p of prop.getElementsByTagName("property")) {

                if ( p.getAttribute("name") != undefined) {

                    this.properties[ p.getAttribute("name")] = p.getAttribute("value");
                }
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

