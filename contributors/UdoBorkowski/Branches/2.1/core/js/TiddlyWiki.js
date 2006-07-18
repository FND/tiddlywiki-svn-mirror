// ---------------------------------------------------------------------------------
// TiddlyWiki() object contains Tiddler()s
// ---------------------------------------------------------------------------------

function TiddlyWiki()
{
	var tiddlers = {}; // Hashmap by name of tiddlers
	this.namedNotifications = []; // Array of {name:,notify:} of notification functions
	this.notificationLevel = 0;
	this.slices = {}; // map tiddlerName->(map sliceName->sliceValue). Lazy.
	this.clear = function() {
		tiddlers = {};
		this.setDirty(false);
		};
	this.fetchTiddler = function(title) {
		return tiddlers[title];
		};
	this.deleteTiddler = function(title) {
		 delete this.slices[title];
		 delete tiddlers[title];
		};
	this.addTiddler = function(tiddler) {
		 delete this.slices[tiddler.title];
		 tiddlers[tiddler.title] = tiddler;
		};
	this.forEachTiddler = function(callback) {
		for(var t in tiddlers)
			{
			var tiddler = tiddlers[t];
			if(tiddler instanceof Tiddler)
				callback.call(this,t,tiddler);
			}
		};
}

// Set the dirty flag
TiddlyWiki.prototype.setDirty = function(dirty)
{
	this.dirty = dirty;
}

TiddlyWiki.prototype.isDirty = function()
{
	return this.dirty;
}

TiddlyWiki.prototype.suspendNotifications = function()
{
	this.notificationLevel--;
}

TiddlyWiki.prototype.resumeNotifications = function()
{
	this.notificationLevel++;
}

// Invoke the notification handlers for a particular tiddler
TiddlyWiki.prototype.notify = function(title,doBlanket)
{
	if(!this.notificationLevel)
		for(var t=0; t<this.namedNotifications.length; t++)
			{
			var n = this.namedNotifications[t];
			if((n.name == null && doBlanket) || (n.name == title))
				n.notify(title);
			}
}

// Invoke the notification handlers for all tiddlers
TiddlyWiki.prototype.notifyAll = function()
{
	if(!this.notificationLevel)
		for(var t=0; t<this.namedNotifications.length; t++)
			{
			var n = this.namedNotifications[t];
			n.notify(n.name);
			}
}

// Add a notification handler to a tiddler
TiddlyWiki.prototype.addNotification = function(title,fn)
{
	for (var i=0; i<this.namedNotifications.length; i++)
		if((this.namedNotifications[i].name == title) && (this.namedNotifications[i].notify == fn))
			return this;
	this.namedNotifications.push({name: title, notify: fn});
	return this;
}

TiddlyWiki.prototype.removeTiddler = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler)
		{
		this.deleteTiddler(title);
		this.notify(title,true);
		this.setDirty(true);
		}
}

TiddlyWiki.prototype.tiddlerExists = function(title)
{
	var t = this.fetchTiddler(title);
	return (t != undefined);
}

TiddlyWiki.prototype.isShadowTiddler = function(title)
{
	return typeof config.shadowTiddlers[title] == "string";
}

TiddlyWiki.prototype.getTiddler = function(title)
{
	var t = this.fetchTiddler(title);
	if(t != undefined)
		return t;
	else
		return null;
}

TiddlyWiki.prototype.getTiddlerText = function(title,defaultText)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler)
		return tiddler.text;
	if(!title)
		return defaultText;
	var pos = title.indexOf(config.textPrimitives.sliceSeparator);
	if(pos != -1)
		{
		var slice = this.getTiddlerSlice(title.substr(0,pos),title.substr(pos + config.textPrimitives.sliceSeparator.length));
		if(slice)
			return slice;
		}
	if(this.isShadowTiddler(title))
		return config.shadowTiddlers[title];
	if(defaultText != undefined)
		return defaultText;
	return null;
}

