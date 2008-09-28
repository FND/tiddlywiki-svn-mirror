#!/bin/bash
for recipe in `find . -name *.recipe` ; do
  recipebase=`echo $recipe | sed -e s/\.html\.recipe$//g`
  (cd `dirname $recipebase` ; cook `basename $recipebase`)
done

pub=`dirname $0`'/pub'
if [ -e $pub ] ; then
  mv $pub /tmp/pub$$
fi
mkdir $pub

cp plugins/comments/CommentsPlugin.html verticals/tiddlyguv/TiddlyGuv.html verticals/tiddlyguv/portal/*.html pub
rsync -avz --delete -e ssh $pub/* $TIDDLYGUV_PUB
