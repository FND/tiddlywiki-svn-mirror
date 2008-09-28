/***
| Name:|HideWhenPlugin|
| Description:|Allows conditional inclusion/exclusion in templates|
| Version:|6.1.2|
| Date:|20-Oct-2006|
| Source:|http://mptw.tiddlyspot.com/#HideWhenPlugin|
| Author:|Simon Baird <simon.baird@gmail.com>|
For use in ViewTemplate and EditTemplate. Eg
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

merge(config.macros,{

	hideWhen: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( eval(paramString), place);
	}},

	showWhen: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !eval(paramString), place);
	}},

	hideWhenTagged: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( tiddler.tags.containsAll(params), place);
	}},

	showWhenTagged: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !tiddler.tags.containsAll(params), place);
	}},

	hideWhenTaggedAny: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( tiddler.tags.containsAny(params), place);
	}},

	showWhenTaggedAny: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !tiddler.tags.containsAny(params), place);
	}},

	hideWhenExists: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( store.tiddlerExists(params[0]) || store.isShadowTiddler(params[0]), place);
	}},

	showWhenExists: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !(store.tiddlerExists(params[0]) || store.isShadowTiddler(params[0])), place);
	}}

});

//}}}

