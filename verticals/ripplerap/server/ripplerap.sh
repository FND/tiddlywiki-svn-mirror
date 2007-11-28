#!/bin/sh
#
#   script to build ripplerap feed from individual RSS feeds
#
set -x
set -e

userdir=./users
notesdir=./notes

#
#  find index.xml files changed since last time
#
lasttime="conf/lasttime"

# uncomment these for testing
#rm -f "$lasttime"
touch users/PaulDowney/index.xml

now=$(date +'%Y%m%d%H%M.%S')
[ ! -f $lasttime ] && touch -t 200601010000 $lasttime
files=$(find $userdir -name index.xml -newer $lasttime)
touch -t $now $lasttime

if [ -n "$files" ] 
then 
	ripplerap.py $notesdir $files
fi

exit 0
