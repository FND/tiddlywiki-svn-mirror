#ck parts

ck tiddlydocs.html.recipe
scp  tiddlydocs.html root@tiddlydocs.com:/data/vhost/tiddlydocs.com/recipes/tiddlydocs.html
rm tiddlydocs.html

ck ../../ckeditor/split.html.recipe
scp ../../ckeditor/split.html root@tiddlydocs.com:/data/vhost/tiddlydocs.com/recipes/fckeditor.html
rm ../../ckeditor/split.html


ck ../themes/minimal/split.html.recipe
scp ../themes/minimal/split.html root@tiddlydocs.com:/data/vhost/tiddlydocs.com/recipes/minimalTheme.html
rm ../themes/minimal/split.html