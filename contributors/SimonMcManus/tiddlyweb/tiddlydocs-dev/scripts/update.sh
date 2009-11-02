

## Get CKEditor 
mkdir static 
cd static 
mkdir ckeditor 
curl http://download.cksource.com/CKEditor/CKEditor/CKEditor%203.0/ckeditor_3.0.tar.gz > ckeditor_3.0.tar.gz
tar xvf ckeditor_3.0.tar.gz
rm ckeditor_3.0.tar.gz


twanager recipe tiddlydocs<<EOF
/bags/system/tiddlers
/bags/tiddlydocs_core/tiddlers
EOF