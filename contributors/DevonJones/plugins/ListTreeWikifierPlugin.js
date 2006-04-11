/***
|''Name:''|ListTreeWikifierPlugin |
|''Version:''|<<getversion listtree >> |
|''Date:''|<<getversiondate listtree "DD MMM YYYY">> |
|''Source:''|http://www.tiddlyforge.net/pytw/#ListTreeWikifierPlugin |
|''Author:''|[[DevonJones]] |
|''Type:''|Wikifier Extension |
|''License:''|Copyright (c) 2005, Devon Jones. Licensed under the [[TiddlyWiki Plugin License|http://www.tiddlyforge.net/pytw/#TWPluginLicense]], all rights reserved. |
|''Requires:''|TiddlyWiki 1.2.37 or higher, TiddlyWiki 2.0.0 or higher |
!Description
Adds support for a tree in the wikifier

!Syntax

{{{@ followed by a link}}}

!Sample Output

@ TestA
@@ TestB
@@@ TestC
@@ TestD
@@@ TestE

!Known issues

!Notes
you need images for this plugin.  you can download them [[here|http://www.tiddlyforge.net/pytw/listtree.zip]]

!Revision history
v0.9.0 November 3th 2005 - initial release

!Code
***/

//{{{
version.extensions.listtree = { major: 0, minor: 9, revision: 0, date: new Date(2005, 10, 3) };

config.formatters.listtree = {}
config.formatters.listtree.plusimage = "./listtree/plus.png";
config.formatters.listtree.minusimage = "./listtree/minus.png";
config.formatters.listtree.bulletimage = "./listtree/bullet.png";

config.formatters.push({
	name: "listtree",
	match: "^(?:(?:@+))",
	lookahead: "^(?:(@+))",
	terminator: "\\n",
	outerElement: "ul",
	itemElement: "li",
	handler: function(w) {
		var lookaheadRegExp = new RegExp(this.lookahead,"mg");
		w.nextMatch = w.matchStart;
		var placeStack = [w.output];
		var liStack = new Array()
		var currLevel = 0, newLevel;
		var topUl;
		do {
			lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = lookaheadRegExp.exec(w.source);
			var matched = lookaheadMatch && lookaheadMatch.index == w.nextMatch;
			if(matched) {
				newClass = null;
				if(currLevel == 0) {
					newClass = "navtree";
				}
				newLevel = lookaheadMatch[0].length;
				w.nextMatch += lookaheadMatch[0].length;
				if(newLevel > currLevel) {
					for(var i = currLevel; i < newLevel; i++) {
						parent = placeStack[placeStack.length - 1];
						liparent = liStack[liStack.length - 1];
						if(liparent != null) {
							parent = liparent;
						}
						elem = createTiddlyElement(parent, "ul", null, newClass, null);
						if(newClass == "navtree") {
							topUl = elem;
						}
						placeStack.push(elem);
					}
				}
				else if(newLevel < currLevel) {
					for(var i = currLevel; i > newLevel; i--) {
						placeStack.pop();
					}
				}
				
				var e = createTiddlyElement(placeStack[placeStack.length - 1],"li");
				if(newLevel > currLevel) {
					liStack.push(e);
				}
				else if(newLevel == currLevel) {
					liStack.pop();
					liStack.push(e);
				}
				else if(newLevel < currLevel) {
					for(var i = currLevel; i > newLevel; i--) {
						liStack.pop();
					}
					liStack.push(e);
				}
				
				currLevel = newLevel;
				w.subWikify(e,this.terminator);
			}
		} while(matched);
		processULEL(topUl);
	}
});

function processULEL(ul) {
	if (!ul.childNodes || ul.childNodes.length == 0) {
		return;
	}

	// iterate <li>s
	for (var i = 0; i < ul.childNodes.length; i++) {
		var item = ul.childNodes[i];
		if (item.nodeName.toLowerCase() == "li"  && item.className.toLowerCase() != "gap") {
			// iterate this <li>
			var a;
			var subul;
			subul = "";
			for (var j = 0; j < item.childNodes.length; j++) {
				var sitem = item.childNodes[j];
				switch (sitem.nodeName.toLowerCase()) {
					case "a":
						a = sitem;
						break;
					case "ul":
						subul = sitem;
						processULEL(subul);
						break;
				}
			}
			if (subul) {
				associateEL(a,subul);
			}
			else {
				a.parentNode.style.listStyleImage = "url(" + config.formatters.listtree.bulletimage + ")";
			}
		}
	}
}

function associateEL(a, ul) {
	a.oldonclick = a.onclick;
	a.onclick = function (e) {
		var display = ul.style.display;
		this.parentNode.style.listStyleImage = (display == "block") ? "url(" + config.formatters.listtree.plusimage + ")" : "url(" + config.formatters.listtree.minusimage + ")";
		ul.style.display = (display == "block") ? "none" : "block";
		if(ul.style.display =="block") {
			//a.oldonclick(e);
		}
		return false;
	}
	a.onmouseover = function() {
		var display = ul.style.display;
		window.status = (display == "block") ? "Collapse" : "Expand";
		return true;
	}
	a.onmouseout = function() {
		window.status = "";
		return true;
	}
	var display = ul.style.display;
	a.parentNode.style.listStyleImage = "url(" + config.formatters.listtree.plusimage + ")";
	ul.style.display = "none";
}

//}}}
