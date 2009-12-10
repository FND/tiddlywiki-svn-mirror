#
#  script to deploy to server
#  - you need to run build.sh and follow instructions first
#

#host=osmodot@osmosoft.com 
#dir=/data/vhost/www.mediawikiunplugged.com/html

scp index.html $host:$dir
scp TiddlySlidy.zip  $host:$dir
