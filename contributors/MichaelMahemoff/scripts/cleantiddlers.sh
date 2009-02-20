#!/bin/bash
export TRASH='/tmp/cleantiddlers.'"$$"
mkdir $TRASH
  ls -la $TRASH
cd `dirname $0`/../verticals/TiddlyGuv/app/store

for f in `find . -name '^[0-9]+$'` ; do
  if [ `basename $f` != '1' ] ; then
    echo $f
    mv $f $TRASH
  fi
done

for f in `find . -type d -name 'comment_*'` ; do
  echo $f
  mv $f $TRASH
done

for f in `find . -name '*.sw?'` ; do
  echo $f
  mv $f $TRASH
done
