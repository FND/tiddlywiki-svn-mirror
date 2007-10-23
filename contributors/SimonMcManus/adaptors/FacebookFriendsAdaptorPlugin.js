/***
|''Name:''|FacebookFriendsAdaptorPlugin|
|''Description:''|Facebook Friends Adaptor|
|''Author:''|Simon McManus (simonmcmanus (at) bt (dot) com)|
|''Source:''|http://www.example.com/#FacebookFriendsAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/adaptors/FacebookFriendsAdaptorPlugin.js |
|''Version:''|0.0.2|
|''Status:''|Not ready for release|
|''Date:''|Sep 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.FacebookFriendsAdaptorPlugin) {
version.extensions.FacebookFriendsAdaptorPlugin = {installed:true};

function FacebookFriendsAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

//FacebookFriendsAdaptor.mimeType = 'text/x.';
FacebookFriendsAdaptor.serverType = 'facebookfriends';
FacebookFriendsAdaptor.serverParsingErrorMessage = "Error parsing result from server";
FacebookFriendsAdaptor.errorInFunctionMessage = "Error in function FacebookFriendsAdaptor.%0";

FacebookFriendsAdaptor.prototype.setContext = function(context,userParams,callback)
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

FacebookFriendsAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

FacebookFriendsAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

FacebookFriendsAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

FacebookFriendsAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
FacebookFriendsAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
FacebookFriendsAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

FacebookFriendsAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = FacebookFriendsAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

FacebookFriendsAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

FacebookFriendsAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host]);
	var req = FacebookFriendsAdaptor.doHttpGET(uri,FacebookFriendsAdaptor.getWorkspaceListCallback,context,{'accept':'application/json'});
	return typeof req == 'string' ? req : true;
};

FacebookFriendsAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = FacebookFriendsAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
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
			context.statusText = exceptionText(ex,FacebookFriendsAdaptor.serverParsingErrorMessage);
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

FacebookFriendsAdaptor.getElementsByClass = function(searchClass,node,tag)
{
	var classElements = new Array();
	if (node == null)
		node = document;
	if (tag == null)
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp('(^|\\s)'+searchClass+'(\\s|$)');
	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
//#displayMessage("e:"+els[i].className);
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
};

FacebookFriendsAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

FacebookFriendsAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
 //var email = prompt("Please enter your facebook username.", "");
 //var pass =  prompt("Please enter your facebook password.", "");
var email = prompt('What is your facebook login?');
var pass = prompt('What is your facebook password?');
	context = this.setContext(context,userParams,callback);
	var data = "md5pass=" + encodeURI("") + "&" +
		"noerror=" + encodeURI("") + "&" +
		"email=" + encodeURI(email) + "&" +
		"pass=" + encodeURI(pass) + "&" +
		"doquicklogin=Login";
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host]);
	var req = FacebookFriendsAdaptor.doHttpPOST(uri,FacebookFriendsAdaptor.getTiddlerListCallback,context,null,data);
	return typeof req == 'string' ? req : true;
};

FacebookFriendsAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = FacebookFriendsAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
//displayMessage("rt:"+responseText.substr(0,100));
			displayMessage("Got back with status: " + status);
			// Create the iframe
			var iframe = document.createElement("iframe");
			 iframe.style.display = "none";
			document.body.appendChild(iframe);
			var doc = iframe.document;
			if(iframe.contentDocument) {
				doc = iframe.contentDocument; // For NS6
			} else if(iframe.contentWindow) {
				doc = iframe.contentWindow.document; // For IE5.5 and IE6
			}

			//# Strip out the body
			var bodyStartMarker = "<body";
			var bodyEndMarker = "</body>";
			var bodyStart = responseText.indexOf(bodyStartMarker);
			var bodyEnd = responseText.indexOf(bodyEndMarker);
		
			if(bodyStart == -1 || bodyEnd == -1) {
				displayMessage("No <body> found");
			} else {
				//displayMessage("Parsing <body>");
				var content = "<" + "html><" + "body>" + responseText.substring(bodyStart,bodyEnd + bodyEndMarker.length) + "<" + "/body><" + "/html>";
				//# displayMessage("ct:"+content.substr(0,100));
				//# Put the content in the iframe
				doc.open();
				doc.writeln(content);
				doc.close();
			
				var e = doc.getElementById("book");
				
				//# Check we're logged in
				var loginStatus = hasClass(doc.body,"home");	
				//# Get rid of the iframe
				//iframe.parentNode.removeChild(iframe);
				context.adaptor.tiddlers = {};				
				context.tiddlers = [];
				var feed = FacebookFriendsAdaptor.getElementsByClass('friendtable',doc);
				for (var f = 0; f < feed.length; f++) {
					// put the plain text in the title
					var tiddler = new Tiddler(feed[f].textContent);
					// place html into the tiddler text
					tiddler.text = "<html>" + feed[f].innerHTML + "</html>";
					tiddler.modifier = "FacebookPlugin";
					tiddler.tags = ["Friend"];
					context.tiddlers.push(tiddler);
					context.adaptor.tiddlers[tiddler.title] = tiddler;
				}
				displayMessage("Our login status is " + loginStatus);
			}

		} catch (ex) {
			context.statusText = exceptionText(ex,FacebookFriendsAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

FacebookFriendsAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : FacebookFriendsAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

FacebookFriendsAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.tiddler = this.tiddlers[title];
	if(context.tiddler) {
		context.tiddler.fields['server.type'] = FacebookFriendsAdaptor.serverType;
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

FacebookFriendsAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[FacebookFriendsAdaptor.serverType] = FacebookFriendsAdaptor;
} //# end of 'install only once'
//}}}