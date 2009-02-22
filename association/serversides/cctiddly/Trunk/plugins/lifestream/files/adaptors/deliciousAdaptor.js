/***
|''Name''|deliciousAdaptor|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|0.1|

!Code

***/
//{{{

function deliciousAdaptor(){}
deliciousAdaptor.prototype = new AdaptorBase();
deliciousAdaptor.mimeType = 'application/json';
deliciousAdaptor.serverType = 'delicious';

// convert ISO 8601 timestamp to Date instance
function convertISOTimestamp1(str) { // TODO: rename
	var components = str.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)/);
	return new Date(components[1], components[2] - 1, components[3], components[4], components[5], components[6]);
}

deliciousAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password){
	uri = window.url+"/handle/proxy.php?feed="+uri;
    return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

deliciousAdaptor.prototype.getWorkspaceList = function(context,userParams,callback){
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0?count=15';
	var uri = uriTemplate.format([context.host]);
	var req = deliciousAdaptor.doHttpGET(uri,deliciousAdaptor.getWorkspaceListCallback,context, null, "format=json");
	return typeof req == 'string' ? req : true;
};

deliciousAdaptor.createTiddler = function(data) {
	if(!context)
		var context = {};
	var date = convertISOTimestamp1(data.dt);
	var tiddler = new Tiddler(data.d);
	fields = {};
	fields["original_server.type"] = "delicious";
	fields["prettyDate"] = humane_date(date);
	tiddler.set(data.d,data.u+"\n\rTags:"+data.t,"modifier",date,"",date, merge(fields, config.defaultCustomFields));
	store.addTiddler(tiddler);
	if(context.save==true)
		store.saveTiddler(data.d, data.d, data.u, "ccTiddly", date, "lifestream", merge(fields, config.defaultCustomFields));					
}

deliciousAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr){
	try {
		var links = eval(" { " + responseText + " } ");
	} catch(ex) {
		displayMessage("Delicious could not be contacted");
		return false;
	}
	var i=0;
	while(links[i]){
		deliciousAdaptor.createTiddler(links[i]);
    i++;
	}
	window.refreshDisplay();
};
config.adaptors[deliciousAdaptor.serverType] = deliciousAdaptor;
//}}}