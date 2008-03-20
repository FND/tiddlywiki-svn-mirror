/***
|''Name:''|FastSavePlugin|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Description:''|Plug to speed up saving by avoiding loading tiddlywiki before saving|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/FastSavePlugin.js |
|''Version:''|0.0.4|
|''Date:''|Mar 19, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3.0|

!!Description
// Uses a template file to generate the empty TiddlyWiki content, thus avoiding the need to load the TiddlyWiki before saving it

!!Usage
// Include the TiddlyWikiTemplate tiddler in your TiddlyWiki
// Then include this plugin and tag it systemConfig in the normal way.


***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.FastSavePlugin) {
version.extensions.FastSavePlugin = {installed:true};

config.templateFormatters = [
{
	name: 'templateElement',
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
			if(w.source.substr(w.nextMatch,1)=='\n')
				w.nextMatch++;
			var match = lookaheadMatch[3];
			var text = '';
			switch(match) {
			case 'version':
			case 'js':
				text = document.getElementById(match+'Area').innerHTML.replace(/^\s*\/\/<!\[CDATA\[\s*|\s*\/\/\]\]>\s*$/g,'');
				break;
			case 'copyright':
				var e = document.getElementsByName('copyright');
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

//# from Saving.js
function loadOriginal(localPath)
{
	var tiddler = new Tiddler('temp');
	var template = store.getTiddlerText('TiddlyWikiTemplate');
	return template ? wikifyStatic(template,null,tiddler,'template').htmlDecode() : loadFile(localPath);
}

// Save this tiddlywiki with the pending changes
function saveChanges(onlyIfDirty,tiddlers)
{
console.log('ss');
	if(onlyIfDirty && !store.isDirty())
		return;
	clearMessage();
	var t0 = new Date();
	//# Get the URL of the document
	var originalPath = document.location.toString();
	//# Check we were loaded from a file URL
	if(originalPath.substr(0,5) != 'file:') {
		alert(config.messages.notFileUrlError);
		if(store.tiddlerExists(config.messages.saveInstructions))
			story.displayTiddler(null,config.messages.saveInstructions);
		return;
	}
	var localPath = getLocalPath(originalPath);
	//# Load the original file
	var original = loadOriginal(localPath);
	if(!original) {
		alert(config.messages.cantSaveError);
		if(store.tiddlerExists(config.messages.saveInstructions))
			story.displayTiddler(null,config.messages.saveInstructions);
		return;
	}
	//# Locate the storeArea div's
	var posDiv = locateStoreArea(original);
	if(!posDiv) {
		alert(config.messages.invalidFileError.format([localPath]));
		return;
	}
	saveBackup(localPath,original);
	saveRss(localPath);
	saveEmpty(localPath,original,posDiv);
	saveMain(localPath,original,posDiv);
	if(config.options.chkDisplayInstrumentation)
		displayMessage('saveChanges ' + (new Date()-t0) + ' ms');
}

} //# end of 'install only once'
//}}}
