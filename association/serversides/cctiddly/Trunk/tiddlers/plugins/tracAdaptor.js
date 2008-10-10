/***
|''Name''|tracAdaptor|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|0.1|

!Code

***/
//{{{
	
function tracAdaptor(){}
	
tracAdaptor.prototype = new AdaptorBase();
tracAdaptor.mimeType = 'application/json';
tracAdaptor.serverType = 'trac';

tracAdaptor.convertShortMonth = function(text) {
    for(var i = 0; i < config.messages.dates.shortMonths.length; i++) { // XXX: inefficient!?
        if(text == config.messages.dates.shortMonths[i]) {
            return i;
        }
    }
};

tracAdaptor.convertTimestamp = function(str) { // TODO: rename
	var components = str.match(/(\d+) (\w+) (\d+) (\d+):(\d+):(\d+) /);
	return new Date(components[3], tracAdaptor.convertShortMonth(components[2]), components[1],
		components[4], components[5], components[6]);
};


tracAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password){
	displayMessage(url+"/handle/proxy.php?feed="+uri);
    return doHttp('GET',window.url+"/handle/proxy.php?feed="+uri,data,contentType,username,password,callback,params,headers);
};

tracAdaptor.prototype.getWorkspaceList = function(context,userParams,callback){
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host]);
	var req = tracAdaptor.doHttpGET(uri,tracAdaptor.getWorkspaceListCallback,context, {'accept':tracAdaptor.mimeType});
	return typeof req == 'string' ? req : true;
};

tracAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr){
	if(!context)
		context = {};
	context.tiddlers = [];
	
	
	responseText = responseText.replace(/\r+/mg,"");
	var regex_item = /<item>(.|\n)*?<\/item>/mg;
	var regex_title = /<title>(.|\n)*?<\/title>/mg;
	var regex_created = /<pubDate>(.|\n)*?<\/pubDate>/mg;
	var regex_link = /<link>(.|\n)*?<\/link>/mg;
	var regex_guid = /<guid>(.|\n)*?<\/guid>/mg;
	var regex_author = /<author>(.|\n)*?<\/author>/mg;
	var regex_desc = /<description>(.|\n)*?<\/description>/mg;
	var item_match = responseText.match(regex_item);
	for (var i=0;i<item_match.length;i++) {
		item = {};
		var title = item_match[i].match(regex_title);	
		var created = item_match[i].match(regex_created);
		item.title = title[0].replace(/^<title>|<\/title>$/mg,"");
		var author = item_match[i].match(regex_author);		
		author = author[0].replace(/^<author>|<\/author>$/mg,"");
		if(author == "mcmanus.simon@gmail.com") {
//			item.title = item.title.htmlDecode();
			displayMessage(author);
		
	
			item.created = created[0].replace(/^<pubDate>|<\/pubDate>$/mg,"");
			
			item.created = tracAdaptor.convertTimestamp(item.created);
			
				displayMessage(item.created);
			desc = item_match[i].match(regex_desc);
			var link = item_match[i].match(regex_link);
			link = link[0].replace(/^<link>|<\/link>$/mg,"");
			if (desc) item.text = desc[0].replace(/^<description>|<\/description>$/mg,"");
			var t = new Tiddler(item.title);
			t.text = "" + item.text.htmlDecode() + "";	
			t.text = t.text.replace("<![CDATA[", "");
			t.text = t.text.replace("]]]>", "");
			t.fields["url"] = link;
			t.fields["server.type"] = "trac";
			t.set(item.title,t.text,"modifier",item.created,null,t.fields);
			store.addTiddler(t);
			console.log(t);
		}
	}
	context.status = true;
};
config.adaptors[tracAdaptor.serverType] = tracAdaptor;