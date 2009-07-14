#!/bin/bash
# TIDDLYGUV_PORT is a string like "22"
#
# TIDDLYGUV_LOGIN is a string like mylogin@example.com
#
# TIDDLYGUV_WEB_HOME is a string like mylogin@example.com:destdir
#   This is the root dir, it will contain apache.py among other things, so it's
#   the directory you should point to in your apache config
#
# TIDDLYGUV_URL_ROOT is a string like http://TIDDLYGUV.softwareas.com/comments
#

# export TIDDLYGUV_PORT="22"
# export TIDDLYGUV_LOGIN=name@example.com
# export TIDDLYGUV_WEB_HOME="$TIDDLYGUV_LOGIN:TIDDLYGUV"
export TIDDLYGUV_URL_ROOT=http://tiddlyguv.softwareas.com/

if [ "$TIDDLYGUV_PORT" == "" ] ; then
  TIDDLYGUV_PORT='22'
fi
source $HOME/.bash_profile
cd `dirname $0`
# ./purge.sh
../../../scripts/pulltiddlers.sh
../../../scripts/cleantiddlers.sh
./package.sh
echo 'done package'
rsync -avz --delete -e "ssh -p $TIDDLYGUV_PORT" public/* $TIDDLYGUV_SSH_DEST
ssh -p $TIDDLYGUV_PORT $TIDDLYGUV_LOGIN 'tar zxvf tiddlyguv/tiddlyguv.tgz'
