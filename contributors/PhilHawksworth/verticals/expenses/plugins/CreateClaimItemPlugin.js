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
config.macros.CreateClaimItem.newItemType = 'AirfareForm';
config.macros.CreateClaimItem.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	var options = [];
	var slices = store.calcAllSlices('expenseTypeValues');

	// test data to be replaced later when the tiddler exists.
	options.push({'caption':'just get it up there', 'name':'SimpleForm'});
	options.push({'caption':'An Airfare', 'name':'AirfareForm'});

	for(s in slices) {
		var arg =  store.getTiddlerSlice('AirfareForm',s);
		options.push({'caption':arg, 'value':arg});
	}
	createTiddlyDropDown(place,this.setItemType,options,'SimpleForm');
	createTiddlyButton(place,"add item","add another item to this claim",this.doCreate);
};


config.macros.CreateClaimItem.doCreate = function(ev) {

	var e = ev ? ev : window.event;
	var t = story.findContainingTiddler(e.target);
	var claimTiddler = store.getTiddler(t.getAttribute('tiddler'));
	var dt = new Date();
	var uniqueID = 'claim_' + claimTiddler.fields['claim_id'] + '_' + dt.getTime();

	// create tiddler and associate it with this claim.
	var valuesTiddlerTitle = config.macros.CreateClaimItem.newItemType;	
	var newTiddler = store.createTiddler(uniqueID);
	newTiddler.tags.pushUnique('claimItem');
	newTiddler.fields['claim_id'] = claimTiddler.fields['claim_id'];
	newTiddler.fields['expense_type'] = config.macros.CreateClaimItem.newItemType.substr(0,config.macros.CreateClaimItem.newItemType.length-4);

	// add fields as described in the form template for this claim type
	var slices = store.calcAllSlices(valuesTiddlerTitle);
	for(s in slices) {
		// newTiddler.fields[s] = "";
		newTiddler.fields[s.toLowerCase()] = "";
	}	

	//display the new tiddler
	story.displayTiddler(null,uniqueID,DEFAULT_EDIT_TEMPLATE,false,null,null,false,null);
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

	//call out to the particular systems authentication and claim generation functions.
	config.macros.SiteminderLogin.doLogin();
};


// ===========================================
// = Build form elements from the data model =
// ===========================================
config.macros.ModeledDataFormBuilder = {};

config.macros.ModeledDataFormBuilder.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	var options = paramString.parseParams()[0];	
	var referenceForm = tiddler.fields[options.formIdentifier] + 'Form';	
	
	if(options.field) {
		// we are displaying the contents of a field
		var field = options.field + 'Field';
		var type = store.getTiddler(field).fields['field_type'];
		var value = tiddler.fields[field.toLowerCase()];
		var label = options.field;			
		var param = store.getTiddlerSlice(referenceForm,field);
		this.createFormItem(place,{
			type: type,
			value: value,
			label: label,
			param: param,
			readonly: options.readonly ? options.readonly : null,
			mandatory: options.mandatory ? options.mandatory : null
		});
	} else if(options.fields && options.fields == 'nonStandard') {
		// we are displaying all fields not specified as being standard.

		// get these from psd
		var standardFields = ['claim_id','expense_type','StartDateField', 'AmountFields', 'JustificationField'];

		// sadly we need to sanitise the field names because the tiddler fields seem to neef to be lower case.
		for (var s=0; s < standardFields.length; s++) {
			standardFields[s] = standardFields[s].toLowerCase();
		};
		
		for(var f in tiddler.fields) {
			if(!standardFields.contains(f)) {
				console.log('Output ' + f);
				var field = f + 'Field';
				var type = store.getTiddler(field).fields['field_type'];
				var value = tiddler.fields[field.toLowerCase()];
				var label = f;			
				var param = store.getTiddlerSlice(referenceForm,field);
				this.createFormItem(place,{
					type: type,
					value: value,
					label: label,
					param: param,
					readonly: options.readonly ? options.readonly : null,
					mandatory: options.mandatory ? options.mandatory : null
				});
			}
		}
		
		
	} else {
		//we are displaying the form reference that we are using
		var type = 'text';
		var value = tiddler.fields[options.formIdentifier];
		var label = 'Claim Item Type'; // thinking that this should be paramaterised somehow.
		var param = tiddler.fields[options.formIdentifier]; // is this submitted ?
		this.createFormItem(place,{
			type: type,
			value: value,
			label: label,
			param: param,
			readonly: options.readonly ? options.readonly : null,
			mandatory: options.mandatory ? options.mandatory : null
		});
	}

};


config.macros.ModeledDataFormBuilder.createFormItem = function(place, options) {
	
	// test for an empty mandatory element.
	var className = null;
	if(options.mandatory && options.value.length === 0) {
		className = 'flagMandatory';
	}

	// create the label elelment
	createTiddlyElement(place,'label',null,className,options.label,{'for': options.param});	

	// create the form input element
	var attributes = {'value':options.value, 'name':options.param};
	if(options.readonly) {
		attributes.readonly = true;
	}
	createTiddlyElement(place,'input',null,className,null,attributes);	

};

}
//}}}
