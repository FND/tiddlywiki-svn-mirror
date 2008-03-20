/***
|''Name:''|testSaving|
|''Description:''|tests saving using templates|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals/testGeneral/testSaving.js |
|''Version:''|0.0.6|
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
	lookaheadRegExp: /<!--<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>-->|<!--@@([a-z]*)@@-->/mg,
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
			case 'js':
				var e = document.getElementById(match+'Area')
				if(e)
					text = e.innerHTML.replace(/^\s*\/\/<!\[CDATA\[\s*|\s*\/\/\]\]>\s*$/g,'');
				break;
			case 'title':
				text = getPageTitle();
				break;
			case 'copyright':
				e = document.getElementsByName('copyright');
				if(e)
					text = e[0].content;
				break;
			case 'shadow':
				var saver = new TW21Saver();
				var shadows = new TiddlyWiki();
				shadows.loadFromDiv('shadowArea','shadows',true);
				shadows.forEachTiddler(function(title,tiddler) {
					tiddler.created = tiddler.modified = version.date;
					text += saver.externalizeTiddler(store,tiddler) + '\n';
				});
				delete shadows;
				break;
			case 'tiddler':
				if(!w.tiddler.isTagged('empty'))
					text = convertUnicodeToUTF8(store.allTiddlersAsHtml());
				break;
			case 'prehead':
			case 'posthead':
			case 'prebody':
			case 'postscript':
				var s = {prehead:'PreHead',posthead:'PostHead',prebody:'PreBody',postscript:'PostBody'};
				text = store.getRecursiveTiddlerText('Markup'+s[match]);
				break;
			}
			if(text) {
				createTiddlyText(w.output,text);
			} else {
				if(w.source.substr(w.nextMatch,1)=='\n')
					w.nextMatch++;
			}
		}
	}
}
];

config.parsers.templateFormatter = new Formatter(config.templateFormatters);
config.parsers.templateFormatter.format = 'template';
config.parsers.templateFormatter.formatTag = 'TemplateFormat';

expandTemplate2 = function(template,format,tags)
{
	var tiddler = new Tiddler("temp");
	if(tags)
		tiddler.tags = (typeof tags == "string") ? tags.readBracketedList() : tags;
	return wikifyStatic(store.getTiddlerText(template),null,tiddler,format ? format : "template").htmlDecode();
};

function saveChanges(onlyIfDirty,tiddlers)
{
	if(onlyIfDirty && !store.isDirty())
		return;
	clearMessage();
	var t0 = new Date();
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
		displayMessage("saveChanges " + (new Date()-t0) + " ms");
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
		var empty = expandTemplate2("TiddlyWikiTemplate",null,"empty");
		if(saveFile(emptyPath,empty))
			displayMessage(config.messages.emptySaved,"file://" + emptyPath);
		else
			alert(config.messages.emptyFailed);
	}
}

function saveMain(localPath)
{
	try {
		var revised = expandTemplate2("TiddlyWikiTemplate");
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
	return expandTemplate2("RssTemplate");
}

//} //# end of 'install only once'
//}}}
