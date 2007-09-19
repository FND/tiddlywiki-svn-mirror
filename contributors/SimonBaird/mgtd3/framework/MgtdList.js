
merge(config.macros,{

	mgtdList: {

		handler: function (place,macroName,params,wikifier,paramString,tiddler) {
			var pp = paramString.parseParams("tags",null,true);

			// title of the list
			var title = getParam(pp,"title","local");

			// local means only look at tiddlers tagged with this tiddler
			// global means look at every tiddler
			var tagMode = getParam(pp,"mode","local");

			// optional. ignored unless mode global. specify for speed gains
			var startTag = getParam(pp,"startTag");

			// eg, "Next && !Done"
			var tagExpr = getParam(pp,"tags","");

			// additional filter. gets eval'ed
			var whereExpr = getParam(pp,"where","");

			// group by another tag
			var groupBy = getParam(pp,"group","");

			// filter the groups by tag expr
			var gTagExpr = getParam(pp,"gTag","");

			// or eval'ed expression
			var gWhereExpr = getParam(pp,"gWhere","");

			// how to render list items
			var viewType = getParam(pp,"view","plain");

			// how to render headings
			var gViewType = getParam(pp,"gView",groupBy);

			// if there are tiddlers who aren't grouped then give them this title
			// mainly used to label future actions...
			var leftoverTitle = getParam(pp,"leftoverTitle","No "+groupBy);

			// if set to "yes" then we ignore the realm and show everthing
			var ignoreRealm = getParam(pp, "ignoreRealm","");

			// sort items
			var sortBy = getParam(pp,"sort","title");

			// sort groups
			var gSortBy = getParam(pp,"gSort","title");

			if (!startTag)
				if (tagMode != "global")
					startTag = tiddler.title;

			var listRefreshContainer = createTiddlyElement(place,"div");

			listRefreshContainer.setAttribute("refresh","macro");
			listRefreshContainer.setAttribute("macroName",macroName);

			listRefreshContainer.setAttribute("title",title);
			listRefreshContainer.setAttribute("startTag",startTag);
			listRefreshContainer.setAttribute("tagMode",tagMode);
			listRefreshContainer.setAttribute("tagExpr",tagExpr);
			listRefreshContainer.setAttribute("groupBy",groupBy);
			listRefreshContainer.setAttribute("gTagExpr",gTagExpr);
			listRefreshContainer.setAttribute("whereExpr",whereExpr);
			listRefreshContainer.setAttribute("gWhereExpr",gWhereExpr);
			listRefreshContainer.setAttribute("sortBy",sortBy);
			listRefreshContainer.setAttribute("gSortBy",gSortBy);
			listRefreshContainer.setAttribute("viewType",viewType);
			listRefreshContainer.setAttribute("gViewType",gViewType);
			listRefreshContainer.setAttribute("ignoreRealm",ignoreRealm);
			listRefreshContainer.setAttribute("leftoverTitle",leftoverTitle);

			this.refresh(listRefreshContainer);
		},

		refresh: function(place) {

			removeChildren(place);

			var title = place.getAttribute("title");
			var startTag = place.getAttribute("startTag");
			var tagMode = place.getAttribute("tagMode");
			var tagExpr = place.getAttribute("tagExpr");
			var groupBy = place.getAttribute("groupBy");
			var gTagExpr = place.getAttribute("gTagExpr");
			var whereExpr = place.getAttribute("whereExpr");
			var gWhereExpr = place.getAttribute("gWhereExpr");
			var sortBy = place.getAttribute("sortBy");
			var gSortBy = place.getAttribute("gSortBy");
			var viewType = place.getAttribute("viewType");
			var gViewType = place.getAttribute("gViewType");
			var ignoreRealm = place.getAttribute("ignoreRealm");
			var leftoverTitle = place.getAttribute("leftoverTitle");

			var wikifyThis = "";

			wikifyThis += "{{mgtdList{\n";

			wikifyThis += "!"+title+"\n";

			wikifyThis += "{{innerList{\n";

			var theList = fastTagged(startTag);
			if (tagExpr != "") theList = theList.filterByTagExpr(tagExpr);
			if (whereExpr != "") theList = theList.filterByEval(whereExpr);

			if (ignoreRealm != "yes") {
				var activeRealms = store.fetchTiddler("MgtdSettings").getByIndex("Realm");
				theList = theList.select(function(t) {
					var realm = t.getByIndex("Realm");
					return (
						realm.length == 0 ||  // so something with no realm shows up
						realm.containsAny(activeRealms)
					);
				});
			}

			if (groupBy != "") {
				theList = theList.groupByTag(groupBy,sortBy,gSortBy);
				if (gTagExpr != "") theList = theList.filterGroupsByTagExpr(gTagExpr);
				if (gWhereExpr != "") theList = theList.filterGroupsByEval(gWhereExpr);
				wikifyThis += theList.renderGrouped(viewType,gViewType,leftoverTitle);
			}
			else {
				theList = theList.tiddlerSort(sortBy);
				wikifyThis += theList.render(viewType);
			}

			wikifyThis += "}}}\n";
			wikifyThis += "}}}\n";

			wikify(wikifyThis,place,null,tiddler);

			forceReflow();

		}
	}

});

