/***
!Metadata:
|''Name:''|XMLReader|
|''Description:''||
|''Version:''|1.2.0|
|''Date:''|Jul 20, 2006|
|''Source:''|http://sourceforge.net/project/showfiles.php?group_id=150646|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.5+; InternetExplorer 6.0|
!Syntax:
{{{<<xmlreader withDesc|noDesc|asHtml rssfeed.xml|http://www.example.com/rssfeed.rdf>>}}}
!Revision History:
|''Version''|''Date''|''Note''|
|1.2.0|Jul 20, 2006|Runs compatibly with TW 2.1.0 (rev #403+)|
|1.1.0|Jul 10, 2006)|change xmlhttp.send(null)/send() to xmlhttp.send("") for more compatibility for some browsers|
|1.0.0|Mar 11, 2006|Initial release|
|~|~|This macro is reworked from RssNewsMacro, but it can be easy to extended to support different structure of xml document from rss feeds|
|~|~|You could uninstall the RssNewsMacro, but still use the original syntax,<<br>>{{{<<rssfeed  withDesc|noDesc|asHtml rssfeed.xml|http://www.example.com/rssfeed.rdf>>}}}|

!Code section:
***/

//{{{
version.extensions.xmlreader = {major: 1, minor: 2, revision: 0,
	date: new Date("Jul 20, 2006"),
	name: "XMLReader",
	type: "Macro",
	author: "BramChen",
	source: "http://sourceforge.net/project/showfiles.php?group_id=150646"
};
config.macros.xmlreader= {
	itemStructure:{title:'Title',link:'Link',pubDate:'PubDate',description:'Desc'},
//	rsTemplate:function(){var t='';for (var i in itemStructure){t+='_'+itemStructure[i]}},
	rsTemplate:'_pubDate\n**[[_title|_link]]_description',
	items: {Elm: "%0Elm", Text: "_%0"},
	keyItem: "item",
	dateFormat: "DDD, DD MMM YYYY",
	msg:{
		permissionDenied: "Permission to read preferences was denied.",
		errorInDataRetriveing: "Problem retrieving XML data: %0",
		invalidXML: "Invalid XML retrieved from: %0",
		urlNotAccessible: "Access to %0 is not allowed,\nPlease check the setting of your browser:\n1.For Gecko based, you should set the 'signed.applets.codebase_principal_support' to be true, in about:config.\n2.For IE, you should add this web site to your trust list."
	},
	cache: [], 	// url => request
	withDesc: null,
	xmlURL: null,
	groupBy: null,
	xmlhttp: null,
	place:null
};

config.macros.xmlreader.handler = function(place,macroName,params){
	this.withDesc = params[0];
	this.xmlURL = params[1];
	this.place=place;
	if (this.cache[this.xmlURL]) {
		wikify("^^(//from cache//)^^\n",place);
		this.processResponse(this.xmlURL,this.cache[this.xmlURL]);
	}
	else {
		this.asyncGet(this.xmlURL,this.processResponse);
	}
};

