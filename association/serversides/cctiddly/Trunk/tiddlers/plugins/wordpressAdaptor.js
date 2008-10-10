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

wordpressAdaptor.convertShortMonth = function(text) {
    for(var i = 0; i < config.messages.dates.shortMonths.length; i++) { // XXX: inefficient!?
        if(text == config.messages.dates.shortMonths[i]) {
            return i;
        }
    }
};

wordpressAdaptor.convertTimestamp = function(str) { // TODO: rename
	var components = str.match(/(\d+) (\w+) (\d+) (\d+):(\d+):(\d+) \+\d+/);
	return new Date(components[3], wordpressAdaptor.convertShortMonth(components[2]), components[1],
		components[4], components[5], components[6]);
};


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
	responseText = responseText.replace(/\r+/mg,"");
	var regex_item = /<item>(.|\n)*?<\/item>/mg;
	var regex_title = /<title>(.|\n)*?<\/title>/mg;
	var regex_created = /<pubDate>(.|\n)*?<\/pubDate>/mg;
	var regex_guid = /<guid>(.|\n)*?<\/guid>/mg;
	var regex_desc = /<description>(.|\n)*?<\/description>/mg;
	var item_match = responseText.match(regex_item);
	for (var i=0;i<item_match.length;i++) {
		item = {};
		var title = item_match[i].match(regex_title);	
		var created = item_match[i].match(regex_created);
		item.title = title[0].replace(/^<title>|<\/title>$/mg,"");
		item.title = item.title.htmlDecode();
		item.created = created[0].replace(/^<pubDate>|<\/pubDate>$/mg,"");
		item.created = wordpressAdaptor.convertTimestamp(item.created);
		desc = item_match[i].match(regex_desc);
		if (desc) item.text = desc[0].replace(/^<description>|<\/description>$/mg,"");
		var t = new Tiddler(item.title);
		t.text = "<html>" + item.text.htmlDecode() + "</html>";
		t.fields["server.type"] = "wordpress";
		t.set(item.title,t.text,"modifier",item.created,null,t.fields);
		store.addTiddler(t);
	//	context.tiddlers.push(t);
		
		
		
		
	}
	context.status = true;
};
config.adaptors[wordpressAdaptor.serverType] = wordpressAdaptor;