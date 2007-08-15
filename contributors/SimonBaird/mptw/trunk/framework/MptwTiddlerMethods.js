
merge(Tiddler.prototype,{

	render: function(method,args) {
		return this["render_"+method](args);
	},

	renderUtil: function(formatString,formatValues) {
		return formatString.format(formatValues);
	}

});

// for lists of tiddlers
merge(Array.prototype,{
	render: function(renderMethod,args) {
		return this.map(function(tiddler){
			return tiddler.render(renderMethod,args);
		}).join("");
	},

	renderGrouped: function(listRenderMethod,groupBy,headingRenderMethod,noneHeading,args) {
		if (!noneHeading) noneHeading = "None";
		var groups = this.groupBy(groupBy);
		var result = "";
		for (var g in groups) {
			var gTiddler = store.getTiddler(g);
			if (gTiddler)
				result = result + "!"+gTiddler.render(headingRenderMethod);
			else
				result = result + "!("+noneHeading+")\n";
			result = result + groups[g].render(listRenderMethod,args);
		}
		return result;
	},

	renderGroupedByTag: function(listRenderMethod,groupByTag,headingRenderMethod,args) {
		return this.renderGrouped(
			listRenderMethod,
			function(t){return t.getByIndex(groupByTag);},
			headingRenderMethod,
			"No "+groupByTag,
			args);
	}
});
