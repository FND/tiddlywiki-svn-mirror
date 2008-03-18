/***
|''Name:''|testSaving|
|''Description:''|macro to use for general testing|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals\testGeneral/testMacro.js |
|''Version:''|0.0.2|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

***/

/*{{{*/
config.templateFormatters = [
{
//<!--@@prehead@@-->
	name: "templateElement",
	match: "<!--@@",
	//lookaheadRegExp: /<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>/mg,
	lookaheadRegExp: /<!--@@([a-z]*)@@-->\n|<!--@@<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>@@-->/mg,
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
			var text = null;
			switch(lookaheadMatch[1]) {
			case 'version':
				var textTemplate = 'var version = {title: "TiddlyWiki", major: %0, minor: %1, revision: %2, date: new Date("%3"), extensions: {}};';
				text = textTemplate.format([version.major,version.minor,version.revision,version.date.formatString("mmm DD, YYYY")]);
				break;
			case 'title':
				text = getPageTitle();
				break;
			case 'shadow':
				text = ShadowSerialize();
				break;
			case 'tiddler':
				if(!w.tiddler.isTagged("empty"))
					text = convertUnicodeToUTF8(store.allTiddlersAsHtml());
				break;
			case 'js':
				text = document.getElementById("jsArea").textContent;
				text = text.replace(/^\s*\/\/<!\[CDATA\[\s*|\s*\/\/\]\]>\s*$/g,"");
				break;
			case 'prehead':
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

populateTemplate = function(template,format,tags)
{
	var tiddler = new Tiddler("temp");
	if(tags)
		tiddler.tags = (typeof tags == "string") ? tags.readBracketedList() : tags;
	return wikifyStatic(store.getTiddlerText(template),null,tiddler,format ? format : 'template').htmlDecode();
};

ScriptSerialize = function()
{
	return document.getElementById("jsArea").textContent;
};

ShadowSerialize = function()
{
	var shadows = ["MarkupPreHead","ColorPalette","StyleSheetColors","StyleSheetLayout","StyleSheetLocale","StyleSheetPrint","PageTemplate","ViewTemplate","EditTemplate","GettingStarted","OptionsPanel","ImportTiddlers"];
	var saver = new TW21Saver();
	var ret = "";
	for(var i=0;i<shadows.length;i++) {
		var tiddler = new Tiddler(shadows[i]);
		tiddler.created = version.date;
		tiddler.modified = version.date;
		tiddler.text = config.shadowTiddlers[shadows[i]];
		ret += saver.externalizeTiddler(store,tiddler) + "\n";
	}
	return ret;
};

function generateRss()
{
	return populateTemplate("RssTemplate");
}

function saveChanges(onlyIfDirty,tiddlers)
{
	if(onlyIfDirty && !store.isDirty())
		return;
	clearMessage();
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
}

function saveBackup(localPath)
{
	if(config.options.chkSaveBackups) {
		var backupPath = getBackupPath(localPath);
		var backup;
		if(config.browser.isIE) {
			backup = ieCopyFile(backupPath,localPath)
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
		var empty = populateTemplate("TiddlyWikiTemplate",null,"empty");
		if(saveFile(emptyPath,empty))
			displayMessage(config.messages.emptySaved,"file://" + emptyPath);
		else
			alert(config.messages.emptyFailed);
	}
}

function saveMain(localPath)
{
	var save;
	try {
		var revised = populateTemplate("TiddlyWikiTemplate");
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

//<!--@@prehead@@-->
config.macros.ListTemplate = {defaultTemplate: "<!--@@<<view text>>-->"};
config.macros.ListTemplate.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var filter = getParam(params,"filter","");
	var template = getParam(params,"template",null);
	template = template ? store.getTiddlerText(template,this.defaultTemplate) : this.defaultTemplate;
	//var list = getParam(params,"list","");
	var data = getParam(params,"data","");
	var raw = getParam(params,"raw",false);
	var tiddlers = [];
	/* METHOD4 - 24/1/08 - using these calls:
		<<ListTemplate filter:"[tag[docs]]" template:"RssItemTemplate">>
		<<ListTemplate data:"tags" template:"RssItemCategoryTemplate">>
		<<view text>> (for the tags)
		This method for passing data through to subTemplates works by creating "pseudo-tiddlers"
		(Tiddler objects not in the store) that each carry a part of the data array we want iterating through.
		We do this to keep the unit of data as the tiddler.
	*/
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
	var text = "";
	for(i=0; i<tiddlers.length; i++) {
		text += wikifyStatic(template,null,tiddlers[i],'template');
	}
	var d = document.createElement("div");
	d.innerHTML = text;
	if(raw)
		place.textContent = d.textContent;
};

/*}}}*/
