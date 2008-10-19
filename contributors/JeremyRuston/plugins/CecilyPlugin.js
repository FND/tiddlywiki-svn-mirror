/***
|''Name:''|CecilyPlugin|
|''Description:''|A zooming user interface for TiddlyWiki|
|''Author:''|Jeremy Ruston (jeremy (at) osmosoft (dot) com)|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/JeremyRuston/plugins/CecilyPlugin.js|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JeremyRuston/plugins/CecilyPlugin.js|
|''Version:''|0.0.9|
|''Status:''|Under Development|
|''Date:''|July 20, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|BSD|
|''~CoreVersion:''|2.4.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.CecilyPlugin) {
version.extensions.CecilyPlugin = {installed:true};

//-----------------------------------------------------------------------------------
// Point and Rectangle classes
//-----------------------------------------------------------------------------------

// Point class {x:,y:}
function Point(x,y) {
	if(x instanceof Point) {
		this.x = x.x;
		this.y = x.y;
	} else {
		this.x = x;
		this.y = y;
	}
}

// Rectangle class {x:,y:,w:,h:} (w and h are both set to zero for empty rectangles)
function Rect(x,y,w,h) {
	if(x instanceof Rect) {
		this.x = x.x;
		this.y = x.y;
		this.w = x.w;
		this.h = x.h;
	} else {
		this.x = x ? x : 0;
		this.y = y ? y : 0;
		this.w = w ? w : 0;
		this.h = h ? h : 0;
	}
}

// Determines if this rectangle is empty
Rect.prototype.isEmpty = function() {
	return !this.w || !this.h;
}

// Returns the smallest rectangle that contains both this and the source rectangles
Rect.prototype.union = function(src) {
	if(this.isEmpty())
		return new Rect(src);
	if(src.isEmpty())
		return new Rect(this);
	var r = new Rect(Math.min(this.x,src.x),Math.min(this.y,src.y));
	r.w = Math.max(this.x+this.w-r.x,src.x+src.w-r.x);
	r.h = Math.max(this.y+this.h-r.y,src.y+src.h-r.y);
	return r;
}

// Determines if the source rectangle is completely contained within this rectangle
Rect.prototype.contains = function(src) {
	return (src.x > this.x) && ((this.x+this.w) > (src.x+src.w))
		&& (src.y > this.y) && ((this.y+this.h) > (src.y+src.h));
}

// Interpolates between this (t=0) and the source retangle (t=1)
Rect.prototype.interpolate = function(src,t) {
	var interpolate = function(a,b,t) {return a + (b - a) * t;};
	return new Rect(interpolate(this.x,src.x,t), interpolate(this.y,src.y,t),
		interpolate(this.w,src.w,t), interpolate(this.h,src.h,t));
}

// Scales a rectangle around it's centre
Rect.prototype.scale = function(scale) {
	var w = this.w * scale;
	var h = this.h * scale;
	return new Rect(this.x - (w-this.w)/2,this.y - (h-this.h)/2,w,h);
}

// Returns the midpoint of a rectangle
Rect.prototype.midPoint = function() {
	return new Point(this.x + this.w/2, this.y + this.h/2);
}

//-----------------------------------------------------------------------------------
// Generic helper functions
//-----------------------------------------------------------------------------------

// Given a point in the coordinates of a target element, compute the coordinates relative to a specified parent element
function normalisePoint(parent,target,pt) {
	var e = target;
	var r = new Point(pt.x,pt.y);
	while(e != parent && e.offsetParent) {
		r.x += e.offsetLeft;
		r.y += e.offsetTop;
		e = e.offsetParent;
	}
	if(e == parent)
		return r;
	else
		return null;
}

// Checks which of an array of classes are applied to a given element. Returns an array of the classes that are found
function hasClasses(e,classNames)
{
	var classes = e.className ? e.className.split(" ") : [];
	var results = [];
	for(var t=0; t<classNames.length; t++) {
		if(classes.indexOf(classNames[t]) != -1) {
			results.push(classNames[t]);
		}
	}
	return results;
}

//-----------------------------------------------------------------------------------
// Slider control
//-----------------------------------------------------------------------------------

//# The slider control is constructed with a sliderInfo object that can contain the following keys:
//#   place: DOM node to which the slider control is appended as a new child
//#   min: Minimum value (integer)
//#   max: Maximum value (integer)
//#   getterTransform: function to convert internal slider values when reading them
//#   setterTransform: function to convert to internal slider value when setting them
//#   onChange: function(value) called when the slider moves
function SliderControl(sliderInfo) {
	merge(this,sliderInfo);
	if(!this.getterTransform)
		this.getterTransform = function(x) {return x;};
	if(!this.setterTransform)
		this.setterTransform = function(x) {return x;};
	this.slider = createTiddlyElement(this.place,"input");
	this.slider.type = "range";
	this.slider.min = this.min;
	this.slider.max = this.max;
	this.slider.style["-webkit-appearance"] = "slider-horizontal";
	var me = this;
	this.slider.oninput = function (ev) {
		me.onChange(me.getterTransform(parseInt(me.slider.value,10)));
	};
}

SliderControl.prototype.set = function(value) {
	var n = this.setterTransform(value).toString();
	if(this.slider.value != n)
		this.slider.value = n;
};

//-----------------------------------------------------------------------------------
// Zoom macro
//-----------------------------------------------------------------------------------

config.macros.cecilyZoom = {};

config.macros.cecilyZoom.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var zoomElem = createTiddlyElement(place,"span",null,"cecilyLabel cecilyZoom","zoom ");
	var me = this;
	zoomElem.sliderControl = new SliderControl({
		place: place,
		min: 0,
		max: 100,
		getterTransform: function(slider) {
			return Math.pow(Math.E,(slider/100)*12-6);
		},
		setterTransform: function(value) {
			var n = ((Math.log(value)+6)/12)*100;
			n = Math.min(100,Math.max(0,Math.floor(n + 0.5)));
			return n;
		},
		onChange: function(value) {
			if(cecily) {
				var w = cecily.frame.offsetWidth;
				var h = cecily.frame.offsetHeight;
				var cx = cecily.view.x + cecily.view.w/2;
				var cy = cecily.view.y + cecily.view.h/2;
				var newView = new Rect(0,0,w / value,h / value);
				newView.x = cx - newView.w/2;
				newView.y = cy - newView.h/2;
				cecily.setView(newView);
			}
		}
	});
}

config.macros.cecilyZoom.propagate = function(scale) {
	var zoomers = document.getElementsByClassName("cecilyZoom");
	for(var t = 0; t < zoomers.length; t++) {
		zoomers[t].sliderControl.set(scale);
	}
}

//-----------------------------------------------------------------------------------
// Zoom All macro
//-----------------------------------------------------------------------------------

config.macros.cecilyZoomAll = {};

config.macros.cecilyZoomAll.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	createTiddlyButton(place,"zoom everything","Zoom out to see everything",function(ev) {
		if(cecily)
			cecily.scrollToAllTiddlers();
	});
}

//-----------------------------------------------------------------------------------
// Switch background macro
//-----------------------------------------------------------------------------------

config.macros.cecilyBackground = {
};

config.macros.cecilyBackground.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if(cecily) {
		createTiddlyElement(place,"span",null,"cecilyLabel","background ");
		var onchange = function(ev) {
			var sel = this.options[this.selectedIndex].value;
			if(sel != cecily.background) {
				cecily.setBackground(sel);
			}
		};
		var options = [];
		for(var t in Cecily.backgrounds) {
			options.push({name: t, caption: Cecily.backgrounds[t].title});
		}
		var d = createTiddlyDropDown(place,onchange,options,cecily.background);
		addClass(d,"cecilyBackground");
	}
};

config.macros.cecilyBackground.propagate = function(background) {
	var backgrounders = document.getElementsByClassName("cecilyBackground");
	for(var k=0; k<backgrounders.length; k++) {
		var b = backgrounders[k];
		for(var s=0; s<b.options.length; s++) {
			if(b.options[s].value === background && b.selectedIndex !== s)
				b.selectedIndex = s;
		}
	}
};

//-----------------------------------------------------------------------------------
// Switch map macro
//-----------------------------------------------------------------------------------

config.macros.cecilyMap = {
};

config.macros.cecilyMap.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if(cecily) {
		createTiddlyElement(place,"span",null,"cecilyLabel","map ");
		var onchange = function(ev) {
			var sel = this.options[this.selectedIndex].value;
			if(sel != cecily.mapTitle) {
				cecily.setMap(sel);
			}
			cecily.scrollToAllTiddlers();
		};
		var options = [];
		var mapTiddlers = store.getTaggedTiddlers("cecilyMap")
		for(var t=0; t<mapTiddlers.length; t++) {
			options.push({name: mapTiddlers[t].title, caption: mapTiddlers[t].title});
		}
		var d = createTiddlyDropDown(place,onchange,options,cecily.mapTitle);
		addClass(d,"cecilyMap");
	}
};

config.macros.cecilyMap.propagate = function(map) {
	var mappers = document.getElementsByClassName("cecilyMap");
	for(var k=0; k<mappers.length; k++) {
		var m = mappers[k];
		for(var s=0; s<m.options.length; s++) {
			if(m.options[s].value === map && m.selectedIndex !== s)
				m.selectedIndex = s;
		}
	}
};

//-----------------------------------------------------------------------------------
// Cecily main class
//-----------------------------------------------------------------------------------

function Cecily()
{
	this.background = config.options.txtCecilyBackground ? config.options.txtCecilyBackground : "honeycomb";
	this.mapTitle = config.options.txtCecilyMap ? config.options.txtCecilyMap : "MyMap";
	this.drag = null;
	this.map = null;
}

Cecily.prototype.createDisplay = function() {
	this.overlayMenu = document.getElementById("overlayMenu");
	this.addEventHandler(this.overlayMenu,"mouseout",this.onMouseOutOverlay,false);
	this.loadMap(this.mapTitle);
	this.container = document.getElementById(story.containerId());
	this.frame = this.container.parentNode;
	addClass(this.frame,"cecily");
	this.canvas = createTiddlyElement(null,"canvas",null,"cecilyCanvas");
	this.frame.insertBefore(this.canvas,this.frame.firstChild);
	this.setViewSize();
	this.setView(new Rect(0,0,25000,12000));
	this.initScroller();
	var me = this;
	this.addEventHandler(window,"resize",this.onWindowResize,false);
	this.addEventHandler(window,"mousewheel",this.onMouseWheel,true);
	this.addEventHandler(document,"click",this.onMouseClickBubble,false);
	this.addEventHandler(document,"dblclick",this.onMouseDoubleClickBubble,false);
	this.addEventHandler(document,"mousedown",this.onMouseDownCapture,true);
	this.addEventHandler(document,"mousemove",this.onMouseMoveCapture,true);
	this.addEventHandler(document,"mouseup",this.onMouseUpCapture,true);
	this.defaultTiddler = null;
	window.setTimeout(function() {me.scrollToTiddler(me.defaultTiddler);},10);
}

Cecily.prototype.setViewSize = function() {
	var h = findWindowHeight();
	this.frame.style.height = h + "px";
	this.canvas.width = this.frame.offsetWidth;
	this.canvas.height = this.frame.offsetHeight;
}

Cecily.prototype.addEventHandler = function(element,type,handler,capture) {
	var me = this;
	element.addEventListener(type,function (ev) {
		if(ev.offsetX === undefined)
			ev.offsetX = ev.clientX;
		if(ev.offsetY === undefined)
			ev.offsetY = ev.clientY;
		if(ev.toElement === undefined)
			ev.toElement = ev.relatedTarget;
		return handler.call(me,ev);
		},capture);
}

Cecily.prototype.onWindowResize = function(ev) {
	this.setViewSize();
	this.drawBackground();
	return false;
}

Cecily.prototype.onMouseWheel = function(ev) {
	var newView = new Rect(this.view);
	newView.x -= (ev.wheelDeltaX/120) * (this.view.w/16);
	newView.y -= (ev.wheelDeltaY/120) * (this.view.w/16);
	this.setView(newView);
	return false;
};

Cecily.prototype.onMouseClickBubble = function(ev) {
	var tiddler = story.findContainingTiddler(ev.target);
	if(tiddler && this.drag === null && hasClasses(ev.target,["tiddlyLink","toolbar","title","tagged"]).length == 0) { 
		tiddler.parentNode.insertBefore(tiddler,null); 
		this.scrollToTiddler(tiddler); 
	} 
};

Cecily.prototype.onMouseDoubleClickBubble = function(ev) {
	this.showOverlayMenu(new Point(ev.offsetX,ev.offsetY));
};

Cecily.prototype.onMouseDownCapture = function(ev) {
	for(var d=0; d<Cecily.draggerList.length; d++) {
		var dragger = Cecily.draggers[Cecily.draggerList[d]];
		if(dragger.isDrag(this,ev.target,ev)) {
			this.drag = {dragger: dragger};
			dragger.dragDown(this,ev.target,ev);
			break;
		}
	}
	if(this.drag !== null) {
		ev.stopPropagation();
		ev.preventDefault();
		return false;
	}
};

Cecily.prototype.onMouseMoveCapture = function(ev) {
	if(this.drag) {
		this.drag.dragger.dragMove(this,ev.target,ev);
		ev.stopPropagation();
		ev.preventDefault();
		return false;
	}
};

Cecily.prototype.onMouseUpCapture = function(ev) {
	if(this.drag) {
		this.drag.dragger.dragUp(this,ev.target,ev);
		this.drag = null;
		ev.stopPropagation();
		ev.preventDefault();
		return false;
	}
};

Cecily.draggers = {};
Cecily.draggerList = ["tiddlerDragger","tiddlerResizer","backgroundDragger"];

Cecily.draggers.tiddlerDragger = {
	isDrag: function(cecily,target,ev) {
		return hasClass(target,"toolbar") || hasClass(target,"title");
	},
	dragDown: function(cecily,target,ev) {
		var tiddler = story.findContainingTiddler(target);
		tiddler.parentNode.insertBefore(tiddler,null);
		cecily.drag.tiddler = tiddler;
		cecily.drag.tiddlerTitle = tiddler.getAttribute("tiddler");
		cecily.drag.lastPoint = normalisePoint(cecily.frame,target,new Point(ev.offsetX,ev.offsetY));
		addClass(tiddler,"drag");
	},
	dragMove: function(cecily,target,ev) {
		var dragThis = normalisePoint(cecily.frame,target,new Point(ev.offsetX,ev.offsetY));
		if(dragThis) {
			var s = cecily.frame.offsetWidth/cecily.view.w;
			cecily.drag.tiddler.realPos = new Point(cecily.drag.tiddler.realPos.x + (dragThis.x - cecily.drag.lastPoint.x) / s,
													cecily.drag.tiddler.realPos.y + (dragThis.y - cecily.drag.lastPoint.y) / s);
			cecily.drag.tiddler.style.left = cecily.drag.tiddler.realPos.x + "px";
			cecily.drag.tiddler.style.top = cecily.drag.tiddler.realPos.y + "px";
			cecily.drag.lastPoint = dragThis;
		}
	},
	dragUp: function(cecily,target,ev) {
		removeClass(cecily.drag.tiddler,"drag");
		cecily.updateTiddlerPosition(cecily.drag.tiddlerTitle,cecily.drag.tiddler);
	}
};

Cecily.draggers.tiddlerResizer = {
	isDrag: function(cecily,target,ev) {
		return findRelated(target,"tagged","className","parentNode") !== null;
	},
	dragDown: function(cecily,target,ev) {
		var tiddler = story.findContainingTiddler(target);
		tiddler.parentNode.insertBefore(tiddler,null);
		cecily.drag.tiddler = tiddler;
		cecily.drag.tiddlerTitle = tiddler.getAttribute("tiddler");
		cecily.drag.startPoint = normalisePoint(cecily.frame,target,new Point(ev.offsetX,ev.offsetY));
		cecily.drag.startWidth = tiddler.scaledWidth;
		addClass(tiddler,"drag");
	},
	dragMove: function(cecily,target,ev) {
		var s = cecily.frame.offsetWidth/cecily.view.w;
		var dragThis = normalisePoint(cecily.frame,target,new Point(ev.offsetX,ev.offsetY));
		if(dragThis) {
			var newWidth = cecily.drag.startWidth + (dragThis.x - cecily.drag.startPoint.x) / s;
			if(newWidth < 0.01)
				newWidth = 0.01;
			cecily.drag.tiddler.scaledWidth = newWidth;
			cecily.transformTiddler(cecily.drag.tiddler);
		}
	},
	dragUp: function(cecily,target,ev) {
		removeClass(cecily.drag.tiddler,"drag");
		cecily.updateTiddlerPosition(cecily.drag.tiddlerTitle,cecily.drag.tiddler);
	}
};

Cecily.draggers.backgroundDragger = {
	isDrag: function(cecily,target,ev) {
		return target === cecily.canvas;
	},
	dragDown: function(cecily,target,ev) {
		cecily.drag.lastPoint = {x: ev.offsetX, y: ev.offsetY};
	},
	dragMove: function(cecily,target,ev) {
		var s = cecily.frame.offsetWidth/cecily.view.w;
		var newView = new Rect(cecily.view);
		newView.x -= (ev.offsetX - cecily.drag.lastPoint.x)/s;
		newView.y -= (ev.offsetY - cecily.drag.lastPoint.y)/s;
		cecily.drag.lastPoint = {x: ev.offsetX, y: ev.offsetY};
		cecily.setView(newView);
	},
	dragUp: function(cecily,target,ev) {
	}
};

Cecily.prototype.showOverlayMenu = function(pos)
{
	this.overlayMenu.style.display = "block";
	var overlayPos = new Rect(pos.x - this.overlayMenu.offsetWidth/2,pos.y - this.overlayMenu.offsetHeight/2,
							this.overlayMenu.offsetWidth,this.overlayMenu.offsetHeight);
	var w = this.frame.offsetWidth;
	var h = this.frame.offsetHeight;
	if(overlayPos.w > w || overlayPos.h > h) {
		overlayPos = overlayPos.scale(Math.min(w/overlayPos.w,h/overlayPos.h));
	}
	if(overlayPos.x < 0)
		overlayPos.x = 0;
	if(overlayPos.y < 0)
		overlayPos.y = 0;
	if(overlayPos.x + overlayPos.w > w)
		overlayPos.x = w - overlayPos.w;
	if(overlayPos.y + overlayPos.h > h)
		overlayPos.y = h - overlayPos.h;
	var scale = overlayPos.h / this.overlayMenu.offsetHeight;
	this.overlayMenu.style[Cecily.cssTransform] = "scale(" + scale + "," + scale + ")";
	this.overlayMenu.style.left = overlayPos.x + "px";
	this.overlayMenu.style.top = overlayPos.y + "px";
	this.overlayMenu.style.opacity = "0.9";
};

Cecily.prototype.onMouseOutOverlay = function(ev)
{
	if(findRelated(ev.toElement,"overlayMenu","id","parentNode") == null) {
		this.overlayMenu.style.opacity = "0.0";
		this.overlayMenu.style.display = "none";
	}
};

//# Display a given tiddler with a given template. If the tiddler is already displayed but with a different
//# template, it is switched to the specified template. If the tiddler does not exist, and if server hosting
//# custom fields were provided, then an attempt is made to retrieve the tiddler from the server
//# srcElement - reference to element from which this one is being opened -or-
//#              special positions "top", "bottom"
//# tiddler - tiddler or title of tiddler to display
//# template - the name of the tiddler containing the template -or-
//#            one of the constants DEFAULT_VIEW_TEMPLATE and DEFAULT_EDIT_TEMPLATE -or-
//#            null or undefined to indicate the current template if there is one, DEFAULT_VIEW_TEMPLATE if not
//# animate - whether to perform animations
//# customFields - an optional list of name:"value" pairs to be assigned as tiddler fields (for edit templates)
//# toggle - if true, causes the tiddler to be closed if it is already opened
Cecily.prototype.displayTiddler = function(superFunction,args) {
	var tiddler = args[1];
	var srcElement = args[0];
	args[0] = "bottom"; // srcElement to disable animation and scrolling
	var title = (tiddler instanceof Tiddler) ? tiddler.title : tiddler;
	var tiddlerElemBefore = story.getTiddler(title);
	superFunction.apply(story,args);
	var tiddlerElem = story.getTiddler(title);
	if(!tiddlerElem)
	 	return;
	var pos = this.getTiddlerPosition(title,srcElement);
	tiddlerElem.style.left = pos.x + "px";
	tiddlerElem.style.top = pos.y + "px";
	tiddlerElem.realPos = new Point(pos.x,pos.y);
	tiddlerElem.scaledWidth = pos.w;
	tiddlerElem.rotate = 0;
	tiddlerElem.enlarge = 1.0;
	this.transformTiddler(tiddlerElem);
	if(!startingUp) {
		if(tiddlerElem.nextSibling) { // Move tiddler to the bottom of the Z-order if it's not already there
			tiddlerElem.parentNode.insertBefore(tiddlerElem,null);
		}
		this.scrollToTiddler(title);
	}
	this.defaultTiddler = tiddlerElem;
};

// Load the current map from a named tiddler
Cecily.prototype.loadMap = function(title) {
	this.map = {};
	var mapText = store.getTiddlerText(title,"");
    var positionRE = /^(\S+)\s(-?[0-9\.E]+)\s(-?[0-9\.E]+)\s(-?[0-9\.E]+)\s(-?[0-9\.E]+)$/mg;
    do {
        var match = positionRE.exec(mapText);
		if(match) {
			var title = decodeURIComponent(match[1]);
			this.map[title] = {
				x: parseFloat(match[2]),
				y: parseFloat(match[3]),
				w: parseFloat(match[4]),
				h: parseFloat(match[5])
			};
		}
	} while(match);
}

// Save the current map into a named tiddler
Cecily.prototype.saveMap = function(title) {
	var mapTiddler = store.getTiddler(title);
	if((mapTiddler == null) || (mapTiddler.isTagged("cecilyMap"))) {
		var text = [];
		for(var t in this.map) {
			var m = this.map[t];
			text.push(encodeURIComponent(t) + " " + Math.floor(m.x) + " " + Math.floor(m.y) + " " + Math.floor(m.w) + " " + Math.floor(m.h));
		}
		text.sort();
		store.saveTiddler(title,title,text.join("\n"),"Cecily");
		autoSaveChanges(null,[mapTiddler]);
	}
}

// Gets the Rect() position of a named tiddler
Cecily.prototype.getTiddlerPosition = function(title,srcElement) {
	var p = this.map[title];
	if(p)
		return new Rect(p.x,p.y,p.w,p.h);
	else {
		this.nextPos = this.nextPos ? this.nextPos + 250 : 250;
		return new Rect(this.nextPos,500,225,250);
	}
}

// Updates the position of a named tiddler into the current map
Cecily.prototype.updateTiddlerPosition = function(title,tiddlerElem) {
	var pos = new Rect(tiddlerElem.realPos.x,
						tiddlerElem.realPos.y,
						tiddlerElem.scaledWidth,
						tiddlerElem.offsetHeight * (tiddlerElem.scaledWidth/tiddlerElem.offsetWidth));
	this.map[title] = pos;
	this.saveMap(this.mapTitle);
}

// Switch to a new map
Cecily.prototype.setMap = function(title)
{
	this.mapTitle = title;
	config.options.txtCecilyMap = title;
	saveOptionCookie("txtCecilyMap");
	this.loadMap(title);
	var me = this;
	story.forEachTiddler(function(tiddler,elem) {
		var pos = me.getTiddlerPosition(tiddler);
		elem.style.left = pos.x + "px";
		elem.style.top = pos.y + "px";
		elem.realPos = new Point(pos.x,pos.y);
		elem.scaledWidth = pos.w;
		elem.rotate = 0;
		elem.enlarge = 1.0;
		me.transformTiddler(elem);
	});
	this.drawBackground();
	config.macros.cecilyMap.propagate(title);
}

// Applies the tiddler transformation properties (rotate & enlarge) to the display
Cecily.prototype.transformTiddler = function(tiddlerElem) {
	var s = tiddlerElem.scaledWidth/360;
	var r = tiddlerElem.rotate;
	var e = tiddlerElem.enlarge;
	tiddlerElem.style[Cecily.cssTransform] = "translate(-50%,-50%) scale(" + s + "," + s + ") translate(50%,50%) rotate(" + r + "rad) scale(" + e + ")";
	// Experimental beginnings of support for semantic zooming
	var w = tiddlerElem.scaledWidth * (this.frame.offsetWidth)/(this.view.w);
	var f = w < 60 ? addClass : removeClass;
	f(tiddlerElem,"tooSmallToRead");
};

// Moves the viewport to accommodate the specified rectangle
Cecily.prototype.setView = function(newView) {
	var w = this.frame.offsetWidth;
	var h = this.frame.offsetHeight;
	var centre = newView.midPoint();
	this.view = new Rect(newView);
	if((w/h) > (newView.w/newView.h)) {
		this.view.w = newView.h * (w/h);
	} else {
		this.view.h = newView.w * (h/w);
	}
	this.view.x = centre.x - this.view.w/2;
	this.view.y = centre.y - this.view.h/2;
	var s = w/this.view.w;
	var transform = "scale(" + s + ") translate(" + -this.view.x + "px," + -this.view.y + "px)";
	this.container.style[Cecily.cssTransform] = transform;
	config.macros.cecilyZoom.propagate(s);
	this.drawBackground();
};

Cecily.prototype.startHightlight = function(elem) {
	var me = this;
	var animationStart = new Date();
	var animationDuration = 3 * 1000;
	var highlight = {};
	var highlightElem = findRelated(elem.firstChild,"viewer","className","nextSibling");
	highlight.tick = function() {
		if(!highlightElem.parentNode)
			return false;
		var now = new Date();
		var t = (now - animationStart) / animationDuration;
		if(t < 1) {
			var p = (Math.sin(t*Math.PI*4 + Math.PI/2)+1)/2;
			highlightElem.style.backgroundColor = (new RGB("#ffff88")).mix(new RGB("#ffffff"),(p+1)/2).toString();
			return true;
		} else {
			highlightElem.style.backgroundColor = "";
			return false;
		}
	}
	if(highlightElem)
		anim.startAnimating(highlight);
};

Cecily.prototype.scrollToAllTiddlers = function() {
	var currRect = null;
	story.forEachTiddler(function (title,tiddlerElem) {
		var tiddlerRect = new Rect(tiddlerElem.realPos.x,
								tiddlerElem.realPos.y,
								tiddlerElem.scaledWidth,
								tiddlerElem.offsetHeight * (tiddlerElem.scaledWidth/tiddlerElem.offsetWidth));
		if(!currRect)
			currRect = tiddlerRect;
		else
			currRect = tiddlerRect.union(currRect);
	});
	if(currRect)
		this.startScroller([currRect.scale(1.2)]);
}

// Highlight a particular tiddler and scroll it into view
//  tiddler - title of tiddler or reference to tiddlers DOM element
Cecily.prototype.scrollToTiddler = function(tiddler) {
	var tiddlerElem = typeof tiddler == "string" ? story.getTiddler(tiddler) : tiddler;
	if(tiddlerElem) {
		this.startHightlight(tiddlerElem);
		var targetRect = new Rect(tiddlerElem.realPos.x,
									tiddlerElem.realPos.y,
									tiddlerElem.scaledWidth,
									tiddlerElem.offsetHeight * (tiddlerElem.scaledWidth/tiddlerElem.offsetWidth));
		if(this.view.contains(targetRect)) {
			this.startScroller([targetRect.scale(1.2)]);
		} else {
			var passingRect = this.view.union(targetRect);
			this.startScroller([passingRect.scale(1.1),targetRect.scale(1.2)]);
		}
	}
}

Cecily.prototype.initScroller = function() {
	var me = this;
	this.scroller = {
		scrolling: false
	};
	me.scroller.tick = function() {
		var now = new Date();
		var t = (now - me.scroller.animationStart) / me.scroller.animationDuration;
		if(t > 1)
			t = 1;
		me.setView(me.scroller.rectList[me.scroller.currRect].interpolate(me.scroller.rectList[me.scroller.currRect + 1],t));
		if(t == 1) {
			me.scroller.currRect++;
			if(me.scroller.currRect + 1 >= me.scroller.rectList.length) {
				me.scroller.scrolling = false;
				return false;
			}
			me.scroller.animationStart = now;
		}
		return true;
	};
}

Cecily.prototype.startScroller = function(rectList,duration) { // One or more rectangles to scroll to in turn
	var s = this.scroller;
	s.rectList = [this.view];
	for(var r = 0; r < rectList.length; r++)
		s.rectList.push(rectList[r]);
	s.animationStart = new Date();
	s.animationDuration = duration ? duration : 0.75 * 1000;
	s.currRect = 0;
	if(!s.scrolling) {
		s.scrolling = true;
		anim.startAnimating(s);
	}
};

Cecily.prototype.setBackground = function(background) {
	cecily.background = background;
	config.options.txtCecilyBackground = background;
	saveOptionCookie("txtCecilyBackground");
	cecily.drawBackground();
	config.macros.cecilyBackground.propagate(background);
};

Cecily.prototype.drawBackground = function() {
	var b = Cecily.backgrounds[this.background];
	if(b) {
		b.drawBackground(this.canvas,this.view);
	} else {
		var ctx = this.canvas.getContext('2d');
		ctx.fillStyle = "#cccccc";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
};

//-----------------------------------------------------------------------------------
// Background plumbing and generators
//-----------------------------------------------------------------------------------

Cecily.backgrounds = {};

Cecily.backgrounds.plain = {
		title: "Plain",
		description: "Plain",
		drawBackground: function(canvas,view) {
			var w = canvas.width;
			var h = canvas.height;
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = "#aaaacc";
			ctx.fillRect(0, 0, w, h);
		}
};

Cecily.backgrounds.fractal = {
		title: "Fractal",
		description: "Fractal cracks",
		drawBackground: function(canvas,view) {
			var w = canvas.width;
			var h = canvas.height;
			var scale = w/view.w;
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = "#cc8888";
			ctx.fillRect(0, 0, w, h);
			var Turtle = function Turtle(x,y,direction) {
				this.x = x ? x : 0;
				this.y = y ? y : 0;
				this.direction = direction ? direction : 0;
			};
			Turtle.prototype.line = function(d) {
					this.x += Math.sin(this.direction) * d;
					this.y -= Math.cos(this.direction) * d;
				};
			Turtle.prototype.turn = function(a) {
					this.direction += a;
				};
			// Gosper curve as a series of angles to turn (in degrees anti clockwise, for humans)
			var fractalPath =  [0,300,240,60,120,0,60]; // [0,-60,60,-240,240];
			// Work out the overall angle and length of the curve
			var turtle = new Turtle(0,0,0);
			for(var t=0; t<fractalPath.length; t++) {
				turtle.turn(fractalPath[t] / 180 * Math.PI);
				turtle.line(1);
			}
			var fractalAngle = Math.atan2(turtle.y,turtle.x);
			var fractalLength = Math.sqrt(Math.pow(turtle.x,2)+Math.pow(turtle.y,2));
			// Recursive function to draw a generation of the curve
			var drawLeg = function drawLeg(p1,p2,depth) {
				// Work out the angle and length required
				var legLength = Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));
				var legAngle = Math.atan2(p2.y-p1.y,p2.x-p1.x);
				// Initialise the turtle
				var legScale = legLength / fractalLength;
				var turtle = new Turtle(p1.x,p1.y,legAngle);
				turtle.turn(-fractalAngle);
				// Step through the curve
				for(var t=0; t<fractalPath.length; t++) {
					var prevX = turtle.x;
					var prevY = turtle.y;
					turtle.turn(fractalPath[t] / 180 * Math.PI);
					turtle.line(legScale);
					if(depth > 0)
						drawLeg(new Point(prevX,prevY),new Point(turtle.x,turtle.y),depth - 1);
					ctx.lineTo(turtle.x,turtle.y);
				}
			}
			var drawCircle = function(x,y,r) {
				var radgrad = ctx.createRadialGradient(x,y,r,x-r/3,y-r/3,1);
				radgrad.addColorStop(0, '#8888cc');
				radgrad.addColorStop(0.9, '#f0f0ff');
				radgrad.addColorStop(1, '#ffffff');
				ctx.fillStyle = radgrad;
				ctx.beginPath();
				ctx.arc(x,y,r,0,2*Math.PI,0);
				ctx.fill();
			}
			var scale = w/view.w;
			// Get the position of the canvas on the plane
			var px = view.x + view.w/2 - (w/2) / scale;
			var py = view.y + view.h/2 - (h/2) / scale;
			var pw = w / scale;
			var ph = h / scale;
			// Map coordinates
			var p1 = new Point(-430,11);
			var p2 = new Point(1530,674);
			var x = 100;
			var y = 100;
			var r = 500;
			// To 0..1,0..1 for viewport
			p1.x = (p1.x - px)/pw;
			p1.y = (p1.y - py)/ph;
			p2.x = (p2.x - px)/pw;
			p2.y = (p2.y - py)/ph;
			
			x = (x - px)/pw;
			y = (y - py)/ph;
			r = r / pw;
			// To x,y for canvas
			x = x * w;
			y = y * h;
			r = r * w;
			
			p1.x = p1.x * w;
			p1.y = p1.y * h;
			p2.x = p2.x * w;
			p2.y = p2.y * h;
			
			// Draw the circle
			drawCircle(x,y,r);
			// Draw the curve
			ctx.strokeStyle = "#0ff";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(p1.x,p1.y);
			drawLeg(p1,p2,3);
			ctx.stroke();
			// Draw the curve
			ctx.strokeStyle = "#F00";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(p1.x,p1.y);
			drawLeg(p1,p2,2);
			ctx.stroke();
			// Draw the curve
			ctx.strokeStyle = "#Ff0";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(p1.x,p1.y);
			drawLeg(p1,p2,1);
			ctx.stroke();
			// Draw the curve
			ctx.strokeStyle = "#F0f";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(p1.x,p1.y);
			drawLeg(p1,p2,0);
			ctx.stroke();
		}
};

Cecily.backgrounds.experimental = {
		title: "Experimental",
		description: "Experimental scratchpad",
		drawBackground: function(canvas,view) {
			var w = canvas.width;
			var h = canvas.height;
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = "#cccccc";
			ctx.fillRect(0, 0, w, h);
			var drawCircle = function(x,y,r) {
				var radgrad = ctx.createRadialGradient(x,y,r,x-r/3,y-r/3,1);
				radgrad.addColorStop(0, '#8888cc');
				radgrad.addColorStop(0.9, '#f0f0ff');
				radgrad.addColorStop(1, '#ffffff');
				ctx.fillStyle = radgrad;
				ctx.beginPath();
				ctx.arc(x,y,r,0,2*Math.PI,0);
				ctx.fill();
			}
			var scale = w/view.w;
			var px = view.x + view.w/2 - (w/2) / scale;
			var py = view.y + view.h/2 - (h/2) / scale;
			var pw = w / scale;
			var ph = h / scale;
			// Map coordinates
			var x = 100;
			var y = 100;
			var r = 500;
			// To 0..1,0..1 for viewport
			x = (x - px)/pw;
			y = (y - py)/ph;
			r = r / pw;
			// To x,y for canvas
			x = x * w;
			y = y * h;
			r = r * w;
			drawCircle(x,y,r);
				ctx.drawWindow(window, 0, 0, 100, 200, "rgb(0,0,0)");
		}
};

Cecily.backgrounds.honeycomb = {
		title: "Honeycomb",
		description: "Honeycomb balls",
		drawBackground: function(canvas,view) {
			var w = canvas.width;
			var h = canvas.height;
			var scale = w/view.w;
			var t = ((Math.log(scale)+6)/12);
			t = Math.max(t,0);
			t = Math.min(t,1);
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = "#cccc88";
			ctx.fillRect(0, 0, w, h);
			var drawCircle = function(x,y,r,c) {
				ctx.fillStyle = c ? c : '#bbbb66';
				ctx.beginPath();
				ctx.arc(x,y,r,0,2*Math.PI,0);
				ctx.fill();
			}
			var modulo = function(num,denom) {
				return num-Math.floor(num/denom)*denom;
			}
			var gapX = 2000 * scale;
			var yscale = Math.sin(Math.PI/3)*2;
			var gapY = gapX * yscale;
			var radius = 600 * scale;
			if(gapX < 15) {
				gapX = 15;
				gapY = 15;
			}
			if(radius < 7) {
				radius = 7;
			}
			
			for(var y = -modulo(view.y * scale,gapY) - gapY; y < h + gapY; y += gapY) {
				for(var x = -modulo(view.x * scale,gapX) - gapX; x < w + gapX; x += gapX) {
					drawCircle(x,y,radius);
					drawCircle(x + gapX/2,y + gapY/2,radius);
					/*
					drawCircle(x,y,radius/2,"#555577");
					drawCircle(x + gapX/4,y + gapY/4,radius/2,"#555577");
					drawCircle(x + gapX/2,y,radius/2,"#555577");
					drawCircle(x + gapX/4,y - gapY/4,radius/2,"#555577");
					drawCircle(x - gapX/4,y + gapY/4,radius/2,"#555577");
					drawCircle(x - gapX/2,y,radius/2,"#555577");
					drawCircle(x - gapX/4,y - gapY/4,radius/2,"#555577");
					drawCircle(x + gapX/2,y + gapY/2,radius/2,"#555577");
					drawCircle(x + gapX,y + gapY/2,radius/2,"#555577");
					*/
				}
			}
		}
};

