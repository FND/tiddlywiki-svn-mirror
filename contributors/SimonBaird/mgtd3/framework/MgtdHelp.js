
function wikifiedMessage(message) {
	wikify(message,getMessageDiv());
}

merge(config.macros,{

	help: {

		handler: function (place,macroName,params,wikifier,paramString,tiddler) {
			createTiddlyButton(place,"?","help",function() {
				clearMessage();
				wikifiedMessage("@@font-size:80%;''~MonkeyGTD Help''@@\n!"+tiddler.title+"\n"+store.getTiddlerText("MonkeyGTDHelp##"+tiddler.title));
			});
		}
	}

});

