/***
|''Name:''|TWikiChannelPlugin|
|''Description:''|Channel for moving data to and from TWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#TWikiChannelPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.0.5|
|''Date:''|Dec 30, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

|''Default TWiki Server''|<<option txtTWikiDefaultServer>>|
|''Default TWiki Web(workspace)''|<<option txtTWikiDefaultWorkspace>>|
|''Default TWiki username''|<<option txtTWikiUsername>>|
|''Default TWiki password''|<<option txtTWikiPassword>>|

//#var defaultServer = 'twiki.org/cgi-bin';
//#defaultServer = 'smglinx.intra/twiki/bin';
//#defaultWorkspace ='SMG';
//#workspace = 'Sandbox';
//#workspace = 'Main';
//#Channel.PutTWikiPage('SandBox29','twiki.org','Sandbox',user,password);

***/

//{{{
if(!config.options.txtTWikiDefaultServer)
	{config.options.txtTWikiDefaultServer = 'twiki.org';}
if(!config.options.txtTWikiDefaultWorkspace)
	{config.options.txtTWikiDefaultWorkspace = 'Main';}
if(!config.options.txtTWikiUsername)
	{config.options.txtTWikiUsername = '';}
if(!config.options.txtTWikiPassword)
	{config.options.txtTWikiPassword = '';}
//}}}

// Ensure that the plugin is only installed once.
if(!version.extensions.TWikiChannelPlugin) {
version.extensions.TWikiChannelPlugin = {installed:true};

TWikiChannel = {}; // 'namespace' for local functions

TWikiChannel.getPage = function(title,params)
{
// http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts
// http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts?raw=text
//# http://twiki.org/cgi-bin/view/MyWeb/MyTopic?raw=text
//# http://twiki.org/cgi-bin/rest/EmptyPlugin/example?debugenableplugin=EmptyPlugin
//# http://my.host/bin/rest/<subject>/<verb>
//# where <subject> must be the WikiWord name of one of the installed TWikiPlugins,
//# and <verb> is the alias for the function registered using the registerRESTHandler.
//# http://smglinx.intra/twiki/bin/view/SMG/WebHome?raw=text';

	//var urlTemplate = 'http://%0/cgi-bin/view/%1/%2?raw=text';
	var urlTemplate = 'http://%0/view/%1/%2?raw=text';
	var serverHost = params.serverHost;
	if(!serverHost.match(/\/bin$/))
		serverHost += '/cgi-bin';
	var url = urlTemplate.format([serverHost,params.workspace,title]);
//#displayMessage('getTwiki url: '+url);

	params.title = title;
	params.wikiformat = 'TWiki';
	var req = doHttp('GET',url,null,null,null,null,TWikiChannel.getPageCallback,params,null);
//#displayMessage("req:"+req);
};

TWikiChannel.getPageCallback = function(status,params,responseText,xhr)
{
//#displayMessage('TWiki.getPageCallback:'+responseText.substr(0,50));
	var content = responseText;
//<form><textarea readonly="readonly" wrap="virtual" rows="50" cols="80">
	var contentRegExp = /<textarea.*?>((?:.|\n)*?)<\/textarea>/mg;
	contentRegExp.lastIndex = 0;
	var match = contentRegExp.exec(responseText);
	if(match) {
		content = match[1].htmlDecode();
	}

	var tiddler = nexus.createTiddler(params,content);
	tiddler.fields['changecount'] = -1;
	tiddler.modifier = params.serverHost;
	nexus.updateStory(tiddler);
};

TWikiChannel.putPage = function(title,params)
{
	var text = store.fetchTiddler(title).text;
	//var urlTemplate = 'http://%0/cgi-bin/save/%1/%2?text=%3';
	var urlTemplate = 'http://%0/save/%1/%2?text=%3';
	//var urlTemplate = 'http://%0/cgi-bin/edit/%1/%2?text=%3';

	var serverHost = params.serverHost;
	if(!serverHost.match(/\/bin$/))
		serverHost += '/cgi-bin';
	var url = urlTemplate.format([serverHost,params.workspace,title,text]);
//# displayMessage('putUrl:'+url);

	params.title = title;
	var req = doHttp('GET',url,null,null,params.username,params.password,TWikiChannel.putPageCallback,params,null);
//#displayMessage("req:"+x);
};

TWikiChannel.putPageCallback = function(status,params,responseText,xhr)
{
	//#displayMessage('response:'+responseText.substr(0,30));
	displayMessage('TWiki put status:'+status);
};

Nexus.Functions.getPage['twiki'] = TWikiChannel.getPage;
Nexus.Functions.putPage['twiki'] = TWikiChannel.putPage;

} // end of 'install only once'
//}}}
