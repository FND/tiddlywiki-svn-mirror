

rm ../tiddlydocs -R -f

twanager --load tiddlywebwiki.config instance tiddlydocs

cd tiddlydocs

wget http://github.com/tiddlyweb/tiddlyweb/raw/master/apache.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/e7cdc9d91a7fe9e8483933f3e1275139718e321d/atom/atom.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/e7cdc9d91a7fe9e8483933f3e1275139718e321d/atom/atomplugin.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/e7cdc9d91a7fe9e8483933f3e1275139718e321d/atom/htmlatom.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/e7cdc9d91a7fe9e8483933f3e1275139718e321d/twstatic/static.py

wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/tiddlywebconfig.py

twanager bag tdocs < /dev/null
twanager bag documents < /dev/null

twanager from_svn documents http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/documents/TheInternet/split.recipe
twanager from_svn tdocs http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/index.html.recipe

chown apache  *  -R

