
config.extensions.ServerSideSavingPlugin.reportSuccess = function() {
	alert('boo');
}

config.macros.saveNotification = {};
config.macros.saveNotification.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	createTiddlyElement(place, "div", "", "savingNotificationsDiv", "STATUS IS : ");
}



