#!/bin/bash
export TRASH='/tmp/cleantiddlers.'"$$"
mkdir $TRASH
cd `dirname $0`

for f in `find ../verticals/TiddlyGuv/app/store -name '[0-9]*'` ; do
  if [ `basename $f` != '1' ] ; then
    echo $f
    mv $f $TRASH
  fi
done

for f in `find . -type d -name 'comment*'` ; do
  echo $f
  mv $f $TRASH
done
