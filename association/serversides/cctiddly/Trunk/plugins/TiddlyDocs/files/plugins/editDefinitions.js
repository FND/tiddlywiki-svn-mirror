
config.macros.editDefinitions={};

config.macros.editDefinitions.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.macros.editDefinitions.refresh(place, paramString);
}


config.macros.editDefinitions.refresh = function(place, paramString){
	removeChildren(place);
	var w = new Wizard();
	w.place = place;
	w.paramString = paramString;
	var me = config.macros.editDefinitions;
	w.createWizard(place, "Edit Definitions");
	var defList = store.getTiddlerText(paramString);
	var items = defList.split("\n");
	w.setValue("defList", defList);
	w.addStep(null, "add/remove a user <input name='definitionsListMarker' type='hidden'></input>");

	var listMarker = w.getElement("definitionsListMarker");
	var select = createTiddlyElement(null, "select");
	select.name = "definitions";
	select.size = "4";
	for(var i=0; i<items.length; i++) {
		createTiddlyElement(select, "option", null, null, items[i]);
	}
var newDef = createTiddlyElement(null, "input");
newDef.name = "newName";
var newButton = createTiddlyButton(null, "add User", "click to add a new user", function() { config.macros.editDefinitions.add(w); }); 
	listMarker.parentNode.appendChild(newDef);
	listMarker.parentNode.appendChild(select);
		listMarker.parentNode.appendChild(newButton);
	var button = createTiddlyButton(null, "Remove User", "click to remove users", function() { config.macros.editDefinitions.remove(w); });
	listMarker.parentNode.appendChild(button);
	
}


config.macros.editDefinitions.add = function(w){
	w.setValue("defList",  w.getValue("defList")+"\n"+w.formElem.newName.value+"\n")
	store.saveTiddler("UserDefinitions", "UserDefinitions", w.getValue("defList"));
	autoSaveChanges();
		config.macros.editDefinitions.refresh(w.place, w.paramString);
}


config.macros.editDefinitions.remove = function(w){
	var items = w.getValue("defList").split("\n");
  	var removeItem = w.formElem.definitions.value
	removeChildren(w.formElem.definitions);
	var outString = "";
	for(var i=0; i<items.length; i++) {
		if(items[i] != removeItem  && items[i]!= "") {
			createTiddlyElement(w.formElem.definitions, "option", null, null, items[i]);
			outString += items[i]+"\n";
		}
	}
	w.formElem.definitionsListMarker.value = outString;
	w.setValue("defList", outString);
	store.saveTiddler("UserDefinitions", "UserDefinitions", outString);
	autoSaveChanges();
}