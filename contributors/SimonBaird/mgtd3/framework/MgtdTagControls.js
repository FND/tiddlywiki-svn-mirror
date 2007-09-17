
merge(Tiddler.prototype,{

	setTagFromGroup: function(tagGroup,tag) {
		var tagList = fastTagged(tagGroup);
		for (var i=0;i<tagList.length;i++) {
			// trying to speed this up by not using setTiddlerTag
			this.tags.remove(tagList[i].title);
		}
		// now use it. triggers notify
		if (tag)
			store.setTiddlerTag(this.title,true,tag);
		else 
			store.setTiddlerTag(this.title,false,"blah"); // just so there's at least one notify
	},

	toggleTag: function(tag) {
		store.setTiddlerTag(this.title,!this.hasTag(tag),tag);
	},

	hasTag: function(tag) {
		return this.tags.contains(tag);
	}

});

merge(config.macros,{
	
	singleToggleTag: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var pp = paramString.parseParams("tag",null,true);
			
			if (!tiddler)
				tiddler = store.getTiddler(getParam(pp,"title"));
			
			var tag = getParam(pp,"tag");
			var t = store.fetchTiddler(tag);

			var title = getParam(pp,"title",tiddler.title);
			var actOnTiddler = store.getTiddler(title);

			var label = store.getTiddlerSlice(t.title,"button");
			var autoClass = "button " + t.title.replace(/[\/ ]/g,'') 
			if (!label) label = t.title.substring(0,1).toLowerCase();
			var cl = createTiddlyButton(place, label, t.title, function(e) {
					actOnTiddler.toggleTag(tag);
					return false;
				},
				autoClass + " " + (actOnTiddler.hasTag(tag) ? "on" : "off")
				);
		}
		
	},

	groupOfSingleToggleTags: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var pp = paramString.parseParams("tag",null,true);
			
			if (!tiddler)
				tiddler = store.getTiddler(getParam(pp,"title"));
			
			var tag = getParam(pp,"tag");

			var title = getParam(pp,"title",tiddler.title);
			var refresh = getParam(pp,"refresh"); // stupid bit for pagetemplate hack

			var actOnTiddler = store.getTiddler(title);

			var getValues = fastTagged(tag).sort(function(a,b){
				return a.sorterUtil(b,"orderSlice");
			});

			getValues.each(function(t) {

				var label = store.getTiddlerSlice(t.title,"button");
				var autoClass = "button " + t.title.replace(/[\/ ]/g,'') 
				if (!label) label = t.title.substring(0,1).toLowerCase();
				var cl = createTiddlyButton(place, label, t.title, function(e) {
						actOnTiddler.toggleTag(t.title);
						if (refresh == "page")
							refreshPageTemplate();
						return false;
					},
					autoClass + " " + (actOnTiddler.getByIndex(tag).contains(t.title) ? "on" : "off")
					);
			 });
		}
		
	},

	multiToggleTag: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var pp = paramString.parseParams("tag",null,true);
			
			if (!tiddler)
				tiddler = store.getTiddler(getParam(pp,"title"));
			
			var tag = getParam(pp,"tag");

			var refresh = getParam(pp,"refresh"); // stupid bit for pagetemplate hack

			var title = getParam(pp,"title",tiddler.title);
			var actOnTiddler = store.getTiddler(title);

			var getValues = fastTagged(tag).sort(function(a,b){
				return a.sorterUtil(b,"orderSlice");
			});


			getValues.each(function(t) {
				var label = store.getTiddlerSlice(t.title,"button");
				var extraClass = store.getTiddlerSlice(t.title,"buttonClass");
				var autoClass = (extraClass ? extraClass : "") + " button " + t.title.replace(/[\/ ]/g,'') 
				if (!label) label = t.title.substring(0,1).toLowerCase();
				var cl = createTiddlyButton(place, label, t.title, function(e) {
						actOnTiddler.setTagFromGroup(tag,t.title);
						if (refresh == "page")
							refreshPageTemplate();
						return false;
					},
					autoClass + " " + (actOnTiddler.getByIndex(tag).contains(t.title) ? "on" : "off")
					);
			});

		}
	},

	multiSelectTag: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var pp = paramString.parseParams("tag",null,true);
			
			if (!tiddler)
				tiddler = store.getTiddler(getParam(pp,"title"));
			
			var tag = getParam(pp,"tag");
			var refresh = getParam(pp,"refresh"); // stupid bit for pagetemplate hack

			var allowNone = getParam(pp,"allowNone");

			var title = getParam(pp,"title",tiddler.title);
			var actOnTiddler = store.getTiddler(title);

			var selectOptions = [];

			if (allowNone)
				selectOptions.push({name: null, caption:'-'});// TODO this doesn't work right?

			var getValues = fastTagged(tag).sort(function(a,b){
				return a.sorterUtil(b,"orderSlice");
			});

			getValues.each(function(t) {
				var useTitle = store.getTiddlerSlice(t.title,"button");
				if (!useTitle) useTitle = t.title;
				selectOptions.push({name: t.title, caption:useTitle});
			});

			var dd = createTiddlyDropDown(place, function(e) {
					actOnTiddler.setTagFromGroup(
						tag,
						selectOptions[this.selectedIndex].name
						);
					if (refresh == "page")
						refreshPageTemplate();
					return false;
				},
				selectOptions,
				actOnTiddler.getByIndex(tag)[0]
			);

		}
	},

	multiCheckboxTag: {

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

			var output = "";
			getValues.each(function(t) {
				output += "<<toggleTag [[%0]] [[%1]] [[%0]]>>".format([
					t.title,
					actOnTiddler.title
				]);
			});

			wikify(output,place,null,tiddler);

		}
	}

});

setStylesheet(["",
".button.off {font-weight:bold;border-color:#eee;background:#fff;color:#ccc;margin:0px;font-size:110%}",
".button.on {font-weight:bold;border-color:#444;background:#888;color:#fff;margin:0px;font-size:110%}",
".button.tiny { font-size:75%; }",
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




