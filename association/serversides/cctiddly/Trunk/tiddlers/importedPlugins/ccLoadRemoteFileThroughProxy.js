/***
|''Name:''|ccLoadRemoteFileThroughProxy (previous LoadRemoteFileHijack)|
|''Description:''|When the TiddlyWiki file is located on the web (view over http) the content of [[SiteProxy]] tiddler is added in front of the file url. If [[SiteProxy]] does not exist "/proxy/" is added. |
|''Version:''|1.1.0|
|''Date:''|mar 17, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#LoadRemoteFileHijack|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Date:''|Nov 6, 2008|
|''Version:''|0.1|
***/

//{{{
	
version.extensions.LoadRemoteFileThroughProxy={
major:1,minor:1,revision: 0, 
date:new Date("mar 17, 2007"), 
source:"http://tiddlywiki.bidix.info/#LoadRemoteFileThroughProxy"};

if(!window.bidix)window.bidix={}; // bidix namespace
if(!bidix.core)bidix.core={};

bidix.core.loadRemoteFile=loadRemoteFile;
loadRemoteFile=function(url,callback,params){
	var urlStart = window.url;
	if((document.location.toString().substr(0,4)=="http")&&(url.substr(0,4)=="http")){ 
		url=urlStart+"/"+store.getTiddlerText("SiteProxy","/proxy")+url;
	}
	var a = bidix.core.loadRemoteFile(url,callback,params);
	return a;
}
//}}}
