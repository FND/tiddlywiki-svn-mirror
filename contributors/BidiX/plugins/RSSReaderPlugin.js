/***
|''Name:''|RSSReaderPlugin|
|''Description:''|This plugin provides a RSSReader for TiddlyWiki|
|''Version:''|1.1.1|
|''Date:''|Apr 21, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#RSSReaderPlugin|
|''Documentation:''|http://tiddlywiki.bidix.info/#RSSReaderPluginDoc|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''Credit:''|BramChen for RssNewsMacro|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0|
|''OptionalRequires:''|http://www.tiddlytools.com/#NestedSlidersPlugin|
***/
//{{{
version.extensions.RSSReaderPlugin = {
	major: 1, minor: 1, revision: 1,
	date: new Date("Apr 21, 2007"),
	source: "http://TiddlyWiki.bidix.info/#RSSReaderPlugin",
	author: "BidiX",
	coreVersion: '2.2.0'
};

config.macros.rssReader = {
	dateFormat: "DDD, DD MMM YYYY",
	itemStyle: "display: block;border: 1px solid black;padding: 5px;margin: 5px;", //useed  '@@'+itemStyle+itemText+'@@'
	msg:{
		permissionDenied: "Permission to read preferences was denied.",
		noRSSFeed: "No RSS Feed at this address %0",
		urlNotAccessible: " Access to %0 is not allowed"
	},
	cache: [], 	// url => XMLHttpRequest.responseXML
	desc: "noDesc",
	
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var desc = params[0];
		var feedURL = params[1];
		var toFilter = (params[2] ? true : false);
		var filterString = (toFilter?(params[2].substr(0,1) == ' '? tiddler.title:params[2]):'');
		var place = createTiddlyElement(place, "div", "RSSReader");
		wikify("^^<<rssFeedUpdate "+feedURL+" [[" + tiddler.title + "]]>>^^\n",place);
		if (this.cache[feedURL]) {
			this.displayRssFeed(this.cache[feedURL], feedURL, place, desc, toFilter, filterString);
		}
		else {
			var r = loadRemoteFile(feedURL,config.macros.rssReader.processResponse, [place, desc, toFilter, filterString]);
			if (typeof r == "string")
				displayMessage(r);
		}
		
	},

	// callback for loadRemoteFile 
	// params : [place, desc, toFilter, filterString]
	processResponse: function(status, params, responseText, url, xhr) { // feedURL, place, desc, toFilter, filterString) {	
		if (window.netscape){
			try {
				if (document.location.protocol.indexOf("http") == -1) {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				}
			}
			catch (e) { displayMessage(e.description?e.description:e.toString()); }
		}
		if (xhr.status == httpStatus.NotFound)
		 {
			displayMessage(config.macros.rssReader.noRSSFeed.format([url]));
			return;
		}
		if (!status)
		 {
			displayMessage(config.macros.rssReader.noRSSFeed.format([url]));
			return;
		}
		if (xhr.responseXML) {
			// response is interpreted as XML
			config.macros.rssReader.cache[url] = xhr.responseXML;
			config.macros.rssReader.displayRssFeed(xhr.responseXML, params[0], url, params[1], params[2], params[3]);
		}
		else {
			if (responseText.substr(0,5) == "<?xml") {
				// response exists but not return as XML -> try to parse it 
				var dom = (new DOMParser()).parseFromString(responseText, "text/xml"); 
				if (dom) {
					// parsing successful so use it
					config.macros.rssReader.cache[url] = dom;
					config.macros.rssReader.displayRssFeed(dom, params[0], url, params[1], params[2], params[3]);
					return;
				}
			}
			// no XML display as html 
			wikify("<html>" + responseText + "</html>", params[0]);
			displayMessage(config.macros.rssReader.msg.noRSSFeed.format([url]));
		}
	},

	// explore down the DOM tree
	displayRssFeed: function(xml, place, feedURL, desc, toFilter, filterString){
		// Channel
		var chanelNode = xml.getElementsByTagName('channel').item(0);
		var chanelTitleElement = (chanelNode ? chanelNode.getElementsByTagName('title').item(0) : null);
		var chanelTitle = "";
		if ((chanelTitleElement) && (chanelTitleElement.firstChild)) 
			chanelTitle = chanelTitleElement.firstChild.nodeValue;
		var chanelLinkElement = (chanelNode ? chanelNode.getElementsByTagName('link').item(0) : null);
		var chanelLink = "";
		if (chanelLinkElement) 
			chanelLink = chanelLinkElement.firstChild.nodeValue;
		var titleTxt = "!![["+chanelTitle+"|"+chanelLink+"]]\n";
		var title = createTiddlyElement(place,"div",null,"ChanelTitle",null);
		wikify(titleTxt,title);
		// ItemList
		var itemList = xml.getElementsByTagName('item');
		var article = createTiddlyElement(place,"ul",null,null,null);
		var lastDate;
		var re;
		if (toFilter) 
			re = new RegExp(filterString.escapeRegExp());
		for (var i=0; i<itemList.length; i++){
			var titleElm = itemList[i].getElementsByTagName('title').item(0);
			var titleText = (titleElm ? titleElm.firstChild.nodeValue : '');
			if (toFilter && ! titleText.match(re)) {
				continue;
			}
			var descText = '';
			descElem = itemList[i].getElementsByTagName('description').item(0);
			if (descElem){
				try{
					for (var ii=0; ii<descElem.childNodes.length; ii++) {
						descText += descElem.childNodes[ii].nodeValue;
					}
				}
				catch(e){}
				descText = descText.replace(/<br \/>/g,'\n');
				if (desc == "asHtml")
					descText = "<html>"+descText+"</html>";
			}
			var linkElm = itemList[i].getElementsByTagName("link").item(0);
			var linkURL = linkElm.firstChild.nodeValue;
			var pubElm = itemList[i].getElementsByTagName('pubDate').item(0);
			var pubDate;
			if (!pubElm) {
				pubElm = itemList[i].getElementsByTagName('date').item(0); // for del.icio.us
				if (pubElm) {
					pubDate = pubElm.firstChild.nodeValue;
					pubDate = this.formatDateString(this.dateFormat, pubDate);
					}
					else {
						pubDate = '0';
					}
				}
			else {
				pubDate = (pubElm ? pubElm.firstChild.nodeValue : 0);
				pubDate = this.formatDate(this.dateFormat, pubDate);
			}
			titleText = titleText.replace(/\[|\]/g,'');
			var rssText = '*'+'[[' + titleText + '|' + linkURL + ']]' + '' ;
			if ((desc != "noDesc") && descText){
				rssText = rssText.replace(/\n/g,' ');
				descText = '@@'+this.itemStyle+descText + '@@\n';				
				if (version.extensions.nestedSliders){
					descText = '+++[...]' + descText + '===';
				}
				rssText = rssText + descText;
			}
			var story;
			if ((lastDate != pubDate) && ( pubDate != '0')) {
				story = createTiddlyElement(article,"li",null,"RSSItem",pubDate);
				lastDate = pubDate;
			}
			else {
				lastDate = pubDate;
			}
			story = createTiddlyElement(article,"div",null,"RSSItem",null);
			wikify(rssText,story);
		}
	},
	
	formatDate: function(template, date){
		var dateString = new Date(date);
		// template = template.replace(/hh|mm|ss/g,'');
		return dateString.formatString(template);
	},
	
	formatDateString: function(template, date){
		var dateString = new Date(date.substr(0,4), date.substr(5,2) - 1, date.substr(8,2)
			);
		return dateString.formatString(template);
	}
	
};

config.macros.rssFeedUpdate = {
	label: "Update",
	prompt: "Clear the cache and redisplay this RssFeed",
	handler: function(place,macroName,params) {
		var feedURL = params[0];
		var tiddlerTitle = params[1];
		createTiddlyButton(place, this.label, this.prompt, 
			function () {
				if (config.macros.rssReader.cache[feedURL]) {
					config.macros.rssReader.cache[feedURL] = null; 
			}
			story.refreshTiddler(tiddlerTitle,null, true);
		return false;});
	}
};

//}}}
