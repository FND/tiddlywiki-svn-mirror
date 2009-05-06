//{{{

// CustomTracker as a namespace for tracking related functions
var CustomTracker = {
	// store a reference to the original displayTiddler function
	displayTiddler: story.displayTiddler,
	// initialise the Google tracker - specify your account number here!
	pageTracker: _gat._getTracker("UA-8645534-1")
};

CustomTracker.track = function(path) {
	if (document.location.protocol == "http:" || document.location.protocol == "https:") {
		this.pageTracker._trackPageview(path);
	}
};

CustomTracker.trackAndDisplayTiddler = function(srcElement, t) {
	// cope whether a tiddler or a string is passed
	var title = t.title || t;
	// log with the tracker
	CustomTracker.track('/' + title);
	// call the original displayTiddler function
	CustomTracker.displayTiddler.apply(this,arguments);
};

// replace the default displayTiddler function with a tracking version
story.displayTiddler = CustomTracker.trackAndDisplayTiddler;

// Call once for the initial page load
CustomTracker.track();
//}}}