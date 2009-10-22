#!/bin/bash
if [ "$tiddlyweb_port" == "" ] ; then tiddlyweb_port=8080 ; fi
echo "starting server at http://trails.dev:$tiddlyweb_port/static/demo.html"
twanager wserver trails.dev $tiddlyweb_port
