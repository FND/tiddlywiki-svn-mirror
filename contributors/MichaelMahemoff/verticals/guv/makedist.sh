#!/bin/bash

if [ "$TW_ROOT" == "" ] ; then
  echo 'Please set TW_ROOT to the directory of TiddlyWiki SVN root'
  exit 1
fi

cd `dirname $0`
top=`pwd`

if [ -d dist ] ; then
  mv dist /tmp/dist.$$
fi
twanager --load tiddlywebwiki.config instance dist

cd dist

#####################################
# SERVER
#####################################
cp -R $top/cache/*.py .

ln -s $top/src/server/* .

rm tiddlywebconfig.py
# ln -s $top/src/config/tiddlywebconfig.py .
cp $top/src/config/tiddlywebconfig.py .

#####################################
# STORE
#####################################

rm -fr store
mkdir store
cd store

# Recipes and Users config; tiddlers for client and content
ln -s $top/src/recipes/* $top/src/users/* $top/src/client $top/src/content $top/src/protected .

# Client External
mkdir clientExternal
cp client/policy clientExternal
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
    ln -s $f $f.meta clientExternal
  done

# Content bags. Would use "twanager bag" but it's broke?
mkdir documents licenses comments protected-admin
echo '{"read": [], "create": [], "manage": ["NONE"], "write": [], "owner": null, "delete": []}' > documents/policy
echo '{"read": [], "create": [], "manage": ["NONE"], "write": [], "owner": null, "delete": []}' > licenses/policy
echo '{"read": [], "create": [], "manage": ["bob"], "write": ["admin","bob"], "owner": null, "delete": []}' > protected/policy
# NOTE comments should be write: ["admin"] but dev store seems to confuse write with create
echo '{"read": [], "create": [], "manage": ["bob"], "write": [], "owner": null, "delete": ["admin", "bob"]}' > comments/policy
echo '{"read": [], "create": ["bob", "admin"], "manage": ["bob", "admin"], "write": ["bob", "admin"], "owner": "admin", "delete": ["admin", "bob"]}' > protected-admin/policy

#####################################
# MIGRATE STORE
#####################################
cd ..
pwd
# twanager migrate
# sed -i bak "s/'devtext', {'store_root': 'store'}/'text', {'store_root': 'textstore'}/g" tiddlywebconfig.py
