/***
|''Name''|TagsplorerMacro|
|''Description''|tag-based tiddler navigation|
|''Author''|FND|
|''Version''|1.0.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/TagsplorerMacro.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.6.0|
|''Keywords''|navigation tagging|
!Usage
{{{
<<tagsplorer [tag] [tag] ... >>
}}}
!!Examples
<<tagsplorer systemConfig>>
!Revision History
!!v1.0 (2010-03-21)
* initial release
!To Do
* refresh handling
* sorting for tag/tiddler lists
* animations for new/removed tags/tiddlers (requires array diff'ing)
!StyleSheet
.tagsplorer ul {
	margin: 0;
	padding: 0;
}

.tagsplorer .tagSelection {
	overflow: auto;
	border: 1px solid [[ColorPalette::TertiaryLight]];
	padding: 5px;
	list-style-type: none;
	background-color: [[ColorPalette::TertiaryPale]];
}

.tagsplorer .tagSelection li {
	float: left;
	margin-right: 0.5em;
}

.tagsplorer .tiddlerList {
	margin: 5px 0 10px 1.5em;
}
!Code
***/
//{{{
(function($) {

config.shadowTiddlers.StyleSheetTagsplorer = store.getTiddlerText(tiddler.title + "##StyleSheet");
store.addNotification("StyleSheetTagsplorer", refreshStyles);

var macro = config.macros.tagsplorer = {};

config.macros.tagsplorer = $.extend(macro, {
	locale: {
		newTagLabel: "new",
		newTagTooltip: "add tag to filter",
		delTagTooltip: "remove tag",
		noTagLabel: "N/A"
	},

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var tags = params;
		var tiddlers = getTiddlers(tags);

		var container = $('<div class="tagsplorer" />').
			append('<ul class="tagSelection" />').
			append('<ul class="tiddlerList" />');

		macro.refreshTags(tags, container);
		macro.refreshTiddlers(tiddlers, container);

		container.appendTo(place);
	},
	newTagClick: function(ev) {
		var btn = $(this);
		var container = btn.closest(".tagsplorer");

		var tags = container.find(".tagSelection").data("tags");
		var tiddlers = container.find(".tiddlerList").data("tiddlers");
		var tagSelection = getTagSelection(tiddlers, tags);

		var popup = Popup.create(this, "ul");
		if(tagSelection.length) {
			$.each(tagSelection, function(i, tag) {
				createTagElement(popup, tag, macro.locale.newTagTooltip, macro.onTagClick);
			});
		} else {
			createTagElement(popup, macro.locale.noTagLabel);
		}
		$(popup).data({
			container: container,
			tags: tags,
			tiddlers: tiddlers
		});
		Popup.show();
		ev.stopPropagation();
	},
	onTagClick: function(ev) {
		var btn = $(this);
		var popup = btn.closest(".popup");
		var container = popup.data("container");
		var tags = popup.data("tags");
		var tiddlers = popup.data("tiddlers");
		var tag = btn.text();
		tags.pushUnique(tag);
		tiddlers = filterTiddlers(tiddlers, tag);
		macro.refreshTags(tags, container);
		macro.refreshTiddlers(tiddlers, container);
	},
	delTag: function(ev) {
		var btn = $(this);
		var container = btn.closest(".tagsplorer");
		var tags = container.find(".tagSelection").data("tags");
		tags.remove(btn.text());
		var tiddlers = getTiddlers(tags);
		btn.parent().remove();
		macro.refreshTags(tags, container);
		macro.refreshTiddlers(tiddlers, container);
	},
	refreshTags: function(tags, container) {
		var orig = container.find(".tagSelection");
		var clone = orig.clone().empty();
		clone.data("tags", tags);

		var self = this;
		$.each(tags, function(i, tag) {
			createTagElement(clone, tag, self.locale.delTagTooltip, self.delTag);
		});
		createTagElement(clone, this.locale.newTagLabel, this.locale.newTagTooltip, this.newTagClick).
			addClass("button");

		orig.replaceWith(clone);
	},
	refreshTiddlers: function(tiddlers, container) {
		var orig = container.find(".tiddlerList");
		var clone = orig.clone().empty();
		clone.data("tiddlers", tiddlers);

		$.each(tiddlers, function(i, tiddler) {
			var el = $("<li />").appendTo(clone)[0];
			createTiddlyLink(el, tiddler.title, true);
		});

		orig.replaceWith(clone);
	}
});

var getTiddlers = function(tags) {
	var tiddlers = store.getTiddlers();
	for(var i = 0; i < tags.length; i++) {
		tiddlers = filterTiddlers(tiddlers, tags[i]);
	}
	return tiddlers;
};

var filterTiddlers = function(tiddlers, tag) {
	return $.map(tiddlers, function(item, i) {
		if(item.tags.contains(tag)) {
			return item;
		}
	});
};

var getTagSelection = function(tiddlers, exclude) {
	var tags = [];
	for(var i = 0; i < tiddlers.length; i++) {
		var _tags = tiddlers[i].tags;
		for(var j = 0; j < _tags.length; j++) {
			var tag = _tags[j];
			if(!exclude.contains(tag)) {
				tags.pushUnique(tag);
			}
		}
	}
	return tags;
};

var createTagElement = function(container, label, tooltip, action) {
	var el = $("<li />").appendTo(container);
	return $('<a href="javascript:;" />').
		text(label).
		attr("title", tooltip || "").
		click(action || null).
		appendTo(el);
};

})(jQuery);
//}}}
