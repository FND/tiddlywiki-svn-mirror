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
	this.items = [];
	this.base = "http://api.maps.yahoo.com/Maps/V1/annotatedMaps";
	this.namespace = "yahoo:maps";
	this.params = {
		appid:"SzdB7ATV34GOxwkm9FJKLa8MEcpIX13E0Sbjm.eL1CE7NPnReIlPpvQxqRvptZ7dIQ--",
		xmlsrc:""
	}
};

YahooMapsSimpleAPI.prototype.makeURL = function() {
	var url = this.base;
	return url;
};

YahooMapsSimpleAPI.prototype.makeDataString = function() {
	var data = "";
	this.makeGeoRss();
	for (var i in this.params) {
		data += '&' + i + '=' + encodeURIComponent(this.params[i]);
	}
	return data;
};

YahooMapsSimpleAPI.prototype.addElement = function(tiddler) {
	// makeGeoRss expects:
	// item.title (don't know what to use for this), item.link (missing at the moment), item.desc (missing at the moment, but will be the body of the popup so should be the text of the review)
	// item.streetAddress, item.city, item.country (these are all in the fields)
	var item = {};
	item.title = ""; // fix
	item.link = ""; // fix
	item.desc = ""; // fix
	item.fields = tiddler.fields;
	this.items.push(item);
};

YahooMapsSimpleAPI.prototype.displayMap = function() {
	var ifr = new IFrame();
	console.log(ifr);
	var url = this.makeURL();
	console.log(url);
	var data = this.makeDataString();
	console.log(data);
	var context = {};
	context.ifr = ifr;
	doHttp(url,"POST",data,null,null,null,this.displayMapCallback,context,null,true);
};

YahooMapsSimpleAPI.prototype.displayMapCallback = function(status,context,responseText,url,xhr) {
	var ifr = context.ifr;
	console.log(responseText);
	//ifr.modify(responseText);
};

YahooMapsSimpleAPI.prototype.makeGeoRss = function() {

	var xml = "";
	var items = this.items;
	var namespace = this.namespace;
	if(items.length > 0) {
		xml += "<rss version = '2.0'>\n";
		xml += "<channel xmlns:" + namespace +"='"+this.base+"'>\n";
		xml += "<title>Your DIY City Guide updates</title>\n";
		xml += "<link>http://www.tiddlywiki.com/</link>\n";
		xml += "<description>Locations that you selected to view</description>\n";
		var item = {};
		for(var i=0;i<items.length;i++) {
			item = items[i];
			xml += "<item>\n";
			xml += "<title>" + item.title.htmlEncode() + "</title>\n";
			xml += "<link>" + item.link.htmlEncode() + "</link>\n";
			xml += "<description>" + item.desc.htmlEncode() + "</description>\n";
			xml += "<" + namespace +":Address>" + item.streetAddress.htmlEncode() + "</" +namespace + ":Address>\n";
			xml += "<" + namespace + ":CityState>" + item.city.htmlEncode() + "</" + namespace + ":CityState>\n";
			xml += "<" + namespace + ":Country>" + item.country.htmlEncode() + "</" + namespace + ":Country>\n";
			xml += "</item>\n";
		}
		xml += "</channel>\n";
		xml += "</rss>";
	}
	this.params.xmlsrc = xml;
};

} //# end of 'install only once'
//}}}