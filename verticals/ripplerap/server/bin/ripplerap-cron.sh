#!/bin/sh
#
#   script to build ripplerap feed from individual RSS feeds
#
set -x
set -e
USER=pauldowney
HOME=/Users/$USER

LOGNAME=$USER
PATH=$HOME/bin:/usr/local/bin:/usr/bin:/bin:
LC_COLLATE=C
LANG=en_US
LANGUAGE=en_US:en_GB:en

export ripplerapdir=$HOME/src/tiddlywiki.org/Trunk/verticals/ripplerap/server
cd $ripplerapdir

./bin/ripplerap.sh
