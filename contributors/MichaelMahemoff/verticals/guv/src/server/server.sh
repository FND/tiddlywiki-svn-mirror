#!/bin/bash
# assumes you're running tiddlyguv at tiddlyguv.dev
# easiest is to edit /etc/hosts and add, for example, mapping for tiddlyguv.dev to 127.0.0.1
export PYTHONPATH=`pwd`
echo 'Visit'
echo 'http://tiddlyguv.dev:9090/challenge/ldap?tiddlyweb_redirect=%2Frecipes%2Fportal%2Ftiddlers.wiki'
echo 'Regular user login: mike/mike. Admin login: bob/bob'
# if [ `hostname` == 'thehostname' ] ; then
  # cp tiddlywebconfig.dev.py tiddlywebconfig.py
# fi
twanager server tiddlyguv.dev 9090
