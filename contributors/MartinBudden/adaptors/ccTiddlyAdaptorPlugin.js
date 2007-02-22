/***
|''Name:''|ccTiddlyAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from ccTiddly wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ccTiddlyAdaptorPlugin.js|
|''Version:''|0.4.1|
|''Date:''|Feb 18, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

''For debug:''
|''Default ccTiddly username''|<<option txtccTiddlyUsername>>|
|''Default ccTiddly password''|<<option txtccTiddlyPassword>>|

***/

//{{{
if(!config.options.txtccTiddlyUsername)
	{config.options.txtccTiddlyUsername = '';}
if(!config.options.txtccTiddlyPassword)
	{config.options.txtccTiddlyPassword = '';}
//}}}

// Ensure that the plugin is only installed once.
if(!version.extensions.ccTiddlyAdaptorPlugin) {
version.extensions.ccTiddlyAdaptorPlugin = {installed:true};

function doHttpGET(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
}

function ccTiddlyAdaptor()
{
	this.host = null;
	this.workspace = null;
	// for debug
	this.username = config.options.txtccTiddlyUsername;
	this.password = config.options.txtccTiddlyPassword;
	return this;
}

ccTiddlyAdaptor.serverType = 'cctiddly';
ccTiddlyAdaptor.serverParsingErrorMessage = "Error parsing result from server";
ccTiddlyAdaptor.errorInFunctionMessage = "Error in function ccTiddlytextAdaptor.%0";

ccTiddlyAdaptor.fullHostName = function(host)
{
//#displayMessage("fullHostName:"+host);
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

ccTiddlyAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

ccTiddlyAdaptor.prototype.openHost = function(host,context,callback)
{
//#displayMessage("openHost:"+host);
	this.host = ccTiddlyAdaptor.fullHostName(host);
//#displayMessage("host:"+this.host);
	if(context && callback)
		window.setTimeout(callback,0,true,this,context);
	return true;
};

ccTiddlyAdaptor.prototype.openWorkspace = function(workspace,context,callback)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(context && callback)
		window.setTimeout(callback,0,true,this,context);
	return true;
};

ccTiddlyAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var uriTemplate = '%0#%1';
	var host = ccTiddlyAdaptor.fullHostName(this.host);
	info.uri = uriTemplate.format([host,tiddler.title]);
	return info;
};

ccTiddlyAdaptor.prototype.generateTiddlerUri = function(tiddler)
{
	return this.generateTiddlerInfo(tiddler).uri;
};

ccTiddlyAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage('ccTiddlyAdaptor.getTiddler:' + title);
	return this.getTiddlerRevision(title,null,context,userParams,callback);
};

ccTiddlyAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
//#displayMessage('ccTiddlyAdaptor.getTiddlerRevision:' + title + ' r:' + revision);
	title = encodeURIComponent(title);
	var host = ccTiddlyAdaptor.fullHostName(this.host);
	if(!context) context = {};
	context.userParams = userParams;
	context.adaptor = this;
	if(callback) context.callback = callback;
	context.tiddler = new Tiddler(title);
	context.tiddler.fields['server.host'] = ccTiddlyAdaptor.minHostName(host);
	context.tiddler.fields['server.type'] = ccTiddlyAdaptor.serverType;
	if(revision) {
		var uriTemplate = '%0msghandle.php?action=revisionDisplay&title=%1&revision=%2';
		var uri = uriTemplate.format([host,title,revision]);
//#displayMessage('urir: '+uri);
		var req = doHttpGET(uri,ccTiddlyAdaptor.getTiddlerCallback2,context);
	} else {
		// first get the revision list
		uriTemplate = '%0msghandle.php?action=revisionList&title=%1';
		uri = uriTemplate.format([host,title]);
//#displayMessage('uri: '+uri);
		req = doHttpGET(uri,ccTiddlyAdaptor.getTiddlerCallback1,context);
	}
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

//# http://cctiddly.sourceforge.net/msghandle.php?action=revisionList&title=About
//# 200610221408 6 ccTiddly
//# 200610221357 5 ccTiddly
//# 200609082012 4 ccTiddly
//# 200609081946 3 ccTiddly
//# 200608162039 2 ccTiddly
//# 200603111654 1 ccTiddly

ccTiddlyAdaptor.getTiddlerCallback1 = function(status,context,responseText,xhr)
{
//#displayMessage('getTiddlerCallback1 status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
	context.status = false;
	context.statusText = ccTiddlyAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		var revs = responseText.split('\n');
		var parts = revs[0].split(' ');
		var tiddlerRevision = parts[1];
		//# http://cctiddly.sourceforge.net/msghandle.php?action=revisionDisplay&title=About&revision=6
		// now get the latest revision
		var uriTemplate = '%0msghandle.php?action=revisionDisplay&title=%1&revision=%2';
		var host = ccTiddlyAdaptor.fullHostName(context.adaptor.host);
		var uri = uriTemplate.format([host,context.tiddler.title,tiddlerRevision]);
//#displayMessage('uri: '+uri);
		var req = doHttpGET(uri,ccTiddlyAdaptor.getTiddlerCallback2,context);
//#displayMessage("req1:"+req);
	} else {
		context.statusText = xhr.statusText;
	if(context.callback)
		context.callback(context,context.userParams);
	}
};

