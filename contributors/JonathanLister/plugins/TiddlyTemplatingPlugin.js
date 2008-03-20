/***
|''Name:''|TiddlyTemplatingPlugin |
|''Description:''| |
|''Author:''|JonathanLister |
|''CodeRepository:''| |
|''Version:''|1 |
|''Date:''| |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!Macros included in the plugin
|''Name:''|ListTemplateMacro|
|''Description:''|Renders a set of tiddlers through a template|
|''Author:''|JonathanLister (based on ListRelatedPlugin by JeremyRuston)|
|''CodeRepository:''| |
|''Version:''|0.0.2|
|''Date:''|Jan 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

ListTemplateMacro finds a set of tiddlers and renders them once each through a template. The template can contain additional calls to the macro to allow for e.g. looping inside a template (think RSS items).

It needs to be able to support recursion, so that sub-templates make sense. The content is passed in either through a filter for tiddlers, a tag to get tiddlers, or a space-separated list. We'll support more as we go along, but this is what we need for RSS.

Usage:
{{{
<<ListTemplate filter:"[tag[!excludeLists]]" template:"RssTemplate">>
}}}

Parameters can be:
filter - a tiddler filter
data - the part of a tiddler to use in the subTemplate
raw - if set to true in a top-level template, renders the output as text suitable for saving to a file; otherwise, outputs as HTML into place

|''Name:''|TiddlyTemplatingMacro|
|''Description:''|Renders a template and saves the output to a local file|
|''Author:''|JonathanLister|
|''CodeRepository:''| |
|''Version:''|1 |
|''Date:''| |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

Usage:
{{{
<<TiddlyTemplating path template>>
}}}


|''Name:''|PermalinkMacro |
|''Description:''|Creates a permalink to the tiddler |

Usage:
{{{
<<permalink>>
}}}

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TiddlyTemplating) {
version.extensions.TiddlyTemplating = {installed:true};
// NOTE: FOR NOW, THIS PLUGIN ALSO OVERRIDES THE RSS SAVING AND PRODVIDES A MACRO CALLED TIDDLYTEMPLATING TO SAVE AN EXTERNAL FILE

expandTemplate = function(template,filter,data,tiddler)
{
	var tempTiddlerName = "temp";
	var defaultTemplate = "<<view text>>";
	template = template ? store.getTiddlerText(template,defaultTemplate) : defaultTemplate;
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
		tiddlers.push(tiddler ? tiddler : new Tiddler(tempTiddlerName));
	}
	var output = "";
	for(i=0; i<tiddlers.length; i++) {
		output += wikifyStatic(template,null,tiddlers[i],'template').htmlDecode();
		//displayMessage(">>>>>>>>>>>");
		//displayMessage(output);
		//displayMessage("<<<<<<<<");
	}
	return output;	
};

config.macros.ListTemplate = {};

config.macros.ListTemplate.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var filter = getParam(params,"filter",null);
	var template = getParam(params,"template",null);
	var data = getParam(params,"data",null);
	var raw = getParam(params,"raw",null);
	if(raw=="true")
		createTiddlyText(place,expandTemplate(template,filter,data,tiddler));
	else {
		//displayMessage("---before expand---");
		var output = expandTemplate(template,filter,data,tiddler);
		//displayMessage("---after expand---");
		//displayMessage("---innerHTML before---");
		//displayMessage(place.innerHTML);
		//displayMessage("---going to add this output---");
		//displayMessage(output);
		place.innerHTML += output;
		//displayMessage("---innerHTML with output---");
		//displayMessage(place.innerHTML);
	}
};

config.templateFormatters = [
{
	//<!--@@prehead@@-->
	name: "templateElement",
	match: "<!--",
	//lookaheadRegExp: /<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>/mg,
	lookaheadRegExp: /<!--@@([a-z]*)@@-->\n|<!--<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>-->/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			if(!lookaheadMatch[1]) {
				invokeMacro(w.output,lookaheadMatch[2],lookaheadMatch[3],w,w.tiddler);
				return;
			}
			var text = '';
			switch(lookaheadMatch[1]) {
			case 'version':
				//displayMessage('v1');
				var e = document.getElementById(lookaheadMatch[1]+"Area");
				//displayMessage('v2');
				text = e.innerHTML;
				text = text.replace(/^\s*\/\/<!\[CDATA\[\s*|\s*\/\/\]\]>\s*$/g,"");
				break;
			case 'js':
				var e = document.getElementById(lookaheadMatch[1]+"Area");
				text = e.innerHTML;
				text = text.replace(/^\s*\/\/<!\[CDATA\[\s*|\s*\/\/\]\]>\s*$/g,"");
				break;
			case 'title':
				text = getPageTitle();
				break;
			case 'shadow':
				//displayMessage("shadow");
				var saver = new TW21Saver();
				for(var i in config.shadowTiddlers) {
					var tiddler = new Tiddler(i);
					//displayMessage("shadow:"+tiddler.title);
					tiddler.created = tiddler.modified = version.date;
					tiddler.text = config.shadowTiddlers[i];
					text += saver.externalizeTiddler(store,tiddler) + "\n";
				}
				break;
			/*case 'tiddler':
				if(!w.tiddler.isTagged("empty"))
					text = convertUnicodeToUTF8(store.allTiddlersAsHtml());
				break;
			case 'prehead':
				var = s = "Markup"+{prehead:"PreHead",posthead:"PostHead",prebody:"PreBody",postscript:"PostBody"}[lookaheadMatch[1]];
				text = store.getRecursiveTiddlerText("MarkupPreHead","");
				break;
			case 'posthead':
				text = store.getRecursiveTiddlerText("MarkupPostHead","");
				break;
			case 'prebody':
				text = store.getRecursiveTiddlerText("MarkupPreBody","");
				break;
			case 'postscript':
				text = store.getRecursiveTiddlerText("MarkupPostBody","");
				break;
			*/
			}
			if(text) {
				createTiddlyText(w.output,text+"\n");
			}
		} else {
			// normal HTML comment
			createTiddlyText(w.output,w.matchText);
		}
	}
}
];

