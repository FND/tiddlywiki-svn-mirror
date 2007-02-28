
// this must be used in conjunction with IndexedTagsPlugin

merge(config.macros,{

	fastList: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var parsedParams = paramString.parseParams("tags",null,true);

			// startTag should make it faster
			// because we are starting with just a subset of tiddlers
			// not scanning every tiddler each time
			// will use the indexes from IndexedTagsPlugin
			var startTag = getParam(parsedParams,"startTag");
			var tagExpr = getParam(parsedParams,"tagExpr");
			var sortBy = getParam(parsedParams,"sortBy","title");
			var mode = getParam(parsedParams,"local");

			if (!startTag)
				if (mode != "global")
					startTag = tiddler.title;

	
			var listDiv = createTiddlyElement(place,"div",null,"mList");
			var listTitleSpan = createTiddlyElement(listDiv,"span",null,"mListTitle");
			createTiddlyText(listTitleSpan,"Hey");

			var listRefreshContainer = createTiddlyElement(listDiv,"div");

			listRefreshContainer.setAttribute("refresh","macro");
			listRefreshContainer.setAttribute("macroName",macroName);

       		listRefreshContainer.setAttribute("startTag",startTag);
       		listRefreshContainer.setAttribute("tagExpr",tagExpr);
       		listRefreshContainer.setAttribute("sortBy",sortBy);

			this.refresh(listRefreshContainer);

		},

		refresh: function(place) {
			var startTag = place.getAttribute("startTag");
			var tagExpr = place.getAttribute("tagExpr");
			var sortBy = place.getAttribute("sortBy");
			var list = this.tagList(startTag,tagExpr,sortBy);
			var markup = "";
			for (var i=0;i<list.length;i++) {
				markup += this.renderTiddler["action"](list[i],true);
			}
			removeChildren(place);
			wikify(markup,place,null,tiddler);
		},

		renderTiddler: {
			action: function(t,showProject) {
				return "{{action2{"+
					"@@font-size:80%;"+
					"<<toggleTag Done [["+t.title+"]] ->>"+
					"<<tTag tag:Next mode:text text:N title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Waiting For]] mode:text text:W title:[["+t.title+"]]>>"+
					"<<tTag tag:[[Starred]] mode:text text:{{config.mGTD.star}} title:[["+t.title+"]]>>"+
					" @@"+
					"[["+t.title+"]] "+
					"}}}\n";
			}
		},

		tagList: function(startTag,tagExpr,sortBy) {

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

			for (var i=0;i<startList.length;i++) {
				var tiddler = store.fetchTiddler(startList[i]);
				try {
					if (eval(expr))
						output.push(tiddler);
				}
				catch(e) {
					if (firstError) {
						alert("error parsing: "+expr);
						firstError = false;
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
