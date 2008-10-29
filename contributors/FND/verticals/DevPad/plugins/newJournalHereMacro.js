/***
!Usage
{{{
<<newJournalHere>>
}}}
<<newJournalHere>>
***/
//{{{
config.macros.newJournalHere = {
	label: "new journal",
	prompt: "Create a new tiddler from the current date and time",
	accessKey: "J"
}

config.macros.newJournalHere.handler = function(place, macroName, params, wikifier, paramString, tiddler)
{
	if(!readOnly) {
		params = paramString.parseParams("anon", null, true, false, false);
		var title = params[1] && params[1].name == "anon" ? params[1].value : config.macros.timeline.dateFormat;
		title = getParam(params,"title",title);
		title = tiddler.title + title;
		config.macros.newTiddler.createNewTiddlerButton(place,title,params,this.label,this.prompt,this.accessKey,"text",true);
	}
};
//}}}