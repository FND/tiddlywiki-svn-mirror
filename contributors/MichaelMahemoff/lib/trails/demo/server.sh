#!/bin/bash
if [ "$tiddlyweb_port" == "" ] ; then tiddlyweb_port=8080 ; fi
echo "starting server at http://trails.dev:$tiddlyweb_port/trails/mike/news.player"
twanager wserver trails.dev $tiddlyweb_port
