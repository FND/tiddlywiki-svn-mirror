/***
|''Name''|CrossIndexingMacro|
|''Version''|0.7|
|''Status''|@@beta@@|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#CrossIndexingMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|[//TBD//]|
!Notes
Created [[for DaveG|http://groups.google.com/group/TiddlyWiki/browse_thread/thread/afa54bd105e791fa]]'s [[My Notes TiddlyWiki|http://www.giffmex.org/emptynotestw.html]].
!Usage
{{{
<<crossIndex [tag] [scope]>>
}}}
!Revision History
!!v0.5 (2008-02-08)
* initial release
!!v0.6 (2008-02-09)
* renamed to CrossIndexingMacro (from TiddlerHierarchyMacro)
* added listing of uncategorized items
* linkified headings
!!v0.7 (2008-02-10)
* added optional scope parameter
* fixed "uncategorized" listings
* minor code enhancements
!To Do
* rename
* documentation
* code sanitizing
!Code
***/
//{{{
config.macros.crossIndex = {};

config.macros.crossIndex.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var scope = params[1] || tiddler.title;
	var index = this.getIndex(scope, params[0]);
	var output = "";
	var i;
	for(topic in index) {
		if(index[topic].length > 0) {
			output += "![[" + topic + "]]\n";
			for(i = 0; i < index[topic].length; i++) {
				output += "* [[" + index[topic][i] + "]]\n";
			}
		}
	}
	wikify(output, place);
}

config.macros.crossIndex.getIndex = function(scope, category) {
	// retrieve topics
	var topics = store.getTaggedTiddlers(category).map(function(t) { return t.title });
	// generate index
	var index = {
		uncategorized: []
	};
	for(i = 0; i < topics.length; i++) {
		index[topics[i]] = [];
		store.forEachTiddler(function(title, tiddler) {
			if(tiddler.tags.containsAll([scope, topics[i]]))
				index[topics[i]].push(title);
			else if(tiddler.tags.contains(scope) && !tiddler.tags.containsAny(topics))
				index.uncategorized.pushUnique(title);
		});
	}
	return index;
}
//}}}