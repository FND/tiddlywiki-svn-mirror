/***
|''Name:''|YahooMapsSimpleAPIPlugin|
|''Description:''|Displays GeoRSS-encoded content on a Yahoo! Map inside an IFrame|
|''Author''|JonathanLister|
|''CodeRepository:''|n/a |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

***/

//{{{
if(!version.extensions.YahooMapsSimpleAPIPlugin) {
version.extensions.YahooMapsSimpleAPIPlugin = {installed:true};

var YahooMapsSimpleAPI = function(query,context) {
	this.geoRssXML = "";
	this.base = "http://api.maps.yahoo.com/Maps/V1/annotatedMaps";
	this.appid = "SzdB7ATV34GOxwkm9FJKLa8MEcpIX13E0Sbjm.eL1CE7NPnReIlPpvQxqRvptZ7dIQ--";
};

YahooMapsSimpleAPI.prototype.makeURL = function() {
	var url = this.base+'?';
	for (var i in this.params) {
		url += '&' + i + '=' + encodeURIComponent(this.params[i]);
	}
	return url;
};

YahooMapsSimpleAPI.prototype.addElement = function(fields) {

};

YahooMapsSimpleAPI.prototype.createGeoRss = function(fields) {
	// NOTE: can get a lot of the code from http://developer.yahoo.com/maps/simple/V1/jspost.js
	// create the geoRss wrapper
	// loop through the geoRss elements
};

YahooMapsSimpleAPI.prototype.displayMap = function() {
	// bring in the IFrame plugin
	// make POST to this.makeURL() with this.geoRssXML as the data
	// set responseText to the IFrame contents using ifr.modify(html)
};

} //# end of 'install only once'
//}}}