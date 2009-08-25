config.macros.editDefinitions={};

config.macros.editDefinitions.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var defContainer = createTiddlyElement(place, "div", null, "definitionsContainer");
	config.macros.editDefinitions.refresh(defContainer, paramString);
}

config.macros.editDefinitions.refresh = function(place, paramString){
	removeChildren(place);
	var w = new Wizard();
	w.place = place;
	w.paramString = paramString;
	var me = config.macros.editDefinitions;
	w.createWizard(place, paramString.replace("Definitions", " ")+"Definitions");
	var defList = store.getTiddlerText(paramString);
	var items = defList.split("\n");
	w.setValue("defList", defList);
	w.addStep(null, "<input name='definitionsListMarker' type='hidden'></input>");
	var listMarker = w.getElement("definitionsListMarker");
	var select = createTiddlyElement(null, "select");
	select.name = "definitions";
	select.size = "7";
	select.style.width = "14.5em";
	for(var i=0; i<items.length; i++) {
		createTiddlyElement(select, "option", null, null, items[i]);
	}
	var newDef = createTiddlyElement(null, "input");
	newDef.name = "newName";
	var newButton = createTiddlyButton(null, "add", "click to add ", function() { config.macros.editDefinitions.add(w); }); 

	var table = createTiddlyElement(listMarker.parentNode, "table", "", "definitionsTable");
	var tr = createTiddlyElement(table, "tr");
	var td = createTiddlyElement(tr, "td");
	td.appendChild(newDef);
	var td = createTiddlyElement(tr, "td");
	td.appendChild(newButton);

	
	listMarker.parentNode.appendChild(createTiddlyElement(null, "br"));
	var button = createTiddlyButton(null, "remove", "click to remove", function() { config.macros.editDefinitions.remove(w); });
	


	var tr = createTiddlyElement(table, "tr");
	var td = createTiddlyElement(tr, "td");
	td.appendChild(select);
	var td = createTiddlyElement(tr, "td");
	td.appendChild(button);	
}

config.macros.editDefinitions.add = function(w){
	if(w.formElem.newName.value !="") {
		w.setValue("defList",  w.formElem.newName.value+"\n"+w.getValue("defList"));
		store.saveTiddler(w.paramString, w.paramString, w.getValue("defList"));
		autoSaveChanges();
	}
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
	outString = outString.substring(0, outString.length-1);
	w.formElem.definitionsListMarker.value = outString;
	w.setValue("defList", outString);
	store.saveTiddler(w.paramString, w.paramString, outString);
	autoSaveChanges();
}


config.shadowTiddlers.StyleSheetEditDefinitions = store.getTiddlerText(tiddler.title + "##StyleSheet");
store.addNotification("StyleSheetEditDefinitions", refreshStyles);

/***
!StyleSheet

.definitionsTable {
	padding:0.1em;
	vertical-align:top;
}

****/
