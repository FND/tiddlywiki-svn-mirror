
// requires MgtdIndexedTags for the fastTagged and getByIndex methods
// TODO make these usable without MgtdIndexedTags if it doesn't exist

merge(Tiddler.prototype,{


	addTag: function(tag) {
		store.setTiddlerTag(this.title,true,tag);
	},

	removeTag: function(tag) {
		store.setTiddlerTag(this.title,false,tag);
	},

	setTagFromGroup: function(tagGroup,tag) {
		var tagList = fastTagged(tagGroup);

		// it goes slow if you don't do this
		store.suspendNotifications();

		// remove all the tags in the group
		for (var i=0;i<tagList.length;i++)
			this.removeTag(tagList[i].title);

		// add the one selected
		if (tag)
			this.addTag(tag);

		// touch the modified date so we can sort usefully
		this.modified = new Date();

		// resume notification and notify
		store.resumeNotifications();
		store.notify(this.title,true);
	},

	toggleTag: function(tag) {
		store.setTiddlerTag(this.title,!this.hasTag(tag),tag);
		// touch the modified date
		this.modified = new Date();
	},

	hasTag: function(tag) {
		return this.tags.contains(tag);
	},

	getParent: function(tag) {
		return this.getByIndex(tag);
	},

	realmMismatchWithParent: function(tag) {
		var myRealm = this.getParent('Realm')[0];

		if (!myRealm)
			return true; // no realm, should be fixed..

		var myParent = this.getParent(tag)[0];
		if (!myParent)
			return false; // nothing to be mismatched with

		var parentTiddler = store.fetchTiddler(this.getParent(tag)[0]);
		if (!parentTiddler)
			return true; // doubt it would ever happen but...

		parentRealm = parentTiddler.getParent('Realm')[0]; // we assume one realm only...
		if (!parentRealm)
			return true;

		return parentRealm != myRealm;
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
			var labelOff = store.getTiddlerSlice(t.title,"buttonOff");

			// dreadful hack
			if (tag == "Starred")
				label = "\u2605";

			var autoClass = "button " + t.title.replace(/[\/ ]/g,'') 

			if (!label) label = t.title;
			if (!labelOff) labelOff = label;


			var curState = actOnTiddler.hasTag(tag);

			var cl = createTiddlyButton(place, curState?label:labelOff, t.title, function(e) {
					actOnTiddler.toggleTag(tag);
					return false;
				},
				autoClass + " " + (curState ? "on" : "off")
				);
		}
		
	},

	groupOfSingleToggleTags: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var pp = paramString.parseParams("tag",null,true);

			var useCheckbox = getParam(pp,"useCheckbox","");
			
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

				if (!label)
					label = t.title;

				if (useCheckbox == "yes") {
					// checkbox style toggle tags
					wikify("<<toggleTag [["+t.title+"]] [["+tiddler.title+"]] ->>[["+label+"]]&nbsp;" ,place,null,tiddler);
				}
				else {
					// button style toggle tags
					var cl = createTiddlyButton(place, label, t.title, function(e) {
							actOnTiddler.toggleTag(t.title);
							if (refresh == "page")
								refreshPageTemplate();
							return false;
						},
						autoClass + " " + (actOnTiddler.getByIndex(tag).contains(t.title) ? "on" : "off")
						);
			 	}
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
			var longVersion = getParam(pp,"longVersion");

			var title = getParam(pp,"title",tiddler.title);
			var actOnTiddler = store.getTiddler(title);

			var getValues = fastTagged(tag).sort(function(a,b){
				return a.sorterUtil(b,"orderSlice");
			});


			getValues.each(function(t) {
				var label = store.getTiddlerSlice(t.title,longVersion?"buttonLong":"button");

				var extraClass = store.getTiddlerSlice(t.title,"buttonClass");
				var autoClass = (extraClass ? extraClass : "") + " button " + t.title.replace(/[\/ ]/g,'') 
				if (!label) label = t.title;
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
	},

	// these don't really belong here but never mind..
	convertToFromTickler: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			if (tiddler.tags.contains('Tickler')) {

				createTiddlyButton(place, "make action", "make this tickler into a next action", function(e) {
						tiddler.removeTag("Tickler");                      
						tiddler.addTag("Action");                      
						tiddler.removeTag("Done");                     
						tiddler.setTagFromGroup("ActionStatus","Next"); 
						return false;
					});

				createTiddlyButton(place, "make project", "make this tickler into an active project", function(e) {
						tiddler.removeTag("Tickler");                      
						tiddler.addTag("Project");                       
						tiddler.removeTag("Complete");                   
						tiddler.setTagFromGroup("ProjectStatus",'Active');
						return false;
					});
			}
			if (tiddler.tags.containsAny(['Action','Project'])) {
				createTiddlyButton(place, "make tickler", "make this item into a tickler", function(e) {
						tiddler.removeTag("Action");
						tiddler.removeTag("Project");
						tiddler.addTag("Tickler");                          
						tiddler.addTag("Once");                          
						return false;
					});
			}
		}
	},

	convertActionToSubProj: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			if (tiddler.tags.contains('Action')) {

				createTiddlyButton(place, "make subj project", "make this action into a sub project", function(e) {
						tiddler.removeTag("Action");                      
						tiddler.removeTag("Next");                     
						tiddler.removeTag("Future");                     
						tiddler.removeTag("Waiting For");                     
						tiddler.removeTag("Done");                     
						tiddler.addTag("Project");                      
						tiddler.addTag("Active");                      
						return false;
					});

			}
		}
	},


	linkToParent: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			var label = params[1] ? params[1] : '>>';
			var useTiddler = params[2] ? store.fetchTiddler(params[2]) : tiddler;
			var links = useTiddler.getByIndex(params[0]);
			var output = "";
			for (var i=0;i<links.length;i++)
				output += ( (i==0?'':' ') + "[[%1|%0]]".format([links[i], label == 'title' ? '['+links[i]+']' : label]) );
			if (output != "")
				wikify(output,place,null,useTiddler);
		}
	}

});

