/***
|''Name:''|TextToXMLDOMPlugin|
|''Description:''|Convert a chunk of text into XML DOM for traversing using standard XML DOM methods|
|''Author:''|PhilHawksworth |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/TestToXMLDOMPlugin.js |
|''Version:''|0.2|
|''Date:''|April 8, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|


''Usage examples:''
{{{
// Create an XMLDOM object from some text 
var xml = getXML(text);

// Use standars XML DOM methods to parse the object. For example:
// Get all of the 'thing' tag elements.
var things = xml.getElementsByTagName("thing");

// Get the uri attribute of the first 'thing' element.
var thingUri = things[0].getAttribute("uri");
}}}


***/

//{{{
if(!version.extensions.TextToXMLDOMPlugin) {
version.extensions.TextToXMLDOMPlugin = {installed:true};

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
	if(doc){
		return doc;
	}
	else
		return null;	
};


} //# end of 'install only once'
//}}}