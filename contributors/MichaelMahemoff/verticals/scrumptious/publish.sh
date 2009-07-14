#!/bin/bash
# SCRUMPTIOUS_PORT is a string like "22"
#
# SCRUMPTIOUS_SSH_LOGIN is a string like mylogin@example.com
#
# SCRUMPTIOUS_SSH_DEST is a string like mylogin@example.com:destdir
#   This is the root dir, it will contain apache.py among other things, so it's
#   the directory you should point to in your apache config
#
# SCRUMPTIOUS_URL_ROOT is a string like http://scrumptious.softwareas.com/comments
#

export SCRUMPTIOUS_DOMAIN="scrumptious.tv"
export SCRUMPTIOUS_PORT="80"
export SCRUMPTIOUS_SSH_PORT="22"
export SCRUMPTIOUS_SSH_LOGIN=name@example.com
export SCRUMPTIOUS_SSH_DEST="$SCRUMPTIOUS_SSH_LOGIN:scrumptious"
export SCRUMPTIOUS_URL_ROOT=http://scrumptious.tv/comments

if [ "$SCRUMPTIOUS_SSH_PORT" == "" ] ; then
  SCRUMPTIOUS_SSH_PORT='22'
fi
source $HOME/.bash_profile
cd `dirname $0`
./purge.sh
./package.sh
echo 'done package'

echo $SCRUMPTIOUS_DOMAIN
echo $SCRUMPTIOUS_PORT
echo $SCRUMPTIOUS_SSH_PORT
echo $SCRUMPTIOUS_SSH_LOGIN
echo $SCRUMPTIOUS_SSH_DEST
echo $SCRUMPTIOUS_URL_ROOT

rsync -avz --delete -e "ssh -p $SCRUMPTIOUS_SSH_PORT" public/* $SCRUMPTIOUS_SSH_DEST
echo "****************** Done rsync to $SCRUMPTIOUS_SSH_DEST"
ssh -p $SCRUMPTIOUS_SSH_PORT $SCRUMPTIOUS_SSH_LOGIN 'tar zxvf scrumptious/scrumptious.tgz'
ssh -p $SCRUMPTIOUS_SSH_PORT $SCRUMPTIOUS_SSH_LOGIN 'scrumptious/updateSettings.sh';
echo "untarred tarball at $SCRUMPTIOUS_SSH_LOGIN port $SCRUMPTIOUS_SSH_PORT"
echo '****************** Done untar'
