#!/usr/bin/env bash

# generate recipe from directory index
#
# Usage:
#  $ ./generateRecipe.sh targetDir
#
# TODO:
# * prompt for overwriting
# * plugins to use plugin prefix instead of tags argument?
# * recursiveness optional
# * remove leading "./" from recipe entries

filename="split.recipe"

function quit {
	echo "aborting: $1"
	exit
}

if [ $# -gt 0 ]; then
	cd $1 || quit "invalid target directory"
else
	quit "target directory not specified"
fi

rm $filename # XXX: throws error if file does not exist

# add tiddlers
find . -name "*.tid" -exec echo -e 'tiddler: {}' >> $filename \;

# add plugins
find . -name "*.js" -exec echo -e 'tiddler: {} tags="systemConfig"' >> $filename \;
