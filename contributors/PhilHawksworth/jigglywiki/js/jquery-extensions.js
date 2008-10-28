// Replace the $ alias with js for greater compatibility.
var jq = jQuery.noConflict();

var loadJQueryExtensions = function() {
	jQuery.fn.reverse = Array.prototype.reverse;	
};