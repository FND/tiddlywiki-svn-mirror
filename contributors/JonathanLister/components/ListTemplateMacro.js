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

NOTE: FOR NOW, THIS PLUGIN ALSO INCLUDES OVERRIDEN "VIEW" MACRO AND NEW "NOW" MACRO (AT BOTTOM)

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ListTemplateMacro) {
version.extensions.ListTemplateMacro = {installed:true};

config.macros.ListTemplate = {
	defaultTemplate: "<<view text>>",
	// defaultData: "TemplateData" (only needed for METHOD2)
};

config.macros.ListTemplate.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var filter = getParam(params,"filter","");
	var template = getParam(params,"template",null);
	template = template ? store.getTiddlerText(template,this.defaultTemplate) : this.defaultTemplate;
	var list = getParam(params,"list","");
	var data = getParam(params,"data","");
	var tiddlers = [];
	/* METHOD4 - 24/1/08 - using these calls:
		<<ListTemplate filter:"[tag[docs]]" template:"RssItemTemplate">>
		<<ListTemplate data:"tags" template:"RssItemCategoryTemplate">>
		<<view text>> (for the tags)
		This method for passing data through to subTemplates works by creating "pseudo-tiddlers" (Tiddler objects not in the store) that each carry a part of the data array we want iterating through. We do this to keep the unit of data as the tiddler. */
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
		tiddlers.push(tiddler);
	}
	for(i=0; i<tiddlers.length; i++) {
		// NOTE: Saq suggested using WikifyStatic here, which returns html and then I could output it batch later
		new Wikifier(template,formatter,null,tiddlers[i]).subWikify(place);
	}
};

} //# end of 'install only once'
//}}}


/* Overwriting view macro to allow access to global variables */
/* in my core as patch
config.macros.view.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if((tiddler instanceof Tiddler) && params[0]) {
		if(params[2]=='global') {
			// little hack to allow you to provide string references to variables e.g. "version.major"
			var values = params[0].split(".");
			var value = window;
			for(var i=0; i<values.length; i++) {
				value = value[values[i]];
			}
		} else {
			value = store.getValue(tiddler,params[0]);
		}
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
			case "template":
				wikify("<!--{{{-->\n"+value+"\n<!--}}}-->",place);
				break;
			}
		}
	} else {
		// if tiddler isn't an instance of tiddler or we don't provide a paramter for viewing, just print out the tiddler
		// NB: I don't like this. I would like to fix it so that <<view>> doesn't only works for tiddlers i.e. doesn't do an instanceof check at the top
		// Don't think I need this anymore 24/1/08 - check this.
		createTiddlyText(place,tiddler.toString());
	}
};
*/
/***
!today macro (overriding)

Usage: <<today what>>
'what' can be: GMT, hour, year or a date template e.g. "DD MMM YYYY"
***/
/* (macro is in my core as a patch) */
merge(config.macros.today.views,{
	UTC: {
		handler: function(d) {
			return d.toUTCString();
		}
	},
	hour: {
		handler: function(d) {
			return d.formatString("hh");
		}
	},
	year: {
		handler: function(d) {
			return d.formatString("YYYY");
		}
	}
});
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

/***
Experimental override of saveRSS using templating
***/
var saveRssOld = saveRss;
function saveRss(localPath)
{
	if (!config.macros.ListTemplate) {
		saveRssOld(localPath);
		return;
	}
	//# Save Rss
	if(config.options.chkGenerateAnRssFeed) {
		var rssPath = localPath.substr(0,localPath.lastIndexOf(".")) + ".xml";
		// START hack
		var e = document.createElement("div");
		var paramString = 'template:"RssTemplate"';
		config.macros.ListTemplate.handler(e,"ListTemplate",null,null,paramString);
		var rssSave = saveFile(rssPath,convertUnicodeToUTF8(e.textContent));
		// END hack
		// OLD var rssSave = saveFile(rssPath,convertUnicodeToUTF8(generateRss()));
		if(rssSave)
			displayMessage(config.messages.rssSaved,"file://" + rssPath);
		else
			alert(config.messages.rssFailed);
	}
}

/***
Experimental TiddlyTemplating save macro

usage: <<TiddlyTemplating template path>>
***/
config.macros.TiddlyTemplating = {};

config.macros.TiddlyTemplating.handler = function(place,macroName,params) {
	config.messages.fileSaved = "file successfully saved";
	config.messages.fileFailed = "file save failed";
	var saveName = params[0];
	var template = params[1];
	if (!template) {
		// Change to use a default template when one exists, maybe to backup the whole TW?
		displayMessage("TiddlyTemplating: usage <<TiddlyTemplating filename template>>");
		return;
	}
	var localPath = getLocalPath(document.location.toString());
	var savePath;
	if((p = localPath.lastIndexOf("/")) != -1)
		savePath = localPath.substr(0,p) + "/" + saveName;
	else if((p = localPath.lastIndexOf("\\")) != -1)
		savePath = localPath.substr(0,p) + "\\" + saveName;
	else
		savePath = localPath + "." + saveName;
	var e = document.createElement("div");
	var paramString = 'template:"'+template+'"';
	createTiddlyText(place,"generating...");
	config.macros.ListTemplate.handler(e,"ListTemplate",null,null,paramString,null);
	createTiddlyText(place,"saving...");
	var fileSave = saveFile(savePath,convertUnicodeToUTF8(e.textContent));
	if(fileSave) {
		createTiddlyText(place,"saved...");
		// would rather use displayMessage, but doesn't work when opening tiddler
		// displayMessage(config.messages.fileSaved,"file://" + savePath);
	}
	else
		alert(config.messages.fileFailed,"file://"+savePath);
};