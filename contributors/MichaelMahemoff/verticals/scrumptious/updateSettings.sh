#!/bin/bash

export SCRUMPTIOUS_DOMAIN="scrumptious.tv"
export SCRUMPTIOUS_PORT="80"
export SCRUMPTIOUS_URL_ROOT="http://$SCRUMPTIOUS_DOMAIN/comments"

cd `dirname $0`
sed -i'' -e "s|http:\/\/comments.boz:8080\/comments|$SCRUMPTIOUS_URL_ROOT|g" *.html *.js static/js/injection.js
sed -i'' -e "s|comments.boz|$SCRUMPTIOUS_DOMAIN|g" tiddlywebconfig.py
sed -i'' -e "s|8080|$SCRUMPTIOUS_PORT|g" tiddlywebconfig.py
