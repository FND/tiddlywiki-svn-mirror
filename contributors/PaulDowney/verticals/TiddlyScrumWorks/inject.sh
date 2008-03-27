#!/bin/sh

# hack to inject tiddler files into the TiddlyWiki storeArea
# would be neater if cook could handle a file containing a bunch of tiddlers ..

s="$1" ;  shift
t="$1" ;  shift

{
    echo "/^<div title=.UserDefinitions"
    echo ".,/^<\/div/d"
    echo "/^<div title=.UserDefinitions"
    echo ".,/^<\/div/d"

    echo "/^<div id=.storeArea"
    for i in "$*"
    do
	echo ".r $i"
    done

    echo "w $t"
    echo "q"
} | ed "$s" > /dev/null
