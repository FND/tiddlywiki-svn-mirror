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
	defaultTemplate: "<<view text>>",
	defaultData: "TemplateData"
};

config.macros.ListTemplate.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var filter = getParam(params,"filter","");
	var template = getParam(params,"template",null);
	var list = getParam(params,"list","");
	var data = getParam(params,"data","");
	if(template)
		template = store.getTiddlerText(template,this.defaultTemplate);
	else
		template = this.defaultTemplate;
	var tiddlers = [];
	if(data) {
		// go get the data description and get the tiddlers out
		// done here using slices of a TemplateData tiddler
		// could also be done with individual tiddlers or not using slices
		var filter = store.getTiddlerSlice(this.defaultData,data);
		tiddlers = store.filterTiddlers(filter);
	} else {
		// no data provided, so we inherit
		// tiddler here refers to the tiddler that the wikifier is using
		// if this is the top-level template, you will need to give it some data or it will use the containing tiddler for any view (et al.) macros
		tiddlers.push(tiddler);
	}
	for (var t=0; t<tiddlers.length; t++) {
		var tiddler = tiddlers[t];
		var wikifier = new Wikifier(template,formatter,null,tiddler);
		wikifier.subWikifyUnterm(place);
	}
	/* if(filter) {
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
	} */
};

} //# end of 'install only once'
//}}}


/* Overwriting view macro to allow access to global variables */
config.macros.view.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if((tiddler instanceof Tiddler) && params[0]) {
		if(params[2]=='global') {
			// little hack to allow you to provide string references to variables e.g. "version.major"
			var values = params[0].split(".");
			var value = window;
			for (var i=0; i<values.length; i++) {
				value = value[values[i]];
			}
		} else
			var value = store.getValue(tiddler,params[0]);
		if(value != undefined) {
			switch(params[1]) {
				case undefined:
					highlightify(value,place,highlightHack,tiddler);
					break;
				case "link":
					createTiddlyLink(place,value,true);
					break;
				case "wikified":
					wikify(value,place,highlightHack,tiddler);
					break;
				case "date":
					value = Date.convertFromYYYYMMDDHHMM(value);
					createTiddlyText(place,value.formatString(params[2] ? params[2] : config.views.wikified.dateFormat));
					break;
				case "html":
					wikify("<!--{{{-->\n"+value+"\n<!--}}}-->",place);
					break;
				default:
					createTiddlyText(place,value);
					break;
			}
		}
	}
};

/***
!now macro

Usage: <<now what format>>
'what' can be: hour
'format' is a date template e.g. "DD MMM YYYY"
***/

config.macros.now = {};
config.macros.now.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var d = new Date();
	if(params[0] !== undefined) {
		switch(params[0]) {
			case "GMT":
				createTiddlyText(place,d.toUTCString());
				break;
			case "hour":
				dateFormat = "hh";
				createTiddlyText(place,d.formatString(dateFormat));
				break;
			case "year":
				dateFormat = "YYYY";
				createTiddlyText(place,d.formatString(dateFormat));
				break;
			default:
				dateFormat = config.views.wikified.dateFormat;
				createTiddlyText(place,d.formatString(dateFormat));
				break;
		}
	}
};

/***
!permalink macro

Usage: <<permalink>>
***/
config.macros.permalink = {};
config.macros.permalink.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var t = encodeURIComponent(String.encodeTiddlyLink(tiddler.title));
	createTiddlyText(place,window.location+"#"+t);
};
