#!/bin/sh
#
#   script to build ripplerap feed from individual RSS feeds
#   change the ripplerapdir variable to point to your server directory
#
#	the following is an example crontab line to periodically run 
#	ripplerap.sh every minute:
#
#	*/1 * * * * /path/to/ripplerap/bin/ripplerap-cron.sh
#
#	add it to your cron server using crontab -e command
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
