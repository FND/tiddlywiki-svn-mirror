/***
|''Name:''|JSPWikiChannelPlugin|
|''Description:''|Channel for moving data to and from JSP Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#JSPWikiChannelPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.0.5|
|''Status:''|alpha pre-release|
|''Date:''|Dec 30, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

|''Default JSPWiki Server''|<<option txtjspikiDefaultServer>>|
|''Default JSPWiki Web(workspace)''|<<option txtjspikiDefaultWorkspace>>|
|''Default JSPWiki username''|<<option txtjspwikiUsername>>|
|''Default JSPWiki password''|<<option txtjspwikiPassword>>|

***/

//{{{
if(!config.options.txtjspwikiDefaultServer)
	{config.options.txtjspwikiDefaultServer = 'www.jspwiki.org';}
if(!config.options.txtjspwikiDefaultWorkspace)
	{config.options.txtjspwikiDefaultWorkspace = '';}
if(!config.options.txtjspwikiUsername)
	{config.options.txtjspwikiUsername = '';}
if(!config.options.txtjspwikiPassword)
	{config.options.txtjspwikiPassword = '';}
if(!config.options.chkjspwikiPasswordRequired)
	{config.options.chkjspwikiPasswordRequired = true;}
//}}}

// Ensure that the plugin is only installed once.
if(!version.extensions.JSPWikiChannelPlugin) {
version.extensions.JSPWikiChannelPlugin = {installed:true};

JSPWikiChannel = {}; // 'namespace' for local functions

JSPWikiChannel.getPage = function(title,params)
{
// http://jspwiki.org/wiki/WikiRPCInterface
// http://www.jspwiki.org/RPCU/

	//#var fn = 'wiki.getRPCVersionSupported';
	//#var fn = 'wiki.getAllPages';
	var fn = 'wiki.getPage';
	var urlTemplate = 'http://%0/RPCU/';
	var url = urlTemplate.format([params.serverHost,params.workspace,title]);
//#displayMessage('getJSPWwiki url: '+url);

	var fnParamsTemplate ='<params><param><value><string>%0</string></value></param></params>';
	var fnParams = fnParamsTemplate.format([title]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#displayMessage("payload:"+payload);

	params.title = title;
	params.wikiformat = 'JSPWiki';
	params.serverType = 'jspwiki';
	var req =doHttp('POST',url,payload,null,params.username,params.password,JSPWikiChannel.getPageCallback,params);
//#displayMessage("req:"+req);
};

JSPWikiChannel.getPageCallback = function(status,params,responseText,xhr)
{
//#displayMessage('JSP.getPageCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	var content = responseText;
	content = content.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value>','');
	content = content.replace('</value></param></params></methodResponse>','');
	var tiddler = nexus.createTiddler(params,content);
	tiddler.modifier = params.serverHost;
	nexus.updateStory(tiddler);
};

JSPWikiChannel.putPage = function(title,params)
{
// http://www.jspwiki.org/wiki/WikiRPCInterface2
// http://www.jspwiki.org/RPC2/
	var text = store.fetchTiddler(title).text;

//#putPage(utf8 page,utf8 content,struct attributes )
	var fn = 'wiki.putPage';
	var urlTemplate = 'http://%0/RPC2/';
	var url = urlTemplate.format([params.serverHost,params.workspace,title]);
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
	params.serverType = 'jspwiki';
	var req =doHttp('POST',url,payload,null,username,password,JSPWikiChannel.putPageCallback,params);
//#displayMessage("req:"+req);
};

JSPWikiChannel.putPageCallback = function(status,params,responseText,xhr)
{
	displayMessage('putPageCallback status:'+status);
	displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
};

Nexus.Functions.getPage['jspwiki'] = JSPWikiChannel.getPage;
Nexus.Functions.putPage['jspwiki'] = JSPWikiChannel.putPage;

} // end of 'install only once'
//}}}
