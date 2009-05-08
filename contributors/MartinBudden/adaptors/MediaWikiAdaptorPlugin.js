/***
|''Name:''|MediaWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data from MediaWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#MediaWikiAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/MediaWikiAdaptorPlugin.js |
|''Version:''|0.8.10|
|''Date:''|Jul 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.1|

|''Max number of tiddlers to download''|<<option txtMediaWikiAdaptorLimit>>|


MediaWiki REST documentation is at:
http://meta.wikimedia.org/w/api.php
http://meta.wikimedia.org/w/query.php

''For debug:''
|''Default MediaWiki username''|<<option txtMediaWikiUsername>>|
|''Default MediaWiki password''|<<option txtMediaWikiPassword>>|

***/
//{{{
if(!config.options.txtMediaWikiUsername)
	{config.options.txtMediaWikiUsername = '';}
if(!config.options.txtMediaWikiPassword)
	{config.options.txtMediaWikiPassword = '';}
//}}}

//{{{
//# Ensure that the plugin is only installed once.
if(!config.adaptors.mediawiki) {

if(config.options.txtMediaWikiAdaptorLimit == undefined)
	{config.options.txtMediaWikiAdaptorLimit = '500';}

//#config.adaptors.MediaWikiAdaptor.loadMissingTiddler = Story.prototype.loadMissingTiddler;
//#Story.prototype.loadMissingTiddler = function(title,fields,tiddlerElem)
//#{
//#	var i = title.indexOf('#');
//#	if(i!=-1) {
//#		title = title.substr(0,i);
//#	}
//#	config.adaptors.MediaWikiAdaptor.loadMissingTiddler.apply(this,arguments);
//#};

config.adaptors.mediawiki = function() {};

(function(adaptor) {

adaptor.prototype = new AdaptorBase();

adaptor.serverType = 'mediawiki';
adaptor.serverParsingErrorMessage = "Error parsing result from server";
adaptor.errorInFunctionMessage = "Error in function MediaWikiAdaptor.%0";

adaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return httpReq('GET',uri,callback,params,headers,data,contentType,username,password);
};

adaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return httpReq('POST',uri,callback,params,headers,data,contentType,username,password);
};

adaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

adaptor.normalizedTitle = function(title)
{
	var n = title.charAt(0).toUpperCase() + title.substr(1);
	return n.replace(/\s/g,'_');
};

adaptor.dateFromTimestamp = function(timestamp)
// Convert a MediaWiki timestamp in ISO 8601 (YYYY-MM-DDThh:mm:ssZ)  format into a JavaScript Date object
{
	var dt = timestamp;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

adaptor.anyChild = function(obj)
//# convenience function for getting children whose keys are unknown
//# such as children of pages subobjects, whose keys are numeric page ids
{
	for(var key in obj) {
		if(typeof obj[key]!='function')
			return obj[key];
	}
	return null;
};

//#
//#api.php ? action=login & lgname=Bob & lgpassword=secret
//#<?xml version="1.0" encoding="utf-8"?>
//#<api>
//#  <login
//#    result="Success"
//#    lguserid="12345"
//#    lgusername="Bob"
//#    lgtoken="b5780b6e2f27e20b450921d9461010b4"
//#    cookieprefix="enwiki"
//#    sessionid="08nj1ioefhlvmdjfor5to3mvv5"
//#  />
//#</api>

adaptor.prototype.complete = function(context,fn)
{
	context.complete = fn;
	var ret;
	if(context.sessionToken) {
		ret = context.complete(context,context.userParams);
	} else {
		ret = this.login(context);
	}
	return ret;
};

adaptor.prototype.login = function(context)
{
//#console.log('login',context);
	//#context = this.setContext(context,userParams,callback);
	var host = this.fullHostName(context.host);
	var uriTemplate = '%0/api.php?action=login&format=json&lgname=%1&lgpassword=%2';
	var uri = uriTemplate.format([host,escape(config.options.txtMediaWikiUsername),escape(config.options.txtMediaWikiPassword)]);
//#console.log('uri:'+uri);

	var req = adaptor.doHttpPOST(uri,adaptor.loginCallback,context,{"Content-Length":"1"}," ");
//#console.log('req:'+req);
	return typeof req == 'string' ? req : true;
};

//#{
//# "query": {
//# 	"pages" : { 
//#			"5982813": {
//#				"pageid":5982813,
//#				"ns":0,
//#				"title":"MainPage",
//#				"touched":"2008-05-07T05:22:48Z",
//#				"lastrevid":64058732,
//#				"counter":0,
//#				"length":22,
//#				"redirect":"",
//#				"new":"",
//#				"edittoken":"19f47e1ab9dc35ebc065e9cdf4a49516+\\",
//#				"revisions":[{"revid":64058732,"user":"Ilingod","timestamp":"2006-07-16T03:06:46Z","comment":"Redirecting to [[Main Page]]"}]}
//#}
//#}}

//#{"login":{"result":"Success","lguserid":11,"lgusername":"MartinBudden","lgtoken":"9fa40aeb51e083cf4dc0d0f4909c01e3"}}
adaptor.loginCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('loginCallback:'+status);
	if(status) {
		try {
			eval('var info=' + responseText);
		} catch (ex) {
			context.statusText = exceptionText(ex,adaptor.serverParsingErrorMessage);
			if(context.complete)
				context.complete(context,context.userParams);
			return;
		}
		context.status = true;
		context.sessionToken = info.login.lgtoken;
		if(context.complete)
			context.complete(context,context.userParams);
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
		if(context.callback)
			context.callback(context,context.userParams);
	}
};

adaptor.getWorkspaceId = function(workspace)
{
	var workspaces = {
		"media": -2, "special":-1,
		"":0, "talk":1,"user":2,"user talk":3,"meta":4,"meta talk":5,"image":6,"image talk":7,
		"mediawiki":8,"mediawiki talk":9,"template":10,"template talk":11,"help":12,"help talk":13,
		"category":14,"category talk":15};
	workspace = workspace.toLowerCase();
	var id = workspaces[workspace];
	if(!id) {
		if(workspace=="" || workspace=="main")
			id = 0;
		else if(workspace.lastIndexOf("talk") != -1)
			id = 5;
		else
			id = 4;
	}
	return id;
};

adaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	if(!workspace)
		workspace = "";
//#console.log("openWorkspace:"+workspace);
	this.workspace = workspace;
	this.workspaceId = null;
	context = this.setContext(context,userParams,callback);
	if(workspace) {
		if(context.workspaces) {
			for(var i=0;i<context.workspaces.length;i++) {
				if(context.workspaces[i].name == workspace) {
					this.workspaceId = context.workspaces[i].id;
					break;
				}
			}
		} else {
			workspace = workspace.toLowerCase();
			this.workspaceId = adaptor.getWorkspaceId(workspace);
		}
	}
	if(!this.workspaceId) {
		if(workspace=="" || workspace.toLowerCase()=="main")
			this.workspaceId = 0;
		else if(workspace.lastIndexOf("talk") != -1)
			this.workspaceId = 5;
		else
			this.workspaceId = 4;
	}
//#console.log("workspaceId:"+this.workspaceId);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

adaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#console.log("getWorkspaceList");
//# http://meta.wikimedia.org/w/api.php?&action=query&meta=siteinfo&siprop=namespaces
//# http://wikipedia.org/w/api.php?&action=query&meta=siteinfo&siprop=namespaces
//# http://wiki.unamesa.org/api.php?&action=query&meta=siteinfo&siprop=namespaces
//# http://tiddlywiki.org/api.php?&action=query&meta=siteinfo&siprop=namespaces
	if(context.workspace) {
//#console.log("w:"+context.workspace);
		context.status = true;
		context.workspaces = [{name:context.workspace,title:context.workspace}];
		if(context.callback)
			window.setTimeout(function() {callback(context,userParams);},0);
		return true;
	}
	var uriTemplate = '%0/api.php?format=json&action=query&meta=siteinfo&siprop=namespaces';
	var uri = uriTemplate.format([context.host]);
//#console.log("uri:"+uri);
	var req = adaptor.doHttpGET(uri,adaptor.getWorkspaceListCallback,context);
	return typeof req == 'string' ? req : true;
};

