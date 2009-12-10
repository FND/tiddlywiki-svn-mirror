#!/bin/bash

#
#   1. run this build script
#   2. run deploy.sh to copy to server
#

cook

cd ..
(
    echo TiddlySlidy/index.html
    echo TiddlySlidy/TiddlySaver.jar
    echo TiddlySlidy/images/*
) | zip -@ TiddlySlidy/TiddlySlidy.zip

echo "open index.html in firefox and save changes before running deploy.sh!"
