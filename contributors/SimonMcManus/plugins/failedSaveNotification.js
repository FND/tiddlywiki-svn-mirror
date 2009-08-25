
config.extensions.ServerSideSavingPlugin.reportSuccess = function() {
}

config.extensions.ServerSideSavingPlugin.reportFailure = function(tiddler, context){
	jQuery.modal.show("Your changes were not saved.");
}

/*
config.macros.saveNotification.displayStatus = function(dirty) {
	if(dirty) {
			$('.savingNotificationsDiv').css('background', 'red');
	} else {
			$('.savingNotificationsDiv').css('background', 'green');
	}
};

config.macros.saveNotification = {};
config.macros.saveNotification.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	createTiddlyElement(place, "div", "", "savingNotificationsDiv", "STATUS IS : ");
	config.macros.saveNotification.displayStatus(store.isDirty());
};

var original = TiddlyWiki.prototype.setDirty;
TiddlyWiki.prototype.setDirty = function(dirty) {
	original.apply(arguments);
	config.macros.saveNotification.displayStatus(dirty);
};

*/
