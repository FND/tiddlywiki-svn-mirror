/***
|''Name:''|FilterTiddlersPlugin|
|''Description:''|Filter the tiddlers in a TiddlyWiki|
|''Author''|JonathanLister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/FilterTiddlersPlugin.js |
|''Version:''|0.4|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|

! Usage
{{{
store.filterTiddlers(filter)
}}}
where "filter" is a filter expression, as explained below

Returns an array of Tiddler() objects that match the filter expression

! Filter expressions
Filter expressions are of the form:
{{{
filterString | filterString | ... // only one filterString is required
}}}
where filterString is of the form:
{{{
[filterElements]
}}}
where filterElements is one or more of the following:
* [TiddlerName]
* tag[TagName]
* sort[SortField]
* limit[NoOfResults]

***/

//{{{
if(!version.extensions.FilterTiddlersPlugin) {
version.extensions.FilterTiddlersPlugin = {installed:true};

TiddlyWiki.prototype.filterTiddlers = function(filter) {
	var pieces = [];
	var results = [];
	var makeStore = function(tiddlers) {
		if(tiddlers && tiddlers.length===0) {
			return store;
		}
		var TW = new TiddlyWiki();
		for(var i=0;i<tiddlers.length;i++) {
			TW.addTiddler(tiddlers[i]);
		}
		return TW;
	};
	var filterTiddlers = function(filter,tiddlers)
	{
		var store = makeStore(tiddlers);
		var results = [];
		var accumulator = [];
		var addToResults = function(results,tiddlers) {
			for(var i=0;i<tiddlers.length;i++) {
				results.pushUnique(tiddlers[i]);
			}
		};
		var addAllToResults = function(results,toExclude) {
			if(toExclude && toExclude.length) {
				var titles = [];
				for(var i=0;i<toExclude.length;i++) {
					titles.push(toExclude[i].title);
				}
				store.forEachTiddler(function(title,tiddler) {
					if(titles && !titles.contains(title)) {
						results.pushUnique(tiddler);
					}
				});
			} else {
				store.forEachTiddler(function(title,tiddler) {
					results.pushUnique(tiddler);
				});
			}
		};
		var removeFromResults = function(results,tiddlers) {
			for(var i=0;i<tiddlers.length;i++) {
				var n = results.indexOf(tiddler[i]);
				if(n!=-1)
					results.splice(n,1);
			}
		};
		var tiddlerSort = function(field) {
			// if the accumulator is empty, sort the results array
			if(accumulator.length==0)
				results = store.sortTiddlers(results,field);
			else
				accumulator = store.sortTiddlers(accumulator,field);
		};
		var limitResults = function(limit) {
			// if the accumulator is empty, limit the results array
			var arrayToSplice = accumulator.length==0 ? results : accumulator;
			if(arrayToSplice.length>limit) {
				arrayToSplice.splice(limit,arrayToSplice.length-limit);
			}
		};
		if(filter) {
			var tiddler, tiddlers;
			var re = /([^ \[\]]+)|(?:\[((?:[ \w-+!]+\[[^\]]+\])+)\])|(?:\[\[([^\]]+)\]\])/mg;
			var re_inner = /([ \w-+!]+)\[([^\]]+)]/mg;
			var match = re.exec(filter);
			while(match) {
				if(match[1] || match[3]) {
					var title = match[1] ? match[1] : match[3];
					if(title=="*") {
						addAllToResults(results);
					} else {
						tiddler = store.fetchTiddler(title);
						if(tiddler) {
							addToResults(results,[tiddler]);
						} else if(store.isShadowTiddler(title)) {
							tiddler = new Tiddler();
							tiddler.set(title,store.getTiddlerText(title));
							addToResults(results,[tiddler]);
						}
					}
				} else if(match[2]) {
					// loop through the nested matches of the form 'tag[word]'
					var match_inner = re_inner.exec(match[2]);
					while(match_inner) {
						switch(match_inner[1]) {
						// Note: all 'tag' case fall-through are intentional
						case "-tag":
							tiddlers = store.getTaggedTiddlers(match_inner[2]);
							removeFromResults(accumulator,tiddlers);
							break;
						case "tag":
						case "+tag":
							tiddlers = store.getTaggedTiddlers(match_inner[2]);
							addToResults(accumulator,tiddlers);
							break;
						case "!tag":
							tiddlers = store.getTaggedTiddlers(match_inner[2]);
							addAllToResults(accumulator,tiddlers);
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
	if(filter) {
		pieces = filter.split("|");
		for(var i=0;i<pieces.length;i++) {
			results = filterTiddlers(pieces[i],results);
		}
	}
	return results;
};

// Move this to config.messages once approved
merge(config.messages,{
	filterSortError:"Error in tiddler filter expression: '[-sort[field]]' is invalid; use '[sort[-field]]' instead"
});

} //# end of 'install only once'
//}}}