/***
|''Name:''|ccTiddlyChannelPlugin|
|''Description:''|Channel for moving data to and from ccTiddlys|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#ccTiddlyChannelPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.0.5|
|''Date:''|Dec 30, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

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
if(!version.extensions.ccTiddlyChannelPlugin) {
version.extensions.ccTiddlyChannelPlugin = {installed:true};

ccTiddlyChannel = {}; // 'namespace' for local functions

ccTiddlyChannel.getTiddler = function(title,params)
// get a list of the revisions for a page
{
	//title = encodeURIComponent(title);
//#displayMessage('getTiddler:'+title);
//# http://cctiddly.sourceforge.net/msghandle.php?action=revisionList&title=About

	var urlTemplate = 'http://%0/msghandle.php?action=revisionList&title=%1';
	var url = urlTemplate.format([params.serverHost,title]);
//#displayMessage('getccTiddly url: '+url);

	params.title = title;
	params.workspace = null;
	params.serverType = 'cctiddly';
	var req = doHttp('GET',url,null,null,null,null,ccTiddlyChannel.getTiddlerCallback1,params,null);
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
ccTiddlyChannel.getTiddlerCallback1 = function(status,params,responseText,xhr)
{
//#displayMessage('getTiddlerCallback1 status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
	//params.revisions = [];
	var r =  responseText;
	var revs = r.split('\n');
	var parts = revs[0].split(' ');
	params.serverPageRevision = parts[1];
	/*for(var i=0; i<revs.length; i++) {
		var parts = revs[i].split(' ');
		if(parts.length>1) {
			params.revisions[i] = {};
			params.revisions[i].modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
			params.revisions[i].key = parts[1];
		}
	}*/
// http://cctiddly.sourceforge.net/msghandle.php?action=revisionDisplay&title=About&revision=6
	var urlTemplate = 'http://%0/msghandle.php?action=revisionDisplay&title=%1&revision=%2';
	var url = urlTemplate.format([params.serverHost,params.title,params.serverPageRevision]);
	var req = doHttp('GET',url,null,null,null,null,ccTiddlyChannel.getTiddlerCallback2,params,null);
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
ccTiddlyChannel.getTiddlerCallback2 = function(status,params,responseText,xhr)
{
//#displayMessage('getTiddlerCallback2 status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	var x = responseText.split('\n');
	var content = x[2];
	content = content.unescapeLineBreaks();
	var tiddler = store.createTiddler(params.title);
	tiddler.updateFieldsAndContent(params,content);
	try {
		//tiddler.modifier = x[2];
		/*if(x[4])
			tiddler.created = Date.convertFromYYYYMMDDHHMM(x[4]);
		if(x[5])
			tiddler.modified = Date.convertFromYYYYMMDDHHMM(x[5]);
		tiddler.tags = x[6];*/
	} catch(ex) {
	}
	store.updateStory(tiddler);
};


ccTiddlyChannel.getTiddlerRevisionList = function(title,params)
// get a list of the revisions for a page
{
	//title = encodeURIComponent(title);
//#displayMessage('getTiddlerRevisionList');
// http://cctiddly.sourceforge.net/msghandle.php?action=revisionList&title=About

	var urlTemplate = 'http://%0/msghandle.php?action=revisionList&title=%1';
	var url = urlTemplate.format([params.serverHost,title]);
//#displayMessage('getccTiddly url: '+url);

	params.title = title;
	params.workspace = null;
	params.serverType = 'cctiddly';
	var req = doHttp('GET',url,null,null,null,null,ccTiddlyChannel.getTiddlerRevisionListCallback,params,null);
//#displayMessage("req:"+req);
};

ccTiddlyChannel.getTiddlerRevisionListCallback = function(status,params,responseText,xhr)
{
//#displayMessage('getTiddlerRevisionListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
//#displayMessage('callback:'+params.callback);
	params.revisions = [];
	var r =  responseText;
	if(r != '-') {
		var revs = r.split('\n');
		for(var i=0; i<revs.length; i++) {
			var parts = revs[i].split(' ');
			if(parts.length>1) {
				params.revisions[i] = {};
				params.revisions[i].modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
				params.revisions[i].key = parts[1];
			}
		}
	}
	params.callback(params);
};

ccTiddlyChannel.getTiddlerRevision = function(title,revision,src,updateTimeline)
{
	//title = encodeURIComponent(title);
	var tiddler = store.fetchTiddler(title);
	if(tiddler.fields.serverPageRevision == revision)
		return;
	zw.status('loading...');
	revision = revision ? '&revision=' + revision : '';
	updateTimeline = updateTimeline ? '&updatetimeline=1' : '';
	//ajax.get('?action=get&id=' + encodeURIComponent(title) + revision + updateTimeline + '&' + zw.no_cache(),displayTiddlerRevisionCallback)
};

ccTiddlyChannel.getTiddlerRevisionCallback = function(status,params,responseText,xhr)
{
	//#displayMessage('getTiddlerRevisionCallback status:'+status);
	//#displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
	var encoded = responseText;
	if(encoded.indexOf('\n') > -1) {
		var parts = encoded.split('\n');
		var tiddler = new Tiddler();
		var title = parts[0];
		tiddler.set(title,Tiddler.unescapeLineBreaks(parts[1].htmlDecode()),parts[2],
				Date.convertFromYYYYMMDDHHMM(parts[3]),parts[5],
				Date.convertFromYYYYMMDDHHMM(parts[4]));
		tiddler.revisionKey = parts[7];
		store.addTiddler(tiddler);
		story.refreshTiddler(title,DEFAULT_VIEW_TEMPLATE,true);
		if(parts[6] == 'update timeline')
			store.notify('TabTimeline',true);
	} else if(encoded != '-') {
		alert(encoded); // error message
	}
	zw.status(false);
};

ccTiddlyChannel.putTiddler = function(title,params)
{
	var content = store.fetchTiddler(title).text;
	title = encodeURIComponent(title);
	var urlTemplate = 'http://%0/RPC2/';
	var url = urlTemplate.format([params.serverHost,params.workspace,encodeURIComponent(title)]);
//#displayMessage('putZiddlyWwiki url: '+url);

	params.title = title;
	params.serverHost = server;
	params.workspace = workspace;
	params.serverType = 'cctiddly';
	var req =doHttp('POST',url,payload,null,params.username,params.password,ccTiddlyChannel.putTiddlerCallback,params);
//#displayMessage("req:"+req);
};

ccTiddlyChannel.putTiddlerCallback = function(status,params,responseText,xhr)
{
	displayMessage('putTiddlerCallback status:'+status);
	displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
};


config.hostFunctions.getTiddler['cctiddly'] = ccTiddlyChannel.getTiddler;
//config.hostFunctions.getTiddlerRevisionList['cctiddly'] = ccTiddlyChannel.getTiddlerRevisionList;
//config.hostFunctions.getTiddlerRevision['cctiddly'] = ccTiddlyChannel.getTiddlerRevision;
//config.hostFunctions.putTiddler['cctiddly'] = ccTiddlyChannel.putTiddler;

} // end of 'install only once'
//}}}
