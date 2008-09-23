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
config.macros.CreateClaimItem.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	config.macros.CreateClaimItem.newItemType = 'QuickClaimItemForm';
	var options = [];
	var slices = store.calcAllSlices('ExpenseTypeValues');
	for(s in slices) {
		options.push({'caption':s, 'name':slices[s]+"Form"});
	}
	createTiddlyDropDown(place,this.setItemType,options,'QuickClaimItemForm');
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
		newTiddler.fields[s] = "";
	}	

	//display the new tiddler
	story.displayTiddler(null,uniqueID,DEFAULT_EDIT_TEMPLATE,false,null,null,false,null);
};


config.macros.CreateClaimItem.setItemType = function(ev) {
	var e = ev ? ev : window.event;
	var t = e.target;
	config.macros.CreateClaimItem.newItemType = t[t.selectedIndex].value == 'nullForm' ? 'QuickClaimItemForm' : t[t.selectedIndex].value;
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


// ===============
// = Quick claim =
// ===============
config.macros.SubmitQuickClaim = {};

config.macros.SubmitQuickClaim.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var btn = createTiddlyButton(place,"submit quick claim","quickly submit this item to the system to tweak later",this.submitClick);
	btn.setAttribute('id','btn_QuickClaimSubmit');
};

config.macros.SubmitQuickClaim.submitClick = function() {

	var btn = document.getElementById('btn_QuickClaimSubmit');
	var disabled = hasClass(btn, 'disabled');
	if(disabled) {
		return false;
	}
	
	// validate the form.		
	if(document.quickClaim.amount.value.length < 1) {
		config.macros.SubmitQuickClaim.handleResponse('fail', "Oops. You need to submit an amount.");	
	} else if (isNaN(parseFloat(document.quickClaim.amount.value))) {
		config.macros.SubmitQuickClaim.handleResponse('fail', "Oops. The amount you enter needs to be a number.");	
	} else if (document.quickClaim.justification.value.length < 1) {
		config.macros.SubmitQuickClaim.handleResponse('fail', "Oops. You need to provide a justification.");	
	} else {
		addClass(btn, 'disabled');	
		config.macros.SubmitQuickClaim.doSubmit();			
	}	
	
	return false;
};

config.macros.SubmitQuickClaim.doSubmit = function() {
	console.log('submitting quick claim item');
	// call out to the particular systems authentication and claim generation functions.
	// this function will typically be overwritten to add the sensitive 
};

config.macros.SubmitQuickClaim.handleResponse = function(status, message, uri) {
	var successMsg = "Your quick claim item has been added to a claim on the system.";
	var failureMsg = "Doh! We couldn't get to the system to add your quick claim item. Have another bash.";
	var msg;

	// status = info | success | fail
	if(status == 'success') {
		msg = message ? message : successMsg;
		document.forms['quickClaim'].reset();
		var btn = document.getElementById('btn_QuickClaimSubmit');
		removeClass(btn, 'disabled');
	} 
	else if(status == 'fail') {
		msg = message ? message : failureMsg;
		var btn = document.getElementById('btn_QuickClaimSubmit');
		removeClass(btn, 'disabled');
	} else {
		msg = message;
	}
	clearMessage();
	displayMessage(msg, uri);

};



// ===========================================
// = Build form elements from the data model =
// ===========================================
config.macros.ModeledDataFormBuilder = {};

config.macros.ModeledDataFormBuilder.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	var options = paramString.parseParams()[0];	
	var readonly = options.readonly ? options.readonly : null;
	var mandatory = options.mandatory ? options.mandatory : null;
	var referenceForm = tiddler.fields[options.formIdentifier] + 'Form';	
	if(options.field) {
		// we are displaying the contents of a field
		var field = options.field + 'Field';	
		
		// if this form doesn't specify a field that we are asking for, return nothing.
		if(tiddler.fields[field] === undefined) {
			return;
		}
		this.createFormItem(place,{
			value: tiddler.fields[field],
			label: options.field,
			param: store.getTiddlerSlice(referenceForm,field),
			readonly: readonly,
			mandatory: mandatory
		});
	} else if(options.fields && options.fields == 'nonStandard') {
		// we are displaying all fields not specified as being standard.
		var tiddlyWikiMetaFields = ['changecount'];
		var standardFields = ['claim_id','expense_type','StartDateField','DaysField','LostReceiptField','TrainingCostField','AmountField','JustificationField']; // get these from psd
		standardFields = standardFields.concat(tiddlyWikiMetaFields);
		var s;
		for(var f in tiddler.fields) {
			if(!standardFields.contains(f)) {
				s = createTiddlyElement(place,'span',null,'field');	
				this.createFormItem(s,{
					value: tiddler.fields[f],
					label: f.substr(0,f.length-5),
					param: store.getTiddlerSlice(referenceForm,f),
					readonly: readonly,
					mandatory: mandatory
				});
			}
		}	
	} else {
		//we are displaying the form reference that we are using
		this.createFormItem(place,{
			value: tiddler.fields[options.formIdentifier],
			label: 'Claim Item Type', 						// thinking that this should be paramaterised somehow.
			param: tiddler.fields[options.formIdentifier], 	// is this submitted ?
			readonly: readonly,
			mandatory: mandatory
		});
	}

};


config.macros.ModeledDataFormBuilder.createFormItem = function(place, options) {
	
	// test for an empty mandatory element.
	var className = null;
	if(options.mandatory && options.value.length === 0) {
		className = 'flagMandatory';
	}

	// create the label element
	createTiddlyElement(place,'label',null,className,options.label,{'for': options.param});	

	// create the form input element
	var attributes = {'value':options.value, 'name':options.param};
	if(options.readonly) {
		attributes.readonly = true;
	}
	var t = story.findContainingTiddler(place);
	createTiddlyElement(place,'input',t.getAttribute('tiddler')+options.param,className,null,attributes);	

};


// Hijack the save tiddler function so that we can also persist changes in the edited fields.
config.macros.CreateClaimItem.saveTiddler = story.saveTiddler;
Story.prototype.saveTiddler = function(title,event,shiftKey) {
	
	// reflect the values in the inputs back to the tiddler fields.
	var storedTiddler = store.getTiddler(title);
	var displayedTiddler = story.getTiddler(title);
	
	// fields definitions are held in..
	var defs = storedTiddler.fields['expense_type'];
	
	// for each field in the stored tiddler, look for a corresponding input in the displayed tiddler.
	for(var f in storedTiddler.fields) {
		var s = store.getTiddlerSlice(defs + 'Form',f);
		if(s !== undefined) {			
			storedTiddler.fields[f] = document.getElementById(title+s).value;
		}
	}
		
	// call the real save tiddler button.
	config.macros.CreateClaimItem.saveTiddler.apply(this, arguments);
};


}
//}}}
