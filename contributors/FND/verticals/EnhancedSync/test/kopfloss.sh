#!/usr/bin/env sh

cd "`dirname $0`/kopfloss"
./run.sh $@ "fixtures/browser.js" \
	"../../../../../../core/jquery/jquery.js" \
	"../fixtures/kopfloss.js" "../fixtures/tiddlywiki.js" \
	"../../../../plugins/EnhancedSyncPlugin.js" \
	../*.js
