#!/bin/bash
export PYTHONPATH=`pwd`
if [ `hostname` == 'michael-mahemoffs-macbook-pro.local' ] ; then
  cp tiddlywebconfig.dev.py tiddlywebconfig.py
fi
$TIDDLYWEB_ROOT/twanager server 0.0.0.0 8080
