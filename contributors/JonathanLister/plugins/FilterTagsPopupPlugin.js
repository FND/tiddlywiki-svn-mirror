// Extensions specific for adding 'Filter on tag %0', as if the above were in the core

config.views.wikified.tag.filterTagsText = "Filter on tag '%0'";
config.views.wikified.tag.filterTagsTooltip = "Filter on tag '%0'";
config.views.wikified.tag.labelFilterTags = "Filter on tag '%0'";
config.views.wikified.tag.labelFilterNoTags = "No more related tags";

// Instead of overriding Popup.layouts.onClickTag, make use of the fact it is extendable
Popup.extend('onClickTag', function(popup,params,handlers) {
	var lingo = params.lingo;
	var tag = params.tag;
	var tiddlers = params.tiddlers;
	var btn = handlers.button(popup,lingo.filterTagsText.format([tag]),lingo.filterTagsTooltip.format([tag]),onClickFilterTags,{tag:tag});
	btn.tiddlers = tiddlers;
});

// New layout for popup to be displayed when "Filter tags" is clicked
Popup.layouts.onClickFilterTags = function(popup,params,handlers) {
	var lingo = params.lingo;
	var tag = params.tag;
	var relatedtags = params.relatedtags;
	var tiddlers = params.tiddlers;
	var btn;
	var prompt = relatedtags.length == 0 ? lingo.labelFilterNoTags : lingo.labelFilterTags;
	handlers.text(popup,prompt.format([tag]));
	for(var t=0; t<relatedtags.length; t++) {
		if(relatedtags[t]!==tag) {
			btn = createTagButton(createTiddlyElement(popup,"li"),relatedtags[t],tag);
			btn.tiddlers = tiddlers;
		}
	}
};

// Event handler for 'Filter on tag ...' on a tiddler tag popup
window.onClickFilterTags = function(ev)
{
	var e = ev ? ev : window.event;
	var popup = Popup.create(this);
	var relatedtags = [];
	var tags = [];
	var tag = this.getAttribute("tag");
	var tiddlers = this.tiddlers;
	if(!tiddlers) {
		tiddlers = store.getTaggedTiddlers(tag);
	}
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
		tag:tag,
		tiddlers:tiddlers
	};
	Popup.layout(popup,'onClickFilterTags',params);
	Popup.show();
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return false;
};