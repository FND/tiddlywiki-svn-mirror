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
	defaultTemplate: "\n",
};

config.macros.ListTemplate.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var filter = getParam(params,"filter","");
	var template = getParam(params,"template",null);
	var list = getParam(params,"list","");
	if(template)
		template = store.getTiddlerText(template,this.defaultTemplate);
	else
		template = this.defaultTemplate;
	var wrapper = createTiddlyElement(place,"div",null,"ListTemplateTiddler");
	if(filter) {
		// looking for tiddlers
		var tiddlers = [];
		tiddlers = store.filterTiddlers(filter);
		for(var t=0; t<tiddlers.length; t++) {
			var tiddler = tiddlers[t];
			var wikifier = new Wikifier(template,formatter,null,tiddler);
			wikifier.subWikifyUnterm(wrapper);
		}
	} else if(list) {
		// now we assume we are working with a string of text, so we split it up and make tiddlers out of it
		var items = list.readBracketedList();
		for (var t=0; t<items.length; t++) {
			var tiddler = new Tiddler(items[t]);
			tiddler.assign(items[t],items[t]);
			var wikifier = new Wikifier(template,formatter,null,tiddler);
			wikifier.subWikifyUnterm(wrapper);
		}
	} else {
		// no content provided, just render template
		// you'd expect not to use any display macros in a template that you weren't passing content to, but the way it works if you run it is that the content would be the tiddler that encloses this call to ListTemplate e.g. another template. We're leaving this in until we have a reason not to
		var wikifier = new Wikifier(template,formatter,null,tiddler);
		wikifier.subWikifyUnterm(wrapper);
	}
};

} //# end of 'install only once'
//}}}
