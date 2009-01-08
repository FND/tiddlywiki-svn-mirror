TiddlyWiki standard distribution

This directory contains what is required to build a distribution of TiddlyWiki. There are two recipes:

index.2.4.2.html.recipe
empty.2.4.2.html.recipe

The above recipes are named assuming the 2.4.2 release, and change according to the release.

These recipes are used to build the content of www.tiddlywiki.com and an empty tiddlywiki. The script "bld" can be used to cook these recipes.

After building, the "index" document needs to be saved in the browser once to set the title and generate the RSS feed.

For 2.4.2 these need to be cooked and the resultant TiddlyWikis copied onto the server as follows:

index.2.4.2.html => http://www.tiddlywiki.com/index.html
empty.2.4.2.html => http://www.tiddlywiki.com/empty.html
empty.2.4.2.html => http://www.tiddlywiki.com/upgrade/index.html

The script "upload" can be used to upload the index and empty html files onto the tiddlywiki.com server (you will be prompted for your username and password twice).
Alternatively, the script "uploaddav" can be used, which only requires a single password prompt.

Note:
In preparation for a release, the following steps need to be taken:
* set version number in Trunk/core/js/Version.js
* create recipe in Trunk/core/recipes/
* tag release to Tags/core/
* update tiddlywiki.com vertical's recipes
* update tiddlywiki.com vertical's NewFeatures tiddler
