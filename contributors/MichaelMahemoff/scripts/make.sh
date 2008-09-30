#!/bin/bash
root=`dirname $0`'/..'
cd $root
for recipe in `find . -name *.recipe` ; do
  recipebase=`echo $recipe | sed -e s/\.html\.recipe$//g`
  (cd `dirname $recipebase` ; cook `basename $recipebase`)
done

pub="$root/pub"
if [ -e $pub ] ; then
  mv $pub /tmp/pub$$
fi
mkdir $pub

cp plugins/CommentsPlugin/CommentsPlugin.html verticals/tiddlyguv/TiddlyGuv.html verticals/tiddlyguv/portal/*.html pub
rsync -avz --delete -e ssh $pub/* $TIDDLYGUV_PUB
