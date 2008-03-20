/***
|''Name:''|testSaving|
|''Description:''|tests saving using templates|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals/testGeneral/testSaving.js |
|''Version:''|0.0.4|
|''Date:''|Mar 15, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3.0|

***/

//{{{
//if(!version.extensions.testSaving) {
//version.extensions.testSaving = {installed:true};
config.templateFormatters = [
{
	name: "templateElement",
	match: '<!--(?:<<|@@)',
	//lookaheadRegExp:   /<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>/mg,
	lookaheadRegExp: /<!--<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>-->|<!--@@([a-z]*)@@-->\n/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			if(lookaheadMatch[1]) {
				invokeMacro(w.output,lookaheadMatch[1],lookaheadMatch[2],w,w.tiddler);
				return;
			}
			var match = lookaheadMatch[3];
			var text = '';
			switch(match) {
			case 'version':
				//# drop through
			case 'js':
				text = document.getElementById(match+"Area").innerHTML.replace(/^\s*\/\/<!\[CDATA\[\s*|\s*\/\/\]\]>\s*$/g,"");
				break;
			case 'title':
				text = getPageTitle();
				break;
			case 'shadow':
				var saver = new TW21Saver();
				var shadows = new TiddlyWiki();
				shadows.loadFromDiv("shadowArea","shadows",true);
				shadows.forEachTiddler(function(title,tiddler) {
					tiddler.created = tiddler.modified = version.date;
					text += saver.externalizeTiddler(store,tiddler) + "\n";
				});
				delete shadows;
				break;
			case 'tiddler':
				if(!w.tiddler.isTagged("empty"))
					text = convertUnicodeToUTF8(store.allTiddlersAsHtml());
				break;
			case 'prehead':
				//var = s = "Markup"+{prehead:"PreHead",posthead:"PostHead",prebody:"PreBody",postscript:"PostBody"}[lookaheadMatch[1]];
				text = store.getRecursiveTiddlerText("MarkupPreHead");
				break;
			case 'posthead':
				text = store.getRecursiveTiddlerText("MarkupPostHead");
				break;
			case 'prebody':
				text = store.getRecursiveTiddlerText("MarkupPreBody");
				break;
			case 'postscript':
				text = store.getRecursiveTiddlerText("MarkupPostBody");
				break;
			}
			if(text) {
				createTiddlyText(w.output,text+"\n");
			}
		}
	}
}
];

config.parsers.templateFormatter = new Formatter(config.templateFormatters);
config.parsers.templateFormatter.format = 'template';
config.parsers.templateFormatter.formatTag = 'TemplateFormat';

expandTemplate2 = function(template,filter,data,tiddler)
{
	var tempTiddlerName = "temp";
	var defaultTemplate = "<<view text>>";
	template = template ? store.getTiddlerText(template,defaultTemplate) : defaultTemplate;
	var tiddlers = [];
	// METHOD4 - 24/1/08 - using these calls:
	// <<ListTemplate filter:"[tag[docs]]" template:"RssItemTemplate">>
	// <<ListTemplate data:"tags" template:"RssItemCategoryTemplate">>
	// <<view text>> (for the tags)
	// This method for passing data through to subTemplates works by creating "pseudo-tiddlers" (Tiddler objects not in the store) that each carry a part of the data array we want iterating through. We do this to keep the unit of data as the tiddler.
	
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
console.log('ll:'+paramString);
console.log(params);
	p = paramString.parseParams("anon",null,true,false,false);
console.log(params);
	var template = getParam(p,"template",null);
console.log('t1:'+template);
	if(!template)
		template =params[0];
console.log('t2:'+template);
	var filter = getParam(p,"filter",null);
	var data = getParam(p,"data",null);
	createTiddlyText(place,expandTemplate2(template,filter,data,tiddler));
};

config.macros.permalink = {};
config.macros.permalink.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var t = encodeURIComponent(String.encodeTiddlyLink(tiddler.title));
	createTiddlyText(place,window.location+"#"+t);
};

