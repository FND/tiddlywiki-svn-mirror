#!/bin/bash
for recipe in *recipe ; do
  r1=`basename $recipe .recipe`
  r2=`basename $r1 .html`
  cook $r2
  # scp *.html portal/*.html 
done

pub=`dirname $0`'/pub'
if [ -e $pub ] ; then
  mv $pub /tmp/pub$$
fi
mkdir $pub

cp *.html portal/*.html pub
rsync -avz --delete -e ssh $pub/* $TIDDLYGUV_PUB