//#{
//#	"query": {
//#		"namespaces": {
//#			"-2": {"id": -2,"*": "Media"},
//#			"-1": {"id": -1,"*": "Special"},
//#			"0":  {"id": 0,"*": ""},
//#			"1":  {"id": 1,"*": "Talk"},
//#			"2":  {"id": 2,"*": "User"},
//#			"3":  {"id": 3,"*": "User talk"},
//#			"4":  {"id": 4,"*": "Meta"}, //or Wikipedia or UnaMesa
//#			"5":  {"id": 5,"*": "Meta talk"}, // or Wikipedia talk or UnaMesa talk
//#			"6":  {"id": 6,"*": "Image"},
//#			"7":  {"id": 7,"*": "Image talk"},
//#			"8":  {"id": 8,"*": "MediaWiki"},
//#			"9":  {"id": 9,"*": "MediaWiki talk"},
//#			"10": {"id": 10,"*": "Template",
//#			"11": {"id": 11,"*": "Template talk"},
//#			"12": {"id": 12,"*": "Help"},
//#			"13": {"id": 13,"*": "Help talk"},
//#			"14": {"id": 14,"*": "Category"},
//#			"15": {"id": 15,"*": "Category talk"}
//#			}
//#		}
//#	}
//#}

adaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
//#console.log("getWorkspaceListCallback:"+status);
//#console.log(responseText);
	context.status = false;
	if(status) {
		try {
			eval('var info=' + responseText);
		} catch (ex) {
			context.statusText = exceptionText(ex,adaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		var namespaces = info.query.namespaces;
		var list = [];
		for(var i in namespaces) {
			var item = {};
			item.id = namespaces[i]['id'];
			item.title = namespaces[i]['*'];
			item.name = item.title;
			list.push(item);
		}
		context.workspaces = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
		context.statusCode = xhr.status;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

adaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
// get a list of the tiddlers in the current workspace
{
	context = this.setContext(context,userParams,callback);
	if(!context.filter)
		context.filter = filter;
//#console.log('getTiddlerList');
//# http://meta.wikimedia.org/w/api.php?action=query&list=allpages&aplimit=5&format=jsonfm
//# http://www.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=wiki
//# http://www.wikipedia.org/w/api.php?action=query&list=embeddedin&titles=Template:IPstack&eilimit=50&format=jsonfm
//# http://www.wikipedia.org/w/api.php?action=query&list=allpages&aplimit=50&format=jsonfm
//# http://www.wikipedia.org/w/query.php?what=category&cptitle=Wiki&format=jsonfm
//# http://wiki.unamesa.org/api.php?action=query&list=allpages&apnamespace=10&aplimit=50&format=jsonfm
//# http://tiddlywiki.org/api.php?action=query&list=allpages&format=jsonfm
//# http://tiddlywiki.org/api.php?action=query&list=allpages&aplimit=50&format=jsonfm

	context.tiddlers = [];
	context.uri = null;
	var host = this.fullHostName(context.host);
	if(!context.tiddlerLimit)
		context.tiddlerLimit = !config.options.txtMediaWikiAdaptorLimit ? config.maxTiddlerImportCount : config.options.txtMediaWikiAdaptorLimit;
    context.tiddlerLimit = parseInt(context.tiddlerLimit,10);
	var limit = context.tiddlerLimit;
	if(limit>500)
		limit = 500;
	filter = context.filter;
	if(filter) {
		var re = /\[(\w+)\[([ \w\.\:]+)\]\]/;
		var match = re.exec(filter);
		if(match) {
			var filterParams = adaptor.normalizedTitle(match[2]);
			switch(match[1]) {
			case 'tag':
				context.responseType = 'pages';
				var uriTemplate = '%0/query.php?format=json&what=category&cpnamespace=%1&cplimit=%2&cptitle=%3';
				break;
			case 'template':
				context.responseType = 'query.embeddedin';
				uriTemplate = '%0/api.php?format=json&action=query&list=embeddedin&einamespace=%1&eititle=Template:%3';
				if(limit)
					uriTemplate += '&eilimit=%2';
				break;
			case 'wikipedia':
				context.responseType = 'query.embeddedin';
				uriTemplate = '%0/api.php?format=json&action=query&list=embeddedin&einamespace=1&eititle=Wikipedia:%3';
				if(limit)
					uriTemplate += '&eilimit=%2';
				break;
			default:
				break;
			}
		} else {
			var params = filter.parseParams('anon',null,false);
			for(var i=1; i<params.length; i++) {
				var tiddler = new Tiddler(params[i].value);
				tiddler.fields.workspaceId = this.workspaceId;
				context.tiddlers.push(tiddler);
			}
			context.status = true;
			if(context.callback)
				window.setTimeout(function() {callback(context,userParams);},0);
			return true;
		}
	} else {
		//#context.responseType = 'query.allpages';
		//#uriTemplate = '%0/api.php?format=json&action=query&list=allpages&apfilterredir=nonredirects&apfrom=%4&prop=info';
		context.responseType = 'query.pages';
		uriTemplate = '%0/api.php?format=json&action=query&generator=allpages&gapfilterredir=nonredirects&gapfrom=%4&prop=info';
		if(this.workspaceId != 0)
			uriTemplate += '&gapnamespace=%1';
		if(limit) {
			uriTemplate += '&gaplimit=%2';
            context.gaplimit = limit;
        }
		context.count = 0;
		context.uri = uriTemplate.format([host,this.workspaceId,limit,filterParams,'%0']);
		context.urifrom = 'gapfrom';
//#console.log('context.uri:'+context.uri);
	}
	var from = '0';
	var uri = uriTemplate.format([host,this.workspaceId,limit,filterParams,from]);
//#console.log('uri: '+uri);
	var req = adaptor.doHttpGET(uri,adaptor.getTiddlerListCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

//#{
//#	"query-continue": {
//#		"allpages": {
//#			"apfrom": "!Xu"
//#		}
//#	},
//#	"query": {
//#		"allpages": {
//#			"5878274": {
//#				"pageid": 5878274,
//#				"ns": 0,
//#				"title": "!"
//#			},
//#			"5197186": {
//#				"pageid": 5197186,
//#				"ns": 0,
//#				"title": "!Xoong language"
//#			}
//#		}
//#	}
//#}
//#{
//#	"query": {
//#		"embeddedin": [
//#			{
//#				"pageid": 791,
//#				"ns": 0,
//#				"title": "Asteroid"
//#			},
//#			{
//#				"pageid": 5962,
//#				"ns": 0,
//#				"title": "Comet"
//#			},
adaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('getTiddlerListCallback status:'+status);
//#console.log(context);
//#console.log(context.responseType);
//#console.log(responseText.substr(0,400));
	context.status = false;
	context.statusText = adaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
			var pages;
			if(context.responseType == 'query.embeddedin')
				pages = info.query.embeddedin;
			else if(context.responseType == 'query.allpages')
				pages = info.query.allpages;
			else if(context.responseType == 'query.pages')
				pages = info.query.pages;
			else
				pages = info.pages;
			var c = null;
			if(info['query-continue']) {
				if(info['query-continue'].allpages) {
					c = info['query-continue'].allpages[context.urifrom];
					context.count += context.gaplimit;
					if(context.count>=context.tiddlerLimit)
						c = null;
				}
			}
			var useMain = false;
			if(context.workspace=="Talk" && context.filter)
				useMain = true;
			for(i in pages) {
				var title = pages[i].title;
				if(useMain&&title)
					title = title.replace(/^Talk:/g,"");
				if(title && !store.isShadowTiddler(title)) {
					//# avoid overwriting shadow tiddlers
					tiddler = new Tiddler(title);
					tiddler.fields.workspaceId = useMain ? 0 : pages[i].ns;
					if(!useMain)
						tiddler.fields['temp.size'] = pages[i].length;
					context.tiddlers.push(tiddler);
				}
			}
		} catch (ex) {
			context.statusText = exceptionText(ex,adaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.uri && c) {
		var u = context.uri.format([c]);
//#console.log('u: '+u);
		var req = adaptor.doHttpGET(u,adaptor.getTiddlerListCallback,context);
	} else {
		if(context.callback)
			context.callback(context,context.userParams);
	}
};

adaptor.prototype.generateTiddlerInfo = function(tiddler)
{
//# http://tiddlywikiguides.org/index.php?title=AutoTaggerPlugin
//# http://en.wikipedia.org/wiki/Mars
	var info = {};
	var host = this && this.host ? this.host : tiddler.fields['server.host'];
	host = this.fullHostName(host);
	if(host.match(/w\/$/)) {
		host = host.replace(/w\/$/,'');
		var uriTemplate = '%0wiki/%2';
	} else {
		uriTemplate = '%0/index.php?title=%2';
	}
	info.uri = uriTemplate.format([host,this.workspace,tiddler.title]);
	return info;
};

adaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

adaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
//#console.log('adaptor.getTiddler:'+context.title+" revision:"+context.revision+" workspace:"+context.workspace);
//# http://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=Elongation&rvprop=content
//# http://meta.wikimedia.org/w/api.php?format=jsonfm&action=query&prop=revisions&titles=Main%20Page&rvprop=content|timestamp|user
//# http://www.tiddlywiki.org/api.php?action=query&prop=revisions&titles=Main%20Page&rvprop=content
//# http://wiki.unamesa.org/api.php?format=jsonfm&action=query&prop=revisions&titles=Main%20Page&rvprop=content|timestamp|user
	var host = this.fullHostName(context.host);
	var uriTemplate = '%0/api.php?format=json&action=query&prop=revisions&titles=%1&rvprop=content|timestamp|user|ids';
	if(context.revision)
		uriTemplate += '&rvstartid=%2&rvlimit=1';
	var uri = uriTemplate.format([host,adaptor.normalizedTitle(context.title),context.revision]);
//#console.log('uri: '+uri);
	context.tiddler = new Tiddler(context.title);
	context.tiddler.fields.wikiformat = 'mediawiki';
	context.tiddler.fields['server.host'] = adaptor.minHostName(host);
	var req = adaptor.doHttpGET(uri,adaptor.getTiddlerCallback,context);
//#console.log('req:'+req);
	return typeof req == 'string' ? req : true;
};

//#{
//#	"query": {
//#		"pages": {
//#			"12631": {
//#				"pageid": 12631,
//#				"ns": 0,
//#				"title": "Main Page",
//#				"revisions": {
//#					"528206": {
//#						"timestamp": "2007-06-09T22:45:35Z",
//#						"revid": 528206,
//#						"pageid": 12631,
//#						"oldid": 524243,
//#						"minor": "",
//#						"*": "{| width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border:1px solid #ffcc00; background:#FFFDDF; padding-left:0.5em; padding-right:0.5em; padding-top:0.3em; padding-bottom:0.1em;\"\n|-\n| width=\"27%\" align=\"center\" | <font style=\"font-family:Verdana,Arial,Helvetica;\"><big>'''[[Wikimedia projects|Projects]]'''<\/big><\/font><br\/>\n''[[Complete list of Wikimedia projects|Complete list]]'' |  ''[[Proposals for new projects|Proposals]]''\n| width=\"42%\" align=center | <font style=\"font-family:Verdana,Arial,Helvetica;\"><big>'''[[Board of Trustees]]'''<\/big><\/font><br\/> \n'''[[Wikimedia:Home|Wikimedia Foundation]]''' | '''[[Wikimedia_meetings|Meetings]]''' <!--| '''[[Election results 2006|Election]]'''-->\n| align=center | <font style=\"font-family:Verdana,Arial,Helvetica;\"><big>'''[[Translation requests|Translations]]'''<\/big><\/font><br\/> \n''[[Translation_requests\/WMF|Foundation]]'' | ''[[Translation request\/WMF\/Fundraising\/2006|Donation form]]'' | ''[[Wikimedia press releases|press releases]]'' <!--\n| ''[[Translation_requests\/Wikimania|Wikimania]]''-->\n|}\n{| width=\"100%\" cellspacing=12 cellpadding=0\n| '''Welcome''' to [[Meta:About|Meta-Wiki]], a website devoted to the coordination of the [[Wikimedia Foundation]]'s projects, including [[Wikipedia]], the free encyclopedia, and the [[MediaWiki]] software on which it runs.  Other venues for discussing the Foundation and these projects include the Wikimedia [http:\/\/mail.wikimedia.org mailing lists] (particularly [http:\/\/mail.wikipedia.org\/mailman\/listinfo\/foundation-l '''foundation-l''']) and the various [[IRC channels]].\n|align=\"right\"| <small>Content pages on Meta: '''{{NUMBEROFARTICLES}}'''<\/small><br \/>\n|}\n{| cellpadding=0 cellspacing=1\n|- valign=\"top\"\n|style=\"border: 1px solid gray;padding-left:1em;padding-right:0.5em;background:#FFEFF0;\" class=\"plainlinks\" colspan=\"2\"|\n\n<span style=\"font-size: 130%;\">'''[[Multilingualism|Meta in many languages]]'''<\/span><br\/>\n''<small>[[Template:MetaHomePages|Edit this list:]]<\/small>'' <small>{{MetaHomePages}}<\/small>\n|- valign=\"top\"\n|style=\"border: 1px solid gray;padding-left:1em;padding-right:0.5em;background:#E4FFDF;padding-bottom:0.5em;\" width=\"45%\"|\n==Meta utilities==\n\n===Requests for...===\n* [[Requests for permissions|Permissions]] (to request sysop, bureaucrat and checkuser status on any Wikimedia wiki)\n* [[Requests for bot status|Bot status]]\n* [[Requests for queries|SQL queries]] \n* [[Requests for CheckUser information|CheckUser queries]] (not [[Checkuser#Access|CheckUser access]])\n* [[Meta:Requests for deletion|Deletion]] \/ [[Meta:Requests for undeletion|Undeletion]] \/ [[:Category:Deleteme|Speedy deletion]] \/ [[Multilingual speedy deletions]]\n* [[Translation requests|Translation]]\n* [[Requests for logos|Logos]]\n\n\n===Other tools===\n\n* [[Meta:Sandbox|Sandbox]]\n* [[Meta:Babel templates|Babel templates]] (language skill)\n* [[Transbabel]] templates (translators by language combo)\n* [[Meta:Categories|Browse Meta-Wiki by category]]\n\n===Form & Content===\n\nOrganize and prepare content, e.g. templates, language files, logos, formats; Copyright issues<br\/>\n''See [[Wikimedia content]]''\n* [[Help:Images and other uploaded files|Image]]\n* [[Maps]]\n* [[Copyright]]\n* [[Statistics]]\n\n|valign=\"top\" bgcolor=\"#E8F1FF\" style=\"border-style:solid;border-width:1px;border-color:gray;padding-left:1em;padding-right:0.5em; padding-bottom:0.5em;\" width=\"55%\"|\n==Latest news==\n{{Information thread}}\n\n|- valign=\"top\"\n|colspan=\"2\" style=\"border: 1px solid gray;padding-left:1em;padding-right:0.5em;padding-bottom:0.5em;\"|\n==Wikimedia Foundation==\n\n{{Wikimedia Foundation}}\n|- valign=\"top\"\n|colspan=\"2\" style=\"border: 1px solid gray;padding-left:1em;padding-right:0.5em;padding-bottom:0.5em;\"|\n==Code & technical issues==\nCoordination of the development process, maintenance of servers, and user guide for MediaWiki.<br \/>\n{{MediaWiki links|param=width=\"30%\"}}\n|- valign=\"top\"\n|style=\"border: 1px solid gray;padding-left:1em;padding-right:0.5em;padding-bottom:0.5em;\" width=\"40%\"|\n==Community & Communication==\nAbout the community itself. Organisation of events; philosophical discussions; collaborated essays.\n\n* [[The Wikipedia Community]]\n* [[Wikipedians categorized by sub-cultural affiliation ]]\n* [[Meta:Babel]] (central discussion place here)\n* [[Wikimedia Embassy]] (local contacts)\n* [[We need your help|Requests for help]] to your trouble\n* [[Mailing list|Mailing Lists]] & [[IRC Channels]]\n* [[Wikipedia meetup]] (meetings between participants)\n* [[Status]] (various types of status, sysop, developer...)\n\n|valign=\"top\" style=\"border: 1px solid gray;padding-left:1em;padding-right:0.5em;padding-bottom:0.5em;\"|\n==Core issues & collaboration==\n\nHelping contribute and collaborate (i.e., what makes it easy, what makes it hard, how to do it well, why you have to, what conflicts typically arise, fixing them). Discussing and formulating project-wide (i.e. not language-specific) policies.\n\n* [[Transfer of authority]]\n* [[Wikimedia principles]] (wikiquette, consensus, NPOV, copyrights)\n* [[Growing Wikimedia]] (building the project and the [[community]])\n* [[Power structure|Wikimedia power structure]]\n* [[Interlingual coordination]] (various international issues)\n* [[Wikipedia policies]]\n* [[Conflict resolution]]\n* [[Privacy policy]]\n|}\n__NOTOC__\n__NOEDITSECTION__\n[[Category:Main page]]"
//#					}
//#				}
//#			}
//#		}
//#	}
//#}


//# Override this to do postprocessing on tiddler after it is retrieved from the server
adaptor.prototype.getTiddlerPostProcess = function(context)
{
	return context.tiddler;
};

adaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('getTiddlerCallback status:'+status);
//#console.log('tiddler:'+context.tiddler.title);
//#console.log(responseText);
	context.status = false;
	if(status) {
		var content = null;
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
			var page = adaptor.anyChild(info.query.pages);
			var revision = adaptor.anyChild(page.revisions);
			var text = revision['*'];
			context.tiddler.fields['server.page.revision'] = String(revision['revid']);
			context.tiddler.fields['server.page.timestamp'] = String(revision['timestamp']);
			var host = context.tiddler.fields['server.host'];
			if(host.indexOf('wikipedia')==-1) {
				context.tiddler.modified = adaptor.dateFromTimestamp(revision['timestamp']);
				context.tiddler.modifier = revision.user;
			} else {
				// content is from wikipedia
				//# set dates to verion date to avoid them being saved to file
				context.tiddler.created = version.date;
				context.tiddler.modified= version.date;
				// remove links to other language articles
				text = text.replace(/\[\[[a-z\-]{2,12}:(?:.*?)\]\](?:\r?)(?:\n?)/g,'');
			}
			context.tiddler.text = text;
			//# convert categories into tags
			var catRegExp = /\[\[(Category:[^|\]]*?)\]\]/mg;
			var tags = '';
			var delim = '';
			catRegExp.lastIndex = 0;
			var match = catRegExp.exec(text);
			while(match) {
				tags += delim;
				if(match[1].indexOf(' ')==-1)
					tags += match[1];
				else
					tags += '[[' + match[1] + ']]';
				delim = ' ';
				match = catRegExp.exec(text);
			}
			context.tiddler.tags = tags.readBracketedList();
			context.tiddler = context.adaptor.getTiddlerPostProcess.call(context.adaptor,context);
		} catch (ex) {
			context.statusText = exceptionText(ex,adaptor.serverParsingErrorMessage);
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

//#{
//#	"query": {
//#		"pages": {
//#			"12631": {
//#				"pageid": 12631,
//#				"ns": 0,
//#				"title": "Main Page",
//#				"revisions": {
//#					"528206": {
//#						"revid": 528206,
//#						"pageid": 12631,
//#						"oldid": 524243,
//#						"user": "Aphaia",
//#						"minor": "",
//#						"timestamp": "2007-02-11T04:55:56Z"
//#					},
//#					"525695": {
//#						"revid": 525695,
//#						"pageid": 12631,
//#						"oldid": 521762,
//#						"user": "Alex43223",
//#						"timestamp": "2007-02-06T23:24:05Z",
//#						"comment": "Fixing links to bypass redirects"
//#					}
//#				}
//#			}
//#		}
//#	},
//#	"query-continue": {
//#		"revisions": {
//#			"rvstartid": "515076"
//#		}
//#	}
//#}

adaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
// get a list of the revisions for a tiddler
{
	context = this.setContext(context,userParams,callback);
//#console.log('getTiddlerRevisionList:'+title+" lim:"+limit);
//# http://meta.wikimedia.org/w/api.php?action=query&prop=revisions&titles=Main%20Page&rvlimit=5&rvprop=timestamp|user|comment
//# http://meta.wikimedia.org/w/api.php?format=jsonfm&action=query&prop=revisions&titles=Main%20Page&rvlimit=5&rvprop=timestamp|user|comment

	var uriTemplate = '%0/api.php?format=json&action=query&prop=revisions&titles=%1&rvlimit=%2&rvprop=ids|flags|timestamp|user|comment';
	if(!limit)
		limit = 5;
	var host = this.fullHostName(context.host);
	var uri = uriTemplate.format([host,adaptor.normalizedTitle(title),limit]);
//#console.log('uri: '+uri);
	var req = adaptor.doHttpGET(uri,adaptor.getTiddlerRevisionListCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

adaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('getTiddlerRevisionListCallback status:'+status);
//#console.log(responseText.substr(0,1000));
	context.status = false;
	if(status) {
		var content = null;
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
			var page = adaptor.anyChild(info.query.pages);
			var title = page.title;
			var revisions = page.revisions;
			var list = [];
			for(var i=0;i<revisions.length;i++) {
				var tiddler = new Tiddler(title);
				tiddler.modified = adaptor.dateFromTimestamp(revisions[i].timestamp);
				tiddler.modifier = revisions[i].user;
				tiddler.fields.comment = revisions[i].comment;
				tiddler.fields['server.page.id'] = adaptor.normalizedTitle(title);
				tiddler.fields['server.page.name'] = title;
				tiddler.fields['server.page.revision'] = String(revisions[i].revid);
				list.push(tiddler);
			}
			context.revisions = list;
		} catch (ex) {
			context.statusText = exceptionText(ex,adaptor.serverParsingErrorMessage);
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

//# api.php ? action=edit
//#	&title=Talk:Main_Page
//#	&section=new
//#	&summary=Hello%20World
//#	&text=Hello%20everyone!
//#	&watch
//#	&basetimestamp=2008-03-20T17:26:39Z
//#	&token=cecded1f35005d22904a35cc7b736e18+\
//#<?xml version="1.0" encoding="utf-8"?>
//#<api>
//#  <edit result="Success" pageid="12" title="Talk:Main Page" oldrevid="465" newrevid="471" />
//#</api>


adaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
//#console.log('putTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.tiddler = tiddler;
	context.title = tiddler.title;
	//# login if nececessary
	return this.complete(context,adaptor.putTiddlerComplete);
};


adaptor.putTiddlerComplete = function(context,userParams)
{
//#console.log('putTiddlerComplete');
	//# get an edit token
	var uriTemplate = '%0/api.php?format=json&action=query&prop=info|revisions&intoken=edit&titles=%1';
	var uri = uriTemplate.format([context.host,escape(adaptor.normalizedTitle(context.tiddler.title))]);
//#console.log('uri:'+uri);

	var req = adaptor.doHttpGET(uri,adaptor.putTiddlerCallback,context);
//#console.log(req);
	return typeof req == 'string' ? req : true;
};

adaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('putTiddlerCallback:'+status);
//#console.log(responseText);
	if(status) {
		try {
			eval('var info=' + responseText);
			//#console.log('info',info);
			var page = adaptor.anyChild(info.query.pages);
			var token = page.edittoken;
			token = token.substr(0,token.length-2) + '%2B%5C';
		} catch (ex) {
			//#console.log('exception',ex);
			context.statusText = exceptionText(ex,adaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
		var uriTemplate = '%0/api.php?format=json&action=edit&title=%1&text=%2&basetimestamp=%3&token=%4';
		var tiddler = context.tiddler;
		var timestamp = tiddler.fields['server.page.timestamp'];
		uri = uriTemplate.format([context.host,escape(adaptor.normalizedTitle(tiddler.title)),escape(tiddler.text),timestamp,token]);
		//#console.log('uri:'+uri);
		var req = adaptor.doHttpPOST(uri,adaptor.putTiddlerCallback2,context,{"Content-Length":"1"}," ","application/x-www-form-urlencoded");
		//#console.log(req);
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
		if(context.callback)
			context.callback(context,context.userParams);
	}
};

adaptor.putTiddlerCallback2 = function(status,context,responseText,uri,xhr)
{
//#console.log('putTiddlerCallback2:'+status);
//#console.log(xhr);
//#console.log(responseText);
	var info;
	context.statusText = xhr.statusText;
	try {
		eval('info=' + responseText + ';');
		//#console.log('info2',info);
	} catch(ex) {
		//#console.log('ex',ex);
		status = false;
		context.status = false;
		context.statusText = 'putTiddler exception';
	}
	if(status) {
		context.status = true;
	} else {
		context.status = false;
	}
	if(info && info.error) {
		context.status = false;
		context.statusText = info.error.info;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

//# placeholder, not complete
/*adaptor.prototype.deleteTiddler = function(tiddler,context,userParams,callback)
{
//#console.log('deleteTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	return this.complete(context,adaptor.deleteTiddlerComplete);
};*/

adaptor.deleteTiddlerComplete = function(context,userParams)
{
//#console.log('putTiddlerComplete');
	//# get an edit token
	var uriTemplate = '%0/api.php?format=json&action=query&prop=intoken=edit&titles=%1';
	var uri = uriTemplate.format([context.host,escape(adaptor.normalizedTitle(context.tiddler.title))]);
//#console.log('uri:'+uri);

	var req = adaptor.doHttpGET(uri,adaptor.deleteTiddlerCallback,context);
//#console.log(req);
	return typeof req == 'string' ? req : true;
};

adaptor.deleteTiddlerCallback = function(context,userParams)
{
//#fnLog('deleteTiddlerComplete:'+title);
	if(status) {
		try {
			eval('var info=' + responseText);
			//#console.log('info',info);
			var page = adaptor.anyChild(info.query.pages);
			var token = page.edittoken;
			token = token.substr(0,token.length-2) + '%2B%5C';
		} catch (ex) {
			//#console.log('exception',ex);
			context.statusText = exceptionText(ex,adaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
		var uriTemplate = '%0/api.php?action=delete&title=%1&token=%2';
		var uri = uriTemplate.format([context.host,context.workspace,escape(adaptor.normalizedTitle(context.title)),token]);
		//#fnLog('uri: '+uri);
		var req = adaptor.doHttpPOST(uri,adaptor.deleteTiddlerCallback,context,{"Content-Length":"1"}," ");
		//#fnLog("req:"+req);
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
		if(context.callback)
			context.callback(context,context.userParams);
	}
};

adaptor.deleteTiddlerCallback2 = function(status,context,responseText,uri,xhr)
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

})(config.adaptors.mediawiki);

} // end of 'install only once'
//}}}
