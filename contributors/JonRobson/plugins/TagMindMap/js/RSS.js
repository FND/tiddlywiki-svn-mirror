/*
Thank you
flickr.com for rss icon
destroy: hungryhosting.com
*/
Array.prototype.contains = function(item)
{
	return this.indexOf(item) != -1;
};

config.macros.rsstomap = {};


config.macros.rsstomap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {

	
	var rule,emphasis;
	var feedurl = params[0];
	var ruleEngine = [null,null];
	var tagField = params[1];
	ruleEngine[0] = tagField;
	if(params[2]) emphasis = params[2];

	
	rule = function(v){return [v];};
	//define some rules
		var applyWordIsTag = function(fieldValue){
			var tags = [];

			var nextspace = 0;
			while(fieldValue.indexOf(" ") != -1){
				nextspace = fieldValue.indexOf(" ");
				
				var word = fieldValue.substring(0,nextspace);
				fieldValue = fieldValue.substring(nextspace+1,fieldValue.length);
				tags.push(word);
			}
			tags.push(fieldValue);
			//console.log(tags);
			return tags;
			
		};
		
		var applyTwitterRule = function(fieldValue){
			var tags = [];
		
			tags.push(fieldValue.substring(0,fieldValue.indexOf(":")));

			var target = fieldValue;		
			while(target.indexOf("#") >= 0){
				target = target.substring(target.indexOf("#")+1,target.length);
				tags.push(target.substring(0,target.indexOf(" ")));
			}
					
			var target = fieldValue;
			while(target.indexOf("@") >= 0){
				target = target.substring(target.indexOf("@")+1,target.length);
				tags.push(target.substring(0,target.indexOf(" ")));
				//doesn't support tags at end of a sentence.. eg. #tag? 
			}
			return tags;
	
		};
		var applyRedditRule = function(value){
			var start = value.indexOf("submitted by");
			var first = value.indexOf("&gt;",start);
			var second =value.indexOf("&gt;",first); 
			var third = value.indexOf("&gt;",second);
		
			return [value.substring(third+4,value.indexOf("&lt;",third))];
		
		};

		if(feedurl.indexOf("twitter.com") > -1)  
			rule = applyTwitterRule;
		else
			rule = null;
			

		if(params[2] == 'wordistag') {
			oldrule = rule;
			if(oldrule !=null) 
				rule = applyWordIsTag;
			else
				newrule = function(title){var res = applyWordIsTag(title); var res2 = oldrule(title); return res.concat(res2); };
	 	}
		ruleEngine[1] = rule;
		var timeoutf = function(){
					var f = function(){
						console.log("polling..");
						feedurl += "?ran=" + Math.random();
						config.macros.rsstomap.feedToTagMindMap(feedurl,ruleEngine);
						window.setTimeout(f,100000);
					};
					f();
				
		}

		timeoutf();
		//this.feedToTagMindMap(feedurl,ruleEngine);

};


