
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

	groupBy: function(callback) {
		var result = {};
		var leftOverGroup = '__NONE__';
		this.each(function(item) {
			var groups = callback(item);
			if (groups.length > 0 || (groups.length == 1 && groups[0])) { // XXX doesn't work??
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
	}

});

