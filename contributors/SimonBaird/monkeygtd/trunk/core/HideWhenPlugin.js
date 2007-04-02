/***
| Name|HideWhenPlugin|
| Description|Allows conditional inclusion/exclusion in templates|
| Version|3.0 ($Rev: 1845 $)|
| Date|$Date: 2007-03-16 15:19:22 +1000 (Fri, 16 Mar 2007) $|
| Source|http://mptw.tiddlyspot.com/#HideWhenPlugin|
| Author|Simon Baird <simon.baird@gmail.com>|
| License|http://mptw.tiddlyspot.com/#TheBSDLicense|
For use in ViewTemplate and EditTemplate. Example usage:
{{{<div macro="showWhenTagged Task">[[TaskToolbar]]</div>}}}
{{{<div macro="showWhen tiddler.modifier == 'BartSimpson'"><img src="bart.gif"/></div>}}}
***/
//{{{

window.removeElementWhen = function(test,place) {
	if (test) {
		removeChildren(place);
		place.parentNode.removeChild(place);
	}
};

window.resolveTiddler = function(tiddler,place) {
	if (!tiddler)
		return store.getTiddler(story.findContainingTiddler(place).getAttribute("tiddler"));
	return tiddler;
}

merge(config.macros,{

	hideWhen: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( eval(paramString), place);
	}},

	showWhen: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( !eval(paramString), place);
	}},

	hideWhenTagged: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( tiddler.tags.containsAll(params), place);
	}},

	showWhenTagged: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( !tiddler.tags.containsAll(params), place);
	}},

	hideWhenTaggedAny: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( tiddler.tags.containsAny(params), place);
	}},

	showWhenTaggedAny: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( !tiddler.tags.containsAny(params), place);
	}},

	hideWhenTaggedAll: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( tiddler.tags.containsAll(params), place);
	}},

	showWhenTaggedAll: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( !tiddler.tags.containsAll(params), place);
	}},

	hideWhenExists: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( store.tiddlerExists(params[0]) || store.isShadowTiddler(params[0]), place);
	}},

	showWhenExists: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		tiddler = resolveTiddler(tiddler,place);
		removeElementWhen( !(store.tiddlerExists(params[0]) || store.isShadowTiddler(params[0])), place);
	}}

});

//}}}

