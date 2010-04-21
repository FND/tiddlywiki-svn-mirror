/***
|''Name''|flickrAdaptor|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|0.1|

!Code

***/
//{{{
	
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
	var components = str.match(/(\w+) (\d+) (\d+):(\d+):(\d+) \+\d+ (\d+)/);
	return new Date(components[6], convertShortMonth(components[1]), components[2],
		components[3], components[4], components[5]);
}


twitterAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password){
    return doHttp('GET',window.url+"/handle/proxy.php?feed="+uri,data,contentType,username,password,callback,params,headers);
};

twitterAdaptor.prototype.getWorkspaceList = function(context,userParams,callback){
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0.json?';
	var uri = uriTemplate.format([context.host]);
	var req = twitterAdaptor.doHttpGET(uri,twitterAdaptor.getWorkspaceListCallback,context, {'accept':twitterAdaptor.mimeType});
	return typeof req == 'string' ? req : true;
};

twitterAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr){
	if(!context)
		context = {};
	context.status = false;
	try {
		eval('var tweets=' + responseText);
	} catch(ex) {
		displayMessage("Twitter could not be contacted");
		return false;
	}
	var list = [];
	for (var i=0; i < tweets.length; i++) {
		var tiddler = new Tiddler(tweets[i]['id']);
		var timestamp = tweets[i]['created_at'];
		var created = convertTimestamp(timestamp);
		fields = {};
		fields["original_server.type"] = "twitter";
		fields["url"] = "http://twitter.com/"+tweets[i]['user']['name']+"/statuses/"+tweets[i]['id'];
		fields["user_img"] = tweets[i]['user']['profile_image_url'];
		fields["prettyDate"] = humane_date(created);
		tiddler.set("tweet_"+tweets[i]['id'],tweets[i]['text'],"modifier",created,"",created,fields);
		store.addTiddler(tiddler);
		if(context.save==true)
			store.saveTiddler("tweet_"+tweets[i]['id'], "tweet_"+tweets[i]['id'], tweets[i]['text'], "ccTiddly", created, "lifestream", merge(fields, config.defaultCustomFields));					
	}			
	context.tiddlers = list;
	context.status = true;		
	window.refreshDisplay();
};
config.adaptors[twitterAdaptor.serverType] = twitterAdaptor;