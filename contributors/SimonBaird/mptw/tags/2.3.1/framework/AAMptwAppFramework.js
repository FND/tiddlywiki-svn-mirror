
merge(Array.prototype,{

	each: function(func) {
		for (var i=0;i<this.length;i++)
			func(this[i]);
	},

	map: function(func) {
		var result = [];
		this.each(function(item) {
			result.push(func(item));
		});
		return result;
	},

	select: function(func) {
		var result = [];
		this.each(function(item) {
			if (func(item))
				result.push(item);
		});
		return result;
	},

	reject: function(func) {
		var result = [];
		this.each(function(item) {
			if (!func(item))
				result.push(item);
		});
		return result;
	},

});

//------------------------------------------

merge(String.prototype,{

	parseTagExpr: function(debug) {

		if (this.trim() == "")
			return "(true)";

		var logicOps = /(!|&&|\|\||\(|\))/g;

		var spaced = this.
 			// because square brackets in templates are no good
			// this means you can use [(With Spaces)] instead of [[With Spaces]]
			replace(/\[\(/g," [[").
			replace(/\)\]/g,"]] "). 
			// space things out so we can use readBracketedList. tricky eh?
			replace(logicOps," $1 ");


		var expr = "";

		var tokens = spaced.readBracketedList(false); // false means not unique. nice one JR!

		tokens.each(function(tok) {

			if (tok.match(logicOps)) {
				expr += tok;
			}
			else if (tok.match(/^parent:/)) {
				// experimental
				var lookForTagInParent = tok.split(":")[1];
				expr += "tiddler.parents().anyHasTag('"+lookForTagInParent+"')";
			}					
			else {
				expr += "tiddler.tags.contains('%0')".format([
						// fix single quote bug. hurrah
						// but still have nasty round bracket bug
						tok.replace(/'/,"\\'")
					]);
			}
		});

		if (debug)
			alert(expr);

		return '('+expr+')';
	}

});

merge(Tiddler.prototype,{

	matchesEvalExpr: function(evalExpr) {
		var tiddler = this;
		return eval(evalExpr);
	},

	matchesTagExpr: function(tagExpr) {
		return this.matchesEvalExpr(tagExpr.parseTagExpr());
	}

});

//------------------------------------

merge(Tiddler.prototype,{

	render: function(method,renderOptions) {
		return this["render_"+method](renderOptions);
	},

	renderUtil: function(formatString,formatValues) {
		return formatString.format(formatValues);
	},

	sorter: function(field) {
		var sortMethod = "sort_"+field;
		if (this[sortMethod])
			return this[sortMethod]();
		else
			return this[field];
	},

	sorterUtil: function(otherTiddler,method) {
		var desc = false;

		if (method.substring(0,1) == "-") {
			desc = true;
			method = method.substring(1);
		}

		if (this.sorter(method) > otherTiddler.sorter(method))
			return (desc ? -1 : +1);
		else if (this.sorter(method) < otherTiddler.sorter(method))
			return (desc ? +1 : -1);
		else
			return 0;
	}

});

merge(String.prototype,{
	sorterUtil: function(otherTiddler,method) {

		var t1 = store.getTiddler(this);
		var t2 = store.getTiddler(otherTiddler);

		if (t1 && t2)
			return t1.sorterUtil(t2,method);
		// this part is flakey but I'm aiming to
		// put the None heading last in all cases
		else if (t2)
			return +1;
		else if (t1)
			return -1;
		else
			return 0;
	}
});

//------------------------------------------

merge(Array.prototype,{

	// returns a hash
	groupBy_hash: function(func) {
		var result = {};
		var leftOverGroup = '__NONE__';
		this.each(function(item) {
			var groups = func(item);
			if (groups.length > 0) {
				groups.each(function(group) {
					if (!result[group])
						result[group] = [];
					result[group].push(item);
				});
			}
			else {
				if (!result[leftOverGroup])
					result[leftOverGroup] = [];
				result[leftOverGroup].push(item);
			}
		});
		return result;
	},

	// returns an array of arrays, like Hash#sort in ruby
	groupBy: function(func,itemSort,groupSort) {

		if (!itemSort) itemSort = "title";
		if (!groupSort) groupSort = "-title";

		var result = this.groupBy_hash(func);
		var sortedResult = [];
		for (var g in result)
			sortedResult.push([g,result[g].sort(function(a,b){return a.sorterUtil(b,itemSort);})]);
		return sortedResult.sort(function(a,b){return a[0].sorterUtil(b[0],groupSort);});
	},

	// for convenience since it's mostly what we want
	groupByTag: function(tag,itemSort,groupSort) {
		return this.groupBy(function(t){return t.getByIndex(tag);},itemSort,groupSort);
 	}

});

//------------------------------------------

// for lists of tiddlers
merge(Array.prototype,{
	
	filterByEval: function(evalExpr) {
		return this.select(function(t) {
			return t.matchesEvalExpr(evalExpr);
		});
	},

	filterByTagExpr: function(tagExpr) {
		return this.filterByEval(tagExpr.parseTagExpr());
	},

	filterGroupsByEval: function(evalExpr) {
		// presumes the group name is a tiddler
		return this.select(function(tGroup) {
			var tiddler = store.getTiddler(tGroup[0]);
			return tiddler && tiddler.matchesEvalExpr(evalExpr);
		});
	},

	filterGroupsByTagExpr: function(tagExpr) {
		return this.filterGroupsByEval(tagExpr.parseTagExpr());
	},

	render: function(renderMethod,renderOptions) {
		return this.map(function(tiddler){
			return tiddler.render(renderMethod,renderOptions);
		}).join("");
	},

	renderGrouped: function(listRenderMethod,headingRenderMethod,noneHeading,renderOptions) {
		var result = "";
		this.each(function(g) {
			var groupName = g[0];
			var groupItems = g[1];
			if (groupName == "__NONE__") {
				result = result + "!!("+(noneHeading?noneHeading:"No "+headingRenderMethod)+")\n";
			}
			else {
				var gTiddler = store.getTiddler(groupName);
				if (gTiddler) {
					result = result + "!!"+gTiddler.render(headingRenderMethod);
				}
				else {
					result = result + "!![["+groupName+"]]\n";
				}
			}
			result = result + groupItems.render(listRenderMethod,renderOptions);
		});
		return result;
	},

	tiddlerSort: function(sortBy) {
		return this.sort(function(a,b) { return a.sorterUtil(b,sortBy); });
	}

});

//------------------------------------------


merge(config.macros,{
	mpList: {
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
			var ignoreRealm = getParam(pp, "ignoreRealm","no");

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

			wikifyThis += "{{mpList{\n";

			wikifyThis += "!"+title+"\n";

			var theList = fastTagged(startTag);
			if (tagExpr != "") theList = theList.filterByTagExpr(tagExpr);
			if (whereExpr != "") theList = theList.filterByEval(whereExpr);
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

			wikify(wikifyThis,place,null,tiddler);

		}
	},

	test11: {
		handler: function (place,macroName,params,wikifier,paramString,tiddler) {

			var s = store.getTiddler("Mow Lawn");
			var b = store.getTiddler("Buy Skis");

			wikify(fastTagged("Action").
				filterByTagExpr("!Done && Action").
				groupByTag("Project").
				filterGroupsByTagExpr("!Complete").
				renderGrouped("Action","Project"),
				place,null,tiddler);

		}
	}

});
