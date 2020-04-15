import { Bitmap } from "./bitmap.js";
import { Tilemap } from "./tilemap.js";
import { Sample } from "./sample.js";

/**
 * Asset loader & manager
 * 
 * (c) 2020 Jani Nykänen
 */


export class Assets {


    constructor() {

        this.bitmaps = new Array();
        this.tilemaps = new Array();
        this.samples = new Array();

        this.total = 0;
        this.loaded = 0;
    }


    // Load assets
    loadAssets(path) {

        this.loadListFile(path);
    } 


    // Load a text file
    loadTextfile(path, type, cb) {
        
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/" + type);
        xobj.open("GET", path, true);

        ++ this.total;

        // When loaded
        xobj.onreadystatechange = () => {

            if (xobj.readyState == 4 ) {

                if(String(xobj.status) == "200") {
                    
                    if (cb != null)
                        cb(xobj.responseText);
                }
                ++ this.loaded;
            }
                
        };
        xobj.send(null);  
    }


    // Load a JSON asset list file
    loadListFile(path) {

        this.loadTextfile(path, "json", (str) => 
            this.parseAssetList(JSON.parse(str))
        );
    }


    // Parse an asset data
    parseAssetList(data) {

        // Load bitmaps
        for (let b of data.bitmaps) {

            this.loadBitmap(
                b.name,
                data.bitmapPath + b.path
            );
        }

        // Load tilemaps
        for (let t of data.tilemaps) {

            this.loadTilemap(
                t.name,
                data.tilemapPath + t.path
            );
        }

        // Load sounds
        for (let b of data.audio) {

            this.loadSample(
                b.name,
                data.audioPath + b.path
            );
        }

    }


    // Start loading a bitmap
    loadBitmap(name, path) {

        ++ this.total;

        let image = new Image();
        image.onload = () => {

            ++ this.loaded;
            this.bitmaps[name] = new Bitmap(image);
        }
        image.src = path;
    }


    // Start loading a sound
    loadSample(name, path) {

        ++ this.total;

        this.samples[name] = (new Sample(
            new Howl({
                src: [path],
                onload: () => { 
                    ++ this.loaded;
                }
            })
        ));
    }


    // Start loading a tilemap
    loadTilemap(name, path) {

        ++ this.total;
        
        this.loadTextfile(path, "xml", (str) => {

            this.tilemaps[name] = new Tilemap(str);
            ++ this.loaded;
        });
    }


    // Is the loading finished
    hasLoaded() {

        return this.total == 0 ||
            this.loaded >= this.total;
    }


    // How much data is loaded, in [0,1)
    dataLoadedPercentage() {

        return this.total == 0 ? 0 :
            this.loaded/this.total;
    }
}

