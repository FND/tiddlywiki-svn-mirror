
var oldEditHandler = config.macros.edit.handler;
config.macros.edit.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(tiddler.isTagged('task'))
		config.macros.editHtml.handler(place,macroName,params,wikifier,paramString,tiddler);
	else
 		oldEditHandler(place,macroName,params,wikifier,paramString,tiddler);
};

