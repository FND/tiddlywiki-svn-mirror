
merge(Tiddler.prototype,{
	setTagFromGroup: function(tagGroup,tag) {
		var tagList = fastTagged(tagGroup);
		for (var i=0;i<tagList.length;i++) {
			// trying to speed this up by not using setTiddlerTag
			this.tags.remove(tagList[i].title);
		}
		// now use it. triggers notify etc
		store.setTiddlerTag(this.title,true,tag);
	}
});

merge(config.macros,{

	multiToggleTag: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var pp = paramString.parseParams("tag",null,true);
			
			if (!tiddler)
				tiddler = store.getTiddler(getParam(pp,"title"));
			
			var tag = getParam(pp,"tag");

			var title = getParam(pp,"title",tiddler.title);
			var actOnTiddler = store.getTiddler(title);

			var getValues = fastTagged(tag).sort(function(a,b){
				return a.sorterUtil(b,"orderSlice");
			});


			getValues.each(function(t) {
				var label = store.getTiddlerSlice(t.title,"button");
				var autoClass = "button " + t.title.replace(/[\/ ]/g,'') 
				if (!label) label = t.title.substring(0,1).toLowerCase();
				var cl = createTiddlyButton(place, label, t.title, function(e) {
					actOnTiddler.setTagFromGroup(tag,t.title);
					return false;
				},
				autoClass + " " + (actOnTiddler.getByIndex(tag) == t.title ? "on" : "off")
				);
			});

		}
	}

});

config.macros.tField = config.macros.tTag;

setStylesheet(["",
".viewer .button.off {font-weight:bold;border-color:#eee;background:#fff;color:#ccc;margin:0px;font-size:110%}",
".viewer .button.on {font-weight:bold;border-color:#444;background:#888;color:#fff;margin:0px;font-size:110%}",
// TODO move this css elsewhere
"#realmSelector .button.off {margin:0 0.5em;padding:0 1em;border:2px solid #aaa;background:#eee;color:#333;}", // actually reversed, ie off is "on"
"#realmSelector .button.on {margin:0 0.5em;padding:0 1em;border:2px solid #999;background:#999;color:#ccc;}", // actually reversed, ie off is "on"

// temporary
".viewer .Next.button.on {border-color:#55c;background:#cfa;color:#4a4;}",
".viewer .WaitingFor.button.on {border-color:#b84;background:#fdb;color:#b84;}",
".viewer .Future.button.on {border-color:#48b;background:#bdf;color:#48b;}",

".viewer .Active.button.on {border-color:#55c;background:#cfa;color:#4a4;}",
".viewer .SomedayMaybe.button.on {border-color:#48b;background:#bdf;color:#48b;}",

""].join("\n"),"tTag");

//}}}




