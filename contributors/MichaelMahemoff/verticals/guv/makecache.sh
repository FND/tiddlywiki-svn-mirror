#!/bin/bash
cd `dirname $0`
if [ -d cache ] ; then
  mv cache /tmp/cache.$$
fi
mkdir cache
cd cache

echo 'download packages ...'
curl -O http://github.com/FND/tiddlyweb-plugins/raw/master/devtext.py
curl -O http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/methodhack/methodhack.py
curl -O http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/migrate/migrate.py

curl -O http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atom.py
curl -O http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atomplugin.py
curl -O http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/htmlatom.py

# don't rely on unzip args - just extract the lot
mkdir tmp
cd tmp
curl -O http://plugins.jquery.com/files/jquery.scrollTo-1.4.2.zip
unzip jquery.scrollTo-1.4.2.zip
mv jquery.scrollTo-min.js ../scrollTo.js
echo "tags: systemConfig" >  ../scrollTo.js.meta
echo '' >> ../scrollTo.js.meta
cd ..
mv tmp /tmp/cachetmp.$$
cd ..
