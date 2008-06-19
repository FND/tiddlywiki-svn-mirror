// Extra properties and methods for popup
// Enables extendable, layout template-based popups
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


// defaults to handle onClickTag
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
		return createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
	},
	button: function(popup,label,tooltip,callback,attribs) {
		return createTiddlyButton(createTiddlyElement(popup,"li"),label,tooltip,callback,null,null,null,attribs);
	},
	link: function(popup,title,text) {
		if(title) {
			var h = createTiddlyLink(createTiddlyElement(popup,"li"),title,false);
			createTiddlyText(h,text);
			return h;
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
				handlers.listBreak(popup);
			} else {
				handlers.noTitles(popup,lingo.popupNone.format([tag]));
				handlers.listBreak(popup);
			}
			handlers.link(popup,tag,lingo.openTag.format([tag]));
		}
	}
});

Popup.makeExtendable('onClickTag');

window.onClickTag = function(ev)
{
	var e = ev || window.event;
	var popup = Popup.create(this);
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	var tiddlers = this.tiddlers;
	var tags = [];
	var filter = tiddlers ? "[tag["+tag+"]]" : tag;
	if(popup && filter) {
		var tagged = tiddlers ? filterTiddlers(filter,tiddlers) : store.getTaggedTiddlers(filter);
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
			tag:tag,
			tiddlers:tagged
		};
		Popup.layout(popup,'onClickTag',params);
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
};
