#!/usr/bin/env bash

# set up TiddlyWeb instance using devtext store
#
# Usage:
#  $ ./devinstance.sh targetDir
#
# TODO:
# * make devtext store optional

instance="dev"

function quit {
	echo "aborting: $1"
	exit
}

if [ $# -gt 0 ]; then
	cd $1 || quit "invalid target directory"
else
	quit "target directory not specified"
fi

# remove trailing slash
dir=`echo $1 | sed -e "s/\/$//"`

# initialize configuration
wget http://github.com/FND/tiddlyweb-plugins/raw/master/devtext.py
tiddlywebconfig='{\n	"server_store": ["devtext", { "store_root": "store" }]\n}'
echo -e "config = $tiddlywebconfig" > tiddlywebconfig.py

#  create instance
twanager instance $instance &&
	rm tiddlywebconfig.py tiddlyweb.log *.pyc &&
	cd $instance ||
	quit "failed to create instance"

# configure instance
mv ../devtext.py ./
echo -e "config.update($tiddlywebconfig)" >> tiddlywebconfig.py # XXX: odd way to merge with existing config!?

# create sample tiddler
twanager bag content < /dev/null
echo -e "tags: tmp test\n\nlorem ipsum dolor sit amet" | twanager tiddler lipsum content
# create sample plugin
twanager bag plugins < /dev/null
echo -e 'alert("Hello world!");' > store/plugins/helloworld.js
# create sample recipe
echo -e "/bags/system/tiddlers\n/bags/plugins/tiddlers\n/bags/content/tiddlers" | twanager recipe sample

echo -e "\ninstance created; run \"twanager server\" from $dir/$instance to start server"
