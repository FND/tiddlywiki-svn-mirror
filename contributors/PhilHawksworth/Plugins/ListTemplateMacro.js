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

ListTemplateMacro finds a set of tiddlers and renders them once each through a template. The template can contain additional calls to the macro to allow for e.g. looping inside a template (think RSS items).

It needs to be able to support recursion, so that sub-templates make sense. The content is passed in either through a filter for tiddlers, a tag to get tiddlers, or a space-separated list. We'll support more as we go along, but this is what we need for RSS.

Usage example:

{{{
<<ListTemplate filter:"[tag[!excludeLists]]" template:"RssTemplate">>
}}}

Parameters can be:
filter - a tiddler filter
data - the part of a tiddler to use in the subTemplate

NOTE: FOR NOW, THIS PLUGIN ALSO OVERRIDES THE RSS SAVING AND PRODVIDES A MACRO CALLED TIDDLYTEMPLATING TO SAVE AN EXTERNAL FILE

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ListTemplateMacro) {
version.extensions.ListTemplateMacro = {installed:true};

config.macros.ListTemplate = {
	defaultTemplate: "<<view text>>"
};

config.macros.ListTemplate.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var filter = getParam(params,"filter","");
	var template = getParam(params,"template",null);
	template = template ? store.getTiddlerText(template,this.defaultTemplate) : this.defaultTemplate;
	var list = getParam(params,"list","");
	var data = getParam(params,"data","");
	
	var passedTiddlers = getParam(params, "tiddlers", null);
	
	var tiddlers = [];
	/* METHOD4 - 24/1/08 - using these calls:
		<<ListTemplate filter:"[tag[docs]]" template:"RssItemTemplate">>
		<<ListTemplate data:"tags" template:"RssItemCategoryTemplate">>
		<<view text>> (for the tags)
		This method for passing data through to subTemplates works by creating "pseudo-tiddlers" (Tiddler objects not in the store) that each carry a part of the data array we want iterating through. We do this to keep the unit of data as the tiddler. */
	if(filter) {
		tiddlers = store.filterTiddlers(filter);
	} 
	else if(passedTiddlers) {
		tiddlers = passedTiddlers;
	}
	else if(data) {
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
		tiddlers.push(tiddler);
	}
	for(i=0; i<tiddlers.length; i++) {
		// NOTE: Saq suggested using WikifyStatic here, which returns html and then I could output it batch later
		new Wikifier(template,formatter,null,tiddlers[i]).subWikify(place);
	}
};

} //# end of 'install only once'
//}}}

