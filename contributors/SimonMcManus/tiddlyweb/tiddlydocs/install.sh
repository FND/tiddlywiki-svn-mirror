

rm tiddlydocs -R -f

twanager --load tiddlywebwiki.config instance tiddlydocs

cd tiddlydocs

wget http://github.com/tiddlyweb/tiddlyweb/raw/master/apache.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atom.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atomplugin.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/htmlatom.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/twstatic/static.py

rm tiddlywebconfig.py
wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/tiddlywebconfig.py

twanager bag tdocs < /dev/null
twanager bag documents < /dev/null

twanager from_svn documents http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/documents/TheInternet/split.recipe
twanager from_svn tdocs http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/index.html.recipe

## get recipe files 
wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/store/recipes/tiddlydocs > store/recipes/tiddlydocs


## TEMP - update permissions on system bag
wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/store/bags/system/policy > store/bags/system/policy

chown apache  *  -R

