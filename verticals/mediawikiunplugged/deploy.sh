#
#  script to deploy to server
#  - you need to run build.sh and follow instructions first
#

# originally hosted on mediawikiunplugged.osmosoft.com
host=mwudot@mediawikiunplugged.osmosoft.com 
dir=/data/vhost/www.mediawikiunplugged.com/html
#scp redirect.html $host:$dir/index.html

# hosted on whatfettle.com
host=pauldowney@amp.dreamhost.com
dir=/home/pauldowney/mediawikiunplugged.com

scp index.html index.xml $host:$dir
scp MediaWikiUnplugged.zip $host:$dir

ssh $host mkdir -p $dir/images
scp images/* $host:$dir/images

ssh $host mkdir -p $dir/counter
scp counter/index.php $host:$dir/counter
