#!/bin/sh
#
#   script to build ripplerap feed from individual RSS feeds
#
set -e
export ripplerapdir=/data/vhost/www.ripplerap.com/html/LeWeb
export USER=ripmaster
export LOGNAME=$USER
export PATH=$ripplerapdir/bin:/usr/local/bin:/usr/bin:/bin:
export LC_COLLATE=C
export LANG=en_US
export LANGUAGE=en_US:en_GB:en

cd $ripplerapdir
$ripplerapdir/bin/ripplerap.sh
