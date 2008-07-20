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
	var r = {x: pt.x, y: pt.y};
	while((e != parent) && (e.parentNode)) {
		r.x += e.offsetLeft;
		r.y += e.offsetTop;
		e = e.parentNode;
	}
	if(e == parent)
		return r;
	else
		return null;
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
// Cecily helper macros
//-----------------------------------------------------------------------------------

config.macros.cecilyZoom = {
	zoomers: []
};

config.macros.cecilyZoom.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	createTiddlyElement(place,"span",null,"cecilyLabel","zoom ");
	var me = this;
	config.macros.cecilyZoom.zoomers.push(new SliderControl({
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
	}));
}

config.macros.cecilyZoom.propagate = function(scale) {
	var me = config.macros.cecilyZoom;
	for(var t = 0; t < me.zoomers.length; t++) {
		me.zoomers[t].set(scale);
	}
}

config.macros.cecilyZoomAll = {};

config.macros.cecilyZoomAll.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	createTiddlyButton(place,"zoom everything","Zoom out to see everything",function(ev) {
		if(cecily)
			cecily.scrollToAllTiddlers();
	});
}

config.macros.cecilyBackground = {
	backgroundDropdowns: []
};

config.macros.cecilyBackground.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if(cecily) {
		createTiddlyElement(place,"span",null,"cecilyLabel","background ");
		var onchange = function(ev) {
			var sel = this.options[this.selectedIndex].value;
			if(sel != cecily.background) {
				cecily.background = sel;
				config.options.txtCecilyBackground = sel;
				saveOptionCookie("txtCecilyBackground");
				cecily.drawBackground();
			}
		};
		var defaultName = Cecily.backgrounds[cecily.background].title;
		var options = [];
		for(var t in Cecily.backgrounds) {
			options.push({name: t, caption: Cecily.backgrounds[t].title});
		}
		createTiddlyDropDown(place,onchange,options,cecily.background);
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
	this.addEventHandler(document,"mousedown",this.onMouseDownCapture,true);
	this.addEventHandler(document,"click",this.onMouseClickBubble,false);
	this.addEventHandler(document,"mousemove",this.onMouseMoveCapture,true);
	this.addEventHandler(document,"mouseup",this.onMouseUpCapture,true);
	var cecily = this;
	this.defaultTiddler = null;
	window.setTimeout(function() {cecily.scrollToTiddler(cecily.defaultTiddler);},10);
}

Cecily.prototype.setViewSize = function() {
	var h = findWindowHeight();
	this.frame.style.height = h + "px";
	this.canvas.width = this.frame.offsetWidth;
	this.canvas.height = this.frame.offsetHeight;
}

Cecily.prototype.addEventHandler = function(element,type,handler,capture) {
	var me = this;
	element.addEventListener(type,function (ev) {return handler.call(me,ev);},capture);
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
	if(tiddler && this.drag == null && !hasClass(ev.target,"tiddlyLink"))
		this.scrollToTiddler(tiddler);
};

