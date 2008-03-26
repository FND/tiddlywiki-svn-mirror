/***
|''Name:''|ListTemplatePlugin |
|''Description:''|Renders a set of tiddlers through a template |
|''Author:''|JonathanLister (based on ListRelatedPlugin by JeremyRuston) |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/ListTemplatePlugin.js |
|''Version:''|0.0.4|
|''Date:''|25/3/08|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

The listTemplate macro finds a set of tiddlers and renders them once each through a template. The template can contain additional
calls to the macro to allow for e.g. looping inside a template (think RSS items).

It needs to be able to support recursion, so that sub-templates make sense. The content is passed in either through a filter for tiddlers,
a tag to get tiddlers, or a space-separated list. We'll support more as we go along, but this is what we need for RSS.

Usage:
{{{
<<listTemplate template:"RssTemplate" filter:"[tag[!excludeLists]]">>
<<listTemplate RssTemplate filter:"[tag[!excludeLists]]">> // template qualification is optional
}}}

Parameters can be:
template - the name of the template
filter - a tiddler filter
data - the part of a tiddler to use in the subTemplate

If a parameter does not have a qualifier, it is assumed to be the template name

|''Name:''|PermalinkMacro |
|''Description:''|Creates a permalink to the tiddler |

Usage:
{{{
<<permalink>>
}}}
***/

//{{{
if(!version.extensions.ListTemplatePlugin) {
version.extensions.ListTemplatePlugin = {installed:true};

expandTemplate = function(template,filter,data,tiddler)
{
	//	<<ListTemplate filter:"[tag[docs]]" template:"RssItemTemplate">>
	//	<<ListTemplate data:"tags" template:"RssItemCategoryTemplate">>
	//	<<view text>> (for the tags)
	//	This method for passing data through to subTemplates works by creating "pseudo-tiddlers" (Tiddler objects not in the store)
	//  that each carry a part of the data array we want iterating through. We do this to keep the unit of data as the tiddler.
	var tempTiddlerName = "temp";
	var defaultTemplate = "<<view text>>";
	template = template ? store.getTiddlerText(template,defaultTemplate) : defaultTemplate;
	var tiddlers = [];
	if(filter) {
		tiddlers = store.filterTiddlers(filter);
	} else if(data) {
		switch(data) {
		case "tags":
			// creates a new tiddler for each tag and has that tag as its tags
			for(var i=0;i<tiddler.tags.length;i++) {
				var t = new Tiddler(tiddler.title);
				t.tags = new Array(tiddler.tags[i]);
				tiddlers.push(t);
			}
			break;
		default:
			tiddlers.push(tiddler);
			break;
		}
	} else {
		// no data provided, so inherit
		tiddlers.push(tiddler ? tiddler : new Tiddler(tempTiddlerName));
	}
	var output = "";
	for(i=0; i<tiddlers.length; i++) {
		output += wikifyStatic(template,null,tiddlers[i],'template').htmlDecode();
	}
	return output;	
};

config.macros.listTemplate = {};
config.macros.listTemplate.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	p = paramString.parseParams("anon",null,true,false,false);
	var template = getParam(p,"template",null);
	if(!template)
		template = params[0];
	var filter = getParam(p,"filter",null);
	var data = getParam(p,"data",null);
	var output = expandTemplate(template,filter,data,tiddler);
	place.innerHTML += output.htmlEncode();
};

config.macros.permalink = {};
config.macros.permalink.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var t = encodeURIComponent(String.encodeTiddlyLink(tiddler.title));
	createTiddlyText(place,window.location+"#"+t);
};

} //# end of 'install only once'
//}}}


