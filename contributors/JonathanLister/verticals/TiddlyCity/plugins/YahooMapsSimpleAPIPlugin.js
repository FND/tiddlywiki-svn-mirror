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

config.macros.view.views.text = function(value,place,params,wikifier,paramString,tiddler) {
	if(params[2]=='htmlencoded')
		value = value.htmlEncode();
	if(params[2]=='uriencoded')
		value = encodeURIComponent(value);
	highlightify(value,place,highlightHack,tiddler);
};

var YahooMapsSimpleAPI = function() {
	this.base = "http://api.maps.yahoo.com/Maps/V1/annotatedMaps";
	this.params = {
		appid:"SzdB7ATV34GOxwkm9FJKLa8MEcpIX13E0Sbjm.eL1CE7NPnReIlPpvQxqRvptZ7dIQ--",
		xmlsrc:expandTemplate('GeoRSSTemplateForYahooMapsSimpleAPIPost')
	};
};

YahooMapsSimpleAPI.prototype.makeURL = function() {
	var url = this.base;
	return url;
};

YahooMapsSimpleAPI.prototype.makePostString = function() {
	var data = "";
	var params = [];
	for (var i in this.params) {
		params.push(i+'='+encodeURIComponent(this.params[i]));
	}
	data = params.join('&');
	return data;
};

// alternatively, could display using an iframe...
// although the IFrame library isn't solid yet (9th June)
YahooMapsSimpleAPI.prototype.displayMapUsingForm = function(place) {
	var url = this.makeURL();
	
	var data = this.makePostString();
	//append the form at the end.
	var form = document.createElement('form');
	form.style.display = "none";
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
	
	form.submit();
};

} //# end of 'install only once'
//}}}