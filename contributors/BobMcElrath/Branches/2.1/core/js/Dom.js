// ---------------------------------------------------------------------------------
// DOM utilities - many derived from www.quirksmode.org
// ---------------------------------------------------------------------------------

function drawGradient(place,horiz,colours)
{
	for(var t=0; t<= 100; t+=2)
		{
		var bar = document.createElement("div");
		place.appendChild(bar);
		bar.style.position = "absolute";
		bar.style.left = horiz ? t + "%" : 0;
		bar.style.top = horiz ? 0 : t + "%";
		bar.style.width = horiz ? (101-t) + "%" : "100%";
		bar.style.height = horiz ? "100%" : (101-t) + "%";
		bar.style.zIndex = -1;
		var f = t/100;
		var p = f*(colours.length-1);
		bar.style.backgroundColor = colours[Math.floor(p)].mix(colours[Math.ceil(p)],p-Math.floor(p)).toString();
		}
}

function createTiddlyText(theParent,theText)
{
	return theParent.appendChild(document.createTextNode(theText));
}

function createTiddlyCheckbox(theParent,caption,checked,onChange)
{
	var cb = document.createElement("input");
	cb.setAttribute("type","checkbox");
	cb.onclick = onChange;
	theParent.appendChild(cb);
	cb.checked = checked;
	if(caption)
		wikify(caption,theParent);
	return cb;
}

function createTiddlyElement(theParent,theElement,theID,theClass,theText)
{
	var e = document.createElement(theElement);
	if(theClass != null)
		e.className = theClass;
	if(theID != null)
		e.setAttribute("id",theID);
	if(theText != null) 
		{
                var m = theText.match(/^<html>(.*)<\/html>$/);
		if(m)
			e.innerHTML = m[1];
		else
			e.appendChild(document.createTextNode(theText));
		}
	if(theParent != null)
		theParent.appendChild(e);
	return(e);
}

// Add an event handler
// Thanks to John Resig, via QuirksMode
function addEvent(obj,type,fn)
{
	if(obj.attachEvent)
		{
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){obj['e'+type+fn](window.event);}
		obj.attachEvent('on'+type,obj[type+fn]);
		}
	else
		obj.addEventListener(type,fn,false);
}

// Remove  an event handler
// Thanks to John Resig, via QuirksMode
function removeEvent(obj,type,fn)
{
	if(obj.detachEvent)
		{
		obj.detachEvent('on'+type,obj[type+fn]);
		obj[type+fn] = null;
		}
	else
		obj.removeEventListener(type,fn,false);
}

function addClass(e,theClass)
{
	var currClass = e.className.split(" ");
	if(currClass.indexOf(theClass) == -1)
		e.className += " " + theClass;
}

function removeClass(e,theClass)
{
	var currClass = e.className.split(" ");
	var i = currClass.indexOf(theClass);
	while(i != -1)
		{
		currClass.splice(i,1);
		i = currClass.indexOf(theClass);
		}
	e.className = currClass.join(" ");
}

function hasClass(e,theClass)
{
	if(e.className)
		{
		if(e.className.split(" ").indexOf(theClass) != -1)
			return true;
		}
	return false;
}

// Find the closest relative with a given property value (property defaults to tagName, relative defaults to parentNode)
function findRelated(e,value,name,relative)
{
	name = name ? name : "tagName";
	relative = relative ? relative : "parentNode";
	if(name == "className")
		{
		while(e && !hasClass(e,value))
			{
			e = e[relative];
			}
		}
	else
		{
		while(e && e[name] != value)
			{
			e = e[relative];
			}
		}
	return e;
}

// Resolve the target object of an event
function resolveTarget(e)
{
	var obj;
	if (e.target)
		obj = e.target;
	else if (e.srcElement)
		obj = e.srcElement;
	if (obj.nodeType == 3) // defeat Safari bug
		obj = obj.parentNode;
	return(obj);
}

// Return the content of an element as plain text with no formatting
function getPlainText(e)
{
	var text = "";
	if(e.innerText)
		text = e.innerText;
	else if(e.textContent)
		text = e.textContent;
	return text;
}

