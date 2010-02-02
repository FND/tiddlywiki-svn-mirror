#ck parts

ck tiddlydocs.html.recipe
scp  tiddlydocs.html root@tiddlydocs.com:/data/vhost/tiddlydocs.com/pieces/tiddlydocs.html
rm tiddlydocs.html

ck ../../ckeditor/split.html.recipe
scp ../../ckeditor/split.html root@tiddlydocs.com:/data/vhost/tiddlydocs.com/pieces/fckeditor.html
rm ../../ckeditor/split.html

ck ../themes/css3/split.html.recipe
scp ../themes/css3/split.html root@tiddlydocs.com:/data/vhost/tiddlydocs.com/pieces/css3Theme.html
rm ../themes/css3/split.html

ck ../themes/minimal/split.html.recipe
scp ../themes/minimal/split.html root@tiddlydocs.com:/data/vhost/tiddlydocs.com/pieces/minimalTheme.html
rm ../themes/minimal/split.html