TiddlyWiki.prototype.slicesRE = /(?:[\'\/]*(\w+)[\'\/]*\:[\'\/]*\s*(.*?)\s*$)|(?:\|[\'\/]*(\w+)\:?[\'\/]*\|\s*(.*?)\s*\|)/gm

TiddlyWiki.prototype.calcAllSlices = function(title) 
{
	var slices = {};
	var text = this.getTiddlerText(title,"");
	this.slicesRE.lastIndex = 0;
	do 
		{
			var m = this.slicesRE.exec(text);
			if (m) 
				{
					if (m[1])
						slices[m[1]] = m[2];
					else
						slices[m[3]] = m[4];
				}
		}
	while(m);
	return slices;
}

// Returns the slice of text of the given name
//#
//# A text slice is a substring in the tiddler's text that is defined
//# either like this
//#    aName:  textSlice
//# or
//#    |aName:| textSlice |
//# or
//#    |aName| textSlice |
//#
//# In the text the name (or name:) may be decorated with '' or //. I.e.
//# this would also a possible text slice:
//#
//#    |''aName:''| textSlice |
//#
//# @param name should only contain "word characters" (i.e. "a-ZA-Z_0-9")
//# @return [may be undefined] the (trimmed) text of the specified slice.
TiddlyWiki.prototype.getTiddlerSlice = function(title,sliceName)
{
	var slices = this.slices[title];
	if (!slices) {
		slices = this.calcAllSlices(title);
		this.slices[title] = slices;
	}
	return slices[sliceName];
}

// Build an hashmap of the specified named slices of a tiddler
TiddlyWiki.prototype.getTiddlerSlices = function(title,sliceNames)
{
	var r = {};
	for(var t=0; t<sliceNames.length; t++)
		{
		var slice = this.getTiddlerSlice(title,sliceNames[t]);
		if(slice)
			r[sliceNames[t]] = slice;
		}
	return r;
}

TiddlyWiki.prototype.getRecursiveTiddlerText = function(title,defaultText,depth)
{
	var bracketRegExp = new RegExp("(?:\\[\\[([^\\]]+)\\]\\])","mg");
	var text = this.getTiddlerText(title,defaultText);
	if(text == null)
		return "";
	var textOut = [];
	var lastPos = 0;
	do {
		var match = bracketRegExp.exec(text);
		if(match)
			{
			textOut.push(text.substr(lastPos,match.index-lastPos));
			if(match[1])
				{
				if(depth <= 0)
					textOut.push(match[1]);
				else
					textOut.push(this.getRecursiveTiddlerText(match[1],match[1],depth-1));
				}
			lastPos = match.index + match[0].length;
			}
		else
			textOut.push(text.substr(lastPos));
	} while(match);
	return(textOut.join(""));
}

TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields)
{
	var tiddler = this.fetchTiddler(title);
	var created;
	if(tiddler)
		{
		created = tiddler.created; // Preserve created date
		this.deleteTiddler(title);
		}
	else
		{
		tiddler = new Tiddler();
		created = modified;
		}
	tiddler.set(newTitle,newBody,modifier,modified,tags,created,fields);
	this.addTiddler(tiddler);
	if(title != newTitle)
		this.notify(title,true);
	this.notify(newTitle,true);
	this.setDirty(true);
	return tiddler;
}

TiddlyWiki.prototype.createTiddler = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(!tiddler)
		{
		tiddler = new Tiddler();
		tiddler.title = title;
		this.addTiddler(tiddler);
		this.setDirty(true);
		}
	return tiddler;
}

// Load contents of a tiddlywiki from an HTML DIV
TiddlyWiki.prototype.loadFromDiv = function(srcID,idPrefix)
{
	this.idPrefix = idPrefix;
	var storeElem = document.getElementById(srcID);
	var tiddlers = this.getLoader().loadTiddlers(this,storeElem.childNodes);
	for(var t=0; t<tiddlers.length; t++)
		tiddlers[t].changed();
	this.setDirty(false);
}

// Return all tiddlers formatted as an HTML string
TiddlyWiki.prototype.allTiddlersAsHtml = function()
{
	return store.getSaver().externalize(store);
}

// Return an array of tiddlers matching a search regular expression
TiddlyWiki.prototype.search = function(searchRegExp,sortField,excludeTag)
{
	var candidates = this.reverseLookup("tags",excludeTag,false);
	var results = [];
	for(var t=0; t<candidates.length; t++)
		{
		if((candidates[t].title.search(searchRegExp) != -1) || (candidates[t].text.search(searchRegExp) != -1))
			results.push(candidates[t]);
		}
	if(!sortField)
		sortField = "title";
	results.sort(function (a,b) {if(a[sortField] == b[sortField]) return(0); else return (a[sortField] < b[sortField]) ? -1 : +1; });
	return results;
}

