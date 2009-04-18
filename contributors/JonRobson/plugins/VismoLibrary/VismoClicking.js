/*
VismoClicking adds the ability to associate a dom element with a collection of VismoShapes using addToMemory function
The getShapeAtClick function allows click detection on this dom element when used in a dom mouse event handler
*/

// Depends on JQuery for offset function
// Get the current horizontal page scroll position
function findScrollX()
{
	return window.scrollX || document.documentElement.scrollLeft;
}
// Get the current vertical page scroll position
function findScrollY()
{
	return window.scrollY || document.documentElement.scrollTop;
}

/*Turn a dom element into one where you can find VismoShapes based on clicks */
/*
Following to be renamed as VismoClickableCanvas
*/
var VismoClickableCanvas = function(element,vismoShapesList){
	if(typeof element == 'string') element= document.getElementById(element);
	if(!element) throw "Element doesn't exist!";
	if(element.vismoClicking) {
		var update = element.vismoClicking;
		return update;
	}
	var wrapper = element;
	var canvas = document.createElement('canvas');
	
	
		canvas.width = parseInt(wrapper.style.width);
		canvas.height = parseInt(wrapper.style.height);
	if(!element.className)element.className = "VismoClickableCanvas";
	jQuery(canvas).css({width:wrapper.style.width, height:wrapper.style.height,'z-index':1,position:'absolute'});
	element.appendChild(canvas);
	this.canvas = canvas;
	this.settings = {};
	this.settings.browser = !VismoUtils.browser.isIE ? 'good' : 'ie'
	this.settings.globalAlpha = 1;
	this.memory = [];
	element.vismoClicking = this;

	if(vismoShapesList) {
		for(var i=0; i < vismoShapesList.length; i++){
			this.add(vismoShapesList[i]);
		}
	}
	this.wrapper = wrapper;
	this._setupMouse();
};