expandTemplate = function(template,format,tags)
{
	var tiddler = new Tiddler("temp");
	if(tags)
		tiddler.tags = (typeof tags == "string") ? tags.readBracketedList() : tags;
	return wikifyStatic(store.getTiddlerText(template),null,tiddler,format ? format : 'template').htmlDecode();
};

function saveChanges(onlyIfDirty,tiddlers)
{
	if(onlyIfDirty && !store.isDirty())
		return;
	clearMessage();
	var t1,t0 = new Date();
	//# Get the URL of the document
	var originalPath = document.location.toString();
	//# Check we were loaded from a file URL
	if(originalPath.substr(0,5) != "file:") {
		alert(config.messages.notFileUrlError);
		if(store.tiddlerExists(config.messages.saveInstructions))
			story.displayTiddler(null,config.messages.saveInstructions);
		return;
	}
	var localPath = getLocalPath(originalPath);
	saveBackup(localPath);
	saveRss(localPath);
	saveEmpty(localPath);
	saveMain(localPath);
	if(config.options.chkDisplayInstrumentation)
		displayMessage("saveChanges " + (t1-t0) + " ms");
}

function saveBackup(localPath)
{
	if(config.options.chkSaveBackups) {
		var backupPath = getBackupPath(localPath);
		if(config.browser.isIE) {
			var backup = ieCopyFile(backupPath,localPath)
		} else {
			var original = loadFile(localPath);
			if(original == null) {
				alert(config.messages.cantSaveError);
				if(store.tiddlerExists(config.messages.saveInstructions))
					story.displayTiddler(null,config.messages.saveInstructions);
				return;
			}
			backup = saveFile(backupPath,original);
		}
		if(backup)
			displayMessage(config.messages.backupSaved,"file://" + backupPath);
		else
			alert(config.messages.backupFailed);
	}
}

function saveEmpty(localPath)
{
	if(config.options.chkSaveEmptyTemplate) {
		var emptyPath,p;
		if((p = localPath.lastIndexOf("/")) != -1)
			emptyPath = localPath.substr(0,p) + "/";
		else if((p = localPath.lastIndexOf("\\")) != -1)
			emptyPath = localPath.substr(0,p) + "\\";
		else
			emptyPath = localPath + ".";
		emptyPath += "empty.html";
		var empty = expandTemplate("TiddlyWikiTemplate",null,"empty");
		if(saveFile(emptyPath,empty))
			displayMessage(config.messages.emptySaved,"file://" + emptyPath);
		else
			alert(config.messages.emptyFailed);
	}
}

function saveMain(localPath)
{
	try {
		var revised = expandTemplate("TiddlyWikiTemplate");
		revised = updateLanguageAttribute(revised);
		var save = saveFile(localPath,revised);
	} catch (ex) {
		showException(ex);
	}	
	if(save) {
		displayMessage(config.messages.mainSaved,"file://" + localPath);
		store.setDirty(false);
	} else {
		alert(config.messages.mainFailed);
	}
}

function saveRss(localPath)
{
	//# Save Rss
	if(config.options.chkGenerateAnRssFeed) {
		var rssPath = localPath.substr(0,localPath.lastIndexOf(".")) + ".xml";
		if(saveFile(rssPath,convertUnicodeToUTF8(generateRss())))
			displayMessage(config.messages.rssSaved,"file://" + rssPath);
		else
			alert(config.messages.rssFailed);
	}
}

function generateRss()
{
	return expandTemplate("RssTemplate");
}

/*
config.templateFormatters = [
{
	name: 'templateElement',
	match: '<!--<<',
	lookaheadRegExp: /<!--<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>-->/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			invokeMacro(w.output,lookaheadMatch[1],lookaheadMatch[2],w,w.tiddler);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
}
];

config.parsers.templateFormatter = new Formatter(config.templateFormatters);
config.parsers.templateFormatter.format = 'template';
config.parsers.templateFormatter.formatTag = 'TemplateFormat';
*/

//} //# end of 'install only once'
//}}}
