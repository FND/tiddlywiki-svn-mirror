/*

(function() {
var original = TiddlyWiki.prototype.setDirty;
TiddlyWiki.prototype.setDirty = function(dirty) {
	original.apply(arguments);
	if(dirty) {
			$('.savingNotificationsDiv').css('background', 'red');
	} else {
			$('.savingNotificationsDiv').css('background', 'green');
	}
};
})();


*/