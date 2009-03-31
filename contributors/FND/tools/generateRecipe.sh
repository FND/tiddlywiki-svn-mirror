#!/usr/bin/env bash

# generate recipe from directory index
#
# Usage:
#  $ ./generateRecipe.sh targetDir
#
# TODO:
# * add trailing slash to targetDir
# * recursiveness optional
# * prompt for overwriting
# * plugins to use plugin prefix instead of tags argument?
# * create .meta files instead of using tags attribute

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

filename=$1$filename

rm $filename # XXX: throws error if file does not exist

# add tiddlers
find . -name "*.tid" | sed -e 's/^\.\/\(.*\)/tiddler: \1 tag="systemConfig"/' >> $filename

# add plugins
find . -name "*.js" | sed -e 's/^\.\/\(.*\)/tiddler: \1 tags="systemConfig"/' >> $filename

echo "recipe created:"
cat $1$filename
