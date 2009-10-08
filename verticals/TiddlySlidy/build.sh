#!/bin/bash

#
#   1. run this build script
#   2. open index.html in a browser (Firefox)
#   3. save changes using the backstage (for RSS and SplasScreenPlugin)
#   4. run deploy.sh to copy to server
#

cook

cd ..
(
    echo TiddlySlidy/index.html
    echo TiddlySlidy/TiddlySaver.jar
) | zip -@ TiddlySlidy/TiddlySlidy.zip

echo "open index.html in firefox and save changes before running deploy.sh!"
