config.views.wikified.relatedtag = {
	labelNoRelatedTags:"no tags",
	labelRelatedTags:"related tags: ",
	openAllText:config.views.wikified.tag.openAllText,
	openAllTooltip:config.views.wikified.tag.openAllTooltip,
	openRelatedTag:"Open related tag '%0'",
	popupNone:config.views.wikified.tag.popupNone,
	tooltip:config.views.wikified.tag.tooltip
};

config.macros.relatedtags = {};
config.macros.relatedtags.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var ul = createTiddlyElement(place,"ul");
	var relatedtags = [];
	var tags = [];
	// go and get tags from tag
	var tag = getParam(params,"anon","");
	var tiddlers = store.getTaggedTiddlers(tag);
	for(var i=0; i<tiddlers.length; i++) {
		tags = tiddlers[i].tags;
		for(var j=0; j<tags.length; j++) {
			relatedtags.pushUnique(tags[j]);
		}
	}
	//end go and get tags from tag
	var sep = getParam(params,"sep"," ");
	var lingo = config.views.wikified.relatedtag;
	var prompt = relatedtags.length == 0 ? lingo.labelNoRelatedTags : lingo.labelRelatedTags;
	createTiddlyElement(ul,"li",null,"listTitle",prompt.format([tag]));
	for(var t=0; t<relatedtags.length; t++) {
		if(relatedtags[t]!==tag) {
			createTagButton(createTiddlyElement(ul,"li"),relatedtags[t],tag);
			if(t<relatedtags.length-1)
				createTiddlyText(ul,sep);
		}
	}
};