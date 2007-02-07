/***
|''Name:''|ccTiddlyAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from ccTiddly wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#ccTiddlyAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ccTiddlyAdaptorPlugin.js|
|''Version:''|0.1.5|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

''For debug:''
|''Default ccTiddly Server''|<<option txtccTiddlyDefaultServer>>|
|''Default ccTiddly Web(workspace)''|<<option txtccTiddlyDefaultWorkspace>>|
|''Default ccTiddly username''|<<option txtccTiddlyUsername>>|
|''Default ccTiddly password''|<<option txtccTiddlyPassword>>|

***/

//{{{
if(!config.options.txtccTiddlyDefaultServer)
	{config.options.txtccTiddlyDefaultServer = 'cctiddly.sourceforge.net';}
if(!config.options.txtccTiddlyDefaultWorkspace)
	{config.options.txtccTiddlyDefaultWorkspace = '';}
if(!config.options.txtccTiddlyUsername)
	{config.options.txtccTiddlyUsername = '';}
if(!config.options.txtccTiddlyPassword)
	{config.options.txtccTiddlyPassword = '';}
//}}}

// Ensure that the plugin is only installed once.
if(!version.extensions.ccTiddlyAdaptorPlugin) {
version.extensions.ccTiddlyAdaptorPlugin = {installed:true};

ccTiddlyAdaptor = function()
{
	this.host = null;
	this.workspace = null;
	return this;
};

ccTiddlyAdaptor.prototype.openHost = function(host,callback,callbackParams)
{
//#displayMessage("openHost:"+host);
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1)!="/")
		host = host + "/";
	this.host = host;
//#displayMessage("host:"+host);
	if(callback)
		window.setTimeout(callback,0,true,this,callbackParams);
	return true;
};

ccTiddlyAdaptor.prototype.openWorkspace = function(workspace,callback,callbackParams)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(callback)
		window.setTimeout(callback,0,true,this,callbackParams);
	return true;
};

ccTiddlyAdaptor.prototype.getTiddler = function(tiddler)
{
	//title = encodeURIComponent(title);
//#displayMessage('getTiddler:'+title);
//# http://cctiddly.sourceforge.net/msghandle.php?action=revisionList&title=About

	// first get the revision list
	var urlTemplate = '%0msghandle.php?action=revisionList&title=%1';
	var url = urlTemplate.format([this.host,this.title]);
//#displayMessage('getccTiddly url: '+url);

	tiddler.fields['server.workspace'] = null;
	tiddler.fields['server.type'] = 'cctiddly';
	tiddler.fields['temp.adaptor'] = this;
	var req = doHttp('GET',url,null,null,null,null,ccTiddlyAdaptor.getTiddlerCallback1,tiddler);
//#displayMessage("req:"+req);
};

/*
200610221408 6 ccTiddly
200610221357 5 ccTiddly
200609082012 4 ccTiddly
200609081946 3 ccTiddly
200608162039 2 ccTiddly
200603111654 1 ccTiddly
*/
ccTiddlyAdaptor.getTiddlerCallback1 = function(status,tiddler,responseText,xhr)
{
//#displayMessage('getTiddlerCallback1 status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
	var revs = responseText.split('\n');
	var parts = revs[0].split(' ');
	var pageRevision = parts[1];
// http://cctiddly.sourceforge.net/msghandle.php?action=revisionDisplay&title=About&revision=6
	var adaptor = tiddler.fields['temp.adaptor'];
	// now get the latest revision
	var urlTemplate = '%0msghandle.php?action=revisionDisplay&title=%1&revision=%2';
	var url = urlTemplate.format([adaptor.host,tiddler.title,pageRevision]);
	var req = doHttp('GET',url,null,null,null,null,ccTiddlyAdaptor.getTiddlerCallback2,tiddler);
//#displayMessage("req:"+req);
};

// http://cctiddly.sourceforge.net/msghandle.php?action=revisionDisplay&title=About&revision=6
/*
About
About
!About\nccTiddly is a tiddly adaptation based on PHP and MySQL to store tiddlers. This is a server side adaptation which allow its user to change their TiddlyWiki over HTTP. It is also possible to generate a standalone version with this!\n\n!Target audiance/uses\n*Online edittable TW\n**Blog\n**news site\n**personal ToDo list\n**online bookmark (with TiddlySnip, still in development)\n*As a collaboration tool\n\n!Features\n|!Add/Edit/Save tiddler over the web|basic tiddly wiki functions allow user to create, edit and delete tiddler but over the internet|\n|!Standalone generation|allow generation of standalone version if required, which is the one available on http://tiddlywiki.com|\n|!Access control|password protect the tiddly so only certain user can change its content over the net, hide ones you don't want anyone but you to see. All in the new privilege system!|\n|!Multiple config file|multiple config file for multiple ccT. One setup, multiple ccTiddly!|\n|!Select particular config file|ability to use a certain config file, which allow multiple tiddly host with one URL|\n|!Versioning|All versions of tiddlers kept|\n|!Import your TW|you can import your TW into ccT fo use and convert back to original TW when you need to bring it around on flashdisk|\n|!Multi-lingual|It may not be in your language now but you can easily translate to your own language|\n|!Tag filter|You can filter out your tiddlers by tag|
ccTiddly
200610221408
200601140131
other
6
*/
ccTiddlyAdaptor.getTiddlerCallback2 = function(status,tiddler,responseText,xhr)
{
//#displayMessage('getTiddlerCallback2 status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	var x = responseText.split('\n');
	var content = x[2];
	content = content.unescapeLineBreaks();
	try {
		//params.modifier = x[2];
		/*if(x[4])
			tiddler.created = Date.convertFromYYYYMMDDHHMM(x[4]);
		if(x[5])
			tiddler.modified = Date.convertFromYYYYMMDDHHMM(x[5]);
		tiddler.tags = x[6];*/
	} catch(ex) {
	}
	tiddler.updateAndSave();
};


