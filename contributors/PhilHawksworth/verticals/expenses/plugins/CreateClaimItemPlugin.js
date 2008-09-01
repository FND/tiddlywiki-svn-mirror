/***
|''Name:''|CreateClaimItemPlugin |
|''Description:''|Creat a new claim item in the EasyExpenses system|
|''Author:''|Phil Hawksworth|
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4.1|
***/

//{{{
if(!version.extensions.CreateClaimItemPlugin) {
version.extensions.CreateClaimItemPlugin = {installed:true};

config.macros.CreateClaimItem = {};

config.macros.CreateClaimItem.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
	var tiddler = story.findContainingTiddler(place);
	var t = store.getTiddler(tiddler.getAttribute('tiddler'));
	
	//make a form to create new claim items. Populate the drop down by finding all the 'form definition' tiddlers.
	var btn = createTiddlyButton(place,"new claim item","add a new claim item",this.CreateClaimItem);
	btn.claim_id = t.fields.claim_id;

	
};

config.macros.CreateClaimItem.CreateClaimItem = function(ev) {
	var e = ev ? ev : window.event;

	console.log('Create new item. claim_id:', this.claim_id);
	
	// create tiddler and associate it with this claim.
	// refelct the form elements into this claim report.
};

}
//}}}
