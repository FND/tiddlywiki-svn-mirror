/***
|''Name:''|ListTemplateMacro|
|''Description:''|Renders a set of tiddler through a template|
|''Author:''|JonathanLister (based on ListRelatedPlugin by JeremyRuston)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/components/ListTemplateMacro.js |
|''Version:''|0.0.1|
|''Date:''|Jan 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

ListTemplateMacro finds a set of tiddlers and renders them through a template. The template can contain additional calls to the macro to allow for e.g. templated looping.

-------
What I'm aiming for here with the adaptation of ListRelatedPlugin:

Usage:

{{{
<<ListTemplate filter:"[tag[!excludeLists]]" template:"RssTemplate">>
}}}

It needs to be able to support recursion, so that sub-templates make sense. The content is passed in either through a filter for tiddlers, a tag to get tiddlers, or a space-separated list. We'll support more as we go along, but this is what we need for RSS.
-------

The parameters are as follows:

|Parameter |Description |Default |
|filter |A tiddler filter expression that filters and sorts the tiddlers to be listed |(none) |
|list |A space-separated list |
|template |A template to determine how each tiddler in the list is laid out |"<<view title>>" |

The optional template parameter specifies the name of a tiddler that contains the template to be used. The template is specified
in TiddlyWiki format (not HTML), and can use the <<view>> macro to extract particular fields. For example:

{{{
Item ''<<view title>>'' by <<view modifier>>
^^last saved on <<view modified date>>^^
}}}

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ListTemplateMacro) {
version.extensions.ListTemplateMacro = {installed:true};

config.macros.ListTemplate = {
	defaultTemplate: "<<view title>>",
};

config.macros.ListTemplate.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	console.log(paramString);
	var filter = getParam(params,"filter","");
	var tag = getParam(params,"tag","");
	var field = getParam(params,"sort","");
	var template = getParam(params,"template",null);
	var list = getParam(params,"list","");
	if(template)
		template = store.getTiddlerText(template,this.defaultTemplate);
	else
		template = this.defaultTemplate;
	var tiddlers = [];
	if(tag) {
		store.forEachTiddler(function(title,tiddler) {
			if(tiddler.isTagged(tag))
				tiddlers.push(tiddler);
		});
		if(field) {
			if(TiddlyWiki.standardFieldAccess[field])
				tiddlers.sort(function(a,b) {return a[field] < b[field] ? -1 : (a[field] == b[field] ? 0 : +1);});
			else
				tiddlers.sort(function(a,b) {return a.fields[field] < b.fields[field] ? -1 : (a.fields[field] == b.fields[field] ? 0 : +1);});
		}
	} else if(list) {
		tiddlers = list.readBracketedList();
	} else {
		tiddlers = store.filterTiddlers(filter);
		console.log(tiddlers);
	}
	if(tiddlers[0] instanceof Tiddler) {
		console.log("working with tiddlers:");
		console.log(tiddlers);
		for(var t=0; t<tiddlers.length; t++) {
			var tiddler = tiddlers[t];
			var wrapper = createTiddlyElement(place,"div",null,"ListTemplateTiddler");
			var wikifier = new Wikifier(template,formatter,null,tiddler);
			wikifier.subWikifyUnterm(wrapper);
		}
	} else {
		console.log("not tiddlers:");
		console.log(tiddlers);
		// now we assume we are working with a simple array of text
		for (var t=0; t<tiddlers.length; t++) {
			var t = tiddlers[t];
			var wrapper = createTiddlyElement(place,"div",null,"ListTemplateContent");
			// in this line, tiddler refers to the parent tiddler running the macro
			// Q: is this right? think so...
			wikify(t,wrapper,null,tiddler);
		}
	}
};

} //# end of 'install only once'
//}}}
