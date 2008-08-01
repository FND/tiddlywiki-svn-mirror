/***
|''Name:''|CommentArtCataloguePlugin |
|''Description:''| |
|''Author:''|JonathanLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/verticals/CommentArtCatalogue/plugins/CommentArtCataloguePlugin.js |
|''Version:''|0.1 |
|''Date:''|31/7/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|

Usage:
{{{

}}}
***/

//{{{
if(!version.extensions.CommentArtCataloguePlugin) {
version.extensions.CommentArtCataloguePlugin = {installed:true};

config.macros.CommentArtCatalogue = {

	messages: {
		noUrl:'no url set',
		noGallery:'no gallery found',
		createTiddler:'added %0 tiddlers'
	},
	omitFilters: [
		/^id="gallery-list"/,
		'noimage.gif'
	],
	tags: [
		"catalogueItem"
	],
	context: {},
	handler: function(place,macroName,params) {
		if(!config.options.txtCommentArtCatalogueUrl) {
			displayMessage(this.messages.noUrl);
			return false;
		} else {
			this.context.place = place;
			this.context.macro = this;
			this.go(config.options.txtCommentArtCatalogueUrl);
		}
	},
	
	go: function(url) {
		httpReq("GET",url,this.getCatalogueCallback,this.context,null,null,null,null,null,true);
	},
	
	getCatalogueCallback: function(status,context,responseText,url,xhr) {
		if(!status) {
			return false;
		} else {
			var macro = context.macro;
			var start = responseText.indexOf('id="gallery-list"');
			var end = responseText.indexOf('<!-- #exhibitions-list -->');
			var s = "";
			var pieces = [];
			if(start===-1||end===-1) {
				displayMessage(this.messages.noGallery);
			} else {
				s = responseText.substring(start,end);
				pieces = s.split('<img ');
				pieces = macro.omitFilter(pieces,context);
				pieces = macro.createFieldsFromSource(pieces);
				macro.createTiddlers(pieces,context);
			}
		}
	},

	omitFilter: function(strings,context) {
		var macro = context.macro;
		var results = [];
		var omitFilters = macro.omitFilters;
		var testFilters = function(s) {
			var omitFilter;
			var matched = false;
			for(var j=0;j<omitFilters.length;j++) {
				omitFilter = omitFilters[j];
				if(typeof omitFilter === 'string') {
					if(s.indexOf(omitFilter)!==-1) {
						matched = true;
					}
				} else { // assume regex
					if(omitFilter.test(s)) {
						matched = true;
					}
				}
			}
			return matched;
		};
		for(var i=0;i<strings.length;i++) {
			if(!testFilters(strings[i])) {
				results.push(strings[i]);
			} else {
				//# debug
				//console.log('omitting '+strings[i]);
			}
		}
		return results;
	},
	
	createFieldsFromSource: function(pieces) {
		var description,title,s;
		var links,result;
		var results = [];
		for(var i=0;i<pieces.length;i++) {
			s = pieces[i];
			result = {};
			links = {};
			links.icon = s.replace(/src="([^"]*)"(.|\n)*/,"$1");
			links.icon = links.icon.replace(/ /g,"%20");
			links.normal = links.icon.replace(/icon(_.*\.[jJ][pP][gG])/,"normal$1");
			links.large = links.icon.replace(/icon(_.*\.[jJ][pP][gG])/,"large$1");
			result.links = links;
			description = s.replace(/^(.|\n)*?<h3 class="pthtrei">/,'<h3 class="pthtrei">');
			result.description = description;
			title = description;
			title = title.replace(/<.*?>/g,"");
			title = title.replace(/\s\s+/g,",");
			title = title.replace(/,\s*$/,"");
			result.title = title;
			results.push(result);
		}
		return results;
	},
	
	createTiddlers: function(pieces,context) {
		var macro = context.macro;
		var title,body,fields,piece;
		var modifier = config.options.txtUserName;
		var tags = macro.tags;
		var created = new Date();
		store.suspendNotifications();
		for(var i=0;i<pieces.length;i++) {
			piece = pieces[i];
			title = piece.title;
			body = "";
			for(var j in piece.links) {
				body+=j+": "+piece.links[j]+"\n";
			}
			
			store.saveTiddler(title,title,body,modifier,null,tags,fields,false,created);
		}
		store.resumeNotifications();
		clearMessage();
		displayMessage(macro.messages.createTiddler.format([pieces.length]));
		wikify('[[Then download and save the images!|CommentArtCatalogueSave]]',context.place);
	}
};