config.macros.rsstomap.generatehashcode = function(string){
	return string;
},
config.macros.rsstomap.feedToTagMindMap = function(feedurl, tagRule){
	this.clearedrssitems = getChildren("cleared");
	this.boringtags = getChildren("boring");
	this.interestingkeywords = getChildren("interesting");
 
	this.boringtags.push("interesting");
	this.boringtags.push("boring");
	var u = new EasyMapUtils();
		var that = u;

	var keywords = this.interestingkeywords;

	var scanForKeyWordsRule = function(fieldValue){
				fieldValue =fieldValue.toUpperCase();
				var tags = [];


				for(var i =0; i < keywords.length; i++){
					var keywordupper = keywords[i].toUpperCase();
					if(fieldValue.indexOf(keywordupper) > -1) {
						tags.push(keywords[i]);
					}
				}

				return tags;
	};		

	var tagrule = tagRule;
	var it = this;
	var callback = function(status,params,responseText,url,xhr){
		var title;
		var xml = that._getXML(responseText);
		if(!xml) return;
		var feedname = "?";
		feedname = xml.getElementsByTagName('title')[0].firstChild.nodeValue;
		
		
		var items = xml.getElementsByTagName('item');
		var alltags;
		var link = "";
		for(var i=0; i < items.length; i++){
			var taglist;
			alltags =[]
			var att = items[i].childNodes;
			var hashcode ="item_";
			var description = "";
			for(var j=0; j < att.length; j++){
				if(att[j].tagName == 'title')  {title= att[j].firstChild.nodeValue;	hashcode += title;}
				if(att[j].tagName == 'link')  link= att[j].firstChild.nodeValue;
				if(att[j].tagName == 'description')  description= att[j].firstChild.nodeValue;
				if(tagrule){
				
					if(att[j].tagName == tagrule[0]) {
						if(att[j].firstChild){
							var tag = att[j].firstChild.nodeValue;
	
								
							if(tagrule[1]){//apply it
								taglist = tagrule[1](tag);
								alltags = alltags.concat(taglist);
							}
							else{
								alltags.push(tag);
							}
						}
					}
				}
			}
			hashcode = it.generatehashcode(hashcode);
			var tooltip = "{{"+title;
			tooltip += '}} \n' + description;
			if(!it.clearedrssitems.contains(hashcode)){
				alltags = alltags.concat(scanForKeyWordsRule(title)); //look for words user likes	
			

				var buryLink = function(e,id){
					console.log("buring..");
					story.displayTiddler(null,id);
					config.commands.editTiddler.handler(e,null,id);
					story.setTiddlerTag(id,"boring",+1);
					config.commands.saveTiddler.handler(e,null,id);
					config.commands.closeTiddler.handler(e,null,id);					
					tiddlytagmindmapobjects[tiddlytagmindmapobjects['last']].deleteNode(id);
					config.macros.TagMindMapEdge.commit();
				};
				
				var diggLink = function(e,id){
					console.log("digging..")
					story.displayTiddler(null,id);
					config.commands.editTiddler.handler(e,null,id);
					story.setTiddlerTag(id,"interesting",+1);
					//config.commands.saveTiddler.handler(e,null,id);
					//config.commands.closeTiddler.handler(e,null,id);

				};
				
				var node ={'id':hashcode, 'name':title, 'data':{'label':"!",'title':tooltip,'links': [[],[]]}};
				//node.data.links[1][0] = diggLink;
				//node.data.links[1][1] = "digg";
				var destroyimg ="<img src='destroy.jpg' height='12' width='12'>";
				node.data.links[0][1] = "<img src='rssimage.jpg'>";
				node.data.links[0][0] = link;
				node.data.links[1][0] = buryLink;
				node.data.links[1][1] = destroyimg;
				
								
				var fromnode = {'id':'-1','data':{'links':[[buryLink,destroyimg]]}};
				if(tagrule == null){
					config.macros.TagMindMapEdge.handler(null,null,["?",node]);
				}
				else{		
					for(var t=0; t < alltags.length; t++){
						if(!it.boringtags.contains(alltags[t])){
							fromnode.id = alltags[t];
							if(alltags[t] != "")config.macros.TagMindMapEdge.handler(null,null,[fromnode,node,true]);
						}
							
					}
				}
			}
		}
		
		//commit changes
		config.macros.TagMindMapEdge.commit();
	};

	u.loadRemoteFile(feedurl,callback);
}

var EasyMapUtils = function(){	
};
EasyMapUtils.prototype = {
	loadRemoteFile: function(url,callback,params)
	{
		return this._httpReq("GET",url,callback,params,null,null,null,null,null,true);
	},

	_httpReq: function (type,url,callback,params,headers,data,contentType,username,password,allowCache)
	{
		//# Get an xhr object
		var x = null;
		try {
			x = new XMLHttpRequest(); //# Modern
		} catch(ex) {
			try {
				x = new ActiveXObject("Msxml2.XMLHTTP"); //# IE 6
			} catch(ex2) {
			}
		}
		if(!x)
			return "Can't create XMLHttpRequest object";
		//# Install callback
		x.onreadystatechange = function() {
			try {
				var status = x.status;
			} catch(ex) {
				status = false;
			}
			if(x.readyState == 4 && callback && (status !== undefined)) {
				if([0, 200, 201, 204, 207].contains(status))
					callback(true,params,x.responseText,url,x);
				else
					callback(false,params,null,url,x);
				x.onreadystatechange = function(){};
				x = null;
			}
		};
		//# Send request
		if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
			window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		try {
			if(!allowCache)
				url = url + (url.indexOf("?") < 0 ? "?" : "&") + "nocache=" + Math.random();
			x.open(type,url,true,username,password);
			if(data)
				x.setRequestHeader("Content-Type", contentType || "application/x-www-form-urlencoded");
			if(x.overrideMimeType)
				x.setRequestHeader("Connection", "close");
			if(headers) {
				for(var n in headers)
					x.setRequestHeader(n,headers[n]);
			}
		//	x.setRequestHeader("X-Requested-With", "TiddlyWiki " + formatVersion());
			x.send(data);
		} catch(ex) {
			//console.log(ex);
			return ex;
		}
		return x;
	},
	
	_getXML:function(str) {
		if(!str)
			return null;
		var errorMsg;
		try {
			var doc = new ActiveXObject("Microsoft.XMLDOM");
			doc.async="false";
			doc.loadXML(str);
		}
		catch(e) {
			try {
				var parser=  new DOMParser();
				var doc = parser.parseFromString(str,"text/xml");
			}
			catch(e) {
				return e.message;
			}
		}

		return doc;	
	}
};