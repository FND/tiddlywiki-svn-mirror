/***
|''Name:''|TiddlyLib |
|''Version:''|1.0.0 |
|''Source:''|http://www.tiddlyforge.net/pytw/#TiddlyLib |
|''Author:''|[[DevonJones]] |
|''Type:''|Library |
|''License:''|Copyright (c) 2005, Devon Jones. Licensed under the [[TiddlyWiki Plugin License|http://www.tiddlyforge.net/pytw/#TWPluginLicense]], all rights reserved. |
|''Requires:''|TiddlyWiki 1.2, TiddlyWiki 2.0 |
!Description
Library of useful TiddlyWiki functions

!Syntax

!Known issues

!Notes

!Revision history
v1.0.0 February 3rd 2006 - Addressed breakage from Firefox 1.5.0.1, fixed compatability with IE, fixed compatability with Tiddlywiki 1.2.x.  Note, this breaks compatability with former versions of TiddlyLib, as it now uses an object interface to be compatible with IE
v0.9.2 October 26th 2005 - removed getParentTiddler since I have since been informed that findContainingTiddler is in the base app
v0.9.1 October 26th 2005 - added tiddler folding
v0.9.0 October 19th 2005 - initial release

!Documentation
!!createLocalTiddlyButton
''Description:''
Creates a tiddly button, but with out the href of "#".  Thus when you click on the button, it doesn't cause the browser to jump.

''Arguments:''
* theParent: 
* theText: 
* theTooltip: 
* theAction: 
* theClass: 
* theId: 
* theAccessKey: 

!!onDblClickTiddlerOverride
''Description:''
Event handler that can be used to override a tiddler's onDblClick.  Used to prevent entering edit mode if a user clicks to fast on a link or button.

''Arguments:''
* e: (Event) Event to handle

!!hideElementEvent
''Description:''
Event that can be attached to a block level element.  Firing this even hides the element

''Arguments:''
* e: (Event) Event to handle

!!showElementEvent
''Description:''
Event that can be attached to a block level element.  Firing this even unhides the element

''Arguments:''
* e: (Event) Event to handle

!!foldTiddler
''Description:''
Folds a tiddler so that all but the title bar of the tiddler is hidden.

''Arguments:''
* title: (String) Tiddler to fold

!!unfoldTiddler
''Description:''
Unfolds a tiddler so that the whole thing is visible.

''Arguments:''
* title: (String) Tiddler to unfold

!Code
***/
//{{{

config.lib = {};
config.lib.tiddlyLib = new TiddlyLib();

function TiddlyLib() {
}

TiddlyLib.prototype.createLocalTiddlyButton = function(theParent,theText,theTooltip,theAction,theClass,theId,theAccessKey) {
	var theButton = document.createElement("a");
	theButton.className = "button";
	if(theAction) {
		theButton.onclick = theAction;
	}
	theButton.setAttribute("title",theTooltip);
	if(theText) {
		theButton.appendChild(document.createTextNode(theText));
	}
	if(theClass) {
		theButton.className = theClass;
	}
	if(theId) {
		theButton.id = theId;
	}
	if(theParent) {
		theParent.appendChild(theButton);
	}
	if(theAccessKey) {
		theButton.setAttribute("accessKey",theAccessKey);
	}
	return(theButton);
}


TiddlyLib.prototype.onDblClickTiddlerOverride = function(e) {
	if (!e) {
		var e = window.event;
	}
	
	var theTarget = resolveTarget(e);
	if(!readOnly && theTarget && theTarget.nodeName.toLowerCase() != "input" && theTarget.nodeName.toLowerCase() != "textarea" && theTarget.nodeName.toLowerCase() != "a") {
		clearMessage();
		if(document.selection && document.selection.empty) {
			document.selection.empty();
		}
		var tiddler;
		if(this.id.substr(0,7) == "tiddler") {
			tiddler = this.id.substr(7);
		}
		if(tiddler) {
			displayTiddler(null,tiddler,2,null,null,false,false);
		}
		return true;
	}
	else {
		return false;
	}
}

TiddlyLib.prototype.hideElementEvent = function(e) {
	this.style.display = "none";
}

TiddlyLib.prototype.showElementEvent = function(e) {
	this.style.display = "block";
}

TiddlyLib.prototype.foldTiddler = function(title) {
    var body = document.getElementById("body" + title);

    if((body != null) && (body.style.display != "none")) {
	  body.style.display = "none";
	  createTiddlerToolbar(title, false, true);
    }
}

TiddlyLib.prototype.unfoldTiddler = function(title) {
    var body = document.getElementById("body" + title);

    if((body != null) && (body.style.display != "block")) {
	  body.style.display = "block";
	  createTiddlerToolbar(title, false, false);
    }
}

//}}}