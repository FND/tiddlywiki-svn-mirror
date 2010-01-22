#
#  script to deploy to server
#  - you need to run build.sh and follow instructions first
#
host=pauldowney@amp.dreamhost.com
dir=/home/pauldowney/tiddlyslidy.com

rsync -avz -e ssh index.html TiddlySlidy.zip *png *jpg $host:$dir