config.parsers.templateFormatter = new Formatter(config.templateFormatters);
config.parsers.templateFormatter.format = 'template';
config.parsers.templateFormatter.formatTag = 'TemplateFormat';

config.macros.TiddlyTemplating = {};

config.macros.TiddlyTemplating.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
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
	//var e = document.createElement("div");
	//var paramString = 'raw:"true" template:"'+template+'"';
	displayMessage("generating...");
	var content = expandTemplate("TiddlyWikiTemplate");
	// config.macros.ListTemplate.handler(e,"ListTemplate",null,null,paramString,tiddler);
	displayMessage("saving...");
	//displayMessage(e.innerText);
	//displayMessage(e.textContent);
	var fileSave = saveFile(savePath,convertUnicodeToUTF8(content));
	if(fileSave) {
		displayMessage("saved... click here to load","file://"+savePath);
		// would rather use displayMessage, but doesn't work when opening tiddler
		// displayMessage(config.messages.fileSaved,"file://" + savePath);
	}
	else
		alert(config.messages.fileFailed,"file://"+savePath);
};

config.macros.permalink = {};
config.macros.permalink.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var t = encodeURIComponent(String.encodeTiddlyLink(tiddler.title));
	createTiddlyText(place,window.location+"#"+t);
};

} //# end of 'install only once'
//}}}

/*** NB: Rest of this code is to be moved to a saving plugin ***/
//{{{
function generateRss()
{
	return expandTemplate("RssTemplate");
}

//# from Config.js
config.shadowsLoaded = [];

//# from main.js
function loadShadowTiddlers()
{
	var shadows = new TiddlyWiki();
	shadows.loadFromDiv("shadowArea","shadows",true);
	shadows.forEachTiddler(function(title,tiddler){config.shadowTiddlers[title] = tiddler.text;config.shadowsLoaded.push(title);});
	delete shadows;
}

/***
Experimental override of saveRSS using templating
***/
/* var saveRssOld = saveRss;
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
} */
//}}}