VismoClickableCanvas.prototype = {
	getDomElement: function(){
		return this.wrapper;
	}
	,getXY: function(e){
		return VismoTransformations.getXY(e,this.getTransformation());
	}
	,setOnMouse: function(down,up,move,dblclick,keypress){
		if(down)this.onmousedown = down;
		if(up)this.onmouseup = up;
		if(move)this.onmousemove=  move;
		if(dblclick) this.ondblclick = dblclick;
		if(keypress) this.onkeypress = keypress;
	}
	,_setupMouse: function(){
		var that = this;
		this.onmousedown = function(e,s,pos){};
		this.onmouseup = function(e,s,pos){};
		this.onmousemove = function(e,s,pos){};
		this.ondblclick = function(e,s,pos){};
		this.onkeypress = function(e){};
		

		this._applyMouseBehaviours(this.wrapper);
		for(var i =0; i < this.wrapper.childNodes.length; i++){
			var child = this.wrapper.childNodes[i];
			this._applyMouseBehaviours(child);
		}
	
	}
	,_applyMouseBehaviours: function(el){
		var newbehaviour = function(e){
				var t = VismoClickingUtils.resolveTargetWithVismoClicking(e);
				if(t.getAttribute("class") == 'vismoControl') return false;
				var shape = that.getShapeAtClick(e);
				return shape;
			
		};
		var that = this;
		
		var down = el.onmousedown;
		var up = el.onmouseup;
		var mv = el.onmousemove;
		var dblclick =el.ondblclick;
		this.initialKeyPress = window.onkeypress;
		el.oncontextmenu=function() {  return false}; 		
		el.onmouseover = function(e){
				if(!that.keypressactive) {
					that.keypressactive =  true;
					window.onkeypress = that.onkeypress;
					document.onkeypress = function(e){if(!e) e= window.event;if(that.initialKeyPress)that.initialKeyPress(e);if(!e) e= window.event;that.onkeypress(e)};
				}
		}
		el.onmouseout = function(e){if(!e) e= window.event;that.keypressactive = false;};

		el.onmousedown = function(e){
			if(!e) e= window.event;
			if(e.preventDefault)e.preventDefault(e);
			var s = newbehaviour(e); 
			//var pos = VismoTransformations.getXY(e,that.getTransformation());
			if(s){
				if(s.getProperty("onmousedown"))s.getProperty("onmousedown")(e,s);		
				else that.onmousedown(e,s);
			}
			else {if(down)down(e,s);}
			

			return false;
		}

		el.ondblclick = function(e){
			if(!e) e= window.event;
			var s = newbehaviour(e); 				
			if(s) {
				if(s.getProperty("ondblclick"))s.getProperty("ondblclick")(e,s);
				else {
					that.ondblclick(e,s);
				}
			}
			else {if(dblclick)dblclick(e,s);}
		
		};
		el.onmouseup = function(e){ if(!e) e= window.event;var s = newbehaviour(e); if(s){if(s.getProperty("onmouseup"))s.getProperty("onmouseup")(e,s);else that.onmouseup(e,s);}else{if(up)up(e,s);}}
		el.onmousemove = function(e){ if(!e) e= window.event;var s = newbehaviour(e);if(s){if(s.getProperty("onmousemove"))s.getProperty("onmousemove")(e,s);else that.onmousemove(e,s);}else{ if(mv)mv(e,s);}}

	}
	,getDimensions: function(){
		return {width: parseInt(this.canvas.style.width), height: parseInt(this.canvas.style.height)};
	}
	,resize: function(width,height){
		
		if(this.canvas.getAttribute("width")){
			this.canvas.width = width;
			this.canvas.height = height;
		}
		jQuery(this.wrapper).css({height:height,width:width});
		jQuery(this.canvas).css({height:height,width:width});
	}
	,setTransparency: function(alpha){	
		this.settings.globalAlpha = alpha
	}
	,_setupCanvasEnvironment: function(){
		if(VismoUtils.browser.isIE) return;
		var ctx = this.canvas.getContext('2d');
		var s =this.getTransformation().scale;
		if(s && s.x)ctx.lineWidth = (0.5 / s.x);
		ctx.globalAlpha = this.settings.globalAlpha;
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		ctx.lineJoin = 'round'; //miter or bevel or round	
	}
	,clear: function(deleteMemory){
		if(deleteMemory){
			this.clearMemory();
		}
		this._maxX = 0;
		this._maxY = 0;

		
		if(!this.canvas.getContext) {
			return;
		}
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);		
		
			
		
	}
	
	,render: function(projection){
		this._setupCanvasEnvironment();
		
		var that = this;
		var transformation = this.getTransformation();
	
		if(transformation.scale.x) sc = transformation.scale.x; else sc = 1;
		var ps = 5 / parseFloat(sc);
		var smallest = 1 / this._iemultiplier;
		var largest = 2.5 * sc;
		if(ps < smallest) ps = smallest;
		if(ps > largest) ps = largest;	
			
			var newfragment = document.createDocumentFragment();
			var mem =that.getMemory();
			if(mem.length > 0){
				
				var tran;
				if(that.settings.browser == 'good'){
				
					var ctx = that.canvas.getContext('2d');
					ctx.save();
					tran = false;

					if(transformation){
						
						var o = transformation.origin;
						var tr = transformation.translate;
						var s = transformation.scale;
						var r = transformation.rotate;
						if(o && s && tr){
							ctx.translate(o.x,o.y);
							ctx.scale(s.x,s.y);
							ctx.translate(tr.x,tr.y);
						}
						if(r && r.x)ctx.rotate(r.x);
					}
					
				}
				else{
					tran = transformation;
				}
				 for(var i=0; i < mem.length; i++){
				 	if(mem[i].optimise(that.canvas,transformation,projection)){
				 	        if(mem[i].getShape() == 'svg')tran = transformation;
						mem[i].render(that.canvas,tran,projection,true,that.settings.browser,ps);
					
						if(mem[i].vmlfill && that.settings.globalAlpha) {
							mem[i].vmlfill.opacity =that.settings.globalAlpha;
						}
					}
				
				}
				/*	
				if(!that.settings.browser == 'ie'){
					that._fragment= newfragment.cloneNode(true);
					that.canvas.appendChild(that._fragment);
				}*/
			}
			if(ctx)ctx.restore();
			
	//	};f();
	}
	,getTransformation: function(){
		if(!this.transformation) {
		var ox = parseInt(this.canvas.style.width);
		var oy = parseInt(this.canvas.style.height);
		this.transformation = {scale:{x:1,y:1},translate:{x:0,y:0},origin:{x: ox/2, y: oy/2}};
		//this.transformation = VismoTransformation.getBlankTransformation(this.canvas);
		}
		return this.transformation;
	}
	
	,setTransformation: function(transformation){
		if(transformation) this.transformation = transformation;	
	}
	,add: function(vismoShape){
		if(!this.memory) this.memory = [];
		this.memory.push(vismoShape);
		vismoShape._vismoClickingID = this.memory.length;
	}
	,transform: function(t){
		this.setTransformation(t);
		this.render();
	}
	,clearMemory: function(){
		for(var i=0; i < this.memory.length; i++){
			if(this.memory[i].vml){
				this.memory[i].vml.parentNode.removeChild(this.memory[i].vml);
			}
		}
		this.memory = [];

	},
	getMemory: function(){
		return this.memory;
	}
	,getMemoryID: function(vismoShape){
		if(vismoShape && vismoShape._vismoClickingID)
			return vismoShape._vismoClickingID;
		else{
			return false;
		}
	}
	,getShapeAtClick: function(e){
		if(!e) {
			e = window.event;
		}
		
		var node = VismoClickingUtils.resolveTarget(e);
		//alert(node.tagName);
		if(node.tagName.toUpperCase() == 'SHAPE') { //vml vismoShape
			return node.vismoShape;
		}
		var target = VismoClickingUtils.resolveTargetWithVismoClicking(e);
	
		if(!target) return;
		var offset = jQuery(target).offset();

		x = e.clientX + window.findScrollX() - offset.left;
		y = e.clientY + window.findScrollY() - offset.top;

		if(this.memory.length > 0){
			var shape = false;
			if(target.vismoClicking){
			shape = target.vismoClicking.getShapeAtPosition(x,y);
			}
			return shape;
		} else{
			//console.log("no shapes in memory");
			//return false;
		}
	},
	getShapeAtPosition: function(x,y) {
		var shapes = this.memory;
		if(this.transformation){
			var pos =  VismoClickingUtils.undotransformation(x,y,this.transformation);
			x = pos.x;
			y = pos.y;
		
		}
		var hitShapes = [];
		for(var i=0; i < shapes.length; i++){
			var shape = shapes[i];
			var st = shape.getShape();
				var g = shape.getBoundingBox();
				
				if(x >= g.x1 && x <= g.x2 && y >=  g.y1 && y <=g.y2){
					hitShapes.push(shapes[i]);
				}

		}
		var res = this._findNeedleInHaystack(x,y,hitShapes);
	
	
		// var shapesInsideBox = _findShapesInsideBoundingBox(shapes, ..) TODO RENAME
		// var points = _findPointsInsideShapes(..)
		
		return res;
	},
	_findNeedleInHaystack: function(x,y,shapes){
		var hits = [];
		for(var i=0; i < shapes.length; i++){
			var st = shapes[i].getShape();
			var itsahit = false;
			if(st == 'polygon'){
				itsahit = this._inPoly(x,y,shapes[i]);
			}
			else if(st == 'image'){
				itsahit = true;
			}
			else if(st == 'point' || st == 'circle'){
				itsahit = this._inCircle(x,y,shapes[i]);
			}
			if(itsahit) {
				hits.push(shapes[i]);
			}
			
		}

		if(hits.length == 0){
			return null;
		}
		else if(hits.length == 1) 
			return hits[0];
		else {//the click is in a polygon which is inside another polygon
			var g = hits[0].getBoundingBox();
			var mindist = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
		
			var closerEdge = {id:0, closeness:mindist};
			for(var i=1; i < hits.length; i++){
				var g = hits[i].getBoundingBox();
				var mindist = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
			
				if(closerEdge.closeness > mindist) {
					closerEdge.id = i; closerEdge.closeness = mindist;
				}
				
			}
			return hits[closerEdge.id];
		
		}

	}
	,_inCircle: function(x,y,vismoShape){
		var bb = vismoShape.getBoundingBox();

		var a =((x - bb.center.x)*(x - bb.center.x)) + ((y - bb.center.y)*(y - bb.center.y));
		var b = vismoShape.getRadius();
		b *= b;
		if (a <= b) return true;
		else return false;
	
	}
	,_inPoly: function(x,y,vismoShape) {
		/* _inPoly adapted from inpoly.c
		Copyright (c) 1995-1996 Galacticomm, Inc.  Freeware source code.
		http://www.visibone.com/inpoly/inpoly.c.txt */
		var coords;
		coords = vismoShape.getCoordinates();
		
		var npoints = coords.length;
		if (npoints/2 < 3) {
			//points don't describe a polygon
			return false;
		}
		var inside = false;
		var xold = coords[npoints-2];
		var yold = coords[npoints-1];
		var x1,x2,y1,y2,xnew,ynew;
		for (var i=0; i<npoints; i+=2) {
			xnew=coords[i];
			ynew=coords[i+1];
			if (xnew > xold) {
				x1=xold;
				x2=xnew;
				y1=yold;
				y2=ynew;
			} else {
				x1=xnew;
				x2=xold;
				y1=ynew;
				y2=yold;
			}
			if ((xnew < x) == (x <= xold)
				&& (y-y1)*(x2-x1) < (y2-y1)*(x-x1)) {
				   inside=!inside;
				}
			xold=xnew;
			yold=ynew;
		 }
		 return inside;
	}

};

