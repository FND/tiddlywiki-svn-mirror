//Removes hidden tiddlers from lists. Hopefully this code will be included in the core TW soon.//
//{{{
TiddlyWiki.prototype.getTags = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(tiddler.tags.find('excludeLists')===null)
			{
			for(var g=0; g<tiddler.tags.length; g++){
				var tag = tiddler.tags[g];
				var taggingTiddler = store.fetchTiddler(tag);
				if(!taggingTiddler || !taggingTiddler.tags || taggingTiddler.tags.find('excludeLists')===null){
					var f = false;
					for(var c=0; c<results.length; c++){
						if(results[c][0] == tag){
							f = true;
							results[c][1]++;
						}
					}
					if(!f){
						results.push([tag,1]);
					}
				}
			}
		}
	});
	results.sort(function (a,b) {if(a[0].toLowerCase() == b[0].toLowerCase()){ return(0);} else {return (a[0].toLowerCase() < b[0].toLowerCase()) ? -1 : +1;} });
	return results;
};

TiddlyWiki.prototype.getOrphans = function()
{
	var results = [];
	this.forEachTiddler(function (title,tiddler) {
		if(this.getReferringTiddlers(title).length === 0 && tiddler.tags.find('excludeLists')===null){
			results.push(title);
		}
	});
	results.sort();
	return results;
};
//}}}