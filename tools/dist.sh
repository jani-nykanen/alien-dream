#!/bin/sh
cd "$(dirname "$0")"
cp ../lib/howler.core.min.js howler.core.min.js
cp -r ../assets assets
java -jar closure.jar --js ../src/core/*.js ../src/*.js --js_output_file out.js #--compilation_level ADVANCED_OPTIMIZATIONS --language_out ECMASCRIPT_2018
cat html_up.txt > index.html
cat out.js >> index.html
cat html_down.txt >> index.html
rm ../dist.zip
zip -r ../dist.zip howler.core.min.js assets index.html

rm index.html
rm -rf assets
rm -rf howler.core.min.js
rm -rf localization
rm -rf out.js
