/***
|''Name''|wordpressAdaptor|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|0.1|

!Code

***/
//{{{
	
function wordpressAdaptor(){}
	
wordpressAdaptor.prototype = new AdaptorBase();
wordpressAdaptor.mimeType = 'application/json';
wordpressAdaptor.serverType = 'wordpress';


// Thanks to FND for this fuction.
wordpressAdaptor.convertShortMonth = function(text) {
    for(var i = 0; i < config.messages.dates.shortMonths.length; i++) { // XXX: inefficient!?
        if(text == config.messages.dates.shortMonths[i]) {
            return i;
        }
    }
}



// convert "mmm 0DD 0hh:0mm:0ss +0000 YYYY" to Date instance
wordpressAdaptor.convertTimestamp = function(str) { // TODO: rename
	displayMessage("aa"+str);
	var components = str.match(/(\w+) (\d+) (\d+):(\d+):(\d+) \+\d+ (\d+)/);
	var components = str.match(/(\w+) (\d+) (\d+):(\d+):(\d+) \+\d+ (\d+)/);
	return new Date(components[6], wordpressAdaptor.convertShortMonth(components[1]), components[2],
		components[3], components[4], components[5]);
}

wordpressAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password){
    return doHttp('GET',window.url+"/handle/proxy.php?feed="+uri,data,contentType,username,password,callback,params,headers);
};

wordpressAdaptor.prototype.getWorkspaceList = function(context,userParams,callback){
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0/?feed=rss2';
	var uri = uriTemplate.format([context.host]);
	var req = wordpressAdaptor.doHttpGET(uri,wordpressAdaptor.getWorkspaceListCallback,context, {'accept':wordpressAdaptor.mimeType});
	return typeof req == 'string' ? req : true;
};

wordpressAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr){
	
	
	
	
	if(!context)
		context = {};
	context.tiddlers = [];
	// First thing to do is strip out any \r characters in the file, as TiddlyWiki doesn't deal with them
	responseText = responseText.replace(/\r+/mg,"");
	// regex_item matches on the items 
	var regex_item = /<item>(.|\n)*?<\/item>/mg;
	// regex_title matches for the titles
	var regex_title = /<title>(.|\n)*?<\/title>/mg;
	
	var regex_created = /<pubDate>(.|\n)*?<\/pubDate>/mg;
	var regex_guid = /<guid>(.|\n)*?<\/guid>/mg;
	var regex_desc = /<description>(.|\n)*?<\/description>/mg;
	var item_match = responseText.match(regex_item);
	for (var i=0;i<item_match.length;i++) {
		// create a new Tiddler in context.tiddlers with the finished item object
		// grab a title
		item = {};
		var title = item_match[i].match(regex_title);	
		var created = item_match[i].match(regex_created);
		item.title = title[0].replace(/^<title>|<\/title>$/mg,"");
		item.title = item.title.htmlDecode();
		item.created = created[0].replace(/^<pubDate>|<\/pubDate>$/mg,"");
	//	displayMessage(item.created);
	//	item.created = wordpressAdaptor.convertTimestamp(item.created).convertToLocalYYYYMMDDHHMM().toString();
		desc = item_match[i].match(regex_desc);
		if (desc) item.text = desc[0].replace(/^<description>|<\/description>$/mg,"");



console.log(item);
			var tiddler = new Tiddler(item.title);
			/*
			
			var timestamp = tweets[i]['created_at'];

				tiddler.created = convertTimestamp(timestamp).convertToLocalYYYYMMDDHHMM().toString();
			fields = {};
			fields["server.type"] = "twitter";
			console.log(tweets[i]);
			fields["url"] = "http://twitter.com/"+tweets[i]['user']['name']+"/statuses/"+tweets[i]['id'];
			fields["user_img"] = tweets[i]['user']['profile_image_url'];
			tiddler.set("tweet_"+tweets[i]['id'],tweets[i]['text'],"modifier",convertTimestamp(timestamp),"",convertTimestamp(timestamp),fields);
			store.addTiddler(tiddler);
			
			*/
			
		var t = new Tiddler(item.title);
		t.text = "<html>" + item.text.htmlDecode() + "</html>";
		context.tiddlers.push(t);
	}
	context.status = true;
	
	return true;
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	context.status = false;
	eval('var tweets=' + responseText);
	var list = [];
	for (var i=0; i < tweets.length; i++) {
		var tiddler = new Tiddler(tweets[i]['id']);
		var timestamp = tweets[i]['created_at'];
		
			tiddler.created = convertTimestamp(timestamp).convertToLocalYYYYMMDDHHMM().toString();
		fields = {};
		fields["server.type"] = "twitter";
		console.log(tweets[i]);
		fields["url"] = "http://twitter.com/"+tweets[i]['user']['name']+"/statuses/"+tweets[i]['id'];
		fields["user_img"] = tweets[i]['user']['profile_image_url'];
		tiddler.set("tweet_"+tweets[i]['id'],tweets[i]['text'],"modifier",convertTimestamp(timestamp),"",convertTimestamp(timestamp),fields);
		store.addTiddler(tiddler);
	}			
	context.tiddlers = list;
	context.status = true;		
	window.refreshDisplay();
};
config.adaptors[wordpressAdaptor.serverType] = wordpressAdaptor;