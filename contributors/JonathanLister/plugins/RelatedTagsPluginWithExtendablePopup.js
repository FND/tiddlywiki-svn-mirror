// extra properties and layout method for Popup
Popup.layouts = {};
Popup.handlers = {};

Popup.layout = function(popup,label,params)
{
	// can we introduce a sort of if-then-else bit to the layouts, so the layouts become genuinely extendable
	// that way we can keep onClickTag extendable because we add to rather than override the layout
	if(this.layouts[label] && typeof this.layouts[label] == 'function') {
		this.layouts[label](popup,params,this.handlers);
	}
};

merge(Popup.handlers, {
	listTitles: function(popup,titles) {
		if(titles) {
			for(r=0; r<titles.length; r++) {
				createTiddlyLink(createTiddlyElement(popup,"li"),titles[r],true);
			}
		}
	},
	noTitles: function(popup,label) {
		createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),label);
	},
	listBreak: function(popup) {
		createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
	},
	button: function(popup,label,tooltip,callback,attribs) {
		var btn = createTiddlyButton(createTiddlyElement(popup,"li"),label,tooltip,callback,null,null,null,attribs);
	},
	link: function(popup,title,text) {
		if(title) {
			var h = createTiddlyLink(createTiddlyElement(popup,"li"),title,false);
			createTiddlyText(h,text);
		}
	}
});

merge(Popup.layouts, {
	onClickTag: function(popup,params,handlers) {
		var lingo = params.lingo;
		var titles = params.titles;
		var tag = params.tag;
		if(popup && titles) {
			if(titles.length > 0) {
				handlers.button(popup,lingo.openAllText.format([tag]),lingo.openAllTooltip,onClickTagOpenAll,{tag:tag});
				handlers.listBreak(popup);
				handlers.listTitles(popup,titles);
			} else {
				handlers.noTitles(popup,lingo.popupNone.format([tag]));
				handlers.listBreak(popup);
			}
			handlers.link(popup,tag,lingo.openTag.format([tag]));
		}
	}
});

// Event handler for clicking on a tiddler tag
window.onClickTag = function(ev)
{
	var e = ev || window.event;
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
		var params = {
			titles:titles,
			lingo:lingo,
			tag:tag
		};
		Popup.layout(popup,'onClickTag',params);
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
};

/* Extensions specific for adding 'show related tags', as if the above were in the core */
/*
config.views.wikified.tag.relatedTagsText = "Show related tags";
config.views.wikified.tag.relatedTagsTooltip = "Show related tags";
config.views.wikified.tag.labelNoRelatedTags = "no tags";
config.views.wikified.tag.labelRelatedTags = "related tags: ";

Popup.handlers.relatedTags = function(popup,params) {
	var lingo = params.lingo;
	var tag = params.tag;
	if(lingo && tag) {
		var relatedTags = createTiddlyButton(createTiddlyElement(popup,"li"),lingo.relatedTagsText,lingo.relatedTagsTooltip,onClickRelatedTags);
		relatedTags.setAttribute("tag",tag);
	}
};

Popup.layouts.onClickTag = function(popup,params) {
	var titles = params.titles;
	var handlers = this.handlers;
	if(popup && titles) {
		if(titles.length > 0) {
			handlers.openAll(popup,params);
			handlers.separator(popup);
			handlers.titles(popup,params);
		} else {
			handlers.noTitles(popup,params);
			handlers.separator(popup,params);
		}
		handlers.relatedTags(popup,params);
		handlers.openTag(popup,params);
	}
};

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
};
*/