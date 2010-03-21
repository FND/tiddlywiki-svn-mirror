/***
|''Name''|TagsplorerMacro|
|''Description''|tag-based tiddler navigation|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/TagsplorerMacro.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5.0|
|''Keywords''|navigation tagging|
!Usage
{{{
<<tagsplorer [tag] [tag] ... >>
}}}
!!Examples
<<tagsplorer systemConfig>>
!Revision History
!!v0.1 (2010-03-21)
* initial release
!To Do
* interactive tag selection instead of prompt
* refresh handling
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
		delTagTooltip: "remove tag",
		addTagLabel: "new",
		addTagTooltip: "add tag to filter",
		addTagLabel: "new",
		addTagPrompt: "Enter new tag:"
	},

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var tags = params;
		var tiddlers = this.getTiddlers(tags);

		var container = $('<div class="tagsplorer" />').
			append('<ul class="tagSelection" />').
			append('<ul class="tiddlerList" />');

		macro.refreshTags(tags, container);
		macro.refreshTiddlers(tiddlers, container);

		container.appendTo(place);
	},
	addTag: function(ev) {
		var tag = prompt(macro.locale.addTagPrompt);
		if(tag) {
			var btn = $(this);
			var container = btn.closest(".tagsplorer");
			var tags = container.find(".tagSelection").data("tags");
			var tiddlers = container.find(".tiddlerList").data("tiddlers");
			tiddlers = macro.filterTiddlers(tiddlers, tag);
			tags.pushUnique(tag);
			macro.refreshTags(tags, container);
			macro.refreshTiddlers(tiddlers, container);
		}
	},
	delTag: function(ev) {
		var btn = $(this);
		var container = btn.closest(".tagsplorer");
		var tags = container.find(".tagSelection").data("tags");
		tags.remove(btn.text());
		var tiddlers = macro.getTiddlers(tags);
		btn.parent().remove();
		macro.refreshTags(tags, container);
		macro.refreshTiddlers(tiddlers, container);
	},
	refreshTags: function(tags, container) {
		var orig = container.find(".tagSelection");
		var clone = orig.clone().empty();
		clone.data("tags", tags);

		addTag = function(label, tooltip, action) {
			var el = $("<li />").appendTo(clone);
			return $('<a href="javascript:;" />').
				text(label).
				attr("title", tooltip).
				click(action).
				appendTo(el);
		};
		var self = this;
		$.each(tags, function(i, tag) {
			addTag(tag, self.locale.delTagTooltip, self.delTag);
		});
		addTag(this.locale.addTagLabel, this.locale.addTagTooltip, this.addTag).
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
	},
	getTiddlers: function(tags) {
		var tiddlers = store.getTiddlers();
		for(var i = 0; i < tags.length; i++) {
			tiddlers = this.filterTiddlers(tiddlers, tags[i]);
		}
		return tiddlers;
	},
	filterTiddlers: function(collection, tag) {
		return $.map(collection, function(item, i) {
			if(item.tags.contains(tag)) {
				return item;
			}
		});
	}
});

})(jQuery);
//}}}
