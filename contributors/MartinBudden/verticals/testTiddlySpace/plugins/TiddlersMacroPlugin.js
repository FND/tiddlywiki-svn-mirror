/***
|''Name''|TiddlersPlugin|
|''Description''|provide ability to loop through filtered list of tiddlers|
|''Author''|Jon Robson|
|''Version''|0.8.3|
!Description
Bring loops to TiddlyWiki.
!Code
***/
//{{{
config.macros.tiddlers = {
	transcludeFields: function(template, tiddler) {
		var attributes = ["title"];
		for(var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			var value = tiddler[attribute];
			template = template.replace("$%0".format([attribute]), value);
		}
		for(var field in tiddler.fields) {
			template = template.replace("$%0".format([field]), tiddler.fields[field])
		}
		return template;
	},
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var args = paramString.parseParams("name", null, true, false, true)[0];
		var template = args.name[0];
		var filter = args.filter ? args.filter[0] : false;
		var transclusions = args["with"] ? args["with"] : [];
		var emptyString = args.ifEmptyString ? args.ifEmptyString[0] : "";
		emptyString = args.ifEmpty ? store.getTiddlerText(args.ifEmpty[0]) : emptyString;
		var templateText = store.getTiddlerText(template);
		for(var i = 0; i < transclusions.length; i++) {
			templateText = templateText.replace(new RegExp("\\$" + (i + 1), "mg"),
				transclusions[i]);
		}
		var tiddlers = filter ? store.filterTiddlers(filter) : store.getTiddlers("title", "excludeLists");
		for(var i = 0; i < tiddlers.length; i++) {
			var tiddler = tiddlers[i];
			var tiddlerTemplateText = this.transcludeFields(templateText, tiddler);
			wikify(tiddlerTemplateText, place, null, tiddler);
		}
		if(tiddlers.length === 0) {
			wikify(emptyString, place);
		}
	}
};
//}}}
