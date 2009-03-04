/***
|''Name:''|TemplatePlugin |
|''Description:''|Collection of functions to support rendering of tiddlers through HTML templates |
|''Author:''|JonathanLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/TemplatePlugin.js |
|''Version:''|0.0.5 |
|''Date:''|3/3/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

The templateTiddlers macro finds a set of tiddlers and renders them once each through a template. The template can contain additional
calls to the macro to allow for e.g. looping inside a template (think RSS items). It needs to be able to support recursion, so that sub-templates make sense.

Usage:
{{{
<<templateTiddlers template:RssTemplate filter:"[tag[!excludeLists]]" [wikitext:true]>>
<<templateTiddlers RssTemplate filter:"[tag[!excludeLists]]">> // template qualification is optional
}}}

Parameters can be:
template - the name of the template
filter - a tiddler filter
wikitext - if true, renders the target tiddler's text as wikitext instead of using the special template formatter
raw - if true, adds the HTML to place without encoding it as text

If a parameter does not have a qualifier, it is assumed to be the template name

|''Name:''|templateTagsMacro |
|''Description:''|Renders a tiddler's tags through a template |

Usage:
{{{
<<templateTags template:RssItemCategoryTemplate>>
<<templateTiddlers RssTemplate>> // template qualification is optional
}}}

Parameters can be:
template - the name of the template

The templateTags macro renders a tiddler's tags through a template in an analagous way to how templateTiddlers renders a set of tiddlers. Future development might offer support for other data items other than tags, but this is what is needed for RSS, the use-case driving the development.

|''Name:''|PermalinkMacro |
|''Description:''|Creates a permalink to the tiddler |

Usage:
{{{
<<permalink>>
}}}
***/

//{{{
if(!version.extensions.templatePlugin) {
version.extensions.templatePlugin = {installed:true};

expandTemplate = function(template,tiddlers,wikitext)
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
	// decide whether to parse as wikitext or simple template
	var format = wikitext ? null : 'template';
	for(var i=0; i<tiddlers.length; i++) {
		output += wikifyStatic(template,null,tiddlers[i],format).htmlDecode();
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
	var wikitext = getParam(p,"wikitext",null);
	var raw = getParam(p,"raw",false);
	var tiddlers = [];
	if(filter) {
		tiddlers = store.filterTiddlers(filter);
	} else {
		// no filter provided, so inherit or create temp tiddler
		tiddlers.push(tiddler ? tiddler : new Tiddler("temp"));
	}
	var output = expandTemplate(template,tiddlers,wikitext);
	/* I'm not sure this 'raw' thing is actually useful... if you don't do the htmlEncode before adding the output to the innerHTML, nested template content could be broken by the htmlDecode in expandTemplate. I think I've used the 'raw' control before to style a tiddler, but maybe this can still be done without using this method. It's probably safe if used right at the top-level of templating... */
	place.innerHTML += raw ? output : output.htmlEncode();
	if(raw) {
		/* Gotta refresh the tiddlerlinks! The wikifyStatic just plops a line of HTML in - the onclick is attached to different element */
	}
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

} //# end of 'install only once'
//}}}
