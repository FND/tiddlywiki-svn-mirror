//{{{

(function() {

try {
    var pageTracker = _gat._getTracker(store.getTiddlerText("AnalyticsConfig::tracker"));
    pageTracker._trackPageview();
} catch(err) {}

// CustomTracker as a namespace for tracking related functions
var CustomTracker = {};

CustomTracker.track = function() {
   // if (readOnly) {
        try {
            pageTracker._trackPageview.apply(this, arguments);
        } catch(err) {}
   // }
};

// hijack displayTiddler to trigger tracking
var _displayTiddler = Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement, tiddler, template,
        animate, unused, customFields, toggle, animationSrc) {
    // log with the tracker
    CustomTracker.track("/" + tiddler);
    // call the original displayTiddler function
    return _displayTiddler.apply(this,arguments);
};

// Call once for the initial page load
CustomTracker.track();

})();

//}}}