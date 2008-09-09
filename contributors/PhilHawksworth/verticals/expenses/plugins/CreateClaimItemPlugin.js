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
	story.displayTiddler(null,title,DEFAULT_VIEW_TEMPLATE,false,null,null,false,null);		
};



// ==================
// = New claim item =
// ==================

config.macros.CreateClaimItem = {};
config.macros.CreateClaimItem.newItemType = 'simple';
config.macros.CreateClaimItem.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	var options = [];
	var slices = store.calcAllSlices('expenseTypeValues');

	// test data to be replaced later when the tiddler exists.
	options.push({'caption':'just get it up there', 'name':'Simple'});
	options.push({'caption':'An Airfare', 'name':'Airfare'});

	for(s in slices) {
		var arg =  store.getTiddlerSlice('AirfareForm',s);
		options.push({'caption':arg, 'value':arg});
	}
	createTiddlyDropDown(place,this.setItemType,options,'simple');
	createTiddlyButton(place,"add item","add another item to this claim",this.doCreate);
};

config.macros.CreateClaimItem.doCreate = function(ev) {

	var e = ev ? ev : window.event;
	var t = story.findContainingTiddler(e.target);
	var claimTiddler = store.getTiddler(t.getAttribute('tiddler'));
	var dt = new Date();
	var uniqueID = 'claim_' + claimTiddler.fields['claim_id'] + '_' + dt.getTime();

	// create tiddler and associate it with this claim.
	var valuesTiddlerTitle = config.macros.CreateClaimItem.newItemType + 'Form';	
	var formDefinitionTiddler = store.getTiddler(valuesTiddlerTitle);
	var newTiddler = store.createTiddler(uniqueID);
	newTiddler.tags.pushUnique('claimItem');
	newTiddler.fields['claim_id'] = claimTiddler.fields['claim_id'];

	// add fields as described in the form template for this claim type
	var slices = store.calcAllSlices(formDefinitionTiddler);
	for(s in slices) {
		var arg =  store.getTiddlerSlice(formDefinitionTiddler,s);
		newTiddler.fields[s.toLowerCase()] = "";
		// newTiddler.fields[s.toLowerCase()] = {'label':s, 'arg':arg, 'value':null};
	}
	console.log('newTiddler.fields',newTiddler.fields);

	// refelct the form elements into this claim report.		
	story.displayTiddler(null,uniqueID,DEFAULT_VIEW_TEMPLATE,false,null,null,false,null);
};

config.macros.CreateClaimItem.setItemType = function(ev) {
	var e = ev ? ev : window.event;
	var t = e.target;
	config.macros.CreateClaimItem.newItemType = t[t.selectedIndex].value;
};



//
// Extend the commands so that we can use our own commands on tiddlers.
//
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

config.macros.view.views.complexField = function(value,place,params,wikifier,paramString,tiddler) {
	var results = value[params[2]];
	highlightify(results,place,highlightHack,tiddler);
};


// ===============
// = Quick claim =
// ===============
config.macros.SubmitQuickClaim = {};

config.macros.SubmitQuickClaim.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var btn = createTiddlyButton(place,"submit quick claim","quickly submit this item to the system to tweak later",this.doSubmit);
};

config.macros.SubmitQuickClaim.doSubmit = function(ev) {
	console.log('submitting quick claim item');
	config.macros.SubmitQuickClaim.handleResponse();
};

config.macros.SubmitQuickClaim.handleResponse = function() {
	console.log('handling response from quick claim form submission');
	displayMessage("Your quick claim item has been submitted");
};


}
//}}}
