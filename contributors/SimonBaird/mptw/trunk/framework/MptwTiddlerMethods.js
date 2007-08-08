
merge(Tiddler.prototype,{

	render: function() {
		// stupid trick because arguments is not really an array
		var args = Array.prototype.slice.call(arguments);
		var renderMethod = args.shift();
		return this["render_"+renderMethod](args);
	},

	renderUtil: function(formatString,formatValues) {
		return formatString.format(formatValues);
	}

});

