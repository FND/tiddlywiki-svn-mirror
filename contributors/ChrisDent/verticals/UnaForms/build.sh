#!/bin/sh -xe
#sudo apt-get install python2.5-dev
#sudo easy_install -U tiddlyweb
#sudo easy_install -U tiddlywebplugins
#sudo easy_install -U PyYAML
#sudo easy_install -U jinja2
twanager instance uf
svn export http://svn.tiddlywiki.org/Trunk/contributors/ChrisDent/verticals/UnaForms/uf uf/ --force
cd uf
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/manager-lister/lister.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/logout/logout.py
#twanager
twanager bag formtools<<EOF
{"policy":{"read": [], "create": ["R:ADMIN"], "manage": ["R:ADMIN"], "write": ["R:ADMIN"], "owner": null, "delete": ["R:ADMIN"]}}
EOF
twanager update
twanager lbags
##
## create form template
##
twanager bag registrationex<<EOF
{"policy":{"read": [], "create": ["R:ADMIN"], "manage": ["R:ADMIN"], "write": ["R:ADMIN"], "owner": null, "delete": ["R:ADMIN"]}}
EOF
twanager from_svn registrationex http://svn.tiddlywiki.org/Trunk/contributors/SaqImtiaz/verticals/InputExForms/schemas/split.recipe
# create recipe
twanager recipe registrationex<<EOF
/bags/system/tiddlers
/bags/formtools/tiddlers
/bags/registrationex/tiddlers
EOF
twanager adduser test test
twanager adduser $1 $2 ADMIN
twanager formform registrationex
#twanager server 
