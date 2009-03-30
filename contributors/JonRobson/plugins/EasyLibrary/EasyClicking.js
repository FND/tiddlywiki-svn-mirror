/*
EasyClicking adds the ability to associate a dom element with a collection of EasyShapes using addToMemory function
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

/*Turn a dom element into one where you can find EasyShapes based on clicks */
/*
Following to be renamed as EasyClickableCanvas
*/
var EasyClicking = function(element,easyShapesList){
	if(element.easyClicking) {
		var update = element.easyClicking;
		return update;
	}
	var wrapper = element;
	var canvas = document.createElement('canvas');
	canvas.width = parseInt(wrapper.style.width);
	canvas.height = parseInt(wrapper.style.height);
	canvas.style.width = wrapper.style.width;
	canvas.style.height = wrapper.style.height;	
	
	canvas.style.zIndex = 1;
	canvas.style.position = "absolute";
	element.appendChild(canvas);
	this.canvas = canvas;
	this.settings = {};
	 this.settings.browser = canvas.getContext ? 'good' : 'ie'
	this.settings.globalAlpha = 1;
	this.memory = [];
	element.easyClicking = this;
	if(easyShapesList) this.memory = easyShapesList;
	
	
};

EasyClicking.prototype = {
	resize: function(width,height){
		if(this.canvas.getAttribute("width")){
			this.canvas.width = width;
			this.canvas.height = height;
		}
		this.canvas.style.height = height+"px";
		this.canvas.style.width = width +"px";
	}
	,setTransparency: function(alpha){	
		this.settings.globalAlpha = alpha
	}
	,_setupCanvasEnvironment: function(){
		if(!this.canvas.getContext) return;
		var ctx = this.canvas.getContext('2d');
		var s =this.getTransformation().scale;
		if(s && s.x)ctx.lineWidth = (0.5 / s.x);
		ctx.globalAlpha = this.settings.globalAlpha;
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
		if(this.settings.browser == 'good'){
			this.clear();
		}
	

		var that = this;
		var transformation = this.getTransformation();
		//var f = function(){
		var ps = 5 / parseFloat(transformation.scale.x);
		var smallest = 1 / this._iemultiplier;
		var largest = 2.5 * transformation.scale.x;
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
				 			
					mem[i].render(that.canvas,tran,projection,true,that.settings.browser,ps);
				
					if(mem[i].vmlfill && that.settings.globalAlpha) {
						mem[i].vmlfill.opacity =that.settings.globalAlpha;
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
		return this.transformation;
	}
	
	,setTransformation: function(transformation){
		if(transformation) this.transformation = transformation;	
	}
	,addToMemory: function(easyShape){
		if(!this.memory) this.memory = [];
		easyShape._easyClickingID = this.memory.length;
		this.memory.push(easyShape);
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
	,getMemoryID: function(easyShape){
		if(easyShape && easyShape._easyClickingID)
			return easyShape._easyClickingID;
		else{
			return false;
		}
	}
	,getShapeAtClick: function(e){
		if(!e) {
			e = window.event;
		}
		
		var node = EasyClickingUtils.resolveTarget(e);
		if(node.getAttribute("class") == 'easyShape') { //vml easyShape
			return node.easyShape;
		}
		var target = EasyClickingUtils.resolveTargetWithEasyClicking(e);
	
		if(!target) return;
		var offset = jQuery(target).offset();
	

		x = e.clientX + window.findScrollX() - offset.left;
		y = e.clientY + window.findScrollY() - offset.top;

		if(this.memory.length > 0){
			var shape = false;
			if(target.easyClicking){
			shape = target.easyClicking.getShapeAtPosition(x,y);
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
			var pos =  EasyClickingUtils.undotransformation(x,y,this.transformation);
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
			if(this._inPoly(x,y,shapes[i])) {
				hits.push(shapes[i]);
			}
		}

		if(hits.length == 0){
			return null;
		}
		else if(hits.length == 1) 
			return hits[0];
		else {//the click is in a polygon which is inside another polygon
		
			var g = hits[0].grid;
			var min = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
		
			var closerEdge = {id:0, closeness:min};
			for(var i=1; i < hits.length; i++){
				g = hits[i].grid;
			var min = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
			
				if(closerEdge.closeness > min) {
					closerEdge.id = i; closerEdge.closeness = min;
				}
				return hits[closerEdge.id];
			}
		
		}

	},
	_inPoint: function(x,y,easyShape,transformation){
		
	
	}
	,_inPoly: function(x,y,easyShape) {
		/* _inPoly adapted from inpoly.c
		Copyright (c) 1995-1996 Galacticomm, Inc.  Freeware source code.
		http://www.visibone.com/inpoly/inpoly.c.txt */
		var coords;
		if(easyShape.getProjectedCoordinates()){
			coords = easyShape.getProjectedCoordinates();
		}
		else{
			coords = easyShape.getCoordinates();
		}
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
	,_inCircle: function(x,y,easyShape){
	
	}
};

