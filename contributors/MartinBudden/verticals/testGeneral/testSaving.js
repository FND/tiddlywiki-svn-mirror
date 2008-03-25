/***
|''Name:''|testSaving|
|''Description:''|tests saving using templates|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals/testGeneral/testSaving.js |
|''Version:''|0.0.7|
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
				var e = document.getElementById(match+'Area');
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
				var tw = new TiddlyWiki();
				tw.loadFromDiv('shadowArea','shadows',true);
				tw.forEachTiddler(function(title,tiddler) {
					//# set dates equal to version date so that they are not stored
					tiddler.created = tiddler.modified = version.date;
					text += saver.externalizeTiddler(store,tiddler) + '\n';
				});
				delete tw;
				break;
			case 'tiddler':
				if(w.tiddler.isTagged('original')) {
					saver = new TW21Saver();
					tw = new TiddlyWiki();
					tw.loadFromDiv('storeArea','store',true);
					tw.forEachTiddler(function(title,tiddler) {text += saver.externalizeTiddler(store,tiddler) + '\n';});
					delete tw;
				} else if (!w.tiddler.isTagged('empty')) {
					text = convertUnicodeToUTF8(store.allTiddlersAsHtml());
				}
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

wikifyTemplate = function(template,tags,format)
{
	var tiddler = new Tiddler("temp");
	if(tags)
		tiddler.tags = (typeof tags == "string") ? tags.readBracketedList() : tags;
	return wikifyStatic(store.getTiddlerText(template),null,tiddler,format ? format : "template").htmlDecode();
};

// Save this tiddlywiki with the pending changes
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
	saveMain(localPath);
	if(config.options.chkSaveBackups)
		saveBackup(localPath);
	if(config.options.chkSaveEmptyTemplate)
		saveEmpty(localPath);
	if(config.options.chkGenerateAnRssFeed)
		saveRss(localPath);
	if(config.options.chkDisplayInstrumentation)
		displayMessage("saveChanges " + (new Date()-t0) + " ms");
}

function saveMain(localPath)
{
	try {
		//# Save new file
		var revised = wikifyTemplate("TiddlyWikiTemplate");
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

function saveBackup(localPath)
{
	//# Save the backup
	var backupPath = getBackupPath(localPath);
	if(config.browser.isIE) {
		var backup = ieCopyFile(backupPath,localPath);
	} else {
		var original = wikifyTemplate("TiddlyWikiTemplate","original");
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

function saveEmpty(localPath)
{
	//# Save the empty template
	var emptyPath,p;
	if((p = localPath.lastIndexOf("/")) != -1)
		emptyPath = localPath.substr(0,p) + "/";
	else if((p = localPath.lastIndexOf("\\")) != -1)
		emptyPath = localPath.substr(0,p) + "\\";
	else
		emptyPath = localPath + ".";
	emptyPath += "empty.html";
	var empty = wikifyTemplate("TiddlyWikiTemplate","empty");
	if(saveFile(emptyPath,empty))
		displayMessage(config.messages.emptySaved,"file://" + emptyPath);
	else
		alert(config.messages.emptyFailed);
}

function saveRss(localPath)
{
	//# Save Rss
	var rssPath = localPath.substr(0,localPath.lastIndexOf(".")) + ".xml";
	if(saveFile(rssPath,convertUnicodeToUTF8(generateRss())))
		displayMessage(config.messages.rssSaved,"file://" + rssPath);
	else
		alert(config.messages.rssFailed);
}

function generateRss()
{
	return wikifyTemplate("RssTemplate");
}

//} //# end of 'install only once'
//}}}
