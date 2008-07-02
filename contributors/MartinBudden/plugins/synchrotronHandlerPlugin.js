/***
|''Name:''|synchrotronHandlerPlugin|
|''Description:''|incorporates Tony Garnock-Jones javascript diff code|
|''Author:''|MartinBudden and TonyGarnockJones|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/synchrotronHandlerPlugin.js |
|''Version:''|0.0.10|
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
// Ensure that the plugin is only installed once.
if(!version.extensions.synchrotronHandlerPlugin) {
version.extensions.synchrotronHandlerPlugin = {installed:true};

merge(config.commands.revisions,{
	done: "Tiddler reverted"
	});

//# saveAndCommitTiddler command definition
config.commands.saveAndCommitTiddler = {};
merge(config.commands.saveAndCommitTiddler,{
	text: "saveAndCommit",
	tooltip: "Save and commit this tiddler",
	hideReadOnly: true,
	done: "Tiddler committed"
	});

config.commands.saveAndCommitTiddler.isEnabled = function(tiddler)
{
	return tiddler && tiddler.isTouched();
};

config.commands.saveAndCommitTiddler.handler = function(event,src,title)
{
//#console.log('config.commands.saveAndCommitTiddler.handler:'+title);
	revisionStore.commitTiddler(store.fetchTiddler(title));
};

config.commands.saveTiddler.handlerOld = config.commands.saveTiddler.handler;
config.commands.saveTiddler.handler = function(event,src,title)
{
//#console.log('saveTiddlerNew');
// 
// TODO: currently ignores change of title
	var newTitle = story.saveTiddler(title,event.shiftKey);
	if(newTitle)
		story.displayTiddler(null,newTitle);
	revisionStore.commitTiddler(store.fetchTiddler(newTitle));
	return false;
};

restartSynchrotron = restart;
function restart()
{
//#console.log('new restart');
	restartSynchrotron();
	Dvcs._debugMode = true;
	revisionStore = new Synchrotron();
	Dvcs._debugMode = true;
	revisionStore.importRevisions(store.getTiddlerText(Synchrotron.repositoryTiddlerTitle));
	revisionStore.checkout = revisionStore.repo.update(null);
}

saveChangesSynchrotron = saveChanges;
function saveChanges(onlyIfDirty,tiddlers)
{
console.log('new saving');
	var tiddler = store.createTiddler(Synchrotron.repositoryTiddlerTitle);
	tiddler.text = '//{{{\n' + revisionStore.exportRevisions() + '\n//}}}\n';
	tiddler.tags = ['excludeLists','excludeSearch'];
	saveChangesSynchrotron(onlyIfDirty,tiddlers);
}

}//# end of 'install only once'
//}}}
