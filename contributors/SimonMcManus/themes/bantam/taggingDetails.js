config.macros.taggingDetails = {};
config.macros.taggingDetails.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var title = getParam(params,"anon","");
	if(title == "" && tiddler instanceof Tiddler)
			title = tiddler.title;
	
	var ul = createTiddlyElement(place,"ul");
	var tagged = store.getTaggedTiddlers(title);
	createTiddlyElement(ul,"li",null,"listTitle",null);
	for(var t=0; t<tagged.length; t++) {
		var altClass = (t%2 == 0)? 'alternateItem':'';

console.log('t is ',tiddler.title);
		var li = createTiddlyElement(ul,"li", tagged[t].title+'ListItem', 'detailList '+tiddler.title+'ListItem '+altClass);
		li.onclick = function() {
			story.displayTiddler(this, [this.firstChild.textContent], config.options.txtTheme+'##CompaniesViewTemplate');
		}
		createTiddlyText(li, tagged[t].title);
		var uri = store.getTiddlerText(tagged[t].title+"_URL");
		if(uri!=null)
			createExternalLink(li,uri, uri);
	
	}
};





config.macros.taggingCount = {};
config.macros.taggingCount.handler = function(place,macroName,params,wikifier,paramString,tiddler){
	params = paramString.parseParams("anon",null,true,false,false);
	var title = getParam(params,"anon","");
	if(title == "" && tiddler instanceof Tiddler)
			title = tiddler.title;
	
	var ul = createTiddlyElement(place,"ul");
	var tagged = store.getTaggedTiddlers(title);
	var i = createTiddlyElement(place, "i");
	createTiddlyText(i, tagged.length+" Listed");

}