config.macros.CommentArtCatalogueSave = {

	context: {},

	handler: function(place,macroName,params) {
		var ss = store.getTaggedTiddlers('catalogueItem');
		var icon,normal,large,s,context;
		var getHost = function(url) {
			var i=0;
			if(!url)
				return '';
			if(!url.match(/:\/\//))
				url = 'http://' + url;
			i = url.indexOf('/',url.indexOf('http://')+7);
			if(i!==-1) {
				url = url.substring(0,i);
			}
			return url;
		};
		var host = getHost(config.options.txtCommentArtCatalogueUrl);
		for(var i=0;i<ss.length;i++) {
			s = ss[i];
			context = {};
			icon = store.getTiddlerSlice(s.title,'icon');
			normal = store.getTiddlerSlice(s.title,'normal');
			large = store.getTiddlerSlice(s.title,'large');
			context.macro = this;
			context.title = s.title;
			context.icon = icon;
			httpReqBin("GET",host+icon,this.getIconCallback,context,null,null,null,null,null,true);
			//# debug
			//break;
		}
		
	},

	getIconCallback: function(status,context,responseText,url,xhr) {
		var title = "";
		if(!status) {
			return false;
		} else {
			//console.log(context.title);
			//console.log(responseText);
			title = context.title+".jpg";
			context.macro.save(title,responseText);
		}
	},
	
	save: function(filename,content) {
		config.messages.fileSaved = "file successfully saved";
		config.messages.fileFailed = "file save failed";
		var localPath = getLocalPath(document.location.toString());
		var savePath;
		if((p = localPath.lastIndexOf("/")) != -1) {
			savePath = localPath.substr(0,p) + "/" + filename;
		} else {
			if((p = localPath.lastIndexOf("\\")) != -1) {
				savePath = localPath.substr(0,p) + "\\" + filename;
			} else {
				savePath = localPath + "." + filename;
			}
		}
		displayMessage("saving...");
		//var fileSave = saveFile(savePath,convertUnicodeToUTF8(content));
		//savePath = savePath.replace(/\//g,"_"); // not quite - don't replace the first few!
		var fileSave = saveFile(savePath,content);
		if(fileSave) {
			displayMessage("saved... click here to load","file://"+savePath);
			console.log("saved... click here to load","file://"+savePath);
		} else {
			//alert(config.messages.fileFailed,"file://"+savePath);
			console.log(config.messages.fileFailed,"file://"+savePath);
		}
	}

};

window.httpReqBin = function(type,url,callback,params,headers,data,contentType,username,password,allowCache)
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
	x.updateProgressIndicator = function(position,totalSize,direction) {
		if(!direction) {
			direction = "downloading";
		}
		var percentComplete = 0;
		if(totalSize!==0) {
			percentComplete = Math.floor((position / totalSize)*100);
			percentComplete = percentComplete > 100 ? 100 : percentComplete;
		}
		clearMessage();
		displayMessage(url);
		displayMessage(direction+"... "+percentComplete+"%");
		displayMessage('('+position+' of '+totalSize+' bytes)');
		if(percentComplete=='100') {
			window.setTimeout(function(){
				clearMessage();
			},2000);
		}
	};
	//# Install progress indicator
	x.onprogress = function(e) {
		var local = url.indexOf('file://')!=-1;
		var direction = (type=='GET') ? "downloading" : "uploading";
		var position = e.position;
		var totalSize = e.totalSize;
		if(local) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				totalSize = x.channel.contentLength;
			} catch(ex) {
				// do nothing
			}
		}
		x.updateProgressIndicator(position,totalSize,direction);
	};
	//# Install callback
	x.onreadystatechange = function() {
		//# add Safari progress indicator
		if(x.readyState >= 3 && config.browser.isSafari && type=='GET') {
			var local = url.indexOf('file://')!=-1;
			if(!local) { // haven't figured out how to make this work for local files yet - no response headers!
				var totalSize = x.getResponseHeader('Content-Length');
				var responseText = x.responseText;
				var position = responseText ? responseText.length : 0;
				x.updateProgressIndicator(position,totalSize);
			} else {
				clearMessage();
				displayMessage('no support yet for local file progress indicator');
				if(x.readyState == 4){
					window.setTimeout(function(){
						clearMessage();
					},2000);
				}
			}
		}
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
		x.setRequestHeader("X-Requested-With", "TiddlyWiki " + formatVersion());
		x.overrideMimeType('text/plain; charset=x-user-defined');
		x.send(data);
	} catch(ex) {
		return exceptionText(ex);
	}
	return x;
};

} //# end of 'install only once'
//}}}
