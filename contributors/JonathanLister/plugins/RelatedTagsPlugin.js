// Extensions specific for adding 'show related tags', as if the above were in the core

config.views.wikified.tag.relatedTagsText = "Show related tags";
config.views.wikified.tag.relatedTagsTooltip = "Show related tags";
config.views.wikified.tag.labelNoRelatedTags = "no tags";
config.views.wikified.tag.labelRelatedTags = "related tags: ";

Popup.handlers.text = function(popup,text) {
	createTiddlyElement(popup,"li",null,null,text);
};

// Instead of overriding Popup.layouts.onClickTag, make use of the fact it is extendable
Popup.extend('onClickTag', function(popup,params,handlers) {
	var lingo = params.lingo;
	var tag = params.tag;
	handlers.button(popup,lingo.relatedTagsText,lingo.relatedTagsTooltip,onClickRelatedTags,{tag:tag});
});

// New layout for popup to be displayed when "show related tags" is clicked
Popup.layouts.onClickRelatedTags = function(popup,params,handlers) {
	var lingo = params.lingo;
	var tag = params.tag;
	var relatedtags = params.relatedtags;
	var prompt = relatedtags.length == 0 ? lingo.labelNoRelatedTags : lingo.labelRelatedTags;
	handlers.text(popup,prompt.format([tag]));
	for(var t=0; t<relatedtags.length; t++) {
		if(relatedtags[t]!==tag) {
			createTagButton(createTiddlyElement(popup,"li"),relatedtags[t],tag);
		}
	}
};

// Event handler for 'Show related tags' on a tiddler tag popup
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
	var params = {
		lingo:lingo,
		relatedtags:relatedtags,
		tag:tag
	};
	Popup.layout(popup,'onClickRelatedTags',params);
	Popup.show();
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return false;
};