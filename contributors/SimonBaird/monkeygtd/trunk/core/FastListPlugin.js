
// this must be used in conjunction with IndexedTagsPlugin

merge(Tiddler.prototype,{
	fastGet: function(what) {
		return config.indexedTags.indexes[this.title][what];
	}
});

merge(config.macros,{

	fastList: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var parsedParams = paramString.parseParams("tags",null,true);

			// startTag should make it faster
			// because we are starting with just a subset of tiddlers
			// not scanning every tiddler each time
			// will use the indexes from IndexedTagsPlugin
			var startTag = getParam(parsedParams,"startTag");

			// eg, "Next && !Done"
			var tagExpr = getParam(parsedParams,"tags");

			// additional filter. gets eval'ed
			var whereExpr = getParam(parsedParams,"where","true");

			// sort by expression
			var sortBy = getParam(parsedParams,"sort","title");

			// group by another tag
			var groupBy = getParam(parsedParams,"group","");

			// tag expression to apply to the group by headings 
			// to only show ones we want to see
			var gTagExpr = getParam(parsedParams,"gTags","");

			// defines how do we display each item in the list
			// see renderTiddler
			var viewType = getParam(parsedParams,"view","plain");

			// defines how we render the heading titles
			// see renderTiddler
			var gViewType = getParam(parsedParams,"gView","plain");

			// the title
			var listTitle = getParam(parsedParams,"title","");

			// if set to "yes" then we ignore the realm and show everthing
			var ignoreRealm = getParam(parsedParams, "ignoreRealm","no");

			// two modes, local means only things tagged with the current tiddler
			// use for project etc, and global means show everything
			var mode = getParam(parsedParams,"local");

			// extra class for the list in case you need it
			var className = getParam(parsedParams,"class","");

			// only relevant when using group
			var showEmpty = getParam(parsedParams,"showEmpty","no");  

			// only relevant using group
			var onlyShowEmpty = getParam(parsedParams,"onlyShowEmpty","no"); 

			if (!startTag)
				if (mode != "global")
					startTag = tiddler.title;

			var listDiv = createTiddlyElement(place,"div",null,"mList "+className);

			//var listTitleSpan = createTiddlyElement(listDiv,"span",null,"mListTitle");
			//createTiddlyText(listTitleSpan,listTitle);

			// come get some... EYE CANDY!

			if (listTitle != "") {
				var niceGradient = '<<gradient vert #f1f1f1 #efefef #eeeeee #ececec #eaeaea #e7e7e7 #e4e4e4 #e1e1e1 #cccccc #cccccc #cccccc #cccccc #cccccc #cccccc #c8c8c8 #c0c0c0 #b4b4b4 #a4a4a4>>{{mListTitle{%0}}}>>';
				wikify(niceGradient.format([listTitle]),listDiv);
			}

			var listRefreshContainer = createTiddlyElement(listDiv,"div");

			if (!mOpt("disableinstantrefresh")) {
					// this triggers the refresh on notify
					listRefreshContainer.setAttribute("refresh","macro");
					listRefreshContainer.setAttribute("macroName",macroName);
			}

			listRefreshContainer.setAttribute("startTag",startTag);
			listRefreshContainer.setAttribute("tagExpr",tagExpr);
			listRefreshContainer.setAttribute("sortBy",sortBy);
			listRefreshContainer.setAttribute("groupBy",groupBy);
			listRefreshContainer.setAttribute("gTagExpr",gTagExpr);
			listRefreshContainer.setAttribute("viewType",viewType);
			listRefreshContainer.setAttribute("gViewType",gViewType);
			listRefreshContainer.setAttribute("ignoreRealm",ignoreRealm);
			listRefreshContainer.setAttribute("showEmpty",showEmpty);
			listRefreshContainer.setAttribute("onlyShowEmpty",onlyShowEmpty);

			this.refresh(listRefreshContainer);

		},

		refresh: function(place) {
			var startTag = place.getAttribute("startTag");
			var tagExpr = place.getAttribute("tagExpr");
			var sortBy = place.getAttribute("sortBy");
			var groupBy = place.getAttribute("groupBy");
			var gTagExpr = place.getAttribute("gTagExpr");
			var viewType = place.getAttribute("viewType");
			var gViewType = place.getAttribute("gViewType");
			var ignoreRealm = place.getAttribute("ignoreRealm");

			var list = this.tagList(startTag,tagExpr,sortBy,ignoreRealm=="yes");
			var markup = "";

			if (groupBy != "") {
				// grouping
				var groupLists = {};
				for (var i=0;i<list.length;i++) {
					var groupIn = list[i].fastGet(groupBy);
					for (var j=0;j<groupIn.length;j++) {
						if (!groupLists[groupIn[j]])
							groupLists[groupIn[j]] = "";
						groupLists[groupIn[j]] += this.renderTiddler[viewType](list[i],false);
					}
				}

				var firstError = true;

				for (var heading in groupLists) {
					
					var tExpr = gTagExpr.parseTagExpr();
					var tiddler = store.getTiddler(heading);

					try {
						if (eval(tExpr)) {
							markup += this.renderTiddler[gViewType](tiddler,true);
							markup += groupLists[heading];
						}
					}
					catch (e) {
						if (firstError) {
							alert("error parsing: "+expr);
							firstError = false;
						}
					}

				}
			}
			else {
				// straight list no grouping
				for (var i=0;i<list.length;i++) {
					markup += this.renderTiddler[viewType](list[i],true);
				}
			}
			removeChildren(place);
			wikify(markup,place,null,tiddler);
		},

		renderTiddler: {

			action: function(t,isHeading,hideProject) {

				// has to be generic class for headings not "action"
				var useClass = "action2";
				if (isHeading)
					useClass = "action";

				var projText = "";
				if (!hideProject) {
					var p = t.fastGet("Project");
					if (p)
						projText = "[/%%/[[P|"+p+"]]/%%/]";
				}

				return "{{"+useClass+"{"+
					"@@font-size:95%;"+
					"<<tTag tag:Done title:[["+t.title+"]] label:''>>"+
					"<<tTag tag:Next mode:text text:{{config.mGTD.next}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Waiting For]] mode:text text:{{config.mGTD.wait}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[["+t.title+"]]>> "+
					"@@"+
					"[["+t.title+"]] "+
					projText +
					"}}}\n";
			},

			project: function(t,isHeading) {
				// has to be generic class for headings not "action"
				var useClass = "action2";
				if (isHeading)
					useClass = "action";

				return "{{"+useClass+"{"+
					"@@font-size:95%;"+
					"<<tTag tag:Complete title:[["+t.title+"]] label:''>>"+
					"<<tTag tag:Someday/Maybe mode:text text:{{config.mGTD.someday}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[["+t.title+"]]>> "+
					"@@"+
					"[["+t.title+"]] "+
					"}}}\n";
			},

			actionHideProject: function(t,isHeading) {
				return this.action(t,isHeading,true);
			},

			plain: function(t,isHeading) {
				if (isHeading)
					return "!![["+t.title+"]]\n";
				else
					return "*[["+t.title+"]]\n";
			},

			project: function(t,isHeading) {

				// has to be generic class for headings not "action"
				var useClass = "action2";
				if (isHeading)
					useClass = "action";

				return "{{"+useClass+"{"+
					"@@font-size:95%;"+
					"<<tTag tag:Complete title:[["+t.title+"]] label:''>>"+
					"<<tTag tag:Someday/Maybe mode:text text:{{config.mGTD.someday}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[["+t.title+"]]>> "+
					"@@"+
					"[["+t.title+"]] "+
					"}}}\n";
			},

			project: function(t) {
				return ""+
					'|<<toggleTag Processed [['+t.title+']] ->>|[['+t.title+']]'+
					'|<<toggleTag Processed [['+t.title+']] ->>|[['+t.title+']]'+
					'|'+
					((store.getValue('MonkeyGTDSettings','mgtd.usemdy')=='true')?
						(t.mGet('tmonth')+'/'+t.mGet('tday')):
						(t.mGet('tday')+'/'+t.mGet('tmonth')))+
					'/'+t.mGet('tyear')+'|\\n';
			}

		},

		tagList: function(startTag,tagExpr,sortBy,ignoreRealm) {

			var output = [];

			var desc = false;
			if (sortBy.substr(0,1) == '-') {
				desc = true;
				sortBy.replace(/^-/,'');
			}

			var startList = config.indexedTags.tagLists[startTag];

			if (!startList)
			  return output;

			var expr = tagExpr.parseTagExpr();

			var firstError = true;

			// this realm stuff could probably be done better
			// but at least it works
			for (var i=0;i<startList.length;i++) {
				var tiddler = store.fetchTiddler(startList[i]);
				var test = false;
				try {
					test = eval(expr);
				}
				catch(e) {
					if (firstError) {
						alert("error parsing: "+expr);
						firstError = false;
					}
				}
				if (test) {
					if (ignoreRealm) {
						output.push(tiddler);
					}
					else {
						if (!config.indexedTags.indexes[tiddler.title]["Realm"] || config.indexedTags.indexes[tiddler.title]["Realm"].length == 0) {
							// not in a realm
							output.push(tiddler);
						}
						else {
							// has a realm
							var showIt = false;
							config.indexedTags.tagLists.Realm.each(function(r) {
								if (!mHideRealm(r))
									if (config.indexedTags.indexes[tiddler.title]["Realm"].contains(r))
										showIt = true;
							});
							if (showIt)
								output.push(tiddler);
						}
					}
				}
			}

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

			return output;
		}
	}
});
