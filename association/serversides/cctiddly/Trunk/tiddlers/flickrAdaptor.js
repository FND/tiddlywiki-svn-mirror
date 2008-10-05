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
	console.log(components);
	return new Date(components[1], components[2], components[3],
		components[4], components[5], components[6]);
}


flickrAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
		uri = "release/handle/proxy.php?feed="+uri;
	    return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

flickrAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
 	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/services/feeds/photos_public.gne?format=json&ids=22127230@N08';
	var uri = uriTemplate.format([context.host]);
	var req = flickrAdaptor.doHttpGET(uri,flickrAdaptor.getWorkspaceListCallback,context);
	return typeof req == 'string' ? req : true;
};


function createTiddler(i){

	console.log(i.published)

		var date = convertISOTimestamp(i.published);
//	var date = "";
		var tiddler = new Tiddler(i.title);
		tiddler.set(i.title,"[img["+ i.title +"|"+ i.media.m+"]]","modifier",date,"",date,"");
		store.addTiddler(tiddler);
	    displayMessage("<img src=" + i.media.m + " alt=" + i.title +">’");
	
}

function jsonFlickrFeed(o){

	return o; 
 var i=0;
  while(o.items[i]){
	createTiddler(o.items[i]);
    i++;
  }
}




flickrAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	var pics = eval(" { " + responseText + " } ");
	var i=0;
  while(pics.items[i]){
	createTiddler(pics.items[i]);
    i++;
  }
};




config.adaptors[flickrAdaptor.serverType] = flickrAdaptor;

