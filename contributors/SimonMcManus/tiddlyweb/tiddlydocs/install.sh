

rm ../tiddlydocs -R -f

twanager --load tiddlywebwiki.config instance tiddlydocs
twanager bag tdocs
twanager bag documents

wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/e7cdc9d91a7fe9e8483933f3e1275139718e321d/atom/atom.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/e7cdc9d91a7fe9e8483933f3e1275139718e321d/atom/atomplugin.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/e7cdc9d91a7fe9e8483933f3e1275139718e321d/atom/htmlatom.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/e7cdc9d91a7fe9e8483933f3e1275139718e321d/twstatic/static.py

twanager from_svn documents http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/documents/TheInternet/split.recipe
twanager from_svn tdocs http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/index.html.recipe
chown apache  *  -R

