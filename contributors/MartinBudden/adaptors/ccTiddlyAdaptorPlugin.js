/***
|''Name:''|ccTiddlyAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from ccTiddly wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ccTiddlyAdaptorPlugin.js |
|''Version:''|0.5.4|
|''Date:''|Feb 25, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.0|

''For debug:''
|''Default ccTiddly username''|<<option txtccTiddlyUsername>>|
|''Default ccTiddly password''|<<option txtccTiddlyPassword>>|

//# see http://cctiddly.svn.sourceforge.net/viewvc/cctiddly/msghandle.php?view=markup for REST syntax

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

fnLog = function(text)
{
	if(window.console) console.log(text.substr(0,80)); else displayMessage(text.substr(0,80));
};

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
ccTiddlyAdaptor.errorInFunctionMessage = "Error in function ccTiddlyAdaptor.%0";

ccTiddlyAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

ccTiddlyAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

ccTiddlyAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = ExampleAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

ccTiddlyAdaptor.fullHostName = function(host)
{
//#fnLog("fullHostName:"+host);
	if(!host)
		return '';
	host = host.trim();
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

ccTiddlyAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#fnLog("openHost:"+host);
	this.host = ccTiddlyAdaptor.fullHostName(host);
//#fnLog("host:"+this.host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ccTiddlyAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#fnLog("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ccTiddlyAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#fnLog("getWorkspaceList");
	var list = [];
	list.push({title:"Main",name:"Main"});
	context.workspaces = list;
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

//# http://cctiddly.sourceforge.net/msghandle.php?action=content
//# http://cctiddly.byethost14.com/msghandle.php?action=content
ccTiddlyAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#fnLog('getTiddlerList');
	//var uriTemplate = '%0msghandle.php?action=content';
	var uriTemplate = '%0msghandle.php?action=content&username=%1&password=%2';
	var host = ccTiddlyAdaptor.fullHostName(this.host);
	var uri = uriTemplate.format([host,this.workspace,this.username,this.password]);
//#displayMessage('uri:'+uri);
	var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getTiddlerListCallback,context);
//#displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
//#fnLog('getTiddlerListCallback status:'+status);
//#fnLog('rt:'+responseText.substr(0,80));
//#fnLog('xhr:'+xhr);
	context.status = false;
	context.statusText = ccTiddlyAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			list = [];
			/*var titles = responseText.split('\n');
			for(var i=0; i<titles.length; i++) {
				var tiddler = new Tiddler(titles[i]);
				list.push(tiddler);
			}*/
			if(list.length==0) {
				list.push(new Tiddler('About')); //kludge until get support for listTiddlers in ccTiddly
			}
			context.tiddlers = list;
		} catch (ex) {
			context.statusText = exceptionText(ex,ccTiddlyAdaptor.serverParsingErrorMessage);
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

ccTiddlyAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
//# http://wiki.osmosoft.com/alpha/martinstest#GettingStarted
	var uriTemplate = '%0%1#%2';
	var host = ccTiddlyAdaptor.fullHostName(this.host);
	info.uri = uriTemplate.format([this.host,this.workspace,tiddler.title]);
	return info;
};

ccTiddlyAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
//#displayMessage('ccTiddlyAdaptor.getTiddlerRevision:' + title + ' r:' + revision);
	context = this.setContext(context,userParams,callback);
	context.revision = revision;
	return this.getTiddler(title,null,context,userParams,callback);
};

ccTiddlyAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
//#displayMessage('ccTiddlyAdaptor.getTiddler:' + title);
	//title = encodeURIComponent(title);
	var host = ccTiddlyAdaptor.fullHostName(this.host);
	context.tiddler = new Tiddler(title);
	context.tiddler.fields['server.host'] = ccTiddlyAdaptor.minHostName(host);
	context.tiddler.fields['server.type'] = ccTiddlyAdaptor.serverType;
	if(revision) {
		var uriTemplate = '%0msghandle.php?action=revisionDisplay&title=%1&revision=%2';
		var uri = uriTemplate.format([host,title,revision]);
//#displayMessage('uriR: '+uri);
		var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getTiddlerCallback2,context);
	} else {
		// first get the revision list
		uriTemplate = '%0handle/revisionlist.php?workspace=%1&title=%2';
		uri = uriTemplate.format([host,title]);
//#displayMessage('uri: '+uri);
		req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getTiddlerCallback1,context);
	}
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

