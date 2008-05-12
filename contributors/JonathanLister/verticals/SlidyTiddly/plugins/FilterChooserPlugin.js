config.views.editor.filterChooser = {
	popupNone:"There are no tags defined",
	tagTooltip:"Add the tag '%0'",
	text:"filters",
	tooltip:"Choose from existing tags to add to this filter"
};

config.macros.filterChooser = {};

config.macros.filterChooser.onClick = function(ev)
{
	var e = ev ? ev : window.event;
	if(e.metaKey || e.ctrlKey) stopEvent(e); //# keep popup open on CTRL-click
	var lingo = config.views.editor.filterChooser;
	var popup = Popup.create(this);
	var tags = store.getTags();
	if(tags.length == 0)
		createTiddlyText(createTiddlyElement(popup,"li"),lingo.popupNone);
	for(var t=0; t<tags.length; t++) {
		var tag = createTiddlyButton(createTiddlyElement(popup,"li"),tags[t][0],lingo.tagTooltip.format([tags[t][0]]),config.macros.filterChooser.onTagClick);
		tag.setAttribute("tag",tags[t][0]);
		tag.setAttribute("tiddler",this.getAttribute("tiddler"));
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
};

config.macros.filterChooser.onTagClick = function(ev)
{
	var e = ev ? ev : window.event;
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	var textarea = story.getTiddlerField(title,"text");
	var text = textarea.value;
	if(!readOnly) {
		var tag_regex_no_filter = /(<<templateTiddlers \w+ filter:['|\"])(['|\"]>>)/mg;
		var tag_regex = /(<<templateTiddlers \w+ filter:['|\"]\[tag\[)([\[\]\w]*)(\]\]['|\"]>>)/mg;
		var match = tag_regex_no_filter.exec(text);
		if(match) {
			textarea.value = textarea.value.substring(0,match.index)+match[1]+"[tag["+tag+"]]"+match[2];
		} else {
			match = tag_regex.exec(text);
			if(match) {
				textarea.value = textarea.value.substring(0,match.index)+match[1]+tag+match[3];
			} else {
				textarea.value = text+"\n"+"<<templateTiddlers template filter:'[tag["+tag+"]]'>>";
			}
			tag_regex.lastIndex = 0;
		}
		tag_regex_no_filter.lastIndex = 0;
	}
	return false;
};

config.macros.filterChooser.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(tiddler instanceof Tiddler) {
		var lingo = config.views.editor.filterChooser;
		var btn = createTiddlyButton(place,lingo.text,lingo.tooltip,this.onClick);
		btn.setAttribute("tiddler",tiddler.title);
	}
};