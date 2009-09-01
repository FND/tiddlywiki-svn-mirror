

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

## get RDF plugin
#mkdir rtf
#cd rtf
#wget http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/tiddlyweb/TiddlyWebRTF/rtf/__init__.py
#cd ../

## get recipe files 
cd store/recipes
wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/store/recipes/tiddlydocs 
cd ../../


mkdir static 
cd static 
mkdir ckeditor 
wget http://download.cksource.com/CKEditor/CKEditor/CKEditor%203.0/ckeditor_3.0.zip
unzip ckeditor_3.0.zip
rm cheditor_3.0.zip

svn co http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/static/mypage_images/ mypage_images


## TEMP - update permissions on system bag
#wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/store/bags/system/policy > store/bags/system/policy


cd ../
chown apache  *  -R

/sbin/service httpd restart
