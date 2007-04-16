
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
			var startTag = getParam(parsedParams,"startTag","");

			// eg, "Next && !Done"
			var tagExpr = getParam(parsedParams,"tags","");

			// additional filter. gets eval'ed
			var whereExpr = getParam(parsedParams,"where","true");

			// sort by expression
			var sortBy = getParam(parsedParams,"sort","title");

			// group by another tag
			var groupBy = getParam(parsedParams,"group","");

			// tag expression to apply to the group by headings 
			// to only show ones we want to see
			var gTagExpr = getParam(parsedParams,"gTags","");
			
			// if there are tiddlers who aren't grouped then give them this title
			// mainly used to label future actions...
			var gLeftoverTitle = getParam(parsedParams,"leftoverTitle","(No "+groupBy+")");

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
			var tagMode = getParam(parsedParams,"mode","local");

			// extra class for the list in case you need it
			var className = getParam(parsedParams,"class","");

			// only relevant when using group
			var showEmpty = getParam(parsedParams,"showEmpty","no");  

			// only relevant when using group
			var showLeftOvers = getParam(parsedParams,"showLeftOvers","yes");  

			// only relevant when using group
			var onlyShowLeftOvers = getParam(parsedParams,"onlyShowLeftovers","no");  

			// only relevant using group
			var onlyShowEmpty = getParam(parsedParams,"onlyShowEmpty","no"); 

			if (startTag == "")
				if (tagMode != "global")
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
			listRefreshContainer.setAttribute("tagMode",tagMode);
			listRefreshContainer.setAttribute("tagExpr",tagExpr);
			listRefreshContainer.setAttribute("whereExpr",whereExpr);
			listRefreshContainer.setAttribute("sortBy",sortBy);
			listRefreshContainer.setAttribute("groupBy",groupBy);
			listRefreshContainer.setAttribute("gLeftoverTitle",gLeftoverTitle);
			listRefreshContainer.setAttribute("gTagExpr",gTagExpr);
			listRefreshContainer.setAttribute("viewType",viewType);
			listRefreshContainer.setAttribute("gViewType",gViewType);
			listRefreshContainer.setAttribute("ignoreRealm",ignoreRealm);
			listRefreshContainer.setAttribute("showEmpty",showEmpty);
			listRefreshContainer.setAttribute("showLeftOvers",showLeftOvers);
			listRefreshContainer.setAttribute("onlyShowLeftOvers",onlyShowLeftOvers);
			listRefreshContainer.setAttribute("onlyShowEmpty",onlyShowEmpty);

			this.refresh(listRefreshContainer);

		},

		refresh: function(place) {
			var startTag = place.getAttribute("startTag");
			var tagExpr = place.getAttribute("tagExpr");
			var whereExpr = place.getAttribute("whereExpr");
			var sortBy = place.getAttribute("sortBy");
			var groupBy = place.getAttribute("groupBy");
			var gLeftoverTitle = place.getAttribute("gLeftoverTitle");
			var gTagExpr = place.getAttribute("gTagExpr");
			var viewType = place.getAttribute("viewType");
			var gViewType = place.getAttribute("gViewType");
			var ignoreRealm = place.getAttribute("ignoreRealm");
			var showLeftOvers = place.getAttribute("showLeftOvers");
			var onlyShowLeftOvers = place.getAttribute("onlyShowLeftOvers");

			var list = this.tagList(startTag,tagExpr,whereExpr,sortBy,ignoreRealm=="yes");
			var markup = "";

			if (groupBy != "") {
				// grouping
				var groupLists = {};
				var leftOvers = "";
				for (var i=0;i<list.length;i++) {
					var groupIn = list[i].fastGet(groupBy);
					if (groupIn.length > 0) {
						for (var j=0;j<groupIn.length;j++) {
							if (!groupLists[groupIn[j]])
								groupLists[groupIn[j]] = "";
							groupLists[groupIn[j]] += this.renderTiddler[viewType](list[i],false);
						}
					}
					else {
						leftOvers += this.renderTiddler[viewType](list[i],false);
					}
				}

				
				var allHeadings = [];
				for (var hh in groupLists) allHeadings.push(hh);
				allHeadings.sort(); // maybe should sort by sortBy

				var firstError = true;

				for (var i=0;i<allHeadings.length;i++) { 

					var heading = allHeadings[i];
					
					var gExpr = gTagExpr.parseTagExpr();
					var tiddler = store.getTiddler(heading);

					var gTest = true;
					try {
						gTest = eval(gExpr);
					}
					catch (e) {
						alert("error parsing group expr: "+gExpr+" for "+heading);
						firstError = false;
					}

					if (gTest) {
						markup += this.renderTiddler[gViewType](tiddler,true,heading);
						markup += groupLists[heading];
					}

				} // end of headings for each

				// now show leftovers
				// plain works even if tiddler is null
				// TODO should all renderTiddler methods handle null?
				if (leftOvers != "" && showLeftOvers == "yes") {
					markup += this.renderTiddler['plain'](null,true,gLeftoverTitle);
					markup += leftOvers;
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

			action_proj: function(t,isHeading,hideProject) {
				// temp for backwards compat
				return this.action(t,isHeading,hideProject);
			},

			action: function(t,isHeading,hideProject,noButtons) {

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
					(noButtons?"":
					"<<tTag tag:Next mode:text text:{{config.mGTD.next}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Waiting For]] mode:text text:{{config.mGTD.wait}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[["+t.title+"]]>> "
					)+
					"@@"+
					"[["+t.title+"]] "+
					projText +
					"}}}\n";
			},

			actionHideProject: function(t,isHeading) {
				return this.action(t,isHeading,true);
			},

			actionPlain: function(t,isHeading) {
				return this.action(t,isHeading,true,true);
			},

			plain: function(t,isHeading,heading) {
				if (t) 
					var useThis = t.title;	
				else 
					var useThis = heading;
				if (isHeading)
					return "!![["+useThis+"]]\n";
				else
					return "*[["+useThis+"]]\n";
			},

			starred: function(t,isHeading,heading) {
				var useClass = "action2";
				if (isHeading)
					useClass = "action";

				if (t) 
					var useThis = t.title;	
				else 
					var useThis = heading;
				return "{{"+useClass+"{"+
					"@@font-size:80%;<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[["+t.title+"]]>>@@ "+
					"[["+useThis+"]]}}}\n";
			},

			project: function(t,isHeading) {

				// has to be generic class for headings not "action"
				var useClass = "action2";
				if (isHeading)
					useClass = "action";

				if (isHeading)
					return "!!"+
					"[["+t.title+"]] "+
					"@@font-size:75%;"+
					"<<tTag tag:Complete title:[["+t.title+"]] label:''>>"+
					"<<tTag tag:Someday/Maybe mode:text text:{{config.mGTD.someday}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[["+t.title+"]]>> "+
					"@@"+
					"\n";
				else
					return "{{"+useClass+"{"+
					"@@font-size:95%;"+
					"<<tTag tag:Complete title:[["+t.title+"]] label:''>>"+
					"<<tTag tag:Someday/Maybe mode:text text:{{config.mGTD.someday}} title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[["+t.title+"]]>> "+
					"@@"+
					"[["+t.title+"]] "+
					"}}}\n";
			},

			tickler: function(t) {
				var foo = ""+
					'|<<tTag tag:Processed title:[['+t.title+']] label:"">>|[['+t.title+']]'+
					'|'+
					((store.getValue('MonkeyGTDSettings','mgtd.usemdy')=='true')?
						(t.mGet('tmonth')+'/'+t.mGet('tday')):
						(t.mGet('tday')+'/'+t.mGet('tmonth')))+
					'/'+t.mGet('tyear')+'|\n';
				return foo;
			}

		},

		tagList: function(startTag,tagExpr,whereExpr,sortBy,ignoreRealm) {

			var output = [];

			var desc = false;
			if (sortBy.substr(0,1) == '-') {
				desc = true;
				sortBy.replace(/^-/,'');
			}

			if (startTag && startTag != "")
				var startList = config.indexedTags.tagLists[startTag];
			else
				// returns all tiddlers. refactor please
				var startList = store.reverseLookup("modifier","a8ajkadf8adjasdfljkasdf8879",false).map(function(t) { return t.title; });

			if (!startList || startList.length == 0)
			  return output;

			if (tagExpr != "") {
				var expr = tagExpr.parseTagExpr();
			}
			else {
				var expr = 'true';
			}

			if (whereExpr && whereExpr != "") {
				expr = "(("+expr+")&&("+whereExpr+"))"
			}

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
