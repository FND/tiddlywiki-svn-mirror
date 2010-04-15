#!/usr/bin/env sh

recipe="index.html.recipe"
document="index.html"

set -e

ruby -C ../../../../tools/cooker cook.rb `pwd`/$recipe --dest `pwd` --ignorecopy
scp $document fnd.lewcid.org:fnd.lewcid.org/misc/TagsplorerDemo.html
echo "INFO: deployed to http://fnd.lewcid.org/misc/TagsplorerDemo.html"
