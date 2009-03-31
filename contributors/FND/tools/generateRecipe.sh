#!/usr/bin/env bash

# generate recipe from directory index
#
# Usage:
#  $ ./generateRecipe.sh targetDir
#
# TODO:
# * recursiveness optional
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

# remove trailing slash
dir=`echo $1 | sed -e "s/\/$//"`

filepath="$dir/$filename"

if [ -f "$filepath" ]; then
	rm $filepath
fi

# add tiddlers
find . -name "*.tid" | sed -e 's/^\.\/\(.*\)/tiddler: \1 tag="systemConfig"/' >> $filepath

# add plugins
find . -name "*.js" | sed -e 's/^\.\/\(.*\)/tiddler: \1 tags="systemConfig"/' >> $filepath

echo "recipe created:"
cat $filepath
