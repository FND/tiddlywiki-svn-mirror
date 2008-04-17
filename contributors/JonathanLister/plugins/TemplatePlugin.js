/***
|''Name:''|TemplatePlugin |
|''Description:''|Collection of functions to support rendering of tiddlers through HTML templates |
|''Author:''|JonathanLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/TemplatePlugin.js |
|''Version:''|0.0.4 |
|''Date:''|25/3/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

The templateTiddlers macro finds a set of tiddlers and renders them once each through a template. The template can contain additional
calls to the macro to allow for e.g. looping inside a template (think RSS items). It needs to be able to support recursion, so that sub-templates make sense.

Usage:
{{{
<<templateTiddlers template:RssTemplate filter:"[tag[!excludeLists]]">>
<<templateTiddlers RssTemplate filter:"[tag[!excludeLists]]">> // template qualification is optional
}}}

Parameters can be:
template - the name of the template
filter - a tiddler filter
data - the part of a tiddler to use in the subTemplate

If a parameter does not have a qualifier, it is assumed to be the template name

|''Name:''|templateTagsMacro |
|''Description:''|Renders a tiddler's tags through a template |

Usage:
{{{
<<templateTags template:RssItemCategoryTemplate>>
<<templateTiddlers RssTemplate>> // template qualification is optional
}}}

The templateTags macro renders a tiddler's tags through a template in an analagous way to how templateTiddlers renders a set of tiddlers. Future development might offer support for other data items other than tags, but this is what is needed for RSS, the use-case driving the development.

|''Name:''|PermalinkMacro |
|''Description:''|Creates a permalink to the tiddler |

Usage:
{{{
<<permalink>>
}}}
***/

//{{{
if(!version.extensions.templateTiddlersPlugin) {
version.extensions.templateTiddlersPlugin = {installed:true};

expandTemplate = function(template,tiddlers)
{
	var defaultTemplate = "<<view text>>";
	var t = template;
	template = template ? store.getTiddlerText(template,template) : defaultTemplate;
	if(!tiddlers) {
		// no tiddlers provided, so create a temporary tiddler
		tiddlers = [];
		tiddlers.push(new Tiddler("temp"));
	}
	var output = "";
	for(var i=0; i<tiddlers.length; i++) {
		output += wikifyStatic(template,null,tiddlers[i],'template').htmlDecode();
		// wikifyStatic returns html; htmlDecode is used so that nesting of templates doesn't cause encoded characters to be wikified
	}
	return output;
};

config.macros.templateTiddlers = {};
config.macros.templateTiddlers.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	p = paramString.parseParams("anon",null,true,false,false);
	var template = getParam(p,"template",null);
	if(!template)
		template = getParam(p,"anon",null);
	var filter = getParam(p,"filter",null);
	var tiddlers = [];
	if(filter) {
		tiddlers = store.filterTiddlers(filter);
	} else {
		// no filter provided, so inherit or create temp tiddler
		tiddlers.push(tiddler ? tiddler : new Tiddler("temp"));
	}
	var output = expandTemplate(template,tiddlers);
	// NOTE: the line below is contentious - should the .htmlEncode() be used?
	// if you don't use it, it seems that output is not always added in a format suitable for innerHTML
	// this is only an apparent problem when templateTiddlers is nested inside other templates (at two levels deep!)
	// this requires tests writing to iron this out once and for all
	// ALSO: HTMLPreviewTemplate uses the output of expandTemplate directly, but hasn't hit this problem yet (possibly because the nesting only goes one level deep on templates tested so far)
	place.innerHTML += output.htmlEncode();
};

config.macros.templateTags = {};
config.macros.templateTags.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	p = paramString.parseParams("anon",null,true,false,false);
	var template = getParam(p,"template",null);
	var tiddlers = [];
	if(!template)
		template = getParam(p,"anon",null);
	for(var i=0;i<tiddler.tags.length;i++) {
		var t = new Tiddler(tiddler.title);
		t.tags = [tiddler.tags[i]];
		tiddlers.push(t);
	}
	var output = expandTemplate(template,tiddlers);
	place.innerHTML += output;
};

config.macros.permalink = {};
config.macros.permalink.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var t = encodeURIComponent(String.encodeTiddlyLink(tiddler.title));
	createTiddlyText(place,window.location+"#"+t);
};

} //# end of 'install only once'
//}}}
