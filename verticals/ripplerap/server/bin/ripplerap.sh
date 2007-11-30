#!/bin/sh
#
#   script to build ripplerap feed from individual RSS feeds
#
set -x
set -e

userdir=./users
notesdir=./notes

[ -z "$ripplerapdir" ] && ripplerapdir="."

#
#  find index.xml files changed since last time
#
lasttime="conf/lasttime"

now=$(date +'%Y%m%d%H%M.%S')
[ ! -f $lasttime ] && touch -t 200601010000 $lasttime
files=$(find $userdir -name index.xml -newer $lasttime)

if [ -n "$files" ] 
then 
	export PYTHONPATH=$ripplerapdir/lib
	python $ripplerapdir/bin/explode-feeds.py -o $notesdir $files
	touch -t $now $lasttime
fi

exit 0
