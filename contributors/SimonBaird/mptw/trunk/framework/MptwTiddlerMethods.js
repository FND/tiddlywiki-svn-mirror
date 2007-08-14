
merge(Tiddler.prototype,{

	render: function(method,args) {
		return this["render_"+method](args);
	},

	renderUtil: function(formatString,formatValues) {
		return formatString.format(formatValues);
	}

});

merge(Array.prototype,{
	render: function(method,args) {
		return this.map(function(tiddler){
			return tiddler.render(method,args);
		}).join("");
	},

	renderGrouped: function(listRenderMethod,groupBy,headingRenderMethod,args) {
		// where the magic happens
		var groups = this.groupBy(groupBy);
		var result = "";
		for (var g in groups) {
			var gTiddler = store.getTiddler(g);
			if (gTiddler)
				result = result + "!"+gTiddler.render(headingRenderMethod);
			else
				result = result + "!"+g+"\n";
			result = result + groups[g].render(listRenderMethod,args);
		}
		return result;
	}
});
