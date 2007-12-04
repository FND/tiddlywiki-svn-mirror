/***
|''Name:''|ListRelatedPlugin|
|''Description:''|Displays a filtered list of tiddlers along with links to related tiddlers|
|''Author:''|JeremyRuston|
|''Source:''|http://www.osmosoft.com/#ListRelatedPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JeremyRuston/plugins/ListRelatedPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Nov 27, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2|


ListRelatedPlugin displays a list of tiddlers, each of which is followed by a sublist of related tiddlers. What
constitutes a "related tiddler" is customisable, as is the template used to display the list and sublist items.

This version ships with handlers for relationships to support RippleRap's convention that a tiddler called
"<title> from <author>" is taken to be a comment by "<author>" on a tiddler called "<title>".

- "raps": returns all tiddlers that are comments on the specified one
- "rapped": if the specified tiddler is a comment, returns the tiddler that it applies to

Usage:

{{{
<<listRelated filter:"[tag[note]]" rel:"raps" template:"MyTemplate" subtemplate:"MySubTemplate">>>
}}}

The parameters are as follows:

|Parameter |Description |Default |
|filter |A tiddler filter expression that filters and sorts the tiddlers to be listed |(none) |
|rel |The relationship of the sublist |raps |
|template |A template to determine how each tiddler in the list is laid out |"<<view title>>" |
|subtemplate |A template to determine how each tiddler in the sublist is laid out |"<<view title>> by <<view modifier>>" |

The optional template parameters specify the name of a tiddler that contains the template to be used. The template is specified
in TiddlyWiki format (not HTML), and can use the <<view>> macro to extract particular fields. For example:

{{{
Item ''<<view title>>'' by <<view modifier>>
^^last saved on <<view modified date>>^^
}}}

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ListRelatedPlugin) {
version.extensions.ListRelatedPlugin = {installed:true};

config.relationships = {
	raps: {
		text: "raps",
		prompt: "Tiddlers that are comments on this one",
		getRelatedTiddlers: function(store,title) {
			var re = "^" + title.escapeRegExp() + " from (.+)";
			var tiddlers = [];
			store.forEachTiddler(function(title,tiddler) {
				var regexp = new RegExp(re,"mg");
				var match = regexp.exec(title);
				if(match)
					tiddlers.push(title);
			});
			return tiddlers;
		}
	},
	rapped: {
		text: "rapped",
		prompt: "Tiddlers that are commented on by this one",
		getRelatedTiddlers: function(store,title) {
			var tiddlers = [];
			var re = "^(.+) from (.+)$";
			var regexp = new RegExp(re,"mg");
			var match = regexp.exec(title);
			if(match)
				tiddlers.push(match[1]);
			return tiddlers;
		}
		
	}
};

config.macros.listRelated = {
	defaultRelationship: "raps",
	defaultTemplate: "<<view title>>",
	defaultSubTemplate: "<<view title>> by <<view modifier>>"
};

config.macros.listRelated.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var filter = getParam(params,"filter","");
	var relationship = getParam(params,"rel",this.defaultRelationship);
	var template = getParam(params,"template",null);
	if(template)
		template = store.getTiddlerText(template,this.defaultTemplate);
	else
		template = this.defaultTemplate;
	var subTemplate = getParam(params,"subtemplate",null);
	if(subTemplate)
		subTemplate = store.getTiddlerText(subTemplate,this.defaultSubTemplate);
	else
		subTemplate = this.defaultSubTemplate;
	var tiddlers = store.filterTiddlers(filter);
	for(var t=0; t<tiddlers.length; t++) {
		var tiddler = tiddlers[t];
		var wrapper = createTiddlyElement(place,"div",null,"listRelatedTiddler")
		var wikifier = new Wikifier(template,formatter,null,tiddler);
		wikifier.subWikifyUnterm(wrapper);
		var rel = config.relationships[relationship].getRelatedTiddlers(store,tiddler.title);
		for(var r=0; r<rel.length; r++) {
			var sub = createTiddlyElement(wrapper,"div",null,"listRelatedSubTiddler");
			wikifier = new Wikifier(subTemplate,formatter,null,store.fetchTiddler(rel[r]));
			wikifier.subWikifyUnterm(sub);
		}
	}
};

} //# end of 'install only once'
//}}}
