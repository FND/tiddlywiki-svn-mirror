
merge(config.macros,{

	mgtdList: {

		getActiveRealms: function() {
			return store.fetchTiddler("MgtdSettings").getByIndex("Realm");
		},

		getRealm: function() {
			// decide which one to use if multiple realms are active
			// use a slice to get the realm priority and choose the highest one
			var active = config.macros.mgtdList.getActiveRealms();
			if (active.length == 1) {
				return active[0];
			}
			else {
				// TODO, make this prettier
				var toBeat = "zzzzzzz";
				var soFar = active[0];
				for (var i=0;i<active.length;i++) {
					var pri = store.getTiddlerSlice(active[i],"priority");
					if (pri && pri < toBeat) {
						toBeat = pri;
						soFar = active[i];
					}
				}
				return soFar;
			}
		},

		getNewButton: function(tags,extraTags) {
			if (typeof tags != 'string')
				tags = String.encodeTiddlyLinkList(tags);
			return '<<newSavedTiddler label:+ tag:"'+tags+'">>'; // newSavedTiddler wants tags in one param?
		},

		handler: function (place,macroName,params,wikifier,paramString,tiddler) {
			var pp = paramString.parseParams("tags",null,true);

			// title of the list
			var title = getParam(pp,"title","");

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

			// group by count only mode
			var groupCountOnly = getParam(pp,"groupCountOnly","");

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

			// new button
			var newButton = getParam(pp,"newButton",""); // not using 
			var newButtonTags = getParam(pp,"newButtonTags","");

			if (!startTag)
				if (tagMode != "global")
					startTag = tiddler.title;

			var listRefreshContainer = createTiddlyElement(place,"div");

			// TODO one big attribute?
			listRefreshContainer.setAttribute("refresh","macro");
			listRefreshContainer.setAttribute("macroName",macroName);

			listRefreshContainer.setAttribute("title",title);
			listRefreshContainer.setAttribute("startTag",startTag);
			listRefreshContainer.setAttribute("tagMode",tagMode);
			listRefreshContainer.setAttribute("tagExpr",tagExpr);
			listRefreshContainer.setAttribute("groupBy",groupBy);
			listRefreshContainer.setAttribute("groupCountOnly",groupCountOnly);
			listRefreshContainer.setAttribute("gTagExpr",gTagExpr);
			listRefreshContainer.setAttribute("whereExpr",whereExpr);
			listRefreshContainer.setAttribute("gWhereExpr",gWhereExpr);
			listRefreshContainer.setAttribute("sortBy",sortBy);
			listRefreshContainer.setAttribute("gSortBy",gSortBy);
			listRefreshContainer.setAttribute("viewType",viewType);
			listRefreshContainer.setAttribute("gViewType",gViewType);
			listRefreshContainer.setAttribute("ignoreRealm",ignoreRealm);
			listRefreshContainer.setAttribute("leftoverTitle",leftoverTitle);
			listRefreshContainer.setAttribute("newButton",newButton);
			listRefreshContainer.setAttribute("newButtonTags",newButtonTags);
			if (tiddler)
				listRefreshContainer.setAttribute("tiddlerTitle",tiddler.title);

			this.refresh(listRefreshContainer);
		},

		refresh: function(place) {

			removeChildren(place);

			var title = place.getAttribute("title");
			var startTag = place.getAttribute("startTag");
			var tagMode = place.getAttribute("tagMode");
			var tagExpr = place.getAttribute("tagExpr");
			var groupBy = place.getAttribute("groupBy");
			var groupCountOnly = place.getAttribute("groupCountOnly");
			var gTagExpr = place.getAttribute("gTagExpr");
			var whereExpr = place.getAttribute("whereExpr");
			var gWhereExpr = place.getAttribute("gWhereExpr");
			var sortBy = place.getAttribute("sortBy");
			var gSortBy = place.getAttribute("gSortBy");
			var viewType = place.getAttribute("viewType");
			var gViewType = place.getAttribute("gViewType");
			var ignoreRealm = place.getAttribute("ignoreRealm");
			var leftoverTitle = place.getAttribute("leftoverTitle");
			var newButton = place.getAttribute("newButton");
			var newButtonTags = place.getAttribute("newButtonTags");
			var tiddlerTitle = place.getAttribute("tiddlerTitle");

			var wikifyThis = "";

			wikifyThis += "{{mgtdList{\n";

            if (title != "")
			    wikifyThis += "!"+title

			// old
			/*
			if (newButton != "") {
				var newButtonParams = newButton.readBracketedList();
				var newButtonTiddler = newButtonParams[0];
				newButtonParams.shift();
				var newButtonArgs = newButtonParams.map(function(a){return "[["+a+"]]";}).join(" "); //a better way to create bracketed list?
																									// fyi it's this: String.encodeTiddlyLinkList
				// put the realm in here... not sure if it's a good idea
				wikifyThis += " <<tiddler "+newButtonTiddler+" with:[["+config.macros.mgtdList.getRealm()+"]] "+newButtonArgs+">>";
			}
			*/
			// new
			var nbTags;
			if (newButtonTags != '') {
				nbTags = [
						newButtonTags,                                  // the tags specified in the macro params
						'[['+config.macros.mgtdList.getRealm()+']]',    // the realm. always want a realm
						(tagMode=='global'?'':'[['+tiddlerTitle+']]')   // if not global, then the add tiddler we're in, new here style
					].join(' ');
				wikifyThis += this.getNewButton(nbTags);
			}

            if (title != "" || newButton != "")
			    wikifyThis += "\n";

			wikifyThis += "{{innerList{\n";

			var checkForContent = wikifyThis;

			var theList = [];
			if (startTag && startTag != 'undefined'/* this sucks */) {
				theList = fastTagged(startTag);
			}
			else {
				// why so hard to get an array of all tiddlers?
				store.forEachTiddler(function(t_title,t_tiddler) { theList.push(t_tiddler); });
			}


			if (tagExpr != "") theList = theList.filterByTagExpr(tagExpr);
			if (whereExpr != "") theList = theList.filterByEval(whereExpr);

			if (ignoreRealm != "yes") {
				var activeRealms = config.macros.mgtdList.getActiveRealms();
				theList = theList.select(function(t) {
					var realm = t.getByIndex("Realm");
					return (
						realm.length == 0 ||  // so something with no realm shows up
						realm.containsAny(activeRealms)
					);
				});
			}

            if (groupBy == "day") {
                // experimental. changing a tag doesn't update modified so
                // this isn't as useful
                theList = theList.groupBy(function(t){return [t.modified.formatString('YYYY-0MM-0DD')];});
				wikifyThis += theList.renderGrouped(viewType,gViewType,leftoverTitle);
            }
			else if (groupBy != "") {
				theList = theList.groupByTag(groupBy,sortBy,gSortBy);
				if (gTagExpr != "") theList = theList.filterGroupsByTagExpr(gTagExpr);
				if (gWhereExpr != "") theList = theList.filterGroupsByEval(gWhereExpr);
				wikifyThis += theList.renderGrouped(viewType,gViewType,leftoverTitle,null,groupCountOnly,nbTags);
			}
			else {
				theList = theList.tiddlerSort(sortBy);
				wikifyThis += theList.render(viewType);
			}

			if (wikifyThis == checkForContent)
				wikifyThis += "{{none{none}}}";

			wikifyThis += "}}}\n";
			wikifyThis += "}}}\n";

			wikify(wikifyThis,place,null,tiddler);

			forceReflow();

		}
	}

});

