
config.macros.newInlineTiddler = {};
config.macros.newInlineTiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
 	var w = new Wizard();
	w.createWizard(place,'Add to '+tiddler.title);
	w.setValue('tiddler', tiddler.title);
	var html = [];
	var structure = store.getTiddlerText(tiddler.title+"Structure");
	if(!structure){
		createTiddlyText(place, "No structure defined");
		return false;
	}
	var items = structure.split("\n", 2);
	jQuery.each(items, function(i, value) {
		var id = value.substring(0, value.length-7);
		var editType = store.getTiddlerSlice(value, 'editType');
		if(editType == null)
			editType="text";
		html.push("<br/>"+id+"<br/>");
		html.push(jQuery("<div/>")[editType+"Edit"](id, store.getTiddlerText(value+'##editOptions')).parent().html());
		
	});
	w.addStep(null, "<div id='"+tiddler.title+"WizardContainer'>Name : <br/><input name='companyName'/><br/>"+html.join(" ")+"</div>");
	 w.setButtons([
	{caption: 'create '+tiddler.title, tooltip: 'click to create the task', onClick:function() { config.macros.newInlineTiddler.onCreate(w); }}
	]);	
}

config.macros.newInlineTiddler.onCreate = function(w) {
	var tiddler = w.getValue('tiddler');
	if(store.tiddlerExists(w.formElem.companyName.value)){
		store.setTiddlerTag(w.formElem.companyName.value, true,tiddler);
	}else{
		store.saveTiddler(w.formElem.companyName.value, w.formElem.companyName.value, "This is a new entry.", null, null, tiddler, config.defaultCustomFields);
	}
	autoSaveChanges(true, w.formElem.companyName.value);
	
	jQuery.each(w.formElem, function(item, value) {
	
		if(value.value != null && value.name !='companyName' && value.name !=""){
			var tiddlerName = w.formElem.companyName.value+"_"+value.name;
//			t = store.saveTiddler(tiddlerName, tiddlerName, 'http://google.com', null, null, "", merge({}, config.defaultCustomFields));
//			t.fields['server.type'] = tiddlerName; // unnecessary hack 
			console.log('tname = '+tiddlerName);
//			autoSaveChanges(null, tiddlerName);
			
		}
	})



	story.refreshTiddler(tiddler, null, true);


	var start = document.getElementById(tiddler+'WizardContainer');
	var destination = document.getElementById(w.formElem.companyName.value+"ListItem");
	anim.startAnimating(new Zoomer('boo',start,destination,null),new Scroller(destination));



};
