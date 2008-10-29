/***
|''Name''|NestedBrowserMacro|
|''Description''|Creates a browser pane inside a tiddler for viewing external pages.|
|''Version''|0.1.1|
|''Source''|[[Rodney's Corner|http://rodney.gotdns.com]] (mirror: [[FND's DevPad|http://devpad.tiddlyspot.com/#NestedBrowserMacro]])|
|''Author''|[[RodneyGomes]]|
|''Contributor''|FND|
|''Type''|Macro|
!Usage
A name must be specified for the browser window in order to give for the back and forward buttons to work. Also required are the URL, width and height for the browser pane.
{{{
<<browse frameName url width height>>
}}}
!!Example
{{{
<<browse "Google" "http://www.google.com" "100%" "100px">>
}}}
<<browse "Google" "http://www.google.com" "100%" "100px">>
!Limitations
Uses an //iframe//, which some browsers might not support.
!Revision History
!!v0.1.0 (2006-02-18)
* initial release 
!!v0.1.1 (2007-10-04)
* various adjustments of the meta description
* mirrored at [[FND's DevPad|http://devpad.tiddlyspot.com/#NestedBrowserMacro]] as the original source is not available anymore
!Code
***/
//{{{
config.macros.browse = {};

config.macros.browse.handler = function(place,macroName,params) {
	
	var frameName = params[0];
	var url = params[1];
	var width = params[2];
	var height = params[3];
	
	var myBackButton = document.createElement('a');
	myBackButton.href = "javascript:frames['" + frameName + "'].history.back()";
	var buttonText = document.createTextNode('[Back]');
	myBackButton.appendChild(buttonText);
	
	var myForwardButton = document.createElement('a');
	myForwardButton.href = "javascript:frames['" + frameName + "'].history.forward()";
	var buttonText = document.createTextNode('[Forward]');
	myForwardButton.appendChild(buttonText);
	
	var myIframe = document.createElement('iframe');	
	myIframe.name = frameName;
	myIframe.src = url;
	myIframe.style.width = width;
	myIframe.style.height = height;
	
	place.appendChild(myBackButton);
	place.appendChild(myForwardButton);
	place.appendChild(myIframe);
	
}
//}}}