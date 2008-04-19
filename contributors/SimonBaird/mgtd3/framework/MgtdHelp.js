
function wikifiedMessage(message) {
	wikify(message,getMessageDiv());
}

merge(config.macros,{

	help: {

		handler: function (place,macroName,params,wikifier,paramString,tiddler) {
			createTiddlyButton(place,"?","help",function() {
				var useThis = params[0]?params[0]:tiddler.title;
				var helpContent = "{{help{\n''~MonkeyGTD Help''\n!"+useThis+"\n"+store.getTiddlerText("MonkeyGTDHelp##"+useThis)+"\n}}}\n";

				// doesn't work at all. I have no idea how to use TW popups apparently ...
				//var popup = Popup.create(place,"div","popupTiddler");
				//wikify(helpContent,popup,null,tiddler);
				//Popup.show();

				// stick with this for now
				clearMessage();
				wikifiedMessage("{{help{\n''~MonkeyGTD Help''\n!"+useThis+"\n"+store.getTiddlerText("MonkeyGTDHelp##"+useThis)+"\n}}}\n");

				return false;
			});
		}
	}

});

