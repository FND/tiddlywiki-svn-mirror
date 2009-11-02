#!/bin/bash
if [ "$tiddlyweb_port" == "" ] ; then tiddlyweb_port=8080 ; fi
echo "starting server at http://traily.dev:$tiddlyweb_port/trails/mike/news.player"
twanager wserver traily.dev $tiddlyweb_port
