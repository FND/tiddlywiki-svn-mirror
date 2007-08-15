
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

			var getValues = fastTagged(tag).sort(function(a,b){
				return a.sorterUtil(b,"orderSlice");
			});

			getValues.each(function(t) {
				var label = store.getTiddlerSlice(t.title,"toggleBtn");
				if (!label) label = t.title.substring(0,1);
				var cl = createTiddlyButton(place, label, t.title, function(e) {
					tiddler.setTagFromGroup(tag,t.title);
					return false;
				});
			});

		}
	}

});

config.macros.tField = config.macros.tTag;

setStylesheet(["",
".button.off {border-style:none;background:#fff;color:#ccc;}",
".button.on {border-style:none;background:#ddd;color:#000;}",
// TODO move this css elsewhere
"#realmSelector .button.off {margin:0 0.5em;padding:0 1em;border:2px solid #aaa;background:#eee;color:#333;}", // actually reversed, ie off is "on"
"#realmSelector .button.on {margin:0 0.5em;padding:0 1em;border:2px solid #999;background:#999;color:#ccc;}", // actually reversed, ie off is "on"
""].join("\n"),"tTag");

//}}}




