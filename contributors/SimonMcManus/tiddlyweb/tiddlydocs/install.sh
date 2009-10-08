

rm tiddlydocs -R -f

twanager --load tiddlywebwiki.config instance tiddlydocs

cd tiddlydocs

wget http://github.com/tiddlyweb/tiddlyweb/raw/master/apache.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atom.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atomplugin.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/htmlatom.py
wget http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/twstatic/static.py
wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/tiddlyeditor_plus.py

rm tiddlywebconfig.py
wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/tiddlywebconfig.py

twanager bag tdocs < /dev/null
twanager bag documents < /dev/null

twanager from_svn documents http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/documents/TheInternet/split.recipe
twanager from_svn tdocs http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/index.html.recipe
twanager from_svn system http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/ServerSideSavingPlugin.js

# Revisions 
twanager from_svn system http://svn.tiddlywiki.org/Trunk/association/plugins/RevisionsCommandPlugin.js
twanager from_svn system http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/DiffFormatterPlugin.js

wget http://github.com/FND/tiddlyweb-plugins/raw/master/differ.py 

# get RDF plugin
mkdir rtf
cd rtf
wget http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/tiddlyweb/TiddlyWebRTF/rtf/__init__.py
cd ../


wget http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/TiddlyDocs/room_script.py

#wget http://github.com/bengillies/TiddlyWeb-Plugins/raw/master/form/form.py



## get recipe files 
cd store/recipes
wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/store/recipes/tiddlydocs 
cd ../../

## Get CKEditor 
mkdir static 
cd static 
mkdir ckeditor 
wget http://download.cksource.com/CKEditor/CKEditor/CKEditor%203.0/ckeditor_3.0.tar.gz
tar xvf ckeditor_3.0.tar.gz
rm ckeditor_3.0.tar.gz

svn co http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/static/mypage_images/ mydocs_images
svn co http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/static/mypage_css/ mypage_css
cd ../

## TEMP - update permissions on system bag
cd store/bags/system/
rm policy
wget http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/store/bags/system/policy 
cd ../../../

cd ../
chown apache  *  -R

/sbin/service httpd restart
