/***
|''Name:''|TiddlerRevsionPlugin|
|''Description:''|Maintains tiddler revision history|
|''Author:''|MartinBudden|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/TiddlerRevsionPlugin.js |
|''Version:''|0.0.1|
|''Date:''|June 12, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.0|

!!Description
//!!TODO write a brief description of the plugin here

!!Usage
//!!TODO describe how to use the plugin - how a user should include it in their TiddlyWiki, parameters to the plugin etc

***/

//{{{
// Ensure that the TiddlerRevsionPlugin is only installed once.
if(!version.extensions.TiddlerRevsionPlugin) {
version.extensions.TiddlerRevsionPlugin = {installed:true};

var revisionStore = null;

function TiddlerRevsion()
{
	return this;
}

TiddlerRevsion.baseRevision = 1000;

TiddlerRevsion.prototype.tiddlerTitle = function(title,revision)
{
	return ('_' + title + '_r:' + revision).trim();
};

TiddlerRevsion.prototype.commitTiddler = function(tiddler)
{
console.log('TiddlerRevsion.commitTiddler:',tiddler.title,tiddler);
	if(!tiddler)
		return false;
	var title = this.tiddlerTitle(tiddler.title,tiddler.fields.revision);
console.log('title:'+title);
	var tags = ['excludeLists','excludeSearch','_'+tiddler.title+'_'];
	store.saveTiddler(title,title,tiddler.text,tiddler.modifier,tiddler.modified,tags,tiddler.fields);
	return true;
};

TiddlerRevsion.prototype.getTiddler = function(revisions,i,uuid,title)
{
console.log('TiddlerRevsion.getTiddler:',title,i);
console.log('title:'+this.tiddlerTitle(title,i));
	var tiddler = store.fetchTiddler(this.tiddlerTitle(title,TiddlerRevsion.baseRevision));
	tiddler.tags = [];
	return tiddler;
};

TiddlerRevsion.prototype.fileRevisionsSorted = function(uuid,title)
{
console.log('TiddlerRevsion.fileRevisionsSorted:',title);
	var results = [];
	var tag = '_'+title+'_';
	store.forEachTiddler(function(title,tiddler) {
		if(tiddler.isTagged(tag))
			results.push(tiddler);
	});
	results.sort(function(a,b) {return a.title < b.title;});
	return results;
};

merge(config.commands.revisions,{
	done: "Tiddler reverted"
	});

config.commands.saveTiddler.handlerOld = config.commands.saveTiddler.handler;
config.commands.saveTiddler.handler = function(event,src,title)
{
console.log('saveTiddlerNew',title);
// 
// TODO: currently ignores change of title
	var newTitle = story.saveTiddler(title,event.shiftKey);
	if(newTitle)
		story.displayTiddler(null,newTitle);
	var tiddler = store.fetchTiddler(newTitle||title);
	if(tiddler.fields.revision)
		tiddler.fields.revision++;
	else
		tiddler.fields.revision = TiddlerRevsion.baseRevision;
	revisionStore.commitTiddler(tiddler);
	return false;
};

restartTiddlerRevsion = restart;
function restart()
{
//#console.log('new restart');
	restartTiddlerRevsion();
	revisionStore = new TiddlerRevsion();
}

}//# end of 'install only once'
//}}}
