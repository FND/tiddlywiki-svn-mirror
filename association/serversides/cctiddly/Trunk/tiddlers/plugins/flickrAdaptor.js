/***
|''Name''|flickrAdaptor|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|0.1|

!Code

***/
//{{{

function flickrAdaptor(){}

flickrAdaptor.prototype = new AdaptorBase();
flickrAdaptor.mimeType = 'application/json';
flickrAdaptor.serverType = 'flickr';

// convert short-month string (mmm) to month number (zero-based)
function convertShortMonth(text){
	for(var i = 0; i < config.messages.dates.shortMonths.length; i++) { // XXX: inefficient!?
		if(text == config.messages.dates.shortMonths[i]) {
			return i;
		}
	}
}

flickrAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password){
	uri = window.url+"/handle/proxy.php?feed="+uri;
    return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

flickrAdaptor.prototype.getWorkspaceList = function(context,userParams,callback){
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/services/feeds/photos_public.gne?ids=22127230@N08&format=json';
	var uri = uriTemplate.format([context.host]);
	var req = flickrAdaptor.doHttpGET(uri,flickrAdaptor.getWorkspaceListCallback,context, null, "format=json");
	return typeof req == 'string' ? req : true;
};

function createTiddler(i){
	var date = convertISOTimestamp1(i.published);
	var tiddler = new Tiddler(i.title);
	fields = {};
	fields["server.type"] = "flickr";
	tiddler.set(i.title, i.media.m,"modifier",date,"",date,fields);
	store.addTiddler(tiddler);
}

function jsonFlickrFeed(o){
	return o; 
}

flickrAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr){
	var pics = eval(" { " + responseText + " } ");
	var i=0;
  	while(pics.items[i]){
		createTiddler(pics.items[i]);
		i++;
	}
	window.refreshDisplay();
};

config.adaptors[flickrAdaptor.serverType] = flickrAdaptor;
//}}}