//# http://cctiddly.sourceforge.net/msghandle.php?action=revisionDisplay&title=About&revision=6
//#0 About
//#1 About
//#2 !About\nccTiddly is a tiddly adaptation based on PHP and MySQL to store tiddlers. This is a server side adaptation which allow its user to change their TiddlyWiki over HTTP. It is also possible to generate a standalone version with this!\n\n!Target audiance/uses\n*Online edittable TW\n**Blog\n**news site\n**personal ToDo list\n**online bookmark (with TiddlySnip, still in development)\n*As a collaboration tool\n\n!Features\n|!Add/Edit/Save tiddler over the web|basic tiddly wiki functions allow user to create, edit and delete tiddler but over the internet|\n|!Standalone generation|allow generation of standalone version if required, which is the one available on http://tiddlywiki.com|\n|!Access control|password protect the tiddly so only certain user can change its content over the net, hide ones you don't want anyone but you to see. All in the new privilege system!|\n|!Multiple config file|multiple config file for multiple ccT. One setup, multiple ccTiddly!|\n|!Select particular config file|ability to use a certain config file, which allow multiple tiddly host with one uri|\n|!Versioning|All versions of tiddlers kept|\n|!Import your TW|you can import your TW into ccT fo use and convert back to original TW when you need to bring it around on flashdisk|\n|!Multi-lingual|It may not be in your language now but you can easily translate to your own language|\n|!Tag filter|You can filter out your tiddlers by tag|
//#3 ccTiddly
//#4 200610221408
//#5 200601140131
//#6 other
//#7 6

ccTiddlyAdaptor.getTiddlerCallback2 = function(status,context,responseText,xhr)
{
//#displayMessage('getTiddlerCallback2 status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	if(status) {
		var x = responseText.split('\n');
		try {
			context.tiddler.text = x[2] ? x[2].unescapeLineBreaks() : '';
			context.tiddler.modifier = x[3];
			if(x[4])
				context.tiddler.created = Date.convertFromYYYYMMDDHHMM(x[4]);
			if(x[5])
				context.tiddler.modified = Date.convertFromYYYYMMDDHHMM(x[5]);
			//context.tiddler.tags = x[6].join(' ');
		} catch(ex) {
			context.statusText = exceptionText(ex,ccTiddlyAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};


ccTiddlyAdaptor.prototype.getTiddlerRevisionList = function(title,context,userParams,callback)
// get a list of the revisions for a page
{
	title = encodeURIComponent(title);
//#displayMessage('getTiddlerRevisionList:'+title);
//# http://cctiddly.sourceforge.net/msghandle.php?action=revisionList&title=About
	var uriTemplate = '%0msghandle.php?action=revisionList&title=%1';
	var host = ccTiddlyAdaptor.fullHostName(this.host);
	var uri = uriTemplate.format([host,title]);
//#displayMessage('uri: '+uri);
	if(!context) context = {};
	context.userParams = userParams;
	context.adaptor = this;
	if(callback) context.callback = callback;
	context.tiddler = new Tiddler(title);
	context.tiddler.fields['server.host'] = ccTiddlyAdaptor.minHostName(host);
	context.tiddler.fields['server.type'] = ccTiddlyAdaptor.serverType;
	var req = doHttpGET(uri,ccTiddlyAdaptor.getTiddlerRevisionListCallback,context);
//#displayMessage("req:"+req);
};

ccTiddlyAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerRevisionListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	if(status) {
		list = [];
		var r =  responseText;
		if(r != '-') {
			var revs = r.split('\n');
			var list = [];
			for(var i=0; i<revs.length; i++) {
				var parts = revs[i].split(' ');
				if(parts.length>1) {
					var tiddler = new Tiddler(context.tiddler.title);
					tiddler.modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
					tiddler.fields['server.page.revision'] = String(parts[1]);
					tiddler.fields['server.page.version'] = tiddler.fields['server.page.revision'];//!! here temporarily for compatibility
					list.push(tiddler);
				}
			}
		}
		context.revisions = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

//# placeholder, not complete
ccTiddlyAdaptor.prototype.putTiddler = function(tiddler,context,callback)
{
//#displayMessage('putTiddler');
	var title = encodeURIComponent(tiddler.title);
//#displayMessage('putTiddler:'+title);
	var host = this && this.host ? this.host : ccTiddlyAdaptor.fullHostName(tiddler.fields['server.host']);
	var uriTemplate = '%0RPC2/';
	var uri = uriTemplate.format([host,title]);
//#displayMessage('uri: '+uri);

	if(!context) context = {};
	context.userParams = userParams;
	context.adaptor = this;
	if(callback) context.callback = callback;
	context.tiddler = tiddler;
	context.tiddler.fields['server.host'] = ccTiddlyAdaptor.minHostName(host);
	context.tiddler.fields['server.type'] = ccTiddlyAdaptor.serverType;
	var req =doHttp('POST',uri,payload,null,this.username,this.password,ccTiddlyAdaptor.putTiddlerCallback,tiddler.text);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('putTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ccTiddlyAdaptor.prototype.close = function() {return true;};

config.adaptors[ccTiddlyAdaptor.serverType] = ccTiddlyAdaptor;
} // end of 'install only once'
//}}}
