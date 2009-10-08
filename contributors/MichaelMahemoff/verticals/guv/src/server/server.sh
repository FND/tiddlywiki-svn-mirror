#!/bin/bash
export PYTHONPATH=`pwd`
echo 'Visit http://tiddlyguv.dev:9090/challenge/ldap?tiddlyweb_redirect=%2Frecipes%2Fportal%2Ftiddlers.wiki'
echo 'Regular user login: mike/mike. Admin login: bob/bob'
# if [ `hostname` == 'thehostname' ] ; then
  # cp tiddlywebconfig.dev.py tiddlywebconfig.py
# fi
twanager server tiddlyguv.dev 9090
