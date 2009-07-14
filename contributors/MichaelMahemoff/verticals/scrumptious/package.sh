#!/bin/bash

SCRUMPTIOUS_URL_ROOT="http://$SCRUMPTIOUS_DOMAIN"
if [ "$SCRUMPTIOUS_WEB_PORT" == "" ] ; then
  SCRUMPTIOUS_URL_ROOT="$SCRUMPTIOUS_URL_ROOT:$SCRUMPTIOUS_WEB_PORT"
fi
function subURL {
  if [ "$SCRUMPTIOUS_URL_ROOT" != "" ] ; then
    echo "SUBBING"
    for f in $* ; do
      sed -i '' -e "s|http:\/\/comments.boz:8080\/comments|$SCRUMPTIOUS_URL_ROOT|g" $f
    done
  fi
}

cd `dirname $0`
if [ -d public ] ; then
  rm -fr public
fi
mkdir public
cp -R docs/* public
perl ./bookmarklet.pl docs/bookmarklet.js docs/index.html > public/index.html
# subURL public/*.js public/index.html tiddlywebconfig.py
echo 'DONE SUBBING'

tmpdir=/tmp/scrumptious-$$
tarball=`pwd`/public/scrumptious.tgz
if [ -d $tmpdir ] ; then
  exit 1
fi
mkdir -p $tmpdir/scrumptious
cp -R updateSettings.sh docs/INSTALL docs/CREDITS docs/LICENSE *.py store static $tmpdir/scrumptious
echo 'COPIED****************'
# sed -i '' -e "s|comments.boz|$SCRUMPTIOUS_DOMAIN|g" $tmpdir/scrumptious/tiddlywebconfig.py
# sed -i '' -e "s|8080|$SCRUMPTIOUS_PORT|g" $tmpdir/scrumptious/tiddlywebconfig.py
echo 'DONE SED ************************************'
subURL $tmpdir/scrumptious/static/js/*.js
cd $tmpdir
tar zcvf $tarball scrumptious
echo "Written to $tmpdir"
