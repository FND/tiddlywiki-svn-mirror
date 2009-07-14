#!/bin/bash

function subURL {
  if [ "$TIDDLYGUV_URL_ROOT" != "" ] ; then
    for f in $* ; do
      sed -i '' -e "s|http:\/\/tiddlyguv.dev:9090\/comments|$TIDDLYGUV_URL_ROOT|g" $f
    done
  fi
}

cd `dirname $0`
if [ -d public ] ; then
  rm -fr public
fi
mkdir public
cp -R docs/* public
subURL store/CommonPlugins/ConfigTweaks/1
# subURL public/*.js public/index.html

tmpdir=/tmp/tiddlyguv-$$
tarball=`pwd`/public/tiddlyguv.tgz
if [ -d $tmpdir ] ; then
  exit 1
fi
mkdir -p $tmpdir/tiddlyguv
cp -R docs/INSTALL docs/CREDITS docs/LICENSE *.py store $tmpdir/tiddlyguv
# subURL $tmpdir/tiddlyguv/static/js/*.js
cd $tmpdir
tar zcvf $tarball tiddlyguv
echo "created tarball $tarball"
