/***
|''Name:''|FacebookAdaptorPlugin|
|''Description:''|Example Adaptor which can be used as a basis for creating a new Adaptor|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#FacebookAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/FacebookAdaptorPlugin.js|
|''Version:''|0.0.1|
|''Status:''|Not for release - this is a template for creating new adaptors|
|''Date:''|Mar 11, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

To make this example into a real TiddlyWiki adaptor, you need to:

# Delete any functionality not supported by you host (for example, putTiddler may not be supported)
# Do the actions indicated by the !!TODO comments, namely:
## Set the values of the main variables, eg FacebookNewsAdaptor.serverType etc
## Fill in the uri templates in the .prototype functions
## Parse the responseText returned in the Callback functions and put the results in the appropriate variables

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.FacebookAdaptorPlugin) {
version.extensions.FacebookAdaptorPlugin = {installed:true};

function FacebookNewsAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

// !!TODO set the variables below
//FacebookNewsAdaptor.mimeType = 'text/x.';
FacebookNewsAdaptor.serverType = 'facebooknews';
FacebookNewsAdaptor.serverParsingErrorMessage = "Error parsing result from server";
FacebookNewsAdaptor.errorInFunctionMessage = "Error in function FacebookNewsAdaptor.%0";

FacebookNewsAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

FacebookNewsAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

FacebookNewsAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

FacebookNewsAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

FacebookNewsAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
FacebookNewsAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
FacebookNewsAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

FacebookNewsAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = FacebookNewsAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

FacebookNewsAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

FacebookNewsAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host]);
	var req = FacebookNewsAdaptor.doHttpGET(uri,FacebookNewsAdaptor.getWorkspaceListCallback,context,{'accept':'application/json'});
	return typeof req == 'string' ? req : true;
};

FacebookNewsAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = FacebookNewsAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var item = {
				title:'exampleTitle',
				name:'exampleName'
				};
			list.push(item);
		} catch (ex) {
			context.statusText = exceptionText(ex,FacebookNewsAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.workspaces = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

/*config.macros.getFriends = {};
config.macros.getFriends.handler =function(place,macroName,params,wikifier,paramString,tiddler) {

	var data = "md5pass=" + encodeURI("") + "&" +
				"noerror=" + encodeURI("") + "&" +
				"email=" + encodeURI(params[0]) + "&" +
				"pass=" + encodeURI(params[1]) + "&" +
				"doquicklogin=Login";

	var ret = doHttp("POST","https://login.facebook.com/login.php",data,null,null,null,myCallback);
	if(typeof ret == "string") {
		createTiddlyError(place,"Failed HTTP request","Error: " + ret);
		alert('failed');
	} else
		createTiddlyText(place,"Hmmm... seeemed to work");
	}

};*/


function getElementsByClass(searchClass,node,tag) {
	var classElements = new Array();
	if ( node == null )
		node = document;
	if ( tag == null )
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp('(^|\\s)'+searchClass+'(\\s|$)');
	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
//displayMessage("e:"+els[i].className);
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
}

FacebookNewsAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

FacebookNewsAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
var email = "simon.mcmanus@bt.com";
var pass = "0penSauce";
	context = this.setContext(context,userParams,callback);
	var data = "md5pass=" + encodeURI("") + "&" +
				"noerror=" + encodeURI("") + "&" +
				"email=" + encodeURI(email) + "&" +
				"pass=" + encodeURI(pass) + "&" +
				"doquicklogin=Login";
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host]);
	var req = FacebookNewsAdaptor.doHttpPOST(uri,FacebookNewsAdaptor.getTiddlerListCallback,context,null,data);
	return typeof req == 'string' ? req : true;
};

FacebookNewsAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
//myCallback = function(status,params,responseText,xhr) {
{
	context.status = false;
	context.statusText = FacebookNewsAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
//displayMessage("rt:"+responseText.substr(0,100));
			displayMessage("Got back with status: " + status);
			// Create the iframe
			var iframe = document.createElement("iframe");
			//iframe.style.display = "none";
			document.body.appendChild(iframe);
			var doc = iframe.document;
			if(iframe.contentDocument)
				doc = iframe.contentDocument; // For NS6
			else if(iframe.contentWindow)
				doc = iframe.contentWindow.document; // For IE5.5 and IE6
		
	
			// Strip out the body
			var bodyStartMarker = "<body";
			var bodyEndMarker = "</body>";
			var bodyStart = responseText.indexOf(bodyStartMarker);
			var bodyEnd = responseText.indexOf(bodyEndMarker);
		
			if(bodyStart == -1 || bodyEnd == -1) {
				displayMessage("Eeek! It's not your father's facebook page...");
			} else {
				displayMessage("Got a body to parse");
				var content = "<" + "html><" + "body>" + responseText.substring(bodyStart,bodyEnd + bodyEndMarker.length) + "<" + "/body><" + "/html>";
				displayMessage("ct:"+content.substr(0,100));
				// Put the content in the iframe
				doc.open();
				doc.writeln(content);
				doc.close();
			
				var e = doc.getElementById("book");
				//displayMessage("element is " + e);
				//displayMessage(e.innerHTML.substring(0,100));
				
				// Check we're logged in
				var loginStatus = hasClass(doc.body,"home");	
				// Get rid of the iframe
				iframe.parentNode.removeChild(iframe);
				
				context.tiddlers = [];
				var feed = getElementsByClass('feed_item clearfix',doc);
				for (var f = 0; f < feed.length; f++) {
					//displayMessage(feed[f].innerHTML);
					var tiddler = new Tiddler("qqq"+f);
					tiddler.text = "<html>" + feed[f].innerHTML + "</html>";
					tiddler.modifier = "FacebookPlugin";
					tiddler.tags = ["NewsFeed"];
					//store.addTiddler(tiddler);
					context.tiddlers.push(tiddler);
				}
				displayMessage("Our login status is " + loginStatus);
			}

		} catch (ex) {
			context.statusText = exceptionText(ex,FacebookNewsAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	//context.adpator.tiddlers = context.tiddlers;
	if(context.callback)
		context.callback(context,context.userParams);
};

FacebookNewsAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : FacebookNewsAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

FacebookNewsAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
displayMessage("g1");
displayMessage("ll:"+context.tiddlers.length);
displayMessage("g2");
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.tiddler = context.tiddlers[title];
	if(context.tiddler) {
		context.tiddler.fields['server.type'] = FacebookNewsAdaptor.serverType;
		context.tiddler.fields['server.host'] = this.host;
	}
	context.status = true;
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		callback(context,userParams);
	} else {
		window.setTimeout(function() {callback(context,userParams);},10);
	}
	return true;
};

FacebookNewsAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[FacebookNewsAdaptor.serverType] = FacebookNewsAdaptor;
} //# end of 'install only once'
//}}}
