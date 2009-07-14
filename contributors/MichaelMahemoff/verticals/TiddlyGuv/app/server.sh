#!/bin/bash
export PYTHONPATH=`pwd`
# if [ `hostname` == 'michael-mahemoffs-macbook-pro.local' ] ; then
  # cp tiddlywebconfig.dev.py tiddlywebconfig.py
# fi
twanager server tiddlyguv.dev 9090
