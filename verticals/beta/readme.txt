TiddlyWiki beta

This directory contains what is required to build a beta version of TiddlyWiki. There are two recipes:

index.2.4.0.B2.html.recipe
empty.2.4.0.B2.html.recipe

The above recipes are named assuming the 2.4.0 Beta 2 release, and change according to the release.

These recipes are used to build the content of www.tiddlywiki.com/beta and an empty tiddlywiki. The script "bldbeta" can be used to cook these recipes.

For 2.4 these need to be cooked and the resultant TiddlyWikis copied onto the server as follows:

index.2.4.0.B2.html => http://www.tiddlywiki.com/beta/index.html
empty.2.4.0.B2.html => http://www.tiddlywiki.com/beta/empty.html
empty.2.4.0.B2.html => http://www.tiddlywiki.com/upgrade/index.html

The script "uploadbeta" can be used to upload the index and empty html files onto the tiddlywiki.com server (you will be prompted for your username and password twice).

Because 2.4.0 is the first version of TiddlyWiki to have an upgrade mechanism it is fine to copy the beta empty file to http://www.tiddlywiki.com/upgrade/index.html. Beta releases after 2.4.0 need to copy this empty file to http://www.tiddlywiki.com/beta/upgrade/index.html