//{{{
(function() {

// hijack getMissingLinks to sort by number of references
var getMissingLinks = TiddlyWiki.prototype.getMissingLinks;
TiddlyWiki.prototype.getMissingLinks = function(sortField) {
	var results = getMissingLinks.apply(this, arguments);
	var index = results.map(function(item, i) {
		return {
			title: results[i],
			count: store.getReferringTiddlers(results[i]).length
		};
	});
	return index.sort(function(a, b) {
		return b.count - a.count;
	}).map(function(item, i) {
		return item.title;
	});
};

})();
//}}}