// Return an array of all the tags in use. Each member of the array is another array where [0] is the name of the tag and [1] is the number of occurances
TiddlyWiki.prototype.getTags = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		for(var g=0; g<tiddler.tags.length; g++)
			{
			var tag = tiddler.tags[g];
			var f = false;
			for(var c=0; c<results.length; c++)
				if(results[c][0] == tag)
					{
					f = true;
					results[c][1]++;
					}
			if(!f)
				results.push([tag,1]);
			}
		});
	results.sort(function (a,b) {if(a[0].toLowerCase() == b[0].toLowerCase()) return(0); else return (a[0].toLowerCase() < b[0].toLowerCase()) ? -1 : +1; });
	return results;
}

// Return an array of the tiddlers that are tagged with a given tag
TiddlyWiki.prototype.getTaggedTiddlers = function(tag,sortField)
{
	return this.reverseLookup("tags",tag,true,sortField);
}

// Return an array of the tiddlers that link to a given tiddler
TiddlyWiki.prototype.getReferringTiddlers = function(title,unusedParameter,sortField)
{
	return this.reverseLookup("links",title,true,sortField);
}

// Return an array of the tiddlers that do or do not have a specified entry in the specified storage array (ie, "links" or "tags")
// lookupMatch == true to match tiddlers, false to exclude tiddlers
TiddlyWiki.prototype.reverseLookup = function(lookupField,lookupValue,lookupMatch,sortField)
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		var f = !lookupMatch;
		for(var lookup=0; lookup<tiddler[lookupField].length; lookup++)
			if(tiddler[lookupField][lookup] == lookupValue)
				f = lookupMatch;
		if(f)
			results.push(tiddler);
		});
	if(!sortField)
		sortField = "title";
	results.sort(function (a,b) {if(a[sortField] == b[sortField]) return(0); else return (a[sortField] < b[sortField]) ? -1 : +1; });
	return results;
}

// Return the tiddlers as a sorted array
TiddlyWiki.prototype.getTiddlers = function(field,excludeTag)
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(excludeTag == undefined || tiddler.isTagged(excludeTag) == null)
			results.push(tiddler);
		});
	if(field)
		results.sort(function (a,b) {if(a[field] == b[field]) return(0); else return (a[field] < b[field]) ? -1 : +1; });
	return results;
}

// Return array of names of tiddlers that are referred to but not defined
TiddlyWiki.prototype.getMissingLinks = function(sortField)
{
	var results = [];
	this.forEachTiddler(function (title,tiddler) {
		for(var n=0; n<tiddler.links.length;n++)
			{
			var link = tiddler.links[n];
			if(this.fetchTiddler(link) == null && !this.isShadowTiddler(link))
				results.pushUnique(link);
			}
		});
	results.sort();
	return results;
}

// Return an array of names of tiddlers that are defined but not referred to
TiddlyWiki.prototype.getOrphans = function()
{
	var results = [];
	this.forEachTiddler(function (title,tiddler) {
		if(this.getReferringTiddlers(title).length == 0 && !tiddler.isTagged("excludeLists"))
			results.push(title);
		});
	results.sort();
	return results;
}

// Return an array of names of all the shadow tiddlers
TiddlyWiki.prototype.getShadowed = function()
{
	var results = [];
	for(var t in config.shadowTiddlers)
		if(typeof config.shadowTiddlers[t] == "string")
			results.push(t);
	results.sort();
	return results;
}

// Resolves a Tiddler reference or tiddler title into a Tiddler object, or null if it doesn't exist
TiddlyWiki.prototype.resolveTiddler = function(tiddler) 
{
	var t = (typeof tiddler == 'string') ? this.getTiddler(tiddler) : tiddler;
	return t instanceof Tiddler ? t : null;
}

TiddlyWiki.prototype.getLoader = function() 
{
	if (!this.loader) 
		this.loader = new TW21Loader();
	return this.loader;
}
 
TiddlyWiki.prototype.getSaver = function() 
{
	if (!this.saver) 
		this.saver = new TW21Saver();
	return this.saver;
}

