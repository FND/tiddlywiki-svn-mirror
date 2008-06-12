config.views.wikified.tag.relatedTagsText = "Show related tags";
config.views.wikified.tag.relatedTagsTooltip = "Show related tags";
config.views.wikified.tag.labelNoRelatedTags = "no tags";
config.views.wikified.tag.labelRelatedTags = "related tags: ";

// Event handler for clicking on a tiddler tag
window.onClickTag = function(ev)
{
	var e = ev ? ev : window.event;
	var popup = Popup.create(this);
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	if(popup && tag) {
		var tagged = store.getTaggedTiddlers(tag);
		var titles = [];
		var li,r;
		for(r=0;r<tagged.length;r++) {
			if(tagged[r].title != title)
				titles.push(tagged[r].title);
		}
		var lingo = config.views.wikified.tag;
		if(titles.length > 0) {
			var openAll = createTiddlyButton(createTiddlyElement(popup,"li"),lingo.openAllText.format([tag]),lingo.openAllTooltip,onClickTagOpenAll);
			openAll.setAttribute("tag",tag);
			createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
			for(r=0; r<titles.length; r++) {
				createTiddlyLink(createTiddlyElement(popup,"li"),titles[r],true);
			}
		} else {
			createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),lingo.popupNone.format([tag]));
		}
		createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
		var relatedTags = createTiddlyButton(createTiddlyElement(popup,"li"),lingo.relatedTagsText,lingo.relatedTagsTooltip,onClickRelatedTags);
		relatedTags.setAttribute("tag",tag);
		var h = createTiddlyLink(createTiddlyElement(popup,"li"),tag,false);
		createTiddlyText(h,lingo.openTag.format([tag]));
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
}

// Event handler for 'Show related tags' on a tiddler popup
window.onClickRelatedTags = function(ev)
{
	var e = ev ? ev : window.event;		
	var popup = Popup.create(this);
	var relatedtags = [];
	var tags = [];
	var tag = this.getAttribute("tag");
	var tiddlers = store.getTaggedTiddlers(tag);
	for(var i=0; i<tiddlers.length; i++) {
		tags = tiddlers[i].tags;
		for(var j=0; j<tags.length; j++) {
			relatedtags.pushUnique(tags[j]);
		}
	}
	var lingo = config.views.wikified.tag;
	var prompt = relatedtags.length == 0 ? lingo.labelNoRelatedTags : lingo.labelRelatedTags;
	createTiddlyElement(popup,"li",null,"listTitle",prompt.format([tag]));
	for(var t=0; t<relatedtags.length; t++) {
		if(relatedtags[t]!==tag) {
			createTagButton(createTiddlyElement(popup,"li"),relatedtags[t],tag);
		}
	}
	Popup.show();
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return false;
}