//-----------------------------------------------------------------------------------
// Utilities for class substitution
//-----------------------------------------------------------------------------------

function overrideMethod(instance,method,override)
{
	var oldFunction = instance[method];
	instance[method] = function () {return override(oldFunction,arguments);};
}

//-----------------------------------------------------------------------------------
// Initialisation code (executed during loading of plugin)
//-----------------------------------------------------------------------------------

function runCecily()
{
	setStylesheet(store.getRecursiveTiddlerText(tiddler.title + "##StyleSheet"),"cecily");
	window.cecily = new Cecily();
	overrideMethod(story,"displayTiddler",function(superFunction,arguments) {cecily.displayTiddler(superFunction,arguments);});
	store.addNotification("PageTemplate",function () {cecily.createDisplay();});
}

Cecily.cssTransform = null;
if(document.body.style['-webkit-transform'] !== undefined)
	Cecily.cssTransform = '-webkit-transform';
if(document.body.style['MozTransform'] !== undefined)
	Cecily.cssTransform = 'MozTransform';

if(Cecily.cssTransform) {
	runCecily();
} else {
	alert("ProjectCecily currently only works on Safari 3.1, Firefox 3.1 and Google Chrome. Use the WebKit nightly build from http://webkit.org/ for the best experience");
}

} // if(!version.extensions.CecilyPlugin)

