window.setPrivatePageTag = function(place){
	var tiddler = story.findContainingTiddler(place).getAttribute("tiddler");
	var status = !!store.getValue(tiddler,'server.host');
	store.setTiddlerTag(tiddler,!status,"PrivatePage");
}
