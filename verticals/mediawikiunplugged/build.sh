#!/bin/bash

#
#   1. run this build script
#   2. open index.html in Firefox
#   3. save changes using the backstage (for RSS and SplasScreenPlugin)
#   4. run deploy.sh to copy to server
#

cook mediawikiunplugged
cook index

cd ..
(
    echo mediawikiunplugged/mediawikiunplugged.html
    echo mediawikiunplugged/images/logo.png
    echo mediawikiunplugged/TiddlySaver.jar
) | zip -@ mediawikiunplugged/MediaWikiUnplugged.zip

echo "open index.html in firefox and save changes before running deploy.sh!"
