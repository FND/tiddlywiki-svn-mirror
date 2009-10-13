#!/bin/bash

function checkTWRoot {
  if [ "$TW_ROOT" == "" ] ; then
    echo 'Please set TW_ROOT to the directory of TiddlyWiki SVN root'
    exit 1
  fi
}

function makeBags { 
  echo "makeBags $*"
  policyJSON=$1
  shift
  for bag in $* ; do
    echo '{"policy": '$policyJSON'}' | twanager bag $bag
  done
  echo "end makeBags"
}

function makedist {
  if [ -d dist ] ; then
    mv dist /tmp/dist.$$
  fi

  cp cache/devtext.py .
  twanager --load tiddlyguvconfig instance dist
  rm tiddlyguvconfig.pyc
  rm devtext.py
}

function populateServerInstance {
  cp -R $top/cache/*.py .
  cp $top/src/server/* .
  rm tiddlywebconfig.py
  cp $top/src/config/tiddlywebconfig.py .
}

function makeAppBags {
  makeBags '{ "delete": ["R:ADMIN"], "manage": ["R:ADMIN"], "accept": ["R:ADMIN"] }' documents licenses
  makeBags '{"create": ["R:ADMIN"], "manage": ["R:ADMIN"], "accept": ["R:ADMIN"], "write": ["R:ADMIN"], "delete": ["R:ADMIN"]}' protected client
  makeBags '{ "delete": ["R:ADMIN"], "manage": ["R:ADMIN"] }' comments # TODO change when dev store fixed
}

function populateAppBagsFromSrc {
  cp $top/src/recipes/* $top/src/users/* store
  # import $top/src/recipes/* $top/src/users/* store
  for bag in client protected ; do
    # import $top/src/$bag/* $bag
    cp $top/src/recipes/* $top/src/users/* store/$bag
  done
}

function populateAppBagsFromCache {
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

# http://is.gd/4g2dK (StackOverflow)
function import {
  args=("$@")
  bag=${!#}
  unset args[${#args[@]}-1]
  for src in "${args[@]}"; do
    echo twanager from_svn $bag 'file://'"$src"
  done
}

#*******************************************************************************
# THE SCRIPT
#*******************************************************************************

checkTWRoot
cd `dirname $0`
top=`pwd`
makedist
cd dist
populateServerInstance
makeAppBags
populateAppBagsFromSrc
populateAppBagsFromCache

