/***
|''Name:''|JSPWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from JSP Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#JSPWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/JSPWikiAdaptorPlugin.js|
|''Version:''|0.1.2|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

''For debug:''
|''Default JSPWiki Server''|<<option txtJSPWikiDefaultServer>>|
|''Default JSPWiki Web(workspace)''|<<option txtJSPWikiDefaultWorkspace>>|
|''Default JSPWiki username''|<<option txtJSPWikiUsername>>|
|''Default JSPWiki password''|<<option txtJSPWikiPassword>>|

***/

//{{{
if(!config.options.txtJSPWikiDefaultServer)
	{config.options.txtJSPWikiDefaultServer = 'www.JSPWiki.org';}
if(!config.options.txtJSPWikiDefaultWorkspace)
	{config.options.txtJSPWikiDefaultWorkspace = '';}
if(!config.options.txtJSPWikiUsername)
	{config.options.txtJSPWikiUsername = '';}
if(!config.options.txtJSPWikiPassword)
	{config.options.txtJSPWikiPassword = '';}
if(!config.options.chkJSPWikiPasswordRequired)
	{config.options.chkJSPWikiPasswordRequired = true;}
//}}}

// Ensure that the plugin is only installed once.
if(!version.extensions.JSPWikiAdaptorPlugin) {
version.extensions.JSPWikiAdaptorPlugin = {installed:true};

JSPWikiAdaptor = {}; // 'namespace' for local functions

JSPWikiAdaptor.getTiddler = function(title,params)
{
// http://JSPWiki.org/wiki/WikiRPCInterface
// http://www.JSPWiki.org/RPCU/

	//#var fn = 'wiki.getRPCVersionSupported';
	//#var fn = 'wiki.getAllTiddlers';
	var fn = 'wiki.getPage';
	var urlTemplate = 'http://%0/RPCU/';
	var url = urlTemplate.format([params.serverHost,params.serverWorkspace,title]);
//#displayMessage('getJSPWwiki url: '+url);

	var fnParamsTemplate ='<params><param><value><string>%0</string></value></param></params>';
	var fnParams = fnParamsTemplate.format([title]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#displayMessage("payload:"+payload);

	params.title = title;
	params.wikiformat = 'JSPWiki';
	params.serverType = 'JSPWiki';
	var req =doHttp('POST',url,payload,null,params.username,params.password,JSPWikiAdaptor.getTiddlerCallback,params);
//#displayMessage("req:"+req);
};

JSPWikiAdaptor.getTiddlerCallback = function(status,params,responseText,xhr)
{
//#displayMessage('JSP.getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	var content = responseText;
	content = content.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value>','');
	content = content.replace('</value></param></params></methodResponse>','');
	var tiddler = store.createTiddler(params.title);
	tiddler.updateFieldsAndContent(params,content);
};

JSPWikiAdaptor.putTiddler = function(title,params)
{
// http://www.JSPWiki.org/wiki/WikiRPCInterface2
// http://www.JSPWiki.org/RPC2/
	var text = store.fetchTiddler(title).text;

//#putPage(utf8 page,utf8 content,struct attributes )
	var fn = 'wiki.putPage';
	var urlTemplate = 'http://%0/RPC2/';
	var url = urlTemplate.format([params.serverHost,params.serverWorkspace,title]);
//#displayMessage('putJSPWwiki url: '+url);

	var fnParamsTemplate ='<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([title,text]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#displayMessage("payload:"+payload);

	params.title = title;
	params.wikiformat = 'JSPWiki';
	params.serverType = 'JSPWiki';
	var req =doHttp('POST',url,payload,null,username,password,JSPWikiAdaptor.putTiddlerCallback,params);
//#displayMessage("req:"+req);
};

JSPWikiAdaptor.putTiddlerCallback = function(status,params,responseText,xhr)
{
	displayMessage('putTiddlerCallback status:'+status);
	displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
};

config.hostFunctions.getTiddler['JSPWiki'] = JSPWikiAdaptor.getTiddler;
config.hostFunctions.putTiddler['JSPWiki'] = JSPWikiAdaptor.putTiddler;

} // end of 'install only once'
//}}}
