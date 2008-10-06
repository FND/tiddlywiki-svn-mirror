function flickrAdaptor(){}

flickrAdaptor.prototype = new AdaptorBase();
flickrAdaptor.mimeType = 'application/json';
flickrAdaptor.serverType = 'flickr';


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

flickrAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	uri = "/release/release/handle/proxy.php?feed="+uri;
    return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

flickrAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/services/feeds/photos_public.gne?ids=22127230@N08&format=json';
	var uri = uriTemplate.format([context.host]);
	var req = flickrAdaptor.doHttpGET(uri,flickrAdaptor.getWorkspaceListCallback,context, null, "format=json");
	return typeof req == 'string' ? req : true;
};


flickrAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	displayMessage("tiddler list");
	//	displayMessage("get Tiddler list");
};

function createTiddler(i){
	var date = convertISOTimestamp(i.published);
	var tiddler = new Tiddler(i.title);
	fields = {};
	fields["server.type"] = "flickr";
	tiddler.set(i.title,"[img["+ i.title +"|"+ i.media.m+"]]","modifier",date,"",date,fields);
	store.addTiddler(tiddler);
}

function jsonFlickrFeed(o){
	return o; 
}

flickrAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	var pics = eval(" { " + responseText + " } ");
	var i=0;
  while(pics.items[i]){
		createTiddler(pics.items[i]);
    i++;
  }
//context.userParams.addStep("Flickr Pics Imported","Your Photos have been imported. ");
window.refreshDisplay();
};




config.adaptors[flickrAdaptor.serverType] = flickrAdaptor;

