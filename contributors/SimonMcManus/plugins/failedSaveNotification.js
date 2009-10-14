/***
|''Requires''|[[ServerSideSavingPlugin]]|

!Code
***/
//{{{
	
	
config.extensions.ServerSideSavingPlugin.reportSuccess = function() {
}

config.extensions.ServerSideSavingPlugin.reportFailure = function(msg, tiddler, context){
	if(context.httpStatus == 403)
		jQuery.modal.show("Your changes were not saved. Your session may have expired. Please try logging in again.");
	else 
		jQuery.modal.show("Your changes were not saved.");
	jQuery('.savingNotificationsDiv').html('Some changes were not saved. Please refresh the page.');
}


config.macros.saveNotification = {};

config.macros.saveNotification.displayStatus = function(dirty) {
	if(dirty) {
			jQuery('.savingNotificationsDiv').show();
	} else {
			jQuery('.savingNotificationsDiv').hide();
	}
};

config.macros.saveNotification.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var div = createTiddlyElement(place, "div", "", "savingNotificationsDiv", "");
	config.macros.saveNotification.displayStatus(store.isDirty());
};

var original = TiddlyWiki.prototype.setDirty;
TiddlyWiki.prototype.setDirty = function(dirty) {
	original.apply(arguments);
	config.macros.saveNotification.displayStatus(dirty);
};



//}}}