Cecily.prototype.onMouseDownCapture = function(ev) {
	for(var d in Cecily.draggers) {
		var dragger = Cecily.draggers[d];
		if(dragger.isDrag(this,ev.target,ev)) {
			this.drag = {dragger: dragger};
			dragger.dragDown(this,ev.target,ev);
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

Cecily.draggers.tiddlerDragger = {
	isDrag: function(cecily,target,ev) {
		return hasClass(target,"toolbar") || hasClass(target,"title");
	},
	dragDown: function(cecily,target,ev) {
		var tiddler = story.findContainingTiddler(target);
		cecily.drag.tiddler = tiddler;
		cecily.drag.tiddlerTitle = tiddler.getAttribute("tiddler");
		cecily.drag.lastPoint = normalisePoint(cecily.frame,target,{x: ev.offsetX, y: ev.offsetY});
		addClass(tiddler,"drag");
	},
	dragMove: function(cecily,target,ev) {
		var dragThis = normalisePoint(cecily.frame,target,{x: ev.offsetX, y: ev.offsetY});
		var s = cecily.frame.offsetWidth/cecily.view.w;
		cecily.drag.tiddler.style.left = (cecily.drag.tiddler.offsetLeft + (dragThis.x - cecily.drag.lastPoint.x) / s) + "px";
		cecily.drag.tiddler.style.top = (cecily.drag.tiddler.offsetTop + (dragThis.y - cecily.drag.lastPoint.y) / s) + "px";
		cecily.drag.lastPoint = dragThis;
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
		cecily.drag.tiddler = tiddler;
		cecily.drag.tiddlerTitle = tiddler.getAttribute("tiddler");
		cecily.drag.startPoint = normalisePoint(cecily.frame,target,{x: ev.offsetX, y: ev.offsetY});
		cecily.drag.startWidth = tiddler.scaledWidth;
		addClass(tiddler,"drag");
	},
	dragMove: function(cecily,target,ev) {
		var s = cecily.frame.offsetWidth/cecily.view.w;
		var dragThis = normalisePoint(cecily.frame,target,{x: ev.offsetX, y: ev.offsetY});
		var newWidth = cecily.drag.startWidth + (dragThis.x - cecily.drag.startPoint.x) / s;
		if(newWidth < 0.01)
			newWidth = 0.01;
		cecily.drag.tiddler.scaledWidth = newWidth;
		cecily.transformTiddler(cecily.drag.tiddler);
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

//# Display a given tiddler with a given template. If the tiddler is already displayed but with a different
//# template, it is switched to the specified template. If the tiddler does not exist, and if server hosting
//# custom fields were provided, then an attempt is made to retrieve the tiddler from the server
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
	args[0] = null; // srcElement to disable animation and scrolling
	var title = (tiddler instanceof Tiddler) ? tiddler.title : tiddler;
	var tiddlerElemBefore = story.getTiddler(title);
	superFunction.apply(story,args);
	var tiddlerElem = story.getTiddler(title);
	if(!tiddlerElem)
	 	return;
	if(!tiddlerElemBefore) {
		var pos = this.getTiddlerPosition(title);
		tiddlerElem.title = tiddler.title;
		tiddlerElem.style.left = pos.x + "px";
		tiddlerElem.style.top = pos.y + "px";
		tiddlerElem.scaledWidth = pos.w;
		tiddlerElem.rotate = 0;
		tiddlerElem.enlarge = 1.0;
		this.transformTiddler(tiddlerElem);
	}
	if(!startingUp) {
		this.scrollToTiddler(title);
	}
	this.defaultTiddler = tiddlerElem;
};

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
Cecily.prototype.getTiddlerPosition = function(title) {
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
	var pos = new Rect(tiddlerElem.offsetLeft,
						tiddlerElem.offsetTop,
						tiddlerElem.scaledWidth,
						tiddlerElem.offsetHeight * (tiddlerElem.scaledWidth/tiddlerElem.offsetWidth));
	this.map[title] = pos;
	this.saveMap(this.mapTitle);
}

// Applies the tiddler transformation properties (rotate & enlarge) to the display
Cecily.prototype.transformTiddler = function(tiddlerElem) {
	var s = tiddlerElem.scaledWidth/360;
	var r = tiddlerElem.rotate;
	var e = tiddlerElem.enlarge;
	tiddlerElem.style['-webkit-transform'] = "translate(-50%,-50%) scale(" + s + "," + s + ") translate(50%,50%) rotate(" + r + "rad) scale(" + e + ")";
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
	this.container.style['-webkit-transform'] = transform;
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
		var tiddlerRect = new Rect(tiddlerElem.offsetLeft,
								tiddlerElem.offsetTop,
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
		var targetRect = new Rect(tiddlerElem.offsetLeft,
									tiddlerElem.offsetTop,
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
	s.animationDuration = duration ? duration : 0.5 * 1000;
	s.currRect = 0;
	if(!s.scrolling) {
		s.scrolling = true;
		anim.startAnimating(s);
	}
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
}

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
					drawCircle(x,y,radius/2,"#555577");
					drawCircle(x + gapX/4,y + gapY/4,radius/2,"#555577");
					drawCircle(x + gapX/2,y,radius/2,"#555577");
					drawCircle(x + gapX/4,y - gapY/4,radius/2,"#555577");
					drawCircle(x - gapX/4,y - gapY/4,radius/2,"#555577");
					drawCircle(x - gapX/4,y + gapY/4,radius/2,"#555577");
					drawCircle(x - gapX/2,y,radius/2,"#555577");
					drawCircle(x + gapX/2,y + gapY/2,radius/2,"#555577");
					drawCircle(x + gapX,y + gapY/2,radius/2,"#555577");
				}
			}
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

setStylesheet(store.getRecursiveTiddlerText(tiddler.title + "##StyleSheet"),"cecily");

var cecily = new Cecily();

overrideMethod(story,"displayTiddler",function(superFunction,arguments) {cecily.displayTiddler(superFunction,arguments);});

store.addNotification("PageTemplate",function () {cecily.createDisplay();});

}

//}}}

/***
!StyleSheet

#displayArea.cecily {
	float: none;
	margin: 0em 0em 0em 0em;
	position: relative;
	background-color: #8888ff;
	overflow: hidden;
}

#overlayMenu {
	z-index: 100;
	bottom: 3em;
	right: 1em;
	width: 15em;
	position: absolute;
	padding: 0.5em 0.5em 0.5em 0.5em;
	-webkit-border-radius: 7px;
	border: 1px solid #222;
	background-color: #444;
	background-image: -webkit-gradient(linear, left top, left bottom, from(#222), to(#666), color-stop(0.3,#444), color-stop(0.1,#333));
	opacity: 0.9;
}

#overlayMenu a {
	text-decoration: none;
	font-weight: bold;
	font-style: normal;
	color: #000;
	background-color: transparent;
	display: block;
	border: none;
}

#overlayMenu a:hover {
	text-decoration: none;
	font-weight: bold;
	font-style: normal;
	color: #000;
	background-color: #ff0;
	display: block;
	border: none;
}

div#backstageArea {
	position: absolute;
}

.cecilyCanvas {
	position: absolute;
	left: 0px;
	top: 0px;
}

.cecilyMenu {
	position: absolute;
	right: 10px;
	top: 10px;
	padding-left: 1em;
	padding-right: 1em;
	-webkit-border-radius: 3px;
	background-color: #777;
	color: #fff;
	border: 1px solid #000;
	opacity: 0.8;
}

#tiddlerDisplay {
	position: relative;
	-webkit-transform-origin: 0% 0%;
}

.cecily .tiddler {
	-not-webkit-box-shadow: 2px 2px 13px #000;
	position: absolute;
	width: 360px;
	padding: 0;
	background-color: #fff;
	overflow: hidden;
	border: 1px solid black;
}

.cecily .tiddler.drag {
	-webkit-box-shadow: 2px 2px 13px #000;
}

.cecily .tiddler .toolbar {
	cursor: all-scroll;
	font-size: 0.8em;
	padding: 0 0.25em 0 0.25em;
	background-color: #aaa;
	color: #aaa;
}

.cecily .tiddler.selected .toolbar {
	background-color: #aaa;
	color: #fff;
}

.cecily .tiddler .toolbar a {
	background-color: #aaa;
	color: #aaa;
	border: none;
}

.cecily .tiddler.selected .toolbar a {
	background-color: #aaa;
	color: #fff;
}

.cecily .tiddler .title {
	cursor: all-scroll;
	padding: 0 0.5em 0.25em 0.5em;
	background-color: #aaa;
	background-image: -webkit-gradient(linear, left top, left bottom, from(#aaa), to(#ccc), color-stop(0.3,#bbb));
	color: #fff;
}


.cecily .tiddler .subtitle {
	padding: 0.25em 0.5em 0.25em 0.5em;
	background-color: #ccc;
	background-image: -webkit-gradient(linear, left top, left bottom, from(#ccc), to(#fff), color-stop(0.9,#eee));
	color: #444;
	font-size: 0.6em;
}

.cecily .tiddler .viewer {
	padding: 0.5em 0.5em 0.5em 0.5em;
	background-color: #fff;
}

.cecily .tiddler .tagging, .cecily .tiddler .tagged {
	float: none;
	border: none;
	background-image: -webkit-gradient(linear, left bottom, left top, from(#888), to(#fff), color-stop(0.5,#ccc));
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

