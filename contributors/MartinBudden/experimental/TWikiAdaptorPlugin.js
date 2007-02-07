/***
|''Name:''|TWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from TWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#TWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/TWikiAdaptorPlugin.js|
|''Version:''|0.1.5|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

''For debug:''
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
if(!version.extensions.TWikiAdaptorPlugin) {
version.extensions.TWikiAdaptorPlugin = {installed:true};

TWikiAdaptor = function()
{
	this.host = null;
	this.workspace = null;
	return this;
};

TWikiAdaptor.prototype.openHost = function(host,callback,callbackParams)
{
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(!host.match(/\/bin$/))
		host += '/cgi-bin';
	if(host.substr(-1)!="/")
		host = host + "/";
	this.host = host;
	if(callback)
		window.setTimeout(callback,0,true,this,callbackParams);
	return true;
};

TWikiAdaptor.getTiddler = function(title,params)
{
// http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts
// http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts?raw=text
//# http://twiki.org/cgi-bin/view/MyWeb/MyTopic?raw=text
//# http://twiki.org/cgi-bin/rest/EmptyPlugin/example?debugenableplugin=EmptyPlugin
//# http://my.host/bin/rest/<subject>/<verb>
//# where <subject> must be the WikiWord name of one of the installed TWikiPlugins,
//# and <verb> is the alias for the function registered using the registerRESTHandler.
//# http://smglinx.intra/twiki/bin/view/SMG/WebHome?raw=text';

	var urlTemplate = '%0view/%1/%2?raw=text';
	var serverHost = params.serverHost;
	if(!serverHost.match(/\/bin$/))
		serverHost += '/cgi-bin';
	var url = urlTemplate.format([this.host,this.workspace,title]);
//#displayMessage('getTwiki url: '+url);

	params.title = title;
	params.wikiformat = 'TWiki';
	var req = doHttp('GET',url,null,null,null,null,TWikiAdaptor.getTiddlerCallback,params,null);
//#displayMessage("req:"+req);
};

TWikiAdaptor.getTiddlerCallback = function(status,params,responseText,xhr)
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

TWikiAdaptor.putTiddler = function(title,params)
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
	var req = doHttp('GET',url,null,null,params.username,params.password,TWikiAdaptor.putTiddlerCallback,params,null);
//#displayMessage("req:"+x);
};

TWikiAdaptor.putTiddlerCallback = function(status,params,responseText,xhr)
{
	//#displayMessage('response:'+responseText.substr(0,30));
	displayMessage('TWiki put status:'+status);
};

TWikiAdaptor.prototype.close = function() {return true;};
config.adaptors['twiki'] = TWikiAdaptor;
} //# end of 'install only once'
//}}}
