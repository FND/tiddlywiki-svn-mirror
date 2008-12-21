//{{{
if(!version.extensions.PumpMessagesPlugin) {
version.extensions.PumpMessagesPlugin = {installed:true};

pumpMessages = function(q){
	displayMessage(q.shift());
	if(q.length){
		setTimeout(function(){pumpMessages(q);},900);
	}
};

setTimeout(function(){pumpMessages([
	"This is a demonstration",
	"of the FadingMessagesPlugin",
	"in ''action'' ..",
	"The messages should disappear",
	"automatically",
	"Fading away, by themselves",
	"You can also click on the cross and delete messages,",
	"if you want",
	"The length of time beofore the message disappears is an option.",
	"See the FadingMessagesPlugin tiddler for more details.",
	]);},3000);

}
//}}}
