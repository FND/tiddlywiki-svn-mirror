
config.extensions.ServerSideSavingPlugin.reportSuccess = function() {
}



config.extensions.ServerSideSavingPlugin.reportFailed = function(tiddler, context){
	alert('Your changes were not saved');
}


config.macros.saveNotification = {};
config.macros.saveNotification.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	createTiddlyElement(place, "div", "", "savingNotificationsDiv", "STATUS IS : ");
}



