/***


***/
//{{{

config.mGTD = {

	star: "\u2605", // "black star"
  // star: "\u22C6", // "star operator" - alternative to black star
	// star: "*", // use in case the above doesn't work on your system
	
	config: {}, // gets populated by populateLists

	tiddlerViews: {
		phoneList:
			"'|[['+this.title+']]"+
			"|'+config.mGTD.undefBlank(store.getTiddlerSlice(this.title,'phone'))+'"+
			"|\\n'",
		tickler:
			"'|<<toggleTag Processed [['+this.title+']] ->>|[['+this.title+']]"+
			"|'+"+
			"((store.getValue('MonkeyGTDSettings','mgtd.usemdy')=='true')"+
			"?(this.mGet('tmonth')+'/'+this.mGet('tday'))"+
			":(this.mGet('tday')+'/'+this.mGet('tmonth')))"+
			"+'/'+this.mGet('tyear')+'|\\n'",
		// TODO ffs use classes for these
		groupBy1:
			"'{{groupBy{[['+this.title+']] }}}\\n'",
		project1:
			"'{{groupBy{[['+this.title+']] @@font-size:80%;"+
			"<<tTag tag:Starred mode:text text:{{config.mGTD.star}} title:[['+this.title+']]>>"+
			"<<toggleTag Complete [['+this.title+']] ->>"+
			"<<tTag tag:Someday/Maybe mode:text text:S/M title:[['+this.title+']]>>@@ }}} \\n'",
		project2:
		  "'{{starthing{"+
			"@@font-size:80%;"+
			"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[['+this.title+']]>>"+
			" @@"+
			"<<toggleTag Complete [['+this.title+']] ->>"+
			"<<tTag tag:Someday/Maybe mode:text text:S/M title:[['+this.title+']]>>'"+
			"[['+this.title+']] }}}\\n'",
		showstar:
		    "'{{starthing{"+
			"@@font-size:80%;"+
			"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[['+this.title+']]>>"+
			" @@"+
			"[['+this.title+']] }}}\\n'",
		showstar2:
		    "'{{starthing{"+
			"@@font-size:80%;margin-left:2em;"+
			"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[['+this.title+']]>>"+
			" @@"+
			"[['+this.title+']] }}}\\n'",
		action:
			"'{{action{"+
			"@@font-size:80%;"+
			"<<toggleTag Done [['+this.title+']] ->>"+
			"<<tTag tag:Next mode:text text:N title:[['+this.title+']]>>"+
			"<<tTag tag:[[Waiting For]] mode:text text:W title:[['+this.title+']]>>"+
			"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[['+this.title+']]>>"+
			" @@"+
			"[['+this.title+']] "+
			"}}}\\n'",
		action2:
			"'{{action2{"+
			"@@font-size:80%;"+
			"<<toggleTag Done [['+this.title+']] ->>"+
			"<<tTag tag:Next mode:text text:N title:[['+this.title+']]>>"+
			"<<tTag tag:[[Waiting For]] mode:text text:W title:[['+this.title+']]>>"+
			"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[['+this.title+']]>>"+
			" @@"+
			"[['+this.title+']] "+
			"}}}\\n'",
		action_proj:
			"'{{action{"+
			"@@font-size:80%;"+
			"<<toggleTag Done [['+this.title+']] ->>"+
			"<<tTag tag:Next mode:text text:N title:[['+this.title+']]>>"+
			"<<tTag tag:[[Waiting For]] mode:text text:W title:[['+this.title+']]>>"+
			"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[['+this.title+']]>>"+
			" @@"+
			"[['+this.title+']] "+
			"'+this.getProjectTextForList()+'"+
			"}}}\\n'",
		action_proj2:
			"'{{action2{"+
			"@@font-size:80%;"+
			"<<toggleTag Done [['+this.title+']] ->>"+
			"<<tTag tag:Next mode:text text:N title:[['+this.title+']]>>"+
			"<<tTag tag:[[Waiting For]] mode:text text:W title:[['+this.title+']]>>"+
			"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[['+this.title+']]>>"+
			" @@"+
			"[['+this.title+']] "+
			"'+this.getProjectTextForList()+'"+
			"}}}\\n'",
		action_plain:
			"'{{action{"+
			"@@font-size:80%;"+
			"<<toggleTag Done [['+this.title+']] ->>"+
			" @@"+
			"[['+this.title+']] "+
			"}}}\\n'",
		action_plain2:
			"'{{action2{"+
			"@@font-size:80%;"+
			"<<toggleTag Done [['+this.title+']] ->>"+
			" @@"+
			"[['+this.title+']] "+
			"}}}\\n'"

	},

	getListByTag: function(tag) {
		return store.getTaggedTiddlers(tag).map( function(t) { return t.title; } );
	},

	populateLists: function() {

		// the meta list
		this.config.GTDComponent = this.getListByTag("GTDComponent");

		for (var i=0;i<this.config.GTDComponent.length;i++) {
			this.config[this.config.GTDComponent[i]] = this.getListByTag(this.config.GTDComponent[i]);
		}

	},

	undefBlank: function(value) {
		return value ? value.toString() : "";
	},

	commands: {
		refresh: {
			text: 'refresh',
			tooltip: 'Refresh this tiddler',
			handler: function(e,src,title) {
				clearMessage();
				if (config.mGTD.populateLists)
					config.mGTD.populateLists();
				story.refreshTiddler(title,null,true);
				return false;			
			}
		}
	},

	macros: {

		realmSelector: {
			handler: function(place,macroName,params,wikifier,paramString,tiddler) {
				var markup = "Show realms: ";
				for (var i=0;i<config.mGTD.config.Realm.length;i++) {
					markup += '<<tField title:MonkeyGTDSettings tag:[[hide'+
						config.mGTD.config.Realm[i] + 
						']] mode:text text:[['+
						config.mGTD.config.Realm[i] +
						']] refreshAll:yes>>';
				}
				wikify(markup,place,null,tiddler);
			}
		},

		listByTag: {
			handler: function(place,macroName,params,wikifier,paramString,tiddler) {
				var parsedParams = paramString.parseParams("tags",null,true);
				var tagExpr = getParam(parsedParams,"tags","true");
				var whereExpr = getParam(parsedParams,"where","true");
				var groupBy = getParam(parsedParams,"group");
				var mode = getParam(parsedParams,"mode","local");
				var title = getParam(parsedParams,"title","local");
				var sortBy = getParam(parsedParams,"sort","title");
				var limit = getParam(parsedParams,"limit");
				var className = getParam(parsedParams,"class","");
				var viewType = getParam(parsedParams,"view");
				var gViewType = getParam(parsedParams,"gView");
				var ignoreRealm = getParam(parsedParams,"ignoreRealm","no");
				var showEmpty = getParam(parsedParams,"showEmpty","no");  // only relevant when using group
				var onlyShowEmpty = getParam(parsedParams,"onlyShowEmpty","no"); // only relevant using group

				if (!gViewType)
					gViewType = "groupBy";

				if (mode != "global")
					tagExpr = '( '+tagExpr+' ) && ( [[' + tiddler.title + ']] )';

				if (ignoreRealm != "yes") {

					for (var i=0;i<config.mGTD.config.Realm.length;i++) {
						if (mHideRealm(config.mGTD.config.Realm[i])) {
							tagExpr = '( '+tagExpr+' ) && ( ![[' + config.mGTD.config.Realm[i] + ']] )';
						}
					}
				}

				var markup = "{{mList "+className+"{\n";

				if (title)
					markup += "{{mListTitle{"+title+"}}}\n";
				
				if (groupBy) {
					markup += store.getByTagExpr(groupBy,sortBy).asList(1,viewType,gViewType,limit,tagExpr,showEmpty,onlyShowEmpty,sortBy);

					var catchLeftoversExpr = "( "+tagExpr+" ) && !parent:" + groupBy;
					var leftovers = store.getByTagExpr(catchLeftoversExpr,sortBy).asList(2,viewType,gViewType,limit);
					if (leftovers != "") {
						markup += "{{groupBy{''(No "+groupBy+")''}}}\n";
						markup += leftovers;
					}

				}
				else
					markup += store.getByTagExpr(tagExpr,sortBy,whereExpr).asList(1,viewType,gViewType,limit);

				markup += "}}}\n";
				wikify(markup,place,null,tiddler);			
			}
		},

		checkboxList: {
			handler: function(place,macroName,params,wikifier,paramString,tiddler) {
				var itemType = params[0];
				for (var i=0;i<config.mGTD.config[itemType].length;i++)
					wikify("<<toggleTag [["+config.mGTD.config[itemType][i]+"]]>>",place,null,tiddler);
			}
		},

		dropdownSelect: {
			handler: function(place,macroName,params,wikifier,paramString,tiddler) {

				var values = store.getByTagExpr(paramString);

				var selectFrom = [];
				var currentVal = "";
				selectFrom.push({name:"", caption:"(none)"});
				for (var i=0;i<values.length;i++) {
					if (tiddler.tags.contains(values[i].title))
						currentVal = values[i].title;	
					selectFrom.push({name:values[i].title, caption:values[i].title});
				}

				var onChangeHandler = function() {
					// this will be better when we use fields:
					store.setTiddlerTag(tiddler.title,false,currentVal);
					tiddler.mSet("project",null);
					if (this.value != "") {
						tiddler.mSet("project",this.value);
						store.setTiddlerTag(tiddler.title,true,this.value);
					}
					return true;
				};

				var selector = createTiddlyDropDown(place,onChangeHandler,selectFrom,currentVal);
				if (currentVal != "")
					wikify(" [[>>|"+currentVal+"]]",place);
			}
		},


		newHere: {
			handler: function(place,macroName,params,wikifier,paramString,tiddler) {
				wikify("<<newTiddler "+paramString+" tag:[["+tiddler.title+"]]>>",place,null,tiddler);
			}
		},

		newHereFields: {
			handler: function(place,macroName,params,wikifier,paramString,tiddler) {
				// needs some work here to derive parent type
				wikify("<<newTiddlerWithFields "+paramString+" tag:[["+tiddler.title+"]] mgtd.project:[["+tiddler.title+"]]>>",place,null,tiddler);
			}
		},

		processInbox: {
			handler: function(place,macroName,params,wikifier,paramString,tiddler) {

				var shortHand = {
					'W': 'Waiting For',
					'N': 'Next',
					'F': ''
				};

				// TODO move this help elsewhere...
				wikify(
					"Enter projects and actions here. Click 'create these items' to create them\n"+
					"Example usage:\n{{{\nPaint House|Home Maintenance\n"+
					".Buy ladder and brushes|Errands\n"+
					".Choose colours|Home|W\n"+
					"\n}}}\n"+
					"By default actions are next actions. "+
					"Specify W or F to make them future or Waiting For. You can create multiple projects.\nRealm:"
				,place);

				for (var i=0;i<config.mGTD.config.Realm.length;i++) {
					var r = config.mGTD.config.Realm[i];
					var foo = createTiddlyCheckbox(place,r,!mHideRealm(r),null);
					foo.id = "piRealm"+r.replace(/ /,'');
				}

				var pi = createTiddlyElement(place,"textarea",null,"piBox");
				
				wikify("\n",place);

				var a1 = createTiddlyCheckbox(place,"Open created projects",true,null);
				a1.id = 'piShowProjects';

				var a2 = createTiddlyCheckbox(place,"Open created actions",false,null);
				a2.id = 'piShowActions';

				wikify("\n\n",place);

				var btn = createTiddlyButton(place,"create these items","create these items",function(e) {
					var lines = pi.value.split("\n");
					var currentProject = "";
					var displayThese = [];

					for (var i=0;i<lines.length;i++) {
						//alert(lines[i]);
						var fields = lines[i].split(/[|;]/);

						if (!fields[0] || fields[0].trim() == "") {
							currentProject = "";
						}
						else {

							var title = fields.shift();
							//alert(title);

							// add the realm
							for (var j=0;j<config.mGTD.config.Realm.length;j++) {
								var theId = "piRealm"+config.mGTD.config.Realm[j].replace(/ /,'');
								if (document.getElementById(theId).checked)
									fields.push(config.mGTD.config.Realm[j]);
							}

							if (title[0] != '.') {
								//alert("project "+title);
								currentProject = title;

								if (document.getElementById('piShowProjects').checked)
									displayThese.push(title);

								fields.push("GTD"); // make it a GTD item
								fields.push("Project"); // make it a project
								if (store.tiddlerExists(title))
									alert("Warning: '"+title+"' already exists, did not create");
								else
									store.saveTiddler(
										title,title,
										"", // content
										config.options.txtUserName,
										new Date(),
										fields, // tags
										null // extra fields
									);
							}
							else {

								// default to next actions
								if (!fields.containsAny(['N','F','W']))
									fields.push('N');

								fields = fields.map(function(f) {
									if (shortHand[f] && shortHand[f] != '')
										return shortHand[f];
									else
										return f;
								});

								//alert("action "+title);
								title = title.trim();
								title = title.replace(/^\.+/,'');

								if (document.getElementById('piShowActions').checked)
									displayThese.push(title);

								fields.push("GTD"); // make it a GTD item
								fields.push("Action"); // make it an action 
								if (currentProject.trim() != "")
									fields.push(currentProject); // make it in this project

								if (store.tiddlerExists(title))
									alert("Warning: '"+title+" already exists, did not create");
								else
									store.saveTiddler(
										title,title,
										"", // content
										config.options.txtUserName,
										new Date(),
										fields, // tags
										null // extra fields
									);
							}
						}
					}

					for (var ii=0;ii<displayThese.length;ii++)
						story.displayTiddler("bottom",displayThese[ii]);

					alert("Done creating items");
					return false;
				}); // end of createTiddlyButton

			}
		},

		collectThoughts: {
			handler: function(place,macroName,params,wikifier,paramString,tiddler) {

				// TODO move this help elsewhere...
				wikify("Enter thoughts one per line. They will be added to your [[Inbox]]",place);
				wikify("\n",place);

				for (var i=0;i<config.mGTD.config.Realm.length;i++) {
					var r = config.mGTD.config.Realm[i];
					var foo = createTiddlyCheckbox(place,r,!mHideRealm(r),null);
					foo.id = "ctRealm"+r.replace(/ /,'');
				}

				wikify("\n",place);
				var ct = createTiddlyElement(place,"textarea",null,"ctBox");
				wikify("\n",place);
				
				var btn = createTiddlyButton(place,"add to inbox","add to inbox",function(e) {
					var lines = ct.value.split("\n");
					var currentProject = "";
					var displayThese = [];

					for (var i=0;i<lines.length;i++) {
						//alert(lines[i]);
						var fields = [lines[i]]; //.split(/[|;]/);

							var title = fields.shift();
							//alert(title);

							// add the realm
							for (var j=0;j<config.mGTD.config.Realm.length;j++) {
								var theId = "ctRealm"+config.mGTD.config.Realm[j].replace(/ /,'');
								if (document.getElementById(theId).checked)
									fields.push(config.mGTD.config.Realm[j]);
							}

							fields.push("GTD"); // make it a GTD item
							fields.push("Inbox"); // make it a project
							if (store.tiddlerExists(title))
								alert("Warning: '"+title+"' already exists, did not create");
							else
								store.saveTiddler(
									title,title,
									"", // content
									config.options.txtUserName,
									new Date(),
									fields, // tags
									null // extra fields
								);

						}

					alert("Done");
					return false;
				}); // end of createTiddlyButton

			}
		}

	},

/*
// I think this is obsolete now. See also NewTiddlerWithFieldsMacro.js which also we don't need for now?? 
	onClickNewTiddler: function() {
		var title = this.getAttribute("newTitle");
		var params = this.getAttribute("params").split("|");
		var focus = this.getAttribute("newFocus");
		var template = this.getAttribute("newTemplate");
		story.displayTiddler(null,title,template);
		var text = this.getAttribute("newText");
		if(typeof text == "string")
			story.getTiddlerField(title,"text").value = text.format([title]);
		for(var t=0;t<params.length;t++) {
			if (params[t].indexOf("=") != -1) {
				// it's a field, name=value. this is hacky and not good
				var nameValue = params[t].split("=");
				// alert(nameValue[0]);
				// alert(nameValue[1]);
				// damn this doesn't work because tiddler doesn't exist yet
				// store.setValue(title,nameValue[0],nameValue[1]);
			}
			else {
				// it's a normal tag
				story.setTiddlerTag(title,params[t],+1);
			}
		}
		story.focusTiddler(title,focus);
		return false;
			
	},
*/
	
	stringMethods: {
		parseTagExpr: function() {

			if (this.trim() == "")
				return "true";

			var spaced = this.
				replace(/\[\(/g," [["). // because square brackets in templates no good
				replace(/\)\]/g,"]] "). 
				replace(/(!|&&|\|\||\(|\))/g," $1 ");
			var tokens = spaced.readBracketedList(false); // false means not unique. thanks Jeremy!
			var expr = "";
			var logicOps = ['(',')','||','&&','!','true','false'];
			for (var i=0;i<tokens.length;i++) {
				if (logicOps.contains(tokens[i])) {
					expr += tokens[i];
				}
				else if (tokens[i].match(/^parent:/)) {
					var lookForTagInParent = tokens[i].split(":")[1];
					expr += "tiddler.parents().anyHasTag('"+lookForTagInParent+"')";
				}					
				else {
					expr += "tiddler.tags.contains('"+tokens[i].
							replace(/'/,"\\'") // fix single quote bug. hurrah
									// but how to fix round bracket bug?
						+"')";
				}
			}
			//alert(expr);
			return '('+expr+')';
		}
	},

	storeMethods: {
		getByTagExpr: function(tagExpr,sortBy,whereExpr) {
			var parsed = tagExpr.parseTagExpr();

			sortBy = sortBy ? sortBy : 'title';
			var desc = false;
			if (sortBy.substr(0,1) == '-') {
				desc = true;
				sortBy.replace(/^-/,'');
			}

			if (whereExpr) {
				parsed = "( "+parsed+" ) && ( "+whereExpr+" ) ";
			}


			var output = [];
			var first = true;
			this.forEachTiddler(function(title,tiddler) {
				//alert(tiddler.getRealm());
				try {
					if (eval(parsed))
						output.push(tiddler);
				}
				catch(e) {
					if (first) {
						alert("error parsing: "+parsed);
						first = false;
					}
				}
			});
			if (sortBy == "tickleDate") {
				output.sort(function(a,b) {
					return a.tickleDate() < b.tickleDate() ? -1 :
						(a.tickleDate() == b.tickleDate() ? 0 : +1);
				});
			}
			else {
				output.sort(function(a,b) {
					return a[sortBy] < b[sortBy] ? -1 :
						(a[sortBy] == b[sortBy] ? 0 : +1);
				});
			}

			if (desc)
				return output.reverse();
			else
				return output;
		}
	},

	arrayMethods: {
		map: function(func) {
			var result = [];
			for (var i=0;i<this.length;i++)
				result.push(func(this[i]));
			return result;
		},

		each: function(func) {
			for (var i=0;i<this.length;i++)
				func(this[i]);
		},

		asList: function(level, viewType, gViewType, limit, subExpr, showEmpty, onlyShowEmpty, sortBy, sortExpr) {
			var output = "";
			for (var i=0;(i<this.length && (!limit || i<limit));i++)
				if (!subExpr)
					output += this[i].mGTDrender(level,viewType);
				else {
					var newExpr = "( " + subExpr + " ) && ( [[" + this[i].title + "]] )";
					var sublist = store.getByTagExpr(newExpr,sortBy).asList(level+1, viewType, gViewType, limit);
					if (((sublist == "" && (showEmpty == "yes" || onlyShowEmpty == "yes"))) || ((sublist != "" && onlyShowEmpty != "yes")))	{
						output += this[i].mGTDrender(level,gViewType);
						output += sublist;
					}
				}
			return output;
		},

		anyHasTag: function(tagName) {
			for (var i=0;i<this.length;i++)
				if (this[i].tags.contains(tagName))
					return true;
			return false;
		}
	},

	tiddlerMethods: {
	
		getProjectTextForList: function() {
			var proj = this.getProject();
			if (proj == '')
				return '';
			return "@@font-size:80%;"+
				" [/%%/[[P|"+proj+"]]/%%/]"+
				"@@";
		},

		getProject: function() {
			//return this.getValueByTag('Project').join("/"); // maybe two projects??
			return this.getValueByGTDComponent('Project').join("/"); // maybe two projects??
		},
		
		getRealm: function() {
			// TODO why is different from getProject?
			// do some sneaky backwards/compat stuff for tags/fields
			
			// check for field
			//var fieldBasedRealm = this.mGet('realm');
			//if (fieldBasedRealm) {
			//	var realm = fieldBasedRealm.readBrackettedList(); // could be more than one
			//}
			//else {
				//var realm = this.getValueByTag('Realm'); // returns array
			//	this.mSet("realm",String.encodeTiddlyLinkList(realm));
			//}
			if (this.tags.contains("Professional")) return "Professional";
			if (this.tags.contains("Personal")) return "Personal";
			
			//return "asdf";//realm[0];
		},

		getValueByTag: function(value) {
			// this gets a lot better when we use fields also
			var values = store.getByTagExpr(value); // probably just getTaggedTiddlers would do here..?
			var result = [];
			for (var i=0;i<values.length;i++) {
				if (this.tags.contains(values[i].title)) {
					result.push(values[i].title);
				}
			}
			return result;
		},

		getValueByGTDComponent: function(itemType) {
			// faster than getValueByTag since we don't need to
			// do a "full table scan" of all tiddlers
			var values = config.mGTD.config[itemType];
			var result = [];
			for (var i=0;i<values.length;i++) {
				if (this.tags.contains(values[i])) {
					result.push(values[i]);
				}
			}
			return result;
		},

		hasValue: function(itemType,value) {
			var foo = this.getValueByGTDComponent(itemType);
			return foo.contains(value);
		},

		mGTDrender: function(level,viewType) {
			var output = "";
			if (viewType) {
				// alert(viewType + ": " + config.mGTD.tiddlerViews[viewType+level]);
				if (config.mGTD.tiddlerViews[viewType+level])
					return eval(config.mGTD.tiddlerViews[viewType+level]);
				else
					return eval(config.mGTD.tiddlerViews[viewType]);
			}
			else {
				for (var i=0; i<level; i++)
					output += "*";
				output += "[[%0]]\n".format([this.title]);
			}
			return output;
		},

		parents: function() {
			var output = [];
			for (var i=0;i<this.tags.length;i++) {
				var t = store.fetchTiddler(this.tags[i]);
				if (t)
					output.push(t);
			}
			return output;
		},

		mGet: function(field) {
			return store.getValue(this,"mgtd."+field);
		},

		mSet: function(field,value) {
			store.setValue(this,"mgtd."+field,value);
		},

		tickleDate: function() {
			var d = this.mGet("tday");
			var m = this.mGet("tmonth");
			var y = this.mGet("tyear");
			var result = "";
			if (d && m && y)
				result = y + String.zeroPad(parseInt(m,10),2) + String.zeroPad(parseInt(d,10),2) + '0000';
			return result;
		}
	},

	styles: [
	//	".mListTitle { font-weight:bold; }",
	//	".mList { border:solid 1px pink; }",
	//	".mList ul { margin-top:0px; padding-top:0px; }",
	""],

	coreFunctions: {

		// Extending this to put in a defaultValue
		createTiddlyDropDown: function(place,onchange,options,defaultValue) {
			var sel = createTiddlyElement(place,"select");
			sel.onchange = onchange;
			var foo = 0;
			for(var t=0; t<options.length; t++)
				{
				var e = createTiddlyElement(sel,"option",null,null,options[t].caption);
				if (options[t].name == defaultValue) foo = t;
				e.value = options[t].name;
			}
			sel.selectedIndex = foo;
			return sel;
		},

		// utility
		mOpt: function(setting) {
			return store.getValue("MonkeyGTDSettings","mgtd."+setting);
		},

		mHideRealm: function(realm) {
			return store.getValue("MonkeyGTDSettings","hide"+realm);
		},

		mDefaultRealm: function() {
			// for (var i=config.mGTD.config.Realm.length-1;i>=0;i--) {
			for (var i=0;i<config.mGTD.config.Realm.length;i++) {
				if (!mHideRealm(config.mGTD.config.Realm[i])) {
					// if both are on it returns last one
					// hack. because Work is after Personal??
					return config.mGTD.config.Realm[i];
				}
			}
			return config.mGTD.config.Realm[0]; // just in case
		}

	},
	dateMethods: {
		// just a bug fix in TW 2.1.3
		// temporary
		formatString: function(template) {
			var t = template.replace(/0hh12/g,String.zeroPad(this.getHours12(),2));
			t = t.replace(/hh12/g,this.getHours12());
			t = t.replace(/0hh/g,String.zeroPad(this.getHours(),2));
			t = t.replace(/hh/g,this.getHours());
			t = t.replace(/0ss/g,String.zeroPad(this.getSeconds(),2));
			t = t.replace(/ss/g,this.getSeconds());
			t = t.replace(/[ap]m/g,this.getAmPm().toLowerCase());
			t = t.replace(/[AP]M/g,this.getAmPm().toUpperCase());
			t = t.replace(/wYYYY/g,this.getYearForWeekNo());
			t = t.replace(/wYY/g,String.zeroPad(this.getYearForWeekNo()-2000,2));
			t = t.replace(/YYYY/g,this.getFullYear());
			t = t.replace(/YY/g,String.zeroPad(this.getFullYear()-2000,2));
			t = t.replace(/MMM/g,config.messages.dates.months[this.getMonth()]);
			t = t.replace(/mmm/g,config.messages.dates.shortMonths[this.getMonth()]);
			t = t.replace(/0MM/g,String.zeroPad(this.getMonth()+1,2));
			t = t.replace(/MM/g,this.getMonth()+1);
			t = t.replace(/0WW/g,String.zeroPad(this.getWeek(),2));
			t = t.replace(/WW/g,this.getWeek());
			t = t.replace(/DDD/g,config.messages.dates.days[this.getDay()]);
			t = t.replace(/ddd/g,config.messages.dates.shortDays[this.getDay()]);
			t = t.replace(/0DD/g,String.zeroPad(this.getDate(),2));
			t = t.replace(/DDth/g,this.getDate()+this.daySuffix());
			t = t.replace(/DD/g,this.getDate());

			t = t.replace(/0mm/g,String.zeroPad(this.getMinutes(),2));
			t = t.replace(/mm/g,this.getMinutes());

			return t;
		}
	},
	
	test: function() {
	},

	init: function() {

		merge(config.macros,this.macros);
		merge(config.commands,this.commands);

		merge(TiddlyWiki.prototype,this.storeMethods);
		merge(Tiddler.prototype,this.tiddlerMethods);
		merge(String.prototype,this.stringMethods);
		merge(Array.prototype,this.arrayMethods);
		merge(Date.prototype,this.dateMethods);
		merge(window,this.coreFunctions);


		//merge(config.shadowTiddlers,{MonkeyGTDStyles:this.styles.join("\n")});
		//store.addNotification("MonkeyGTDStyles",refreshStyles);

		// config.macros.newTiddler.onClickNewTiddler = this.onClickNewTiddler; // over-ride

		this.populateLists();
		
		this.test();
		
	}
};

config.mGTD.init();

//}}}

