// Extra properties and methods for Popup
Popup.layouts = {};
Popup.handlers = {};

Popup.layout = function(popup,label,params)
{
	var layout = this.layouts[label];
	if(layout && typeof layout == 'function') {
		layout(popup,params,this.handlers);
	}
	if(layout.isExtendable) {
		for(var i=0;i<layout.extras.length;i++) {
			layout.extras[i](popup,params,this.handlers);
		}
	}
};

Popup.makeExtendable = function(label) {
	var layout = this.layouts[label];
	if(layout) {
		layout.isExtendable = true;
		layout.extras = [];
	}
};

Popup.extend = function(label,func) {
	var layout = this.layouts[label];
	if(layout.isExtendable) {
		layout.extras.push(func);
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

Popup.makeExtendable('onClickTag');

// Event handler for clicking on a tiddler tag
window.onClickTag = function(ev)
{
	var e = ev || window.event;
	var popup = Popup.create(this);
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	var excludeTags = this.getAttribute("excludeTags");
	var filterFunc = excludeTags ? 'filterTiddlers' : 'getTaggedTiddlers';
	var filter = "";
	var tags = [];
	if(excludeTags) {
		tags = excludeTags.readBracketedList();
		filter += "[";
		for(var i=0;i<tags.length;i++) {
			filter += "tag["+tags[i]+"]";
		}
		filter += "]";
	} else {
		filter = tag;
	}
	if(popup && filter) {
		var tagged = store[filterFunc](filter);
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