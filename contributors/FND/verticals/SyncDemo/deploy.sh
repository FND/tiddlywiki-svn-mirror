#!/usr/bin/env sh

recipe="index.html.recipe"
document="index.html"
uri="fnd.lewcid.org/misc/EnhancedSyncDemo.html"

set -e

ruby -C ../../../../tools/cooker cook.rb `pwd`/$recipe --dest `pwd` --ignorecopy
scp $document "fnd.lewcid.org:$uri"
echo "INFO: deployed to http://$uri"
