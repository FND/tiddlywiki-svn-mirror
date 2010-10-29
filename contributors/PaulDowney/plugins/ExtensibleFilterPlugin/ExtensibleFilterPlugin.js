/***
|''Name:''|ExtensibleFilterPlugin|
|''Description:''|Introduce conflig.filters for extensible filtering of tiddlers |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ExtensibleFilterPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ExtensibleFilterPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config */
(function ($) {
    version.extensions.ExtensibleFilterPlugin = {installed: true};

	// Extensible filter functions
	config.filters = {
		"tag": function (results, match) {
			var matched = this.getTaggedTiddlers(match[3]);
			for(var m = 0; m < matched.length; m++)
				results.pushUnique(matched[m]);
			return results;
		},
		"sort": function (results, match) {
			return this.sortTiddlers(this, results, match[3]);
		},
		"limit": function (results, match) {
			return results.slice(0, parseInt(match[3],10));
		}
	};

	// Filter a list of tiddlers
	//#   filter - filter expression (eg "tidlertitle [[multi word tiddler title]] [tag[systemConfig]]")
	//# Returns an array of Tiddler() objects that match the filter expression
	TiddlyWiki.prototype.filterTiddlers = function(filter)
	{
		var results = [];
		if(filter) {
			var tiddler;
			var re = /([^\s\[\]]+)|(?:\[([ \w]+)\[([^\]]+)\]\])|(?:\[\[([^\]]+)\]\])/mg;
			var match = re.exec(filter);
			while(match) {
				if(match[1] || match[4]) {
					//# matches (eg) text or [[tiddler title]]
					var title = match[1] || match[4];
					tiddler = this.fetchTiddler(title);
					if(tiddler) {
						results.pushUnique(tiddler);
					} else if(this.isShadowTiddler(title)) {
						tiddler = new Tiddler();
						tiddler.set(title,this.getTiddlerText(title));
						results.pushUnique(tiddler);
					} else {
						results.pushUnique(new Tiddler(title));
					}
				} else if(match[2]) {
					//# matches (eg) [text[more text]]
					if (config.filters[match[2]]) {
						results = config.filters[match[2]].call(this, results, match);
					} else {
						var matched = this.getValueTiddlers(match[2],match[3]);
						for(var m = 0; m < matched.length; m++) {
							results.pushUnique(matched[m]);
						}
					}
				}
				match = re.exec(filter);
			}
		}
		return results;
	};

}(jQuery));
//}}}
