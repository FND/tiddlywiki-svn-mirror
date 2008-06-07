/***
|''Name:''|DapperPlugin|
|''Description:''|Pulls the output from a dapp|
|''Author''|JonathanLister|
|''CodeRepository:''|n/a |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

***/

//{{{
if(!version.extensions.DapperPlugin) {
version.extensions.DapperPlugin = {installed:true};

var Dapper = function(params) {
	this.base = 'http://www.dapper.net/transform.php';
	this.params = params ? params : {};
};

Dapper.prototype.makeURL = function(params) {
	var url = this.base+'?';
	for (var i in params) {
		url += '&' + i + '=' + encodeURIComponent(params[i]);
	}
	console.log(url);
	return url;
};

Dapper.prototype.get = function(callback) {
	var url = this.makeURL(this.params);
	loadRemoteFile(url,this.getCallback,callback);
};

Dapper.prototype.getCallback = function(status,callback,responseText,url,xhr) {
	if(!status) {
		displayMessage("error in getCallback: " + xhr.statusText);
	} else {
		var results = eval("("+responseText+")");
		results = results.groups.result;
		callback(results);
	}
};

} //# end of 'install only once'
//}}}