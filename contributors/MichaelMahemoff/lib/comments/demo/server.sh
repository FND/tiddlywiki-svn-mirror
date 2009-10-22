#!/bin/bash
if [ "$tiddlyweb_port" == "" ] ; then tiddlyweb_port=8080 ; fi
echo '******************************************************************************'
echo 'Comments Plugin Demo'
echo "Point your browser at http://comments.dev:${tiddlyweb_port}/static/demo.html"
echo '******************************************************************************'
twanager wserver comments.dev $tiddlyweb_port
