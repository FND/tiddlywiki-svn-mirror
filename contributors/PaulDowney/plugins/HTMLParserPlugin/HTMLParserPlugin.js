/***
|''Name:''|HTMLParserPlugin|
|''Description:''|parse a HTML string into a DOM|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''Source:''|http://whatfettle.com/2008/07/HTMLParserPlugin/|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/HTMLParserPlugin/|
|''Version:''|0.2|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''~CoreVersion:''|2.4|
!!Documentation
Provides a JavaScript ~HTMLParser class intended to be used by other plugins to parse HTML files into a DOM object.

Much of the code and idea for this plugin originates from Jon Lister's experimentations with [[iframes|http://en.wikipedia.org/wiki/IFrame]].

There is a simple [[standalone test|simple.html]] for this library, which ideally should be rewritten using [[QUnit|http://docs.jquery.com/QUnit]].
!!Code
***/
//{{{
if(!version.extensions.HTMLParserPlugin) {
version.extensions.HTMLParserPlugin = {installed:true};

HTMLParser = {};

HTMLParser.removeScripts = function (str) {
	if(str){
		str = str.replace(/<script(.*?)>.*?<\/script>/ig,"");
		str = str.replace(/(onload|onunload)(=.)/ig,"$1$2\/\/");
	}
	return str;
};

HTMLParser.iframeDocument = function (iframe)
{
	if(iframe.contentDocument) {
		return iframe.contentDocument; 
	}
	if(iframe.contentWindow) {
		return iframe.contentWindow.document; // IE5.5 and IE6
	}
	return iframe.document;
};

HTMLParser.parseText = function (text,handler,context)
{
	// create hidden iframe to hold HTML
	var iframe = document.createElement("iframe");
	var id = "parseHTML-iframe";
	iframe.setAttribute("id", id);
	iframe.setAttribute("name", id);
	iframe.setAttribute("type", "content");
	iframe.style.display = "none";
	document.body.appendChild(iframe);

	// callback fired when iframe HTML has been parsed
	var onload = function (event) {
		var iframe = arguments.callee.iframe;

		// poll for load complete
		if(iframe.readyState){
			if(iframe.readyState!=4 && iframe.readyState!="complete"){
				window.setTimeout(arguments.callee,10);
				return false;
			}
		}

		// call user handler
		var handler = arguments.callee.handler;
		var context = arguments.callee.context;
		if(handler){
			handler(HTMLParser.iframeDocument(iframe),context);
		}

		// delete iframe asynchronously 
		// - inline caused spinlock in FF3.1
		var collect = function() {
			var iframe = arguments.callee.iframe;
			iframe.parentNode.removeChild(iframe);
		};
		collect.iframe = iframe;
		window.setTimeout(collect,10);
		return false;
	};

	// call user supplied callback with context when HTML loaded
	onload.iframe = iframe;
	onload.handler = handler;
	onload.context = context;

	// write HTML text into the iframe
	var doc = HTMLParser.iframeDocument(iframe);
	text = HTMLParser.removeScripts(text);
	doc.open();
	doc.writeln(text);
	doc.close();

	// IE6 and Opera don't support onload event for iframe ..
	window.setTimeout(onload,10);

	return;
};

}
//}}}
