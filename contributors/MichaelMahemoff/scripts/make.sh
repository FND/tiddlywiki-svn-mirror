#!/bin/bash
root=`dirname $0`'/..'
cd $root

function makepub() {
  pub="$root/pub"
  if [ -e $pub ] ; then
    mv $pub /tmp/pub$$
  fi
  mkdir $pub
}

function cookall() {
  for recipe in `find . -name *.recipe` ; do
    echo 'COOKING '"$recipe"
    recipebase=`echo $recipe | sed -e s/\.html\.recipe$//g`
    (cd `dirname $recipebase` ; cook `basename $recipebase`)
  done
}

function pub() {
  while [ "$1" != "" ] ; do
    plugin=$1
    (cd plugins/$1 ; if [ -f make.rb ] ; then ./make.rb ; fi ; cook $1 ; )
    cp plugins/$1/$1.html $pub
    shift
  done
  ls -la $pub
}

makepub
pub GuidPlugin CommentsPlugin DrawingPlugin TiddlerTableMacro PreferenceMacros
cd $pub
ls -latr 
echo $MAHEMOFF_TIDDLYWIKI
rsync -avz --delete -e ssh * $MAHEMOFF_TIDDLYWIKI
exit

# (exec maketiddler.sh)
# echo 'done maketiddler'

# cp plugins/CommentsPlugin/CommentsPlugin.html plugins/PowerTitlePlugin/PowerTitlePlugin.html verticals/tiddlyguv/prototype/TiddlyGuv.html plugins/TiddlerTableMacro/TiddlerTableMacro.html verticals/tiddlyguv/portal/*.html pub

# cp verticals/tiddlyguv/prototype/TiddlyGuv.html verticals/tiddlyguv/portal/*.html pub

rsync -avz --delete -e ssh pub/* $TIDDLYGUV_PUB

# cp plugins/CommentsPlugin/CommentsPlugin.html plugins/TiddlerTableMacro/TiddlerTableMacro.html pub

# rsync -avz --delete -e ssh pub/* $MAHEMOFF_PUB