//# http://127.0.0.1/cctiddly/msghandle.php?action=revisionDisplay&title=News&revision=1

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
		var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getTiddlerCallback2,context);
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
			context.tiddler.text = x[2] ? x[2].unescapeLineBreaks().htmlDecode() : '';
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
	context = this.setContext(context,userParams,callback);
	title = encodeURIComponent(title);
fnLog('getTiddlerRevisionList:'+title);
//# http://cctiddly.sourceforge.net/msghandle.php?action=revisionList&title=About
//# http://wiki.osmosoft.com/alpha/handle/revisionlist.php?&workspace=martinstest&title=GettingStarted
	var uriTemplate = '%0handle/revisionlist.php?workspace=%1&title=%2';
	var host = ccTiddlyAdaptor.fullHostName(this.host);
	var uri = uriTemplate.format([host,context.workspace,title]);
fnLog('uri: '+uri);
	context.tiddler = new Tiddler(title);
	context.tiddler.fields['server.host'] = ccTiddlyAdaptor.minHostName(host);
	context.tiddler.fields['server.type'] = ccTiddlyAdaptor.serverType;
	var req = ccTiddlyAdaptor.doHttpGET(uri,ccTiddlyAdaptor.getTiddlerRevisionListCallback,context);
//#console.log("req:"+req);
};

ccTiddlyAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
fnLog('getTiddlerRevisionListCallback status:'+status);
fnLog('rt:'+responseText.substr(0,100));
//#fnLog('xhr:'+xhr);
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
ccTiddlyAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	var title = encodeURIComponent(tiddler.title);
//#fnLog('putTiddler:'+title);
	var host = this && this.host ? this.host : ccTiddlyAdaptor.fullHostName(tiddler.fields['server.host']);
	var uriTemplate = '%0handle/save.php?workspace=%1&title=%2';
	var uri = uriTemplate.format([host,context.workspace,title]);
//#fnLog('uri: '+uri);

	context.tiddler = tiddler;
	context.tiddler.fields['server.host'] = ccTiddlyAdaptor.minHostName(host);
	context.tiddler.fields['server.type'] = ccTiddlyAdaptor.serverType;
/*	doHttp('POST'
		,serverside.url + '/handle/save.php?' + serverside.queryString + '&workspace=' + serverside.workspace
		,'tiddler=' + encodeURIComponent(store.getSaver().externalizeTiddler(store,tiddler))
			+ '&otitle=' + encodeURIComponent(title.htmlDecode())
			+ ((omodified!==null)?'&omodified=' + encodeURIComponent(omodified.convertToYYYYMMDDHHMM()):"")
			+ ((ochangecount!==null)?'&ochangecount=' + encodeURIComponent(ochangecount):"")
		,null, null, null
		,serverside.fn.genericCallback
	);
*/
	var req = ccTiddlyAdaptor.doHttpPOST(uri,ccTiddlyAdaptor.putTiddlerCallback,tiddler.text,null,payload);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#fnLog('putTiddlerCallback status:'+status);
//#fnLog('rt:'+responseText.substr(0,50));
//#fnLog('xhr:'+xhr);
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

//# placeholder, not complete
ccTiddlyAdaptor.prototype.deleteTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	title = encodeURIComponent(tiddler.title);
//#fnLog('deleteTiddler:'+title);
	var host = this && this.host ? this.host : ccTiddlyAdaptor.fullHostName(tiddler.fields['server.host']);
	var uriTemplate = '%0handle/delete.php?workspace=%1&title=%2';
	var uri = uriTemplate.format([host,context.workspace,title]);
//#fnLog('uri: '+uri);

	var req = ccTiddlyAdaptor.doHttpPOST(uri,ccTiddlyAdaptor.deleteTiddlerCallback,title);
//#fnLog("req:"+req);
	return typeof req == 'string' ? req : true;
};

ccTiddlyAdaptor.deleteTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#fnLog('deleteTiddlerCallback:'+status);
//#fnLog('rt:'+responseText.substr(0,50));
//#fnLog('xhr:'+xhr);
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
