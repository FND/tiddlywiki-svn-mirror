//{{{
config.macros.newForm = {
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		
		createTiddlyButton(place,"new form","create a new form",this.onClick);
	},
	
	onClick : function(e) {
		if (!e) var e = window.event;
		var popup = Popup.create(this);
		var schemas = store.getTaggedTiddlers("_schema");
		if (schemas.length == 0) {
			createTiddlyText(createTiddlyElement(popup,"li"),('no form templates available'));
		}
		else {
			for (var b=0; b<schemas.length; b++){
				var btn = createTiddlyButton(createTiddlyElement(popup,"li"),schemas[b].title,schemas[b].title,config.macros.newForm.createForm);
				btn.setAttribute("schema",schemas[b].title);
			}
		}
		Popup.show(popup,false);
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		return(false);
		
	},
	
	createForm : function(e) {
		var schema = this.getAttribute("schema");
		var title = schema + " - " +(new Date()).formatString("YYYY0MM0DD0hh0mm0ss");
		store.saveTiddler(title,title,"",config.options.txtUserName,new Date(),["_form"],merge({"schema":schema},config.defaultCustomFields),false, new Date());
		autoSaveChanges();
		story.displayTiddler(null,title,1);
	}
}
//}}}