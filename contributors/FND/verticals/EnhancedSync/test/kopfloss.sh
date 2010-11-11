#!/usr/bin/env sh

cd "`dirname $0`/kopfloss"
./run.sh $@ "fixtures/browser.js" \
	"../../../../../../core/jquery/jquery-1.4.3.min.js" \
	"../fixtures/kopfloss.js" "../fixtures/tiddlywiki.js" \
	"../../../../plugins/EnhancedSyncPlugin.js" \
	"../candidates.js" "../tasks.js" "../remotes.js" "../processing.js"
