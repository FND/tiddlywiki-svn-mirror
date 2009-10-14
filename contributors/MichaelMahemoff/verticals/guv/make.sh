#!/bin/bash

#*******************************************************************************
# UTILS
#*******************************************************************************

function makeBags {
  policyJSON=$1
  shift
  for bag in $* ; do
    echo '{"policy": '$policyJSON'}' | twanager bag $bag
  done
}

#*******************************************************************************
# TASKS
#*******************************************************************************

function clean {
  if [ -d dist ] ; then
    mv dist /tmp/dist.$$
  fi
}

function cache {
  cd $top
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
}

function instance {
  cp cache/devtext.py .
  twanager --load tiddlyguvconfig instance dist 2>&1 /dev/null
  rm tiddlyguvconfig.pyc
  rm devtext.{py,pyc}
}

function users {
  twanager adduser mike mike
  twanager adduser bob bob ADMIN
}

function recipes {
  twanager recipe portal <<END
  /bags/system/tiddlers
  /bags/common/tiddlers
  /bags/client/tiddlers
  /bags/licenses/tiddlers
  /bags/protected/tiddlers
  /bags/comments/tiddlers
END
}

function serverplugins {
  cp -R $top/cache/*.py .
  cp $top/src/server/* .
  rm tiddlywebconfig.py
  cp $top/src/config/tiddlywebconfig.py .
}

function bags {
  makeBags '{ "delete": ["R:ADMIN"], "manage": ["R:ADMIN"], "accept": ["R:ADMIN"] }' documents licenses
  makeBags '{"create": ["R:ADMIN"], "manage": ["R:ADMIN"], "accept": ["R:ADMIN"], "write": ["R:ADMIN"], "delete": ["R:ADMIN"]}' protected client
  makeBags '{ "delete": ["R:ADMIN"], "manage": ["R:ADMIN"] }' comments # TODO change when dev store fixed
}

function sourcetiddlers {
  for bag in client protected ; do
    # import $top/src/$bag/*.{tid,js,meta} $bag
    # import2 $bag $top/src/$bag/*.{tid,js,meta}
    cp $top/src/$bag/* store/$bag
  done
}

function externals {
  if [ "$TW_ROOT" == "" ] ; then
    echo "need TW_ROOT" ; exit
  fi
  mahemoff=$TW_ROOT/contributors/MichaelMahemoff
  for f in \
    $mahemoff/plugins/CommentsPlugin/CommentsPlugin.js\
    $mahemoff/plugins/GuidPlugin/GuidPlugin.js\
    $TW_ROOT/association/plugins/ServerSideSavingPlugin.js\
    $TW_ROOT/contributors/EricShulman/plugins/SinglePageModePlugin.js\
    $TW_ROOT/contributors/EricShulman/plugins/TaggedTemplateTweak.js\
    $mahemoff/plugins/TiddlerTableMacro/TiddlerTableMacro.js\
    $TW_ROOT/association/adaptors/TiddlyWebAdaptor.js\
    $mahemoff/plugins/TiddlyWebLinkPlugin/TiddlyWebLinkPlugin.js\
    $TW_ROOT/contributors/JeremyRuston/plugins/BackstageTiddlersPlugin.js\
    $TW_ROOT/contributors/MichaelMahemoff/plugins/SimpleMessagePlugin/SimpleMessagePlugin.js\
    `find $top/cache -name '*.js'`\
    ; do
      cp $f $f.meta store/client
    done
}

function sampledata {
  twanager adduser mike mike
  twanager adduser bob bob ADMIN
  for dir in `find ../src/sampledata -type d -mindepth 1 -maxdepth 1 -name '[a-zA-Z]*'`; do
    cp $dir/* store/`basename $dir`
  done
}

#*******************************************************************************
# THE SCRIPT
#*******************************************************************************
cd `dirname $0`
top=`pwd`

tasks="clean cache instance serverplugins bags sourcetiddlers users recipes externals sampledata"

time for task in $tasks ; do
  if [ "$task" != "clean" -a -d "dist" ] ; then
    cd dist
  fi
  echo -n "running \"$task\" ....... "
  $task
  echo "done"
done
