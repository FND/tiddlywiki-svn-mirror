/***
|''Name:''|CreateClaimItemPlugin |
|''Description:''|Creat a new claim item in the EasyExpenses system|
|''Author:''|Phil Hawksworth|
|''Version:''|0.2|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4.1|
***/

//{{{
if(!version.extensions.CreateClaimPlugin) {
version.extensions.CreateClaimPlugin = {installed:true};

config.macros.CreateClaim = {};
config.macros.CreateClaimItem = {};

config.macros.CreateClaim.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var btn = createTiddlyButton(place,"New claim","start a new claim",this.doCreate);
};

config.macros.CreateClaim.doCreate = function(ev) {
	var dt = new Date();
	var claim_id = 'GENERATED_CLAIM_ID_'+ dt.getTime();
	var title = "Your reference";
	var t = store.createTiddler(title);
	t.tags.pushUnique('claimHeader');
	t.fields['claim_id'] = claim_id;
	// t.text = 'this is a new claim. Its ~GENERATED_CLAIM_ID will need to be provided by the expenses system.';
	story.displayTiddler(null,title,DEFAULT_VIEW_TEMPLATE,false,null,null,false,null);		
};


// Extend the commands so that we can use our own commands on tiddlers.
config.commands.newClaimItem = {
	text: "new claim item",
	tooltip: "add another item to claim",
	handler : function(event,src,title) {
		var claimTiddler = store.getTiddler(title);
		var dt = new Date();
		var uniqueID = 'claim_' + claimTiddler.fields['claim_id'] + '_' + dt.getTime();
		// create tiddler and associate it with this claim.
		var t = store.createTiddler(uniqueID);
		t.tags.pushUnique('claimItem');
		t.fields['claim_id'] = claimTiddler.fields['claim_id'];
		t.text = 'defined by the FORM';
		// refelct the form elements into this claim report.		
		story.displayTiddler(null,uniqueID,DEFAULT_VIEW_TEMPLATE,false,null,null,false,null);
	}
};
config.commands.cloneClaimItem = {
	text: "clone",
	tooltip: "add another claim item just like this",
	handler : function(event,src,title) {
		var sourceTiddler = store.getTiddler(title);
		var dt = new Date();
		var uniqueID = 'claim_' + sourceTiddler.fields['claim_id'] + '_' + dt.getTime();
		// create tiddler and associate it with this claim.
		var t = store.createTiddler(uniqueID);
		t.tags.pushUnique('claimItem');
		t.fields = sourceTiddler.fields;
		t.text = sourceTiddler.text;
		// refelct the form elements into this claim report.		
		story.displayTiddler(null,uniqueID,DEFAULT_VIEW_TEMPLATE,false,null,null,false,null);
	}
};

}
//}}}
