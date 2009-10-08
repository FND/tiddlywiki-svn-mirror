#!/bin/bash
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
cp -R $top/cache/* .

ln -s $top/src/server/* .

rm tiddlywebconfig.py
ln -s $top/src/config/tiddlywebconfig.py .

#####################################
# STORE
#####################################

rm -fr store
mkdir store
cd store

# Recipes and Users config; tiddlers for client and content
ln -s $top/src/recipes/* $top/src/users/* $top/src/client $top/src/content .

# Client External
mkdir clientExternal
cp client/policy clientExternal
trunk=$HOME/tw/Trunk
mahemoff=$HOME/tw/Trunk/contributors/MichaelMahemoff
for f in \
  $mahemoff/plugins/CommentsPlugin/CommentsPlugin.js\
  $mahemoff/plugins/GuidPlugin/GuidPlugin.js\
  $trunk/association/plugins/ServerSideSavingPlugin.js\
  $trunk/contributors/EricShulman/plugins/SinglePageModePlugin.js\
  $trunk/contributors/EricShulman/plugins/TaggedTemplateTweak.js\
  $mahemoff/plugins/TiddlerTableMacro/TiddlerTableMacro.js\
  $trunk/association/adaptors/TiddlyWebAdaptor.js\
  $mahemoff/plugins/TiddlyWebLinkPlugin/TiddlyWebLinkPlugin.js\
  ; do
    ln -s $f $f.meta clientExternal
  done

# Content bags. Would use "twanager bag" but it's broke?
mkdir documents licenses comments protected-admin
echo '{"read": [], "create": [], "manage": ["NONE"], "write": [], "owner": null, "delete": []}' > documents/policy
echo '{"read": [], "create": [], "manage": ["NONE"], "write": [], "owner": null, "delete": []}' > licenses/policy
echo '{"read": [], "create": [], "manage": ["bob"], "write": ["admin", "bob"], "owner": null, "delete": ["admin", "bob"]}' > comments/policy
echo {"read": [], "create": ["bob", "admin"], "manage": ["bob", "admin"], "write": ["bob", "admin"], "owner": "admin", "delete": ["admin", "bob"]} > protected-admin/policy
