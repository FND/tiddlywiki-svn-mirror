// Filter a list of tiddlers
//#   filter - filter expression (eg "tiddlertitle [[multi word tiddler title]] [tag[systemConfig]]")
//# Returns an array of Tiddler() objects that match the filter expression
// Limit: [tag[systemConfig]limit[10]] or [tag[systemConfig]] [tag[excludeLists]] [limit[10]]
TiddlyWiki.prototype.filterTiddlers = function(filter)
{
	var results = [];
	var accumulator = [];
	var that = this;
	var addToResults = function(tiddlers,tiddler) {
		tiddlers.pushUnique(tiddler);
	};
	var addAllToResults = function(tiddlers) {
		that.forEachTiddler(function(title,tiddler){
			addToResults(tiddlers,tiddler);
		});
	};
	var removeFromResults = function(tiddlers,tiddler) {
		var i = tiddlers.indexOf(tiddler);
		if(i!=-1)
			tiddlers.splice(i,1);
	};
	var tiddlerSort = function(field) {
		// if the accumulator is empty, sort the results array
		if(accumulator.length==0)
			results = that.sortTiddlers(results,field);
		else
			accumulator = that.sortTiddlers(accumulator,field);
	};
	var limitResults = function(limit) {
		// if the accumulator is empty, limit the results array
		var arrayToSplice = accumulator.length==0 ? results : accumulator;
		if(arrayToSplice.length>limit)
			arrayToSplice.splice(limit);
	};
	if(filter) {
		var tiddler;
		var re = /([^ \[\]]+)|(?:\[((?:[ \w-]+\[[^\]]+\])+)\])|(?:\[\[([^\]]+)\]\])/mg;
		var re_inner = /([ \w-]+)\[([^\]]+)]/mg;
		var match = re.exec(filter);
		while(match) {
			if(match[1] || match[3]) {
				var title = match[1] ? match[1] : match[3];
				if(title=="*") {
					addAllToResults(results);
				} else {
					tiddler = this.fetchTiddler(title);
					if(tiddler) {
						addToResults(results,tiddler);
					} else if(store.isShadowTiddler(title)) {
						tiddler = new Tiddler();
						tiddler.set(title,store.getTiddlerText(title));
						addToResults(results,tiddler);
					}
				}
			} else if(match[2]) {
				// loop through the nested matches of the form 'tag[word]'
				var match_inner = re_inner.exec(match[2]);
				while(match_inner) {
					var accModifier = addToResults;
					switch(match_inner[1]) {
					// Note: all 'tag' case fall-through are intentional
					case "-tag":
						accModifier = removeFromResults;
					case "tag":
					case "+tag":
						this.forEachTiddler(function(title,tiddler) {
							if(tiddler.isTagged(match_inner[2]))
								accModifier(accumulator,tiddler);
						});
						break;
					case "-sort":
						// this is a syntax error
						displayError(config.messages.filterSortError);
						break;
					case "+sort":
						// this fall-through is intentional
					case "sort":
						tiddlerSort(match_inner[2]);
						break;
					case "limit":
						limitResults(match_inner[2]);
						break;
					}
					match_inner = re_inner.exec(match[2]);
				}
			}
			// push accumulator onto results stack
			for (var i=0; i<accumulator.length; i++) {
				results.pushUnique(accumulator[i]);
			}
			accumulator = [];
			match = re.exec(filter);
		}
	}
	return results;
};

// Move this to config.messages once approved
merge(config.messages,{
	filterSortError:"Error in tiddler filter expression: '[-sort[field]]' is invalid; use '[sort[-field]]' instead"
});