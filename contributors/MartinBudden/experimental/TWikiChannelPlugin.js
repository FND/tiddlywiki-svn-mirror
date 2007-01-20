/***
|''Name:''|TWikiChannelPlugin|
|''Description:''|Channel for moving data to and from TWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#TWikiChannelPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.1.0|
|''Date:''|Jan 20, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

|''Default TWiki Server''|<<option txttwikiDefaultServer>>|
|''Default TWiki Web(workspace)''|<<option txttwikiDefaultWorkspace>>|
|''Default TWiki username''|<<option txttwikiUsername>>|
|''Default TWiki password''|<<option txttwikiPassword>>|

//#var defaultServer = 'twiki.org/cgi-bin';
//#defaultServer = 'smglinx.intra/twiki/bin';
//#defaultWorkspace ='SMG';
//#workspace = 'Sandbox';
//#workspace = 'Main';
//#Channel.PutTWikiTiddler('SandBox29','twiki.org','Sandbox',user,password);

***/

//{{{
if(!config.options.txttwikiDefaultServer)
	{config.options.txttwikiDefaultServer = 'twiki.org';}
if(!config.options.txttwikiDefaultWorkspace)
	{config.options.txttwikiDefaultWorkspace = 'Main';}
if(!config.options.txttwikiUsername)
	{config.options.txttwikiUsername = '';}
if(!config.options.txttwikiPassword)
	{config.options.txttwikiPassword = '';}
//}}}

// Ensure that the plugin is only installed once.
if(!version.extensions.TWikiChannelPlugin) {
version.extensions.TWikiChannelPlugin = {installed:true};

TWikiChannel = {}; // 'namespace' for local functions

TWikiChannel.getTiddler = function(title,params)
{
// http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts
// http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts?raw=text
//# http://twiki.org/cgi-bin/view/MyWeb/MyTopic?raw=text
//# http://twiki.org/cgi-bin/rest/EmptyPlugin/example?debugenableplugin=EmptyPlugin
//# http://my.host/bin/rest/<subject>/<verb>
//# where <subject> must be the WikiWord name of one of the installed TWikiPlugins,
//# and <verb> is the alias for the function registered using the registerRESTHandler.
//# http://smglinx.intra/twiki/bin/view/SMG/WebHome?raw=text';

	var urlTemplate = '%0/view/%1/%2?raw=text';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var serverHost = params.serverHost;
	if(!serverHost.match(/\/bin$/))
		serverHost += '/cgi-bin';
	var url = urlTemplate.format([serverHost,params.serverWorkspace,title]);
//#displayMessage('getTwiki url: '+url);

	params.title = title;
	params.wikiformat = 'TWiki';
	var req = doHttp('GET',url,null,null,null,null,TWikiChannel.getTiddlerCallback,params,null);
//#displayMessage("req:"+req);
};

TWikiChannel.getTiddlerCallback = function(status,params,responseText,xhr)
{
//#displayMessage('TWiki.getTiddlerCallback:'+responseText.substr(0,50));
	var content = responseText;
//<form><textarea readonly="readonly" wrap="virtual" rows="50" cols="80">
	var contentRegExp = /<textarea.*?>((?:.|\n)*?)<\/textarea>/mg;
	contentRegExp.lastIndex = 0;
	var match = contentRegExp.exec(responseText);
	if(match) {
		content = match[1].htmlDecode();
	}

	var tiddler = store.createTiddler(params.title);
	tiddler.updateFieldsAndContent(params,content);
};

TWikiChannel.putTiddler = function(title,params)
{
	var text = store.fetchTiddler(title).text;
	//var urlTemplate = 'http://%0/cgi-bin/save/%1/%2?text=%3';
	//var urlTemplate = 'http://%0/cgi-bin/edit/%1/%2?text=%3';

	var urlTemplate = '%0/save/%1/%2?text=%3';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var serverHost = params.serverHost;
	if(!serverHost.match(/\/bin$/))
		serverHost += '/cgi-bin';
	var url = urlTemplate.format([serverHost,params.serverWorkspace,title,text]);
//# displayMessage('putUrl:'+url);

	params.title = title;
	var req = doHttp('GET',url,null,null,params.username,params.password,TWikiChannel.putTiddlerCallback,params,null);
//#displayMessage("req:"+x);
};

TWikiChannel.putTiddlerCallback = function(status,params,responseText,xhr)
{
	//#displayMessage('response:'+responseText.substr(0,30));
	displayMessage('TWiki put status:'+status);
};

config.hostFunctions.getTiddler['twiki'] = TWikiChannel.getTiddler;
config.hostFunctions.putTiddler['twiki'] = TWikiChannel.putTiddler;

} // end of 'install only once'
//}}}
