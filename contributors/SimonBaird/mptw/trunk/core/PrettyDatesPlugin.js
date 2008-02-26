/***
|Name|PrettyDatesPlugin|
|Source|http://prettydatesplugin.tiddlyspot.com|
If you want to you can rename this plugin. :) Some suggestions: LastUpdatedPlugin, RelativeDatesPlugin, SmartDatesPlugin, SexyDatesPlugin.
Inspired by this:
http://ejohn.org/files/pretty.js
***/
Date.prototype.prettyDate = function() {
	var diff = (((new Date()).getTime() - this.getTime()) / 1000);
	var day_diff = Math.floor(diff / 86400);

	if (isNaN(day_diff))      return "";
	else if (diff < 0)        return "in the future";
	else if (diff < 60)       return "just now";
	else if (diff < 120)      return "1 minute ago";
	else if (diff < 3600)     return Math.floor(diff/60) + " minutes ago";
	else if (diff < 7200)     return "1 hour ago";
	else if (diff < 86400)    return Math.floor(diff/3600) + " hours ago";
	else if (day_diff == 1)   return "Yesterday";
	else if (day_diff < 7)    return day_diff + " days ago";
	else if (day_diff < 14)   return  "a week ago";
	else if (day_diff < 31)   return Math.ceil(day_diff/7) + " weeks ago";
	else if (day_diff < 62)   return "a month ago";
	else if (day_diff < 365)  return "about " + Math.ceil(day_diff/31) + " months ago";
	else if (day_diff < 730)  return "a year ago";
	else                      return Math.ceil(day_diff/365) + " years ago";
}



Date.prototype.formatString_orig_mptw = Date.prototype.formatString;

Date.prototype.formatString = function(template) {
	return this.formatString_orig_mptw(template).replace(/pppp/,this.prettyDate());
}


// for mptw. otherwise edit your ViewTemplate as required.
config.mptwDateFormat = 'pppp (MM/0DD/YY)'; 
// config.mptwDateFormat = 'pppp'; 


//}}}

