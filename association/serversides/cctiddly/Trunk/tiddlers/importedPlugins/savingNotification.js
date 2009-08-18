/*

config.extensions = {
	saveTiddlerRequestSent : function() {
		if(store.isDirty() == true)
			$('.savingNotificationsDiv').css('background', 'red');
		else {
			$('.savingNotificationsDiv').css('background', 'green');
		}
	},
	saveTiddlerResponseReceived : function() {
		if(store.isDirty() == true)
			$('.savingNotificationsDiv').css('background', 'red');
		else {
			$('.savingNotificationsDiv').css('background', 'green');
		}
	}
}

*/
config.extensions.ServerSideSavingPlugin.reportSuccess = function() {
	alert('boo');
}


config.macros.saveNotification = {};
config.macros.saveNotification.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	createTiddlyElement(place, "div", "", "savingNotificationsDiv", "STATUS IS : ");
}



