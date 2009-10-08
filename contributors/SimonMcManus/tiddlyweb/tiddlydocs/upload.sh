
if [ -z "$1" ]              # Tested variable is quoted.
then
 echo "ERROR - You need to provide the release number....."  # Need quotes to escape #
exit 1
fi

scp -i ~/.ssh/smm-keypair builds/tiddlydocs-$1.tar.gz  root@wiki.osmosoft.com:/mnt/www/html/TiddlyDocs/downloads
scp -i ~/.ssh/smm-keypair builds/tiddlydocs-$1.tar.gz  root@wiki.osmosoft.com:/mnt/www/html/TiddlyDocs/downloads/tiddlydocs-latest.tar.gz
