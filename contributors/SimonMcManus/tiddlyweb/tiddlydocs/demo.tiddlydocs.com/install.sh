twinstance demo.tiddlydocs.com
cd demo.tiddlydocs.com

twanager bag ckeditor<<EOF
{"policy": {"write": ["ADMIN"]}}
EOF

twanager bag tiddlydocs<<EOF
{"policy": {"write": ["ADMIN"]}}
EOF

twanager bag mydocs<<EOF
{"policy": {"write": ["ADMIN"]}}
EOF

twanager bag documents<<EOF
{"policy": {"accept": ["NONE"]}}
EOF



twanager recipe ckeditor<<EOF
/bags/system/tiddlers
/bags/ckeditor/tiddlers
EOF

twanager recipe tiddlydocs<<EOF
/bags/system/tiddlers
/bags/tiddlydocs/tiddlers
/bags/documents/tiddlers
EOF

twanager recipe mydocs<<EOF
/bags/system/tiddlers
/bags/tiddlydocs/tiddlers
/bags/mydocs/tiddlers
/bags/ckeditor/tiddlers
/bags/documents/tiddlers
EOF

./update.sh


#pip install -U tiddlywebplugins.tiddlydocs 
#tiddlydocs_static_files.sh