/***
!StyleSheet

body {
	font-family: helvetica,arial;
}

#displayArea.cecily {
	float: none;
	margin: 0em 0em 0em 0em;
	position: relative;
	background-color: #ffff88;
	overflow: hidden;
}

div#messageArea {
	-webkit-transition: opacity 0.3s ease-in-out;
	-webkit-border-radius: 4px;
	-moz-border-radius: 4px;
	border: 1px solid #222;
	background-color: [[ColorPalette::SecondaryLight]];
	background-image: -webkit-gradient(linear, left top, left bottom, from([[ColorPalette::SecondaryPale]]), to([[ColorPalette::SecondaryDark]]), color-stop(0.1,[[ColorPalette::SecondaryLight]]), color-stop(0.6,[[ColorPalette::SecondaryMid]]));
	opacity: 0.8;
}

div#messageArea:hover {
	opacity: 1.0;
}

div#messageArea .button {
	padding: 0 0.25em 0 0.25em;
	text-decoration: none;
	-webkit-transition: opacity 0.3s ease-in-out;
	opacity: 0;
	-webkit-border-radius: 3px;
	-moz-border-radius: 3px;
	background-color: #aaa;
	background: -webkit-gradient(linear, left top, left bottom, from([[ColorPalette::PrimaryLight]]), to([[ColorPalette::PrimaryDark]]), color-stop(0.5,[[ColorPalette::PrimaryMid]]));
	color: [[ColorPalette::TertiaryPale]];
}

div#messageArea:hover .button {
	opacity: 1;
}

div#messageArea:hover .button:active {
	background-color: [[ColorPalette::Foreground]];
	color: [[ColorPalette::Background]];
}

#overlayMenu {
	-webkit-box-shadow: 2px 2px 13px #000;
	-moz-box-shadow: 2px 2px 13px #000;
	-webkit-transition: opacity 0.2s ease-in-out;
	z-index: 100;
	position: absolute;
	padding: 0.1em 0.1em 0.1em 0.1em;
	font-size: 0.8em;
	-webkit-border-radius: 4px;
	-moz-border-radius: 4px;
	border: 1px solid #666;
	background-color: #bbb;
	background-image: -webkit-gradient(linear, left top, left bottom, from(#999), to(#ddd), color-stop(0.3,#bbb));
	opacity: 0;
	display: none;
}

#overlayMenu table.twtable {
	border: none;
}

#overlayMenu .twtable th{
	border: none;
}

#overlayMenu .twtable td {
	border: none;
}

#overlayMenu .twtable tr {
	border: none;
	border-bottom: 1px solid #ccc;
}

#overlayMenu a {
	-webkit-transition: color 0.3s ease-in-out;
	text-decoration: none;
	font-weight: bold;
	font-style: normal;
	color: #000;
	background-color: #999;
	border: none;
	margin: 0 0.25em 0 0.25em;
	padding: 3px 3px 3px 3px;
	-webkit-border-radius: 3px;
	-moz-border-radius: 3px;
}

#overlayMenu a:hover {
	text-decoration: none;
	font-weight: bold;
	font-style: normal;
	color: #000;
	background-color: #ff0;
	border: none;
}

#overlayMenu .overlayCommand {
	font-size: 2em;
	color: #fff;
	text-shadow: #000 2px 2px 3px;
}

div#backstageArea {
	position: absolute;
}

.cecilyCanvas {
	position: absolute;
	left: 0px;
	top: 0px;
	background-color: #eee;
}

#tiddlerDisplay {
	position: relative;
	-webkit-transform-origin: 0% 0%;
	-moz-transform-origin: 0% 0%;
}

.cecily .tiddler {
	position: absolute;
	width: 360px;
	padding: 0;
	background-color: #fff;
	overflow: hidden;
	border: 1px solid black;
}

.cecily .tiddler.drag {
	-webkit-box-shadow: 2px 2px 13px #000;
	-moz-box-shadow: 2px 2px 13px #000;
}

.cecily .tiddler .heading {
	background-color: #bbb;
	background-image: -webkit-gradient(linear, left top, left bottom,
		from(#fff), color-stop(0.5,#bbb), color-stop(0.51,#aaa), to(#999));
}

.cecily .tiddler .toolbar {
	cursor: all-scroll;
	padding: 4pt 2pt 4pt 4pt;
	color: #aaa;
}

.cecily .tiddler.selected .toolbar {
	color: #fff;
}

.cecily .tiddler .toolbar a {
	-webkit-transition: opacity 0.3s ease-in-out;
	opacity: 0;
	margin: 0 0.25em 0 0.25em;
	border: none;
	-webkit-border-radius: 3px;
	-moz-border-radius: 3px;
}

.cecily .tiddler.selected .toolbar a {
	opacity: 1;
	background-color: #aaa;
	background: -webkit-gradient(linear, left top, left bottom, from(#888), to(#ccc), color-stop(0.5,#aaa), color-stop(0.7,#bbb));
	color: #fff;
}

.cecily .tiddler.selected .toolbar a:hover {
	background-color: #c80;
	background-image: -webkit-gradient(linear, left top, left bottom, from(#c80), to(#fc1), color-stop(0.5,#c80));
	color: #000;
}

.cecily .tiddler.selected .toolbar a:active {
	background-color: [[ColorPalette::Foreground]];
	background-image: none;
	color: [[ColorPalette::Background]];
}

.cecily .tiddler .title {
	cursor: all-scroll;
	padding: 2pt 8pt 2pt 8pt;
	color: #000;
	background-color: transparent;
}

.cecily .tiddler .subtitle {
	padding: 2pt 8pt 4pt 8pt;
	color: #444;
	font-size: 0.6em;
}

.cecily .tiddler .viewer {
	padding: 4pt 8pt 4pt 8pt;
	background-color: #fff;
}

.cecily .tiddler .tagging, .cecily .tiddler .tagged {
	float: none;
	border: none;
	padding: 2pt 8pt 2pt 8pt;
	background-image: -webkit-gradient(linear, left bottom, left top, from(#888), to(#ccc), color-stop(0.5,#ccc), color-stop(0.95,#fff));
	margin: auto;
}

.cecily .tiddler .tagged {
	cursor: nwse-resize;
}

.cecily .tiddler.selected .tagging, .cecily .tiddler.selected .tagged {
	background-color: auto;
	border: auto;
}

.cecilyButton {
	-webkit-appearance: push-button;
}

!(end of StyleSheet)

***/

