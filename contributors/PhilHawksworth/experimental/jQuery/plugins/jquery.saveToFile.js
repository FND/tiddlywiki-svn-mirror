/*

FILE: jquery.saveToFile.js
DATE: Oct 3rd 2008
AUTHORS: Phil Hawksworth. [http://hawksworx.com]
DESCRIPTION: Enable write access to the filesystem for local file saving.
NOTES: For a good breakdown of an excellent design pattern for jQuery plugins see http://www.learningjquery.com/2007/10/a-plugin-development-pattern

USAGE:

// Save changes to anything in the page body using the default settings.
$('body').saveToFile();

// Save changes to a div with an id of 'store', overriding any of the default settings.
$('#store').saveToFile({
	path: 'PATH',
	filename: 'FILENAME',
	backup: true|false,
	silent: true|false
});

// change a default setting for easier custom behavior.
$.fn.saveToFile.default.filename = 'fileName.html';

*/

	
(function($) {
	
	// plugin definition
	$.fn.saveToFile = function(options) {
		var opts = $.extend({}, $.fn.saveToFile.defaults, options);
		
		log("Saving ", this, opts);
		

		
		// Use existing TW code.
		// This needs to be refactored and incorporated here.
		saveChanges();
		
	};
	
	// plugin defaults.
	$.fn.saveToFile.defaults = {
		path: '/how/far/can/we/reach?/',
		filename: 'fileName.html',
		backup: true,
		silent: false
	};	
	
	// Private functions.
	function log() {
		if (window.console && window.console.log)
			window.console.log(arguments);
	};

})(jQuery);