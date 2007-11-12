function Stats() {
	this.data = {};
}

Stats.prototype.getData = function() {
	return this.data;
};

Stats.prototype.categoryByTag = function(tag,categoryName) {
	var that = this;
	store.forEachTiddler(function(title,t){
		if (t.tags.indexOf(tag) != -1) {
			var y = t.fields[categoryName];
			var x = t;
			if (y) {
				if (!that.data[y]) {
					that.data[y] = [];
				}
				that.data[y].push(x);
			} else {
				if (!that.data["Undefined"]) {
					that.data["Undefined"] = [];
				}
				that.data["Undefined"].push(x);
			}
		}
	});
};

function Graph(stats) {
	this.data = stats.getData();
	/* unused but expected
	this.type = type;
	this.labels = [];
	this.title = "";
	this.legend = {};
	this.tooltips = [];
	this.orientation = "";
	*/
}

Graph.prototype.create = function(place) {
	var serial = "";
	var data = this.data;
	for (var n in data) {
		if (data.hasOwnProperty(n)) {
			var titles = "";
			for (var i=0;i<data[n].length;i++) {
				titles += "[["+data[n][i].title+"]]";
			}
			serial += "|"+n+"|"+titles+"|\n";
		}
	}
	wikify(serial,place);
};

config.macros.graph = {};

config.macros.graph.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var s = new Stats();
	s.categoryByTag("task","scopedefinitions");
	var g = new Graph(s);
	g.create(place);
};