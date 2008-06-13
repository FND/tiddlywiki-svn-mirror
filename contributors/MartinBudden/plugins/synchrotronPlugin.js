/***
|''Name:''|synchrotronPlugin|
|''Description:''|incorporates Tony Garnock-Jones javascript diff code|
|''Author:''|MartinBudden|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/synchrotronPlugin.js |
|''Version:''|0.0.7|
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
// Ensure that the AsyncStartupPlugin is only installed once.
if(!version.extensions.synchrotronPlugin) {
version.extensions.synchrotronPlugin = {installed:true};

//#config.defaultCustomFields['server.type'] = 'synchrotron';

var synchrotron = null;

function Synchrotron()
{
	Dvcs._debugMode = true;
	this.repo = new Dvcs.Repository();
	this.checkout = this.repo.update(null);
	return this;
}

Synchrotron.repositoryTiddlerTitle = '_synchrotronRepository';

Synchrotron.dateFromTimestamp = function(timestamp)
{
	var dt = new Date();
	dt.setTime(parseInt(timestamp,10));
	return dt;
};

Synchrotron.prototype.export = function()
{
	var repoExt = this.repo.exportRevisions();
	var repoText = uneval(repoExt);
	//#console.log('Synchrotron.export:'+repoText);
	return repoText;
};

Synchrotron.prototype.import = function(repoText)
{
	//#console.log('Synchrotron.import:'+repoText);
	if(repoText) {
		var repoExt = eval(repoText);
		this.repo.importRevisions(repoExt);
		this.checkout = this.repo.update(null);
	}
};

Synchrotron.prototype.commitTiddler = function(tiddler)
{
//#console.log('commitTiddler:',tiddler);
	if(!tiddler)
		return false;
	if(!tiddler.fields.uuid)
		tiddler.fields.uuid = this.checkout.createFile();
	var id = tiddler.fields.uuid;
	this.checkout.setProp(id,'title',tiddler.title);
	this.checkout.setProp(id,'text',tiddler.text.split('\n'));
	// TODO: rest of fields & metadata
	var newRevId = this.repo.commit(this.checkout);
	//#console.log('commit:'+tiddler.title);
	//#console.log('text:'+tiddler.text);
	//#console.log('uid:'+id);
	//#console.log('revId:'+newRevId);
	//var repoExt = this.repo.exportRevisions();
	//var repoText = uneval(repoExt);
	//#console.log('repoExt:'+repoText);
	return true;
};

Synchrotron.prototype.getTiddler = function(revisions,i,uuid)
{
	var body = this.repo.getBody(revisions[i],uuid);
//#console.log('body:',body);
//#console.log('li:'+i);
//#console.log(body.title);
//#console.log(body.text);
	if(!body || !body.title)
		return null;
	title = body.title;
	tiddler = new Tiddler(title);
	tiddler.modified = Synchrotron.dateFromTimestamp(revisions[i].timestamp);
	tiddler.text = body.text.join('\n');
	tiddler.fields['server.page.revision'] = i;
	tiddler.fields.uuid = uuid;
	return tiddler;
};

Synchrotron.prototype.fileRevisionsSorted = function(uuid)
{
//#console.log('Synchrotron.fileRevisionsSorted:',uuid);
	if(!uuid)
		return null;
	var m = this.repo.fileRevisions(uuid);
	var results = [];
	for(var revId in m) {
		results.push(m[revId]);
	}
	results.sort(function(r1, r2) {return r1.timestamp - r2.timestamp;});
	return results;
};

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
	revisionStore = new Synchrotron();
	revisionStore.import(store.getTiddlerText(Synchrotron.repositoryTiddlerTitle));
}

saveChangesSynchrotron = saveChanges;
function saveChanges(onlyIfDirty,tiddlers)
{
//#console.log('new saving');

	var tiddler = new Tiddler(Synchrotron.repositoryTiddlerTitle);
	tiddler.text = '//{{{\n' + revisionStore.export() + '\n//}}}\n';
	tiddler.tags = ['excludeLists','excludeSearch'];
	store.addTiddler(tiddler);
	saveChangesSynchrotron(onlyIfDirty,tiddlers);
}

}//# end of 'install only once'
//}}}
