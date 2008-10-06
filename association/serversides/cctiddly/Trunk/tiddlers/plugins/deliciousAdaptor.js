function deliciousAdaptor(){}

deliciousAdaptor.prototype = new AdaptorBase();
deliciousAdaptor.mimeType = 'application/json';
deliciousAdaptor.serverType = 'delicious';

// convert short-month string (mmm) to month number (zero-based)
function convertShortMonth(text) {
	for(var i = 0; i < config.messages.dates.shortMonths.length; i++) { // XXX: inefficient!?
		if(text == config.messages.dates.shortMonths[i]) {
			return i;
		}
	}
}

// convert ISO 8601 timestamp to Date instance
function convertISOTimestamp(str) { // TODO: rename
	var components = str.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)/);
	return new Date(components[1], components[2], components[3],
		components[4], components[5], components[6]);
}

deliciousAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	displayMessage("1");
	uri = "release/handle/proxy.php?feed="+uri;
    return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

deliciousAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	displayMessage("2");	
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/v2/json/simonmcmanus?count=15';
	var uri = uriTemplate.format([context.host]);
	var req = deliciousAdaptor.doHttpGET(uri,deliciousAdaptor.getWorkspaceListCallback,context, null, "format=json");
	return typeof req == 'string' ? req : true;
};


deliciousAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
		displayMessage("3");
	displayMessage("tiddler list");
	//	displayMessage("get Tiddler list");
};


deliciousAdaptor.createTiddler = function(data) {
	var date = convertISOTimestamp(data.dt);
	var tiddler = new Tiddler(data.d);
	fields = {};
	fields["server.type"] = "delicious";
	tiddler.set(data.d,data.d,"modifier",date,"",date,fields);
	store.addTiddler(tiddler);
}

function jsonFlickrFeed(o){
	return o; 
}

deliciousAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	var links = eval(" { " + responseText + " } ");
	var i=0;
  while(links[i]){
//	console.log(links[i]);
			deliciousAdaptor.createTiddler(links[i]);
    i++;
  }
//context.userParams.addStep("Flickr Pics Imported","Your Photos have been imported. ");
window.refreshDisplay();
};




config.adaptors[deliciousAdaptor.serverType] = deliciousAdaptor;

