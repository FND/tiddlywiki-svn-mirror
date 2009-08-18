(function() {
var original = TiddlyWiki.prototype.setDirty;
TiddlyWiki.prototype.setDirty = function(dirty) {
	console.log('before', dirty);
	original.apply(this, arguments);
	console.log('after', dirty);
	if(dirty) {
			console.log('reddush');
			$('.savingNotificationsDiv').css('background', 'red');
	} else {
			$('.savingNotificationsDiv').css('background', 'green');
	}
};
})();