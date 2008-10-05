function flickrAdaptor(){}

flickrAdaptor.prototype = new AdaptorBase();
flickrAdaptor.mimeType = 'application/json';
flickrAdaptor.serverType = 'flickr';



flickrAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
		uri = "release/handle/proxy.php?feed="+uri;
		displayMessage(uri);
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

function jsonFlickrFeed(o){
  var i=0;
  while(o.items[i]){
		
		//tiddler.created = convertTimestamp(timestamp).convertToLocalYYYYMMDDHHMM().toString();
		
		var d = new Date();
			d.setTime(Date.parse(o.items[i].published));
			//d = d.convertToYYYYMMDDHHMM(); 
		var date = d;
		tiddler.set(o.items[i].title,"[img["+ o.items[i].title +"|"+ o.items[i].media.m+"]]","modifier",date,"",date,"");
		store.addTiddler(tiddler);
		console.log(o.items[i]);	
    i++;
  }
}


flickrAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	eval(" { " + responseText + " } ");
};




config.adaptors[flickrAdaptor.serverType] = flickrAdaptor;

