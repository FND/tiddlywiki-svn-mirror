#!/bin/bash
root=`dirname $0`'/..'
cd $root
for recipe in `find . -name *.recipe` ; do
  echo 'COOKING '"$recipe"
  recipebase=`echo $recipe | sed -e s/\.html\.recipe$//g`
  (cd `dirname $recipebase` ; cook `basename $recipebase`)
done

pub="$root/pub"
if [ -e $pub ] ; then
  mv $pub /tmp/pub$$
fi
mkdir $pub

(exec maketiddler.sh)
echo 'done maketiddler'

cp plugins/CommentsPlugin/CommentsPlugin.html plugins/PowerTitlePlugin/PowerTitlePlugin.html verticals/tiddlyguv/prototype/TiddlyGuv.html plugins/TiddlerTableMacro/TiddlerTableMacro.html verticals/tiddlyguv/portal/*.html pub

rsync -avz --delete -e ssh pub/* $TIDDLYGUV_PUB