setStylesheet(["",
".button.off {font-weight:bold;border-color:#eee;background:#fff;color:#ccc;margin:0px;font-size:100%}",
".button.on {font-weight:bold;border-color:#444;background:#888;color:#fff;margin:0px;font-size:100%}",
".button.tiny { font-size:75%; }",
// TODO move this css elsewhere
"#realmSelector .button.off {margin:0 0.5em;padding:0 1em;border:2px solid #aaa;background:#eee;color:#333;}", // actually reversed, ie off is "on"
"#realmSelector .button.on {margin:0 0.5em;padding:0 1em;border:2px solid #999;background:#999;color:#ccc;}", // actually reversed, ie off is "on"

// TODO put into styles instead of here?
// actions
".viewer .Next.button.on {border-color:#55c;background:#cfa;color:#4a4;}",
".viewer .WaitingFor.button.on {border-color:#b84;background:#fdb;color:#b84;}",
".viewer .Future.button.on {border-color:#48b;background:#bdf;color:#48b;}",

// projects
".viewer .Active.button.on {border-color:#55c;background:#cfa;color:#4a4;}",
".viewer .SomedayMaybe.button.on {border-color:#48b;background:#bdf;color:#48b;}",

// ticklers
".viewer .Enabled.button.on {border-color:#55c;background:#cfa;color:#4a4;}",
".viewer .Disabled.button.on {border-color:#b84;background:#fdb;color:#b84;}",

".viewer .Starred.button {padding:0;font-size:100%;}",
".viewer .Starred.button.on {border-color:#fff;background:#fff;color:#f80;}",
".viewer .Starred.button.off {border-color:#fff;background:#fff;color:#ddd;}",

""].join("\n"),"tTag");

//}}}




