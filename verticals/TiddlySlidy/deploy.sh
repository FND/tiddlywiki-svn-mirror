#
#  script to deploy to server
#  - you need to run build.sh and follow instructions first
#
host=${TW_DEPLOY_HOST:?}
dir=/home/pauldowney/tiddlyslidy.com

rsync --exclude .svn -avz -e ssh index.html TiddlySlidy.zip images $host:$dir
