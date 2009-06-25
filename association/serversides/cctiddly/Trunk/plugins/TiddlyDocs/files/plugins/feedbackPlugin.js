
config.macros.feedbackPlugin = {};
config.macros.feedbackPlugin.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var uri = config.defaultCustomFields['server.host']+'handle/proxy.php?feed=http://tiddlydocs.com/handle/listTiddlers.php?workspace=feedback';
	var context = {};
	var req = httpReq('GET', uri,config.macros.feedbackPlugin.getTiddlerListCallback);
} 



config.macros.feedbackPlugin.getTiddlerListCallback = function(status,context,responseText,uri,xhr){
	try{
		eval('var tiddlers=' + responseText);
	}catch (ex){
		alert("feedback is not available.");
	}
	for(var i=0; i < tiddlers.length; i++){
		console.log(tiddlers[i].title);
		var uri = config.defaultCustomFields['server.host']+'handle/proxy.php?feed=http://tiddlydocs.com/handle/getTiddler.php?workspace=feedback&title='+tiddlers[i].title;
		var req = httpReq('GET', uri,config.macros.feedbackPlugin.getTiddlerCallback);
	}
};

config.macros.feedbackPlugin.getTiddlerCallback = function(status,context,responseText,uri,xhr){
	console.log(responseText);
}