config.macros.xmlreader.asyncGet = function (xmlURL,callback){
	var xmlhttp;
	try {xmlhttp=new XMLHttpRequest();}
	catch (e) {
		try {xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");}
		catch (e) {
			try {xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
			catch (e) { displayMessage(e.description?e.description:e.toString());}
		}
	}
	if (!xmlhttp){
		return;
	}
	this.xmlhttp = xmlhttp;
	if (window.netscape){
		if (!this.testURL(xmlURL)){
		try {netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");}
		catch (e) { displayMessage(e.description?e.description:e.toString()); }
		}
	}
//	if (xmlhttp.overrideMimeType) {xmlhttp.overrideMimeType('text/xml');}

	xmlhttp.onreadystatechange=function(){
		var xmlhttp = config.macros.xmlreader.xmlhttp;
		if (xmlhttp.readyState==4) {
			if (xmlhttp.status==200 || xmlhttp.status===0) {
				if (callback) callback(xmlURL,xmlhttp);
			}
			else {
				displayMessage(config.macros.xmlreader.msg.errorInDataRetriveing.format([xmlhttp.statusText]));
			}
		}
	};
	try {
		var url=xmlURL+(xmlURL.indexOf('?')<0?'?':'&')+'nocache='+Math.random();
		xmlhttp.open("GET",url,true);
		xmlhttp.send("");
	}
	catch (e) {
		wikify(e.toString()+this.msg.urlNotAccessible.format([xmlURL]), this.place);
	}
};

config.macros.xmlreader.processResponse = function(xmlURL,xmlhttp){
	if (window.netscape){
		if (!config.macros.xmlreader.testURL(xmlURL)){
			try {netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");}
			catch (e) { displayMessage(e.description?e.description:e.toString()); }
		}
	}
	if (xmlhttp.responseXML){
		config.macros.xmlreader.cache[xmlURL] = xmlhttp;
		config.macros.xmlreader.genLists(xmlhttp.responseXML);
	}
	else {
		wikify("<html>"+xmlhttp.responseText+"</html>", this.place);
		displayMessage(this.msg.invalidXML.format([xmlURL]));
	}
};
	
config.macros.xmlreader.genLists = function(xml){
	var itemList = xml.getElementsByTagName(this.keyItem);
	var itemStructure = this.itemStructure;
	var items = this.items;
	var rsLists='', rssItem; this.groupBy='';
	for (var i=0; i<itemList.length; i++){
		var itemElms=[],itemTexts=[];
		var rsTemplate=this.rsTemplate;
		for (var j in itemStructure){
			var itemElm = items.Elm.format([j]);
			var itemText = items.Text.format([j]);
			itemElms[itemElm] = itemList[i].getElementsByTagName(j).item(0);
			if(itemElms[itemElm]){
				var theTitle = itemStructure[j];
				var theText = (itemElms[itemElm].firstChild)?itemElms[itemElm].firstChild.nodeValue:'';
				rsTemplate=this.convertTemplate(rsTemplate,j,theText);
			}
			else {
				rsTemplate = rsTemplate.replace('_'+j, '');
			}
		}
		rsLists += rsTemplate;
	}
	wikify(rsLists,this.place);
};
	
config.macros.xmlreader.convertTemplate = function(rsTemplate,j,theText){
	switch (j){
		case 'title':
			rsTemplate = rsTemplate.replace(/_title/,theText.replace(/\[|\]/g,''));
			break;
		case 'link':
			rsTemplate = rsTemplate.replace(/_link/, theText);
			break;
		case 'pubDate':
			theText = this.formatString(this.dateFormat, theText);
			if (this.groupBy == theText){
				rsTemplate = rsTemplate.replace(/_pubDate/, '');
			}
			else{
				rsTemplate = rsTemplate.replace(/_pubDate/, '\n* '+theText);
				this.groupBy = theText;
			}
			break;
		case 'description':
			var regexpDesc = new RegExp("withDesc|asHtml","g");
			if (regexpDesc.exec(this.withDesc)  && theText){
				var _description = theText.replace(/\n/g,' ');
					_description =_description.replace(/<br \/>/ig,'\n');				
				if (version.extensions.nestedSliders){
					_description = ((this.withDesc == "asHtml")?"<html>"+_description+"</html>":_description);
					rsTemplate = rsTemplate.replace(/_description/,'+++[...]'+_description+'\n===\n');
				}
				else {
					rsTemplate = rsTemplate.replace(/_description/,_description+'\n');
				}
			}
			else {
				rsTemplate = rsTemplate.replace(/_description/,'');
			}
			break;
	}
	return (rsTemplate);
};
	
config.macros.xmlreader.formatString = function(template, theDate){
		var dateString = new Date(theDate);
		template = template.replace(/hh|mm|ss/g,'');
		return dateString.formatString(template);
};
config.macros.xmlreader.testURL = function (url){
		var rsURL={protocol: '', host: '', hostname:'', port:'', path: ''};
		if (url.indexOf(':') == -1) {
			return true;
		}
		rsURL.protocol = url.substr(0,url.indexOf(":")+1);
		var s1 = url.substr(url.lastIndexOf("//")+2);
		var i = s1.indexOf(':');
		if (i != -1){
			rsURL.host=s1.substr(0,s1.indexOf("/"));
			rsURL.hostname = s1.substr(0,i);
			var s2 = s1.substr(i+1);
			var j = s2.indexOf("/");
			if ( j != -1){
				rsURL.port = s2.substr(0, j);
				rsURL.path = s2.substr(j);
			}
			else {
				rsURL.port = s2;
			}
		}
		else {
			if (s1.indexOf("/") != -1){
		    	rsURL.host = s1.substr(0,s1.indexOf("/"));
		    	rsURL.hostname = rsURL.host;
				rsURL.path = s1.substr(s1.indexOf("/"));
			}
			else {
				rsURL.host = s1;
				rsURL.hostname = s1;
			}
		}
		var curLoc = document.location;
//		var curPort = curLoc.host.substr(curLoc.host.indexOf(":")+1);
		var result = (curLoc.protocol == rsURL.protocol && curLoc.host == rsURL.host);
		return (result);
};
//}}}
// // ''Redefine RssNewsMacro''
//{{{
config.macros.rssfeed=config.macros.xmlreader;
//}}}