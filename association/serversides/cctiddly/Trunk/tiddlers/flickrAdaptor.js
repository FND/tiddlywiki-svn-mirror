function flickrAdaptor(){}

flickrAdaptor.prototype = new AdaptorBase();
flickrAdaptor.mimeType = 'application/json';
flickrAdaptor.serverType = 'flickr';



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
		var date = "";
		var tiddler = new Tiddler(i.title);
		tiddler.set(i.title,"[img["+ i.title +"|"+ i.media.m+"]]","modifier",date,"",date,"");
		store.addTiddler(tiddler);
	    displayMessage("<img src=" + i.media.m + " alt=" + i.title +">’");
		console.log(tiddler);
	
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

