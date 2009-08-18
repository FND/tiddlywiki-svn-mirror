store.setDirty(true);
(function() {
var original = TiddlyWiki.prototype.setDirty;
TiddlyWiki.prototype.setDirty = function(dirty) {
	
	console.log('before', dirty, arguments);
	original.apply(arguments);
	console.log('after', dirty);
	if(dirty) {
			$('.savingNotificationsDiv').css('background', 'red');
	} else {
			$('.savingNotificationsDiv').css('background', 'green');
	}
};
})();