ccTiddlyAdaptor.prototype.getTiddlerRevisionList = function(tiddler)
// get a list of the revisions for a page
{
	//title = encodeURIComponent(title);
//#displayMessage('getTiddlerRevisionList');
// http://cctiddly.sourceforge.net/msghandle.php?action=revisionList&title=About

	var urlTemplate = '%0msghandle.php?action=revisionList&title=%1';
	var url = urlTemplate.format([this.host,tiddler.title]);
//#displayMessage('getccTiddly url: '+url);

	tiddler.fields['server.workspace'] = null;
	tiddler.fields['server.type'] = 'cctiddly';
	tiddler.fields['temp.adaptor'] = this;
	var req = doHttp('GET',url,null,null,null,null,ccTiddlyAdaptor.getTiddlerRevisionListCallback,tiddler);
//#displayMessage("req:"+req);
};

ccTiddlyAdaptor.getTiddlerRevisionListCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('getTiddlerRevisionListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
//#displayMessage('callback:'+params.callback);
	revisions = [];
	var r =  responseText;
	if(r != '-') {
		var revs = r.split('\n');
		for(var i=0; i<revs.length; i++) {
			var parts = revs[i].split(' ');
			if(parts.length>1) {
				revisions[i] = {};
				revisions[i].modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
				revisions[i].key = parts[1];
			}
		}
	}
	tiddler.fields['temp.revisions'] = revisions;
	if(tiddler.fields['temp.callback'])
		tiddler.fields['temp.callback'](tiddler);
};

//# placeholder, not complete
ccTiddlyAdaptor.getTiddlerRevision = function(tiddler,revision,src,updateTimeline)
{
	//title = encodeURIComponent(title);
	if(tiddler.fields.serverPageRevision == revision)
		return;
	//zw.status('loading...');
	revision = revision ? '&revision=' + revision : '';
	updateTimeline = updateTimeline ? '&updatetimeline=1' : '';
	//ajax.get('?action=get&id=' + encodeURIComponent(title) + revision + updateTimeline + '&' + zw.no_cache(),displayTiddlerRevisionCallback)
};

//# placeholder, not complete
ccTiddlyAdaptor.getTiddlerRevisionCallback = function(status,tiddler,responseText,xhr)
{
	//#displayMessage('getTiddlerRevisionCallback status:'+status);
	//#displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
	var encoded = responseText;
	if(encoded.indexOf('\n') > -1) {
		var parts = encoded.split('\n');
		var title = parts[0];
		tiddler.set(title,Tiddler.unescapeLineBreaks(parts[1].htmlDecode()),parts[2],
				Date.convertFromYYYYMMDDHHMM(parts[3]),parts[5],
				Date.convertFromYYYYMMDDHHMM(parts[4]));
		tiddler.revisionKey = parts[7];
		story.refreshTiddler(tiddler.title,DEFAULT_VIEW_TEMPLATE,true);
		if(parts[6] == 'update timeline')
			store.notify('TabTimeline',true);
	} else if(encoded != '-') {
		alert(encoded); // error message
	}
	//zw.status(false);
};

//# placeholder, not complete
ccTiddlyAdaptor.putTiddler = function(tiddler)
{
	var title = encodeURIComponent(tiddler.title);
	var urlTemplate = '%0RPC2/';
	var url = urlTemplate.format([this.host,this.workspace,title]);
//#displayMessage('putZiddlyWwiki url: '+url);

	tiddler.fields['server.type'] = 'cctiddly';
	var req =doHttp('POST',url,payload,null,this.username,this.password,ccTiddlyAdaptor.putTiddlerCallback,tiddler.text);
//#displayMessage("req:"+req);
};

ccTiddlyAdaptor.putTiddlerCallback = function(status,params,responseText,xhr)
{
	displayMessage('putTiddlerCallback status:'+status);
	displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
};

ccTiddlyAdaptor.prototype.getWorkspaceList = function(callback,callbackParams) {return false;};
ccTiddlyAdaptor.prototype.getWorkspaceList = function(callback,callbackParams) {return false;};
ccTiddlyAdaptor.prototype.getTiddlerList = function(callback,callbackParams) {return false;};
ccTiddlyAdaptor.prototype.close = function() {return true;};

config.adaptors['cctiddly'] = ccTiddlyAdaptor;
} // end of 'install only once'
//}}}
