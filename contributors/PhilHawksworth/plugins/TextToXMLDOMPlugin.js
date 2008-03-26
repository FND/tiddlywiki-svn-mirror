/***
|''Name:''|TestToXMLDOMPlugin|
|''Description:''|Convert a chunk of text into XML DOM for traversing using standard XML DOM methods|
|''Author:''|PhilHawksworth |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/Plugins/TestToXMLDOMPlugin.js |
|''Version:''|0.1|
|''Date:''|Mar 18, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|


''Usage examples:''



***/

//{{{
if(!version.extensions.TextToXMLDOMPlugin) {
version.extensions.TextToXMLDOMPlugin = {installed:true};

config.macros.TextToXMLDOM = {};
config.macros.TextToXMLDOM.log = function(x) {
	if(window.console) {
		console.log(x);	
		displayMessage(x);
	}
};




/*
	TODO Abstract the OPML parser into a seperate plugin.
*/
function getXML(opml) {
	if(window.ActiveXObject) {
		var doc = new ActiveXObject("Microsoft.XMLDOM");
		doc.async="false";
		doc.loadXML(opml);
	}
	else {
		var parser=  new DOMParser();
		var doc = parser.parseFromString(opml,"text/xml");	
	}

	FeedListManager.log(opml);

};


} //# end of 'install only once'
//}}}