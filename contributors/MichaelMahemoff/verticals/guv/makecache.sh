#!/bin/bash
cd `dirname $0`
if [ -d cache ] ; then
  mv cache /tmp/cache.$$
fi
mkdir cache
cd cache

curl -O http://github.com/FND/tiddlyweb-plugins/raw/master/devtext.py
curl -O http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/methodhack/methodhack.py

curl -O http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atom.py
curl -O http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atomplugin.py
curl -O http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/htmlatom.py
