
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
			var tagExpr = getParam(parsedParams,"tags");
			var sortBy = getParam(parsedParams,"sort","title");
			var groupBy = getParam(parsedParams,"group","");
			var viewType = getParam(parsedParams,"view","plain");
			var gViewType = getParam(parsedParams,"gView","plain");
			var listTitle = getParam(parsedParams,"title","List");
			var ignoreRealm = getParam(parsedParams, "ignoreRealm","no");
			var mode = getParam(parsedParams,"local");

			if (!startTag)
				if (mode != "global")
					startTag = tiddler.title;

			var listDiv = createTiddlyElement(place,"div",null,"mList");

			//var listTitleSpan = createTiddlyElement(listDiv,"span",null,"mListTitle");
			//createTiddlyText(listTitleSpan,listTitle);

			// come get some... EYE CANDY!
			var niceGradient = '<html><div class="mListTitle" macro="gradient vert #f1f1f1 #efefef #eeeeee #ececec #eaeaea #e7e7e7 #e4e4e4 #e1e1e1 #cccccc #cccccc #cccccc #cccccc #cccccc #cccccc #c8c8c8 #c0c0c0 #b4b4b4 #a4a4a4">%0</div></html>';
			wikify(niceGradient.format([listTitle]),listDiv);

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
			listRefreshContainer.setAttribute("viewType",viewType);
			listRefreshContainer.setAttribute("gViewType",gViewType);
			listRefreshContainer.setAttribute("ignoreRealm",ignoreRealm);

			this.refresh(listRefreshContainer);

		},

		refresh: function(place) {
			var startTag = place.getAttribute("startTag");
			var tagExpr = place.getAttribute("tagExpr");
			var sortBy = place.getAttribute("sortBy");
			var groupBy = place.getAttribute("groupBy");
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
				for (var heading in groupLists) {
					markup += this.renderTiddler[gViewType](store.getTiddler(heading),true);
					markup += groupLists[heading];
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
					//"@@font-size:90%;"+
					"<<toggleTag Done [["+t.title+"]] ->>"+
					"<<tTag tag:Next mode:text text:{{config.mGTD.next}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Waiting For]] mode:text text:{{config.mGTD.wait}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[["+t.title+"]]>> "+
					//"@@"+
					"[["+t.title+"]] "+
					projText +
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

			// this realm stuff sucks a lot..
			// please rewrite
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
