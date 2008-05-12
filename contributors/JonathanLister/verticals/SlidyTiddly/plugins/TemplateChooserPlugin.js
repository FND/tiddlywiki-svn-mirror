config.views.editor.templateChooser = {
	popupNone:"There are no templates defined",
	templateTooltip:"Add the template '%0'",
	text:"templates",
	tooltip:"Choose from existing templates to add to this tiddler"
};

config.macros.templateChooser = {};

config.macros.templateChooser.onClick = function(ev)
{
	var e = ev ? ev : window.event;
	if(e.metaKey || e.ctrlKey) stopEvent(e); //# keep popup open on CTRL-click
	var lingo = config.views.editor.templateChooser;
	var popup = Popup.create(this);
	var templates = store.getTaggedTiddlers("template");
	if(templates.length == 0)
		createTiddlyText(createTiddlyElement(popup,"li"),lingo.popupNone);
	for(var t=0; t<templates.length; t++) {
		var template = createTiddlyButton(createTiddlyElement(popup,"li"),templates[t].title,lingo.templateTooltip.format([templates[t].title]),config.macros.templateChooser.onTemplateClick);
		template.setAttribute("template",templates[t].title);
		template.setAttribute("tiddler",this.getAttribute("tiddler"));
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
};

config.macros.templateChooser.onTemplateClick = function(ev)
{
	var e = ev ? ev : window.event;
	var template = this.getAttribute("template");
	var title = this.getAttribute("tiddler");
	var textarea = story.getTiddlerField(title,"text");
	var text = textarea.value;
	if(!readOnly) {
		var template_regex = /(<<templateTiddlers )(\w+)( filter:(?:'|\")[\[\]\w]*(?:'|\")>>)/mg;
		var match = template_regex.exec(text);
		if(match) {
			textarea.value = textarea.value.substring(0,match.index)+match[1]+template+match[3];
		} else {
			textarea.value = text+"\n"+"<<templateTiddlers "+template+" filter:''>>";
		}
		template_regex.lastIndex = 0;
	}
	return false;
};

config.macros.templateChooser.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(tiddler instanceof Tiddler) {
		var lingo = config.views.editor.templateChooser;
		var btn = createTiddlyButton(place,lingo.text,lingo.tooltip,this.onClick);
		btn.setAttribute("tiddler",tiddler.title);
	}
};