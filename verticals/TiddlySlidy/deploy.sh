#
#  script to deploy to server
#  - you need to run build.sh and follow instructions first
#
host=pauldowney@amp.dreamhost.com
dir=/home/pauldowney/tiddlyslidy.com

#ssh $host mkdir $dir/images

scp index.html $host:$dir

#scp images/* $host:$dir/images
#scp TiddlySlidy.zip  $host:$dir
