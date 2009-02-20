//{{{
config.macros.renderFormInputEx = {
	
	label : "save",
	
	prompt: "save this form",
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		if (!tiddler.isTagged("_form") || !tiddler.fields["schema"])
			return;
		eval("var schema ="+ store.getTiddlerText(tiddler.fields["schema"]));
		schema.parentEl = place;
		var form = new YAHOO.inputEx.Form(schema);
		if (tiddler.text && tiddler.text.length>0)
			form.setValue(YAHOO.lang.JSON.parse(tiddler.text));

		form.updatedEvt.subscribe(
			function(){
				var data = arguments[1][0];
				var dataString = YAHOO.lang.JSON.stringify(data);
				var savedData = tiddler.text;
				//console.log("dataString",dataString);
				//console.log("savedData",savedData);
				//console.log(dataString == savedData)
				var dirty = (dataString == savedData)? false : true;
				//console.log(dirty)
				if(dirty)
					addClass(form.buttonDiv,"dirty");
				else
					removeClass(form.buttonDiv,"dirty");				
				}
		)

		createTiddlyButton(form.buttonDiv,this.label,this.prompt,function(){
			var data = form.getValue();
			var dataString = YAHOO.lang.JSON.stringify(data);
			store.suspendNotifications();
			store.setValue(tiddler,"text",dataString);
			tiddler.incChangeCount();
			store.resumeNotifications();
			autoSaveChanges();
			},"button savebutton");
		
	}
}
//}}}
