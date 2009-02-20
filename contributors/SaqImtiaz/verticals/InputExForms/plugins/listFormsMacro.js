//{{{
config.macros.listForms = {
	
	formTag : "_form",
	
	schemaTag : "_schema",
	
	templateField : "schema",
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		var e = createTiddlyElement(place,"span",null,"listForms",null, {"refresh":"macro","macroName":macroName,"params":paramString,"tiddler":tiddler.title});
		this.refresh(e,paramString);
	},
	
	refresh : function(place,paramString){
		var params = (paramString||place.getAttribute("params")).parseParams("tiddlers",null,true);
		removeChildren(place);
		var forms = store.getTaggedTiddlers(this.formTag);
		var schemas = store.getTaggedTiddlers(this.schemaTag)
		var map = {};
		for (var z=0; z<schemas.length; z++) {
			map[schemas[z].title] = [];
		}
		for (var z=0; z<forms.length; z++) {
			map[forms[z].fields["schema"]].push(forms[z])
		}
		for (x in map){
			var list = createTiddlyElement(place,"ul");
			createTiddlyElement(list,"li",null,"listTitle formListTitle",x);
			for (var z=0;z<map[x].length;z++){
				var li = createTiddlyElement(list,"li");
				createTiddlyLink(li,map[x][z].title,true);
			}
			if (map[x].length == 0)
				createTiddlyElement(list,"li",null,null,"no forms of this type")
			createTiddlyElement(place,"br");
		}
	}
	
	
}
//}}}