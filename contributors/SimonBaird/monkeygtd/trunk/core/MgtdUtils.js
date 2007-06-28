
merge(Array.prototype,{

	map: function(callback) {
		var result = [];
		for (var i=0;i<this.length;i++)
			result.push(callback(this[i]));
		return result;
	},

	each: function(callback) {
		for (var i=0;i<this.length;i++)
			callback(this[i]);
	},

	select: function(callback) {
		var result = [];
		for (var i=0;i<this.length;i++)
			if (callback(this[i]));
				result.push(this[i]);
		return result;
	},

	reject: function(callback) {
		var result = [];
		for (var i=0;i<this.length;i++)
			if (!callback(this[i]));
				result.push(this[i]);
		return result;
	},

	groupBy: function(callback) {
		var result = {};
		var leftOverGroup = '__NONE__';
		this.each(function(item) {
			var groups = callback(item);
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
	}
});


// a test. look at it in firebug
var zzfoo = ["AAAA","Aasdfasf","Qqwereqe","z"].groupBy(function(x){return x == "z" ? [] : [x.substr(0,1)]});