// Get the scroll position for window.scrollTo necessary to scroll a given element into view
function ensureVisible(e)
{
	var posTop = findPosY(e);
	var posBot = posTop + e.offsetHeight;
	var winTop = findScrollY();
	var winHeight = findWindowHeight();
	var winBot = winTop + winHeight;
	if(posTop < winTop)
		return(posTop);
	else if(posBot > winBot)
		{
		if(e.offsetHeight < winHeight)
			return(posTop - (winHeight - e.offsetHeight));
		else
			return(posTop);
		}
	else
		return(winTop);
}

// Get the current width of the display window
function findWindowWidth()
{
	return(window.innerWidth ? window.innerWidth : document.documentElement.clientWidth);
}

// Get the current height of the display window
function findWindowHeight()
{
	return(window.innerHeight ? window.innerHeight : document.documentElement.clientHeight);
}

// Get the current horizontal page scroll position
function findScrollX()
{
	return(window.scrollX ? window.scrollX : document.documentElement.scrollLeft);
}

// Get the current vertical page scroll position
function findScrollY()
{
	return(window.scrollY ? window.scrollY : document.documentElement.scrollTop);
}

function findPosX(obj)
{
	var curleft = 0;
	while (obj.offsetParent)
		{
		curleft += obj.offsetLeft;
		obj = obj.offsetParent;
		}
	return curleft;
}

function findPosY(obj)
{
	var curtop = 0;
	while (obj.offsetParent)
		{
		curtop += obj.offsetTop;
		obj = obj.offsetParent;
		}
	return curtop;
}

// Blur a particular element
function blurElement(e)
{
	if(e != null && e.focus && e.blur)
		{
		e.focus();
		e.blur();
		}
}

// Create a non-breaking space
function insertSpacer(place)
{
	var e = document.createTextNode(String.fromCharCode(160));
	if(place)
		place.appendChild(e);
	return e;
}

// Remove all children of a node
function removeChildren(e)
{
	while(e.hasChildNodes())
		e.removeChild(e.firstChild);
}

// Add a stylesheet, replacing any previous custom stylesheet
function setStylesheet(s,id)
{
	if(!id)
		id = "customStyleSheet";
	var n = document.getElementById(id);
	if(document.createStyleSheet) // Test for IE's non-standard createStyleSheet method
		{
		if(n)
			n.parentNode.removeChild(n);
		// This failed without the &nbsp;
		document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeEnd","&nbsp;<style id='" + id + "'>" + s + "</style>");
		}
	else
		{
		if(n)
			n.replaceChild(document.createTextNode(s),n.firstChild);
		else
			{
			var n = document.createElement("style");
			n.type = "text/css";
			n.id = id;
			n.appendChild(document.createTextNode(s));
			document.getElementsByTagName("head")[0].appendChild(n);
			}
		}
}

// Replace the current selection of a textarea or text input and scroll it into view

function replaceSelection(e,text)
{
	if (e.setSelectionRange)
		{
		var oldpos = e.selectionStart + 1;
		e.value = e.value.substr(0,e.selectionStart) + text + e.value.substr(e.selectionStart);
		e.setSelectionRange( oldpos, oldpos);
		var linecount = e.value.split('\n').length;
		var thisline = e.value.substr(0,e.selectionStart).split('\n').length-1;
		e.scrollTop = Math.floor((thisline-e.rows/2)*e.scrollHeight/linecount);
		}
	else if (document.selection)
		{
		var range = document.selection.createRange();
		if (range.parentElement() == e)
			{
			var isCollapsed = range.text == "";
			range.text = text;
			 if (!isCollapsed)
				{
				range.moveStart('character', -text.length);
				range.select();
				}
			}
		}
}

// Returns the text of the given (text) node, possibly merging subsequent text nodes
function getNodeText(e)
{
	var t = ""; 
	while (e && e.nodeName == "#text")
		{
		t += e.nodeValue;
		e = e.nextSibling;
		}
	return t;
}
