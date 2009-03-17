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
var EasyClicking = function(element,easyShapesList){
	if(element.easyClicking) {
		var update = element.easyClicking;
		return update;
	}

	this.memory = [];
	element.easyClicking = this;
	if(easyShapesList) this.memory = easyShapesList;
	
	
};

EasyClicking.prototype = {
	setTransformation: function(transformation){
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

		//counter any positioning
		//if(target.style.left) x -= parseInt(target.style.left);
		//if(target.style.top) y -= parseInt(target.style.top);

	
		//var memory = target.memory;
		//var transformation = target.transformation;
		//console.log('memory length: '+memory.length);
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
			var g = shapes[i].grid;
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
	_inPoly: function(x,y,poly) {
		/* _inPoly adapted from inpoly.c
		Copyright (c) 1995-1996 Galacticomm, Inc.  Freeware source code.
		http://www.visibone.com/inpoly/inpoly.c.txt */
		var coords;
		if(poly._tcoords){
			coords = poly._tcoords;
			//console.log("using tcoords",x,y,poly.coords.length,poly._tcoords.length);
		}
		else
			coords= poly.coords;
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

