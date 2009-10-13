/* Google Analytics */
$(document).ready(function() {
	var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
	gaJsHost += "google-analytics.com/ga.js";
	var track = function() {
		if(document.location.hostname!=="localhost") {
			try {
				var pageTracker = _gat._getTracker("UA-7537948-1");
				pageTracker._trackPageview();
			} 
			catch(err) {}
		};
	};
	var callback = function() {
		window.setTimeout(track, 100); // Safari 2 and earlier cannot create _gat synchronously
	};
	$.getScript(gaJsHost, callback);
});
