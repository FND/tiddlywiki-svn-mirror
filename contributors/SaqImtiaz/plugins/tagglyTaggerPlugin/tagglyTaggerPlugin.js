config.macros.tagglyTagger = {

	arrow : (document.all ? "\u25bc" : "\u25be"),
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		var p = paramString.parseParams('test', null, true);
		var tag = getParam(p,'tag',undefined);
		if (!tag ||!store.getTiddler(tiddler.title))
			return;
		var label = getParam(p,'label',tag);
		var tooltip = getParam(p,'tooltip',tag);
		var btn = createTiddlyButton(place,label + ": " + this.arrow,tooltip,this.onClick,"tagglyTagger button");
		btn.setAttribute("tag",tag);
	},
	
	onClick : function(ev){
		var e = ev ? ev : window.event;
		var popup = Popup.create(this);
		var tiddler = store.getTiddler(story.findContainingTiddler(this).getAttribute("tiddler"));
		var tags = store.getTaggedTiddlers(this.getAttribute("tag")).map(function(t){return t.title;});
		
		function getLabel(tag){
			if(tiddler.tags.contains(tag))
				var label = "[ ] " + tag;
			else
				var label = "[x] " + tag;
			return label; 
		}
		
		if(!tags.length)
			createTiddlyText(createTiddlyElement(popup,"li"),('no ' + this.getAttribute('tag')));		
		
		for (var s=0; s<tags.length; s++){
			var btn = createTiddlyButton(createTiddlyElement(popup,"li"),getLabel(tags[s]), "toggle '" + tags[s] + "'", config.macros.tagglyTagger.onTagClick,"tagglyTaggerTag button");
			btn.setAttribute("tag",tags[s]);
			btn.setAttribute("tiddler",tiddler.title);
		}
		Popup.show(popup,false);
		stopEvent(e);
		return false;
	},
	
	onTagClick : function(ev){
		var tag = this.getAttribute("tag");
		var tiddler = store.getTiddler(this.getAttribute("tiddler"));
		if(tiddler.isTagged(tag))
			tiddler.tags.remove(tag);
		else
			tiddler.tags.pushUnique(tag);
		store.notify(tiddler.title,true);
		return false;
	}
};

setStylesheet(".viewer .button.tagglyTagger {padding : 0em; font-size:100%; font-weight:bold;} .button.tagglyTaggerTag {padding:0.2em; font-weight:bold;}","tagglyTaggerStyles");
