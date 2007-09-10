/***
|''Name:''|MediaWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data from MediaWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#MediaWikiAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/MediaWikiAdaptorPlugin.js |
|''Version:''|0.5.5|
|''Date:''|Jul 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2.0|

MediaWiki REST documentation is at:
http://meta.wikimedia.org/w/api.php
http://meta.wikimedia.org/w/query.php

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.MediaWikiAdaptorPlugin) {
version.extensions.MediaWikiAdaptorPlugin = {installed:true};

function MediaWikiAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

MediaWikiAdaptor.serverType = 'mediawiki';
MediaWikiAdaptor.serverParsingErrorMessage = "Error parsing result from server";
MediaWikiAdaptor.errorInFunctionMessage = "Error in function MediaWikiAdaptor.%0";

MediaWikiAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

MediaWikiAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	return context;
};

MediaWikiAdaptor.fullHostName = function(host)
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

MediaWikiAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

MediaWikiAdaptor.normalizedTitle = function(title)
{
	var n = title.charAt(0).toUpperCase() + title.substr(1);
	return n.replace(/\s/g,'_');
};

// Convert a MediaWiki timestamp in YYYY-MM-DDThh:mm:ssZ  format into a JavaScript Date object
MediaWikiAdaptor.dateFromTimestamp = function(timestamp)
{
	var dt = timestamp;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

MediaWikiAdaptor.anyChild = function(obj)
//# convenience function for getting children whose keys are unknown
//# such as children of pages subobjects, whose keys are numeric page ids
{
	for(var key in obj) {
		return obj[key];
	}
	return null;
};

MediaWikiAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
//#displayMessage("openHost:"+host);
	context = this.setContext(context,userParams,callback);
	this.host = MediaWikiAdaptor.fullHostName(host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

MediaWikiAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	if(!workspace)
		workspace = "";
//#displayMessage("openWorkspace:"+workspace);
	context = this.setContext(context,userParams,callback);
	var workspaces = {
		"media": -2, "special":-1,
		"":0, "talk":1,"user":2,"user talk":3,"meta":4,"meta talk":5,"image":6,"image talk":7,
		"mediawiki":8,"mediawiki talk":9,"template":10,"template talk":11,"help":12,"help talk":13,
		"category":14,"category talk":15};
	this.workspace = workspace;
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
			this.workspaceId = workspaces[workspace];
		}
	}
	if(!this.workspaceId) {
		if(workspace=="" || workspace=="main")
			this.workspaceId = 0;
		else if(workspace.lastIndexOf("talk") != -1)
			this.workspaceId = 5;
		else
			this.workspaceId = 4;
	}
//#displayMessage("workspaceId:"+this.workspaceId);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

MediaWikiAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage("getWorkspaceList");
//# http://meta.wikimedia.org/w/api.php?&action=query&meta=siteinfo&siprop=namespaces
//# http://wikipedia.org/w/api.php?&action=query&meta=siteinfo&siprop=namespaces
//# http://wiki.unamesa.org/api.php?&action=query&meta=siteinfo&siprop=namespaces
//# http://tiddlywiki.org/api.php?&action=query&meta=siteinfo&siprop=namespaces
	if(context.workspace) {
//#displayMessage("w:"+context.workspace);
		context.status = true;
		context.workspace = [{name:"Main",title:"Main"}];
		if(context.callback)
			window.setTimeout(context.callback,0,context,userParams);
		return true;
	}
	var uriTemplate = '%0api.php?format=json&action=query&meta=siteinfo&siprop=namespaces';
	var uri = uriTemplate.format([this.host]);
//#displayMessage("uri:"+uri);
	var req = MediaWikiAdaptor.doHttpGET(uri,MediaWikiAdaptor.getWorkspaceListCallback,context);
	return typeof req == 'string' ? req : true;
};

//#{
//#	"query": {
//#		"namespaces": {
//#			"-2": {"id": -2,"*": "Media"},
//#			"-1": {"id": -1,"*": "Special"},
//#			"0": {"id": 0,"*": ""},
//#			"1": {"id": 1,"*": "Talk"},
//#			"2": {"id": 2,"*": "User"},
//#			"3": {"id": 3,"*": "User talk"},
//#			"4": {"id": 4,"*": "Meta"}, //or Wikipedia or UnaMesa
//#			"5": {"id": 5,"*": "Meta talk"}, // or Wikipedia talk or UnaMesa talk
//#			"6": {"id": 6,"*": "Image"},
//#			"7": {"id": 7,"*": "Image talk"},
//#			"8": {"id": 8,"*": "MediaWiki"},
//#			"9": {"id": 9,"*": "MediaWiki talk"},
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

MediaWikiAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage("getWorkspaceListCallback:"+status);
	context.status = false;
	if(status) {
		try {
			eval('var info=' + responseText);
		} catch (ex) {
			context.statusText = exceptionText(ex,MediaWikiAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		var namespaces = info.query.namespaces;
		var list = [];
		for(var i in namespaces) {
			item = {};
			item.id = namespaces[i]['id'];
			item.title = namespaces[i]['*'];
			item.name = item.title;
			list.push(item);
		}
		context.workspaces = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

// get a list of the tiddlers in the current workspace
MediaWikiAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage('getTiddlerList');
//# http://meta.wikimedia.org/w/api.php?action=query&list=allpages&aplimit=5&format=jsonfm
//# http://www.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=wiki
//# http://www.wikipedia.org/w/api.php?action=query&list=embeddedin&titles=Template:IPstack&eilimit=50&format=jsonfm
//# http://www.wikipedia.org/w/api.php?action=query&list=allpages&aplimit=50&format=jsonfm
//# http://www.wikipedia.org/w/query.php?what=category&cptitle=Wiki&format=jsonfm

//# http://wiki.unamesa.org/api.php?action=query&list=allpages&apnamespace=10&aplimit=50
	if(!context.tiddlerLimit)
		context.tiddlerLimit = filter ? 200 : 100;

	var limit = context.tiddlerLimit;
	if(filter) {
		var re = /\[(\w+)\[([ \w]+)\]\]/;
		var match = re.exec(filter);
		if(match) {
			var filterParams = MediaWikiAdaptor.normalizedTitle(match[2]);
			switch(match[1]) {
			case 'tags':
				context.responseType = 'pages';
				var uriTemplate = '%0query.php?format=json&what=category&cpnamespace=0&cptitle=%3';
				break;
			case 'template':
				context.responseType = 'query.embeddedin';
				uriTemplate = '%0api.php?format=json&action=query&list=embeddedin&einamespace=0&eilimit=%2&eititle=Template:%3';
				break;
			default:
				break;
			}
		} else {
			var list = [];
			var params = filter.parseParams('anon',null,false);
			for(var i=1; i<params.length; i++) {
				var tiddler = new Tiddler(params[i].value);
				tiddler.fields.workspaceId = this.workspaceId;
				list.push(tiddler);
			}
			context.tiddlers = list;
			context.status = true;
			if(context.callback)
				window.setTimeout(context.callback,0,context,context.userParams);
			return true;
		}
	} else {
		context.responseType = 'query.allpages';
		uriTemplate = '%0api.php?format=json&action=query&list=allpages';
		if(this.workspaceId != 0)
			uriTemplate += '&apnamespace=%1';
		if(limit)
			uriTemplate += '&aplimit=%2';
	}
	var host = MediaWikiAdaptor.fullHostName(this.host);
	var uri = uriTemplate.format([host,this.workspaceId,limit,filterParams]);
//#displayMessage('uri: '+uri);
	var req = MediaWikiAdaptor.doHttpGET(uri,MediaWikiAdaptor.getTiddlerListCallback,context);
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


MediaWikiAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,60));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	context.statusText = MediaWikiAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
			var pages;
			if(context.responseType == 'query.embeddedin')
				pages = info.query.embeddedin;
			else if(context.responseType == 'query.allpages')
				pages = info.query.allpages;
			else
				pages = info.pages;
			var list = [];
			if(context.responseType == 'query.embeddedin') {
				for(var i=0;i<pages.length;i++) {
					var tiddler = new Tiddler(pages[i].title);
					tiddler.fields.workspaceId = pages[i].ns;
					//# avoid overwriting shadow tiddlers
					if(!store.isShadowTiddler(tiddler.title))
						list.push(tiddler);
				}
			} else {
				for(i in pages) {
					tiddler = new Tiddler(pages[i].title);
					tiddler.fields.workspaceId = pages[i].ns;
					//# avoid overwriting shadow tiddlers
					if(!store.isShadowTiddler(tiddler.title))
						list.push(tiddler);
				}
			}
			context.tiddlers = list;
		} catch (ex) {
			context.statusText = exceptionText(ex,MediaWikiAdaptor.serverParsingErrorMessage);
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

MediaWikiAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
//# http://tiddlywikiguides.org/index.php?title=AutoTaggerPlugin
//# http://en.wikipedia.org/wiki/Mars
	var info = {};
	var host = this && this.host ? this.host : MediaWikiAdaptor.fullHostName(tiddler.fields['server.host']);
	if(host.match(/w\/$/)) {
		host = host.replace(/w\/$/,'');
		var uriTemplate = '%0wiki/%2';
	} else {
		uriTemplate = '%0index.php?title=%2';
	}
	info.uri = uriTemplate.format([host,this.workspace,tiddler.title]);
	return info;
};

MediaWikiAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	return this.getTiddlerInternal(context,userParams,callback);
};

MediaWikiAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.revision = revision;
	return this.getTiddlerInternal(context,userParams,callback);
};

// @internal
MediaWikiAdaptor.prototype.getTiddlerInternal = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage('MediaWikiAdaptor.getTiddlerInternal:'+context.title+" revision:"+context.revision);
//# http://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=Elongation&rvprop=content
//# http://meta.wikimedia.org/w/api.php?format=jsonfm&action=query&prop=revisions&titles=Main%20Page&rvprop=content|timestamp
//# http://www.tiddlywiki.org/api.php?action=query&prop=revisions&titles=Main%20Page&rvprop=content
//# http://wiki.unamesa.org/api.php?action=query&prop=revisions&titles=Main%20Page&rvprop=content|timestamp
	var host = MediaWikiAdaptor.fullHostName(this.host);
	var uriTemplate = '%0api.php?format=json&action=query&prop=revisions&titles=%1&rvprop=content|timestamp|user';
	if(context.revision)
		uriTemplate += '&rvstartid=%2&rvlimit=1';
	uri = uriTemplate.format([host,MediaWikiAdaptor.normalizedTitle(context.title),context.revision]);
//#displayMessage('uri: '+uri);
	context.tiddler = new Tiddler(context.title);
	context.tiddler.fields.wikiformat = 'mediawiki';
	context.tiddler.fields['server.host'] = MediaWikiAdaptor.minHostName(this.host);
	var req = MediaWikiAdaptor.doHttpGET(uri,MediaWikiAdaptor.getTiddlerCallback,context);
//#displayMessage('req:'+req);
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

MediaWikiAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	if(status) {
		var content = null;
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
			var page = MediaWikiAdaptor.anyChild(info.query.pages);
			var revision = MediaWikiAdaptor.anyChild(page.revisions);
			var text = revision['*'];
			context.tiddler.fields['server.page.revision'] = String(revision['revid']);
			var host = context.tiddler.fields['server.host'];
			if(host.indexOf('wikipedia')==-1) {
				context.tiddler.modified = MediaWikiAdaptor.dateFromTimestamp(revision['timestamp']);
				context.tiddler.modifier = revision['user'];
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
			context.tiddler.tags = tags;
		} catch (ex) {
			context.statusText = exceptionText(ex,MediaWikiAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		//#var links = page.links;
		//#if (links && links.length) {
		//#	alert(links[0]['*'] + ' is linked from ' + title);
		//#	context.tiddler.text += links[0]['*'];
		//#} else {
		//#	alert('No links on ' + title + ' found');
		//#}
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

MediaWikiAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
// get a list of the revisions for a tiddler
{
	context = this.setContext(context,userParams,callback);
//#displayMessage('getTiddlerRevisionList:'+title+" lim:"+limit);
//# http://meta.wikimedia.org/w/api.php?action=query&prop=revisions&titles=Main%20Page&rvlimit=5&rvprop=timestamp|user|comment
//# http://meta.wikimedia.org/w/api.php?format=jsonfm&action=query&prop=revisions&titles=Main%20Page&rvlimit=5&rvprop=timestamp|user|comment

	var uriTemplate = '%0api.php?format=json&action=query&prop=revisions&titles=%1&rvlimit=%2&rvprop=timestamp|user|comment';
	if(!limit)
		limit = 5;
	var host = MediaWikiAdaptor.fullHostName(this.host);
	var uri = uriTemplate.format([host,MediaWikiAdaptor.normalizedTitle(title),limit]);
//#displayMessage('uri: '+uri);

	var req = MediaWikiAdaptor.doHttpGET(uri,MediaWikiAdaptor.getTiddlerRevisionListCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

MediaWikiAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerRevisionListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	if(status) {
		var content = null;
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
			var page = MediaWikiAdaptor.anyChild(info.query.pages);
			var title = page.title;
			var revisions = page.revisions;
			var list = [];
			for(var i in revisions) {
				var tiddler = new Tiddler(title);
				tiddler.modified = MediaWikiAdaptor.dateFromTimestamp(revisions[i].timestamp);
				tiddler.modifier = revisions[i].user;
				tiddler.fields.comment = revisions[i].comment;
				tiddler.fields['server.page.id'] = MediaWikiAdaptor.normalizedTitle(title);
				tiddler.fields['server.page.name'] = title;
				tiddler.fields['server.page.revision'] = String(revisions[i].revid);
				list.push(tiddler);
			}
			context.revisions = list;
		} catch (ex) {
			context.statusText = exceptionText(ex,MediaWikiAdaptor.serverParsingErrorMessage);
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

// MediaWikiAdaptor.prototype.putTiddler not supported
MediaWikiAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[MediaWikiAdaptor.serverType] = MediaWikiAdaptor;
} // end of 'install only once'
//}}}
