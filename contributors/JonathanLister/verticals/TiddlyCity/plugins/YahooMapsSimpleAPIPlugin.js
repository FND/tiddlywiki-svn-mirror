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
	};
};

YahooMapsSimpleAPI.prototype.makeURL = function() {
	var url = this.base;
	return url;
};

YahooMapsSimpleAPI.prototype.makeDataString = function() {
	var data = "";
	var params = [];
	this.makeGeoRss();
	for (var i in this.params) {
		params.push(i+'='+encodeURIComponent(this.params[i]));
	}
	data = params.join('&');
	return data;
};

YahooMapsSimpleAPI.prototype.addElement = function(tiddler) {
	// makeGeoRss expects:
	// item.title (don't know what to use for this), item.link (missing at the moment), item.desc (missing at the moment, but will be the body of the popup so should be the text of the review)
	// item.streetAddress, item.city, item.country (these are all in the fields)
	var item = {};
	item.title = store.getTiddlerSlice(tiddler.title,"from");
	item.link = "http://www.google.com/?q="+encodeURIComponent(store.getTiddlerSlice(tiddler.title,"from"));
	item.desc = store.getTiddlerSlice(tiddler.title,"tweet");
	item.fields = tiddler.fields;
	item.person = store.getTiddlerSlice(tiddler.title,"by");
	this.items.push(item);
};

// I don't really like this way of displaying the map, would rather edit the iframe directly...
// YahooMapsSimpleAPI.prototype.displayMap needs to be fixed, although the IFrame library isn't solid yet (9th June)
YahooMapsSimpleAPI.prototype.displayMapUsingForm = function(place) {
	var url = this.makeURL();
	var data = this.makeDataString();
	//append the form at the end.
	var form = document.createElement('form');
	form.style.visibility = "hidden";
	place.appendChild(form);
	form.setAttribute('name','YahooMapsRequestForm');
	form.setAttribute('action',url);
	form.setAttribute('onSubmit','doSubmit()');
	form.setAttribute('method','POST');
	//form.setAttribute('target','ResultsIFrame');
	form.setAttribute('target','_blank');
	
	var appid = document.createElement('input');
	form.appendChild(appid);
	appid.setAttribute('type','hidden');
	appid.setAttribute('id','appid');
	appid.setAttribute('name','appid');
	appid.setAttribute('value',this.params.appid);
	
	var xml = document.createElement('input');
	form.appendChild(xml);
	xml.setAttribute('type','hidden');
	xml.setAttribute('id','xmlsrc');
	xml.setAttribute('name','xmlsrc');
	xml.setAttribute('value',this.params.xmlsrc);
	
	var submit = document.createElement('input');
	submit.setAttribute('type','submit');
	submit.setAttribute('value','View on Y! Maps');
	form.appendChild(submit);
	
	var ifr = new IFrame(place,'ResultsIFrame');
	form.submit();
	console.log(ifr);
	ifr.style.width = "100%";
	ifr.style.height = "800px";
};

YahooMapsSimpleAPI.prototype.displayMap = function(place) {
	var ifr = new IFrame(place);
	console.log(ifr);
	var url = this.makeURL();
	console.log(url);
	var data = this.makeDataString();
	console.log(data);
	var context = {};
	context.ifr = ifr;
	doHttp("POST",url,data,null,null,null,YahooMapsSimpleAPI.displayMapCallback,context,null,true);
};

YahooMapsSimpleAPI.displayMapCallback = function(status,context,responseText,url,xhr) {
	var ifr = context.ifr;
	console.log(responseText);
	//ifr.modify(responseText);
	ifr.doc.documentElement.innerHTML = responseText;
	ifr.style.width = "100%";
	ifr.style.height = "600px";
	//ifr.style.height = ifr.f....
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
		var fields = {};
		var iconURL = "";
		for(var i=0;i<items.length;i++) {
			item = items[i];
			fields = item.fields;
			iconURL = fields.iconUrl;
			xml += "<item>\n";
			xml += "<title>" + item.title.htmlEncode() + "</title>\n";
			xml += "<link>" + item.link.htmlEncode() + "</link>\n";
			xml += "<description>" + item.desc.htmlEncode() + "</description>\n";
			// xml += "<" + namespace +":Address>" + fields.streetAddress.htmlEncode() + "</" +namespace + ":Address>\n";
			// xml += "<" + namespace + ":CityState>" + fields.city.htmlEncode() + "</" + namespace + ":CityState>\n";
			// xml += "<" + namespace + ":Country>" + fields.country.htmlEncode() + "</" + namespace + ":Country>\n";
			xml += "<geo:lat>" + fields.lat.htmlEncode() + "</geo:lat>\n";
			xml += "<geo:long>" + fields.lng.htmlEncode() + "</geo:long>\n";
			xml += "<" + namespace +":BaseIcon>" + iconURL + "</" + namespace + ":BaseIcon>\n";
			xml += "</item>\n";
		}
		xml += "</channel>\n";
		xml += "</rss>";
	}
	this.params.xmlsrc = xml;
	console.log("end of makeGeoRss: ",this.params.xmlsrc);
};

} //# end of 'install only once'
//}}}