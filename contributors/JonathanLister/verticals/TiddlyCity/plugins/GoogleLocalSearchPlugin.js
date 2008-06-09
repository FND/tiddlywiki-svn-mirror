/***
|''Name:''|GoogleLocalSearchPlugin|
|''Description:''|Pulls the output from a Google Local Search|
|''Author''|JonathanLister|
|''CodeRepository:''|n/a |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

***/

//{{{
if(!version.extensions.GoogleLocalSearchPlugin) {
version.extensions.GoogleLocalSearchPlugin = {installed:true};

var GoogleLocalSearch = function(query,context) {
	this.context = context ? context : {};
	this.base = 'http://ajax.googleapis.com/ajax/services/search/local';
	this.params = {
		v:'1.0'
	};
	if(query && typeof query === 'string') {
		// localize to London
		// another way to do this might be to localize to the last known location
		// alternatively, figure out a better way of setting country via Google's API... if it exists...
		if (query.indexOf('London')===-1) {
			query = query + ', London';
		}
		this.params.q = query;
	}
};

GoogleLocalSearch.prototype.makeURL = function() {
	var url = this.base+'?';
	for (var i in this.params) {
		url += '&' + i + '=' + encodeURIComponent(this.params[i]);
	}
	return url;
};

GoogleLocalSearch.prototype.get = function(callback) {
	var url = this.makeURL();
	var context = this.context ? this.context : {};
	context.callback = callback;
	loadRemoteFile(url,this.getCallback,context);
};

GoogleLocalSearch.prototype.getCallback = function(status,context,responseText,url,xhr) {
	if(!status) {
		displayMessage("error in getCallback: " + xhr.statusText);
	} else {
		var results = eval("("+responseText+")");
		if(results.responseStatus !== 200) {
			displayMessage("error with results from GoogleLocalSearch: "+results.responseDetails);
		} else {
			console.log(results);
			results = results.responseData.results;
			context.callback(results,context);
		}
	}
};

} //# end of 'install only once'
//}}}