

rm tiddlydocs -R -f

twanager --load tiddlywebwiki.config instance tiddlydocs

cd tiddlydocs

curl http://github.com/tiddlyweb/tiddlyweb/raw/master/apache.py > apache.py
curl http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atom.py > atom.py
curl http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/atomplugin.py > atomplugin.py
curl http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/atom/htmlatom.py > htmlatom.py
curl http://github.com/tiddlyweb/tiddlyweb-plugins/raw/master/twstatic/static.py > static.py
curl http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/tiddlyeditor_plus.py > tiddlyeditor_plus.py
curl http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/TiddlyDocs/gadget.py > gadget.py
curl http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/TiddlyDocs/room_script.py > room_script.py
curl http://github.com/bengillies/TiddlyWeb-Plugins/raw/master/validators/html_validator.py > html_validator.py
curl http://github.com/bengillies/TiddlyWeb-Plugins/raw/master/validators/tiddlywiki_validator.py > tiddlywiki_validator.py

rm tiddlywebconfig.py
curl http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/tiddlywebconfig.py >tiddlywebconfig.py

twanager bag tdocs<<EOF
{"policy": {"write": ["ADMIN"]}}
EOF

twanager bag documents<<EOF
{"policy": {"accept": ["NONE"]}}
EOF

twanager from_svn documents http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/documents/TheInternet/split.recipe
twanager from_svn tdocs http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/index.html.recipe

# Revisions 
twanager from_svn system http://svn.tiddlywiki.org/Trunk/association/plugins/RevisionsCommandPlugin.js
twanager from_svn system http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/DiffFormatterPlugin.js
curl http://github.com/FND/tiddlyweb-plugins/raw/master/differ.py > differ.py

twanager from_svn system http://svn.tiddlywiki.org/Trunk/association/plugins/ServerSideSavingPlugin.js

# get RDF plugin
mkdir rtf
curl http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/tiddlyweb/TiddlyWebRTF/rtf/__init__.py > rtf/__init__.py

curl http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/TiddlyDocs/room_script.py > room_script.py

#curl http://github.com/bengillies/TiddlyWeb-Plugins/raw/master/form/form.py > form.py

twanager recipe tiddlydocs<<EOF
/bags/system/tiddlers
/bags/tdocs/tiddlers
/bags/documents/tiddlers
EOF


## Get CKEditor 
mkdir static 
cd static 
mkdir ckeditor 
curl http://download.cksource.com/CKEditor/CKEditor/CKEditor%203.0/ckeditor_3.0.tar.gz > ckeditor_3.0.tar.gz
tar xvf ckeditor_3.0.tar.gz
rm ckeditor_3.0.tar.gz

svn co http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/static/mypage_images/ mydocs_images
svn co http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/static/mypage_css/ mypage_css
cd ../

## TEMP - update permissions on system bag
rm store/bags/system/policy
curl http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/tiddlyweb/tiddlydocs/store/bags/system/policy > store/bags/system/policy

cd ../
chown apache  *  -R

/sbin/service httpd restart
