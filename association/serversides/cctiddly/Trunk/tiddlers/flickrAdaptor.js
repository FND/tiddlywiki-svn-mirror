function twitterAdaptor(){}

twitterAdaptor.prototype = new AdaptorBase();
twitterAdaptor.mimeType = 'application/json';
twitterAdaptor.serverType = 'twitter';



// Thanks to FND for this fuction.
function convertShortMonth(text) {
    for(var i = 0; i < config.messages.dates.shortMonths.length; i++) { // XXX: inefficient!?
        if(text == config.messages.dates.shortMonths[i]) {
            return i;
        }
    }
}

// convert "mmm 0DD 0hh:0mm:0ss +0000 YYYY" to Date instance
function convertTimestamp(str) { // TODO: rename
	var components = timestamp.match(/(\w+) (\d+) (\d+):(\d+):(\d+) \+\d+ (\d+)/);
	return new Date(components[6], convertShortMonth(components[1]), components[2],
		components[3], components[4], components[5]);
}



twitterAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	    return doHttp('GET',"release/handle/proxy.php?feed="+uri,data,contentType,username,password,callback,params,headers);
};

twitterAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	 console.log(context);
 	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/statuses/user_timeline/simonmcmanus.json';
	var uri = uriTemplate.format([context.host]);
	var req = twitterAdaptor.doHttpGET(uri,twitterAdaptor.getWorkspaceListCallback,context, {'accept':twitterAdaptor.mimeType});
	return typeof req == 'string' ? req : true;
};

twitterAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	eval('var tweets=' + responseText);
	var list = [];
	for (var i=0; i < tweets.length; i++) {
		var tiddler = new Tiddler(tweets[i]['id']);
		tiddler.text = tweets[i]['text'];
		tiddler.modified = convertTimestamp(tweets[i]['created_at']).toString()
		tiddler.created = convertTimestamp(tweets[i]['created_at']).toString()
		store.addTiddler(tiddler);
	}			
	context.tiddlers = list;
	context.status = true;		
};




config.adaptors[twitterAdaptor.serverType] = twitterAdaptor;

