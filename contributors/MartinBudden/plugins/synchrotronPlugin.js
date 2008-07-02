/***
|''Name:''|synchrotronPlugin|
|''Description:''|incorporates Tony Garnock-Jones javascript diff code|
|''Author:''|MartinBudden and TonyGarnockJones|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/synchrotronPlugin.js |
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
if(!version.extensions.synchrotronPlugin) {
version.extensions.synchrotronPlugin = {installed:true};

//#config.defaultCustomFields['server.type'] = 'synchrotron';

var revisionStore = null;

Dvcs.Mergers.Defaults["tags"] = Dvcs.Mergers.simpleTextualMerger;

function Synchrotron()
{
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

Synchrotron.prototype.exportRevisions = function()
{
	var repoExt = this.repo.exportRevisions();
	//var repoText = uneval(repoExt);
	var repoText = '('+JSON.stringify(repoExt,null,Dvcs._debugMode ? '\t' : null) +')';

	console.log('Synchrotron.exportRevisions:\n'+repoText);
	return repoText;
};

Synchrotron.prototype.importRevisions = function(repoText)
{
	console.log('Synchrotron.importRevisions:\n'+repoText);
	if(repoText) {
		var repoExt = eval(repoText);
		return this.repo.importRevisions(repoExt);
	}
	return null;
};
Synchrotron.prototype.commitTiddler = function(tiddler)
{
	var id = this.putTiddler(tiddler);
	if(id) {
		var newRevId = this.repo.commit(this.checkout,{committer:config.options.txtUserName});
		console.log('commit:'+tiddler.title);
		console.log('text:'+tiddler.text);
		console.log('uid:'+id);
		//#console.log('revId:'+newRevId);
		//var repoExt = this.repo.exportRevisions();
		//var repoText = uneval(repoExt);
		//#console.log('repoExt:'+repoText);
		return true;
	}
	return false;
};

Synchrotron.prototype.putTiddler = function(tiddler)
{
console.log('putTiddler:',tiddler);
	if(!tiddler)
		return false;
	if(!tiddler.fields.uuid)
		tiddler.fields.uuid = this.checkout.createFile();
	var id = tiddler.fields.uuid;

	var me = this;
	function maybeStore(key,value) {
		if (value !== me.checkout.getProp(id,key)) {
			me.checkout.setProp(id,key,value);
		}
	}
	function maybeStoreText(key,value) {
		var oldText = me.checkout.getProp(id,key);
		if (!oldText || value.join('\n') !== oldText.join('\n')) {
			me.checkout.setProp(id,key,value);
		}
	}
	function maybeStoreField(tiddler,fieldName,value) {
		if (!fieldName.match(/^temp\./)) {
			if (typeof value != 'string') {
				value = '';
			}
			maybeStore('field-' + fieldName,value);
		}
	}
	maybeStore('title', tiddler.title);
	maybeStore('created', tiddler.created.convertToYYYYMMDDHHMM());
	maybeStore('modified', tiddler.modified.convertToYYYYMMDDHHMM());
	maybeStore('modifier', tiddler.modifier);
	tiddler.tags.sort();
	maybeStoreText('tags', tiddler.tags);
	maybeStoreText('text', tiddler.text.split('\n'));
	store.forEachField(tiddler,maybeStoreField,true);
	return id;
};

Synchrotron.prototype.getTiddler = function(revisions,i,uuid)
{
	var body = this.repo.getBody(revisions[i],uuid);
console.log('getTiddler body:',body);
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

}//# end of 'install only once'
//}}}
