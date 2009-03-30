/***
!Layer 3: RGraph (JIT)
***/
{{{
	
/*
 * File: RGraph.js
 * 
 * Author: Nicolas Garcia Belmonte
 * 
 * Copyright: Copyright 2008 by Nicolas Garcia Belmonte.
 * 
 * License: BSD License
 * 
 * * Copyright (c) 2008, Nicolas Garcia Belmonte
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the organization nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY Nicolas Garcia Belmonte ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Nicolas Garcia Belmonte BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * Homepage: <http://thejit.org>
 * 
 * Version: 1.0a
 */

/*
   Object: $_

   Provides some common utility functions.
*/
var $_ = {
	fn: function() { return function() {}; },

	merge: function(){
		var mix = {};
		for (var i = 0, l = arguments.length; i < l; i++){
			var object = arguments[i];
			if (typeof object != 'object') continue;
			for (var key in object){
				var op = object[key], mp = mix[key];
				mix[key] = (mp && typeof op == 'object' && typeof mp == 'object') ? this.merge(mp, op) : this.unlink(op);
			}
		}
		return mix;
	},

	unlink: function (object){
		var unlinked = null;
		
		switch (typeof object){
			case 'object':
				unlinked = {};
				for (var p in object) unlinked[p] = this.unlink(object[p]);
			break;
			case 'array':
				unlinked = [];
				for (var i = 0, l = object.length; i < l; i++) unlinked[i] = this.unlink(object[i]);
			break;
			default: return object;
		}
		
		return unlinked;
	}
} ;


/*
   Class: Canvas

   A multi-purpose Canvas object decorator.
*/

/*
   Constructor: Canvas

   Canvas initializer.

   Parameters:

      canvasId - The canvas tag id.
      fillStyle - (optional) fill color style. Default's to black
      strokeStyle - (optional) stroke color style. Default's to black

   Returns:

      A new Canvas instance.
*/
var Canvas= function (canvasId, fillStyle, strokeStyle) {
	//browser supports canvas element
		this.canvasId= canvasId;
		this.fillStyle = fillStyle;
		this.strokeStyle = strokeStyle;
		//canvas element exists
		if((this.canvas= document.getElementById(this.canvasId)) 
			&& this.canvas.getContext) {
		      this.ctx = this.canvas.getContext('2d');
		      this.ctx.fillStyle = fillStyle || 'black';
		      this.ctx.strokeStyle = strokeStyle || 'white';
			  this.setPosition();
			  this.translateToCenter();
		
		} else {
			throw "RGraph canvas: Canvas object could not initialize.";
		}
	
};


Canvas.prototype= {
	/*
	   Method: getContext

	   Returns:
	
	      Canvas context handler.
	*/
	getContext: function () {
		return this.ctx;
	},

	/*
	   Method: setPosition
	
	   Calculates canvas absolute position on HTML document.
	*/	
	setPosition: function() {
		var obj= this.canvas;
		var curleft = curtop = 0;
		if (obj.offsetParent) {
			curleft = obj.offsetLeft
			curtop = obj.offsetTop
			while (obj = obj.offsetParent) {
				curleft += obj.offsetLeft
				curtop += obj.offsetTop
			}
		}
		this.position= { x: curleft, y: curtop };
	},

	/*
	   Method: getPosition

	   Returns:
	
	      Canvas absolute position to the HTML document.
	*/
	getPosition: function() {
		return this.position;
	},

	/*
	   Method: clear
	
	   Clears the canvas object.
	*/		
	clear: function () {
		this.ctx.clearRect(-this.getSize().x / 2, -this.getSize().x / 2, this.getSize().x, this.getSize().x);
	},

	/*
	   Method: drawConcentricCircles
	
	   Draws concentric circles. Receives an integer specifying the number of concentric circles.
	*/		
	drawConcentricCircles: function (elem) {
		var config = Config;
		var times = elem || 6;
		var c = this.ctx;
		c.strokeStyle = config.concentricCirclesColor;
		var pi2 = Math.PI*2;
		for(var i=1; i<=times; i++) {
		    c.beginPath();
		  	//c.arc(0, 0, (i*this.controller.getZoomLevel()), 0, pi2, true);
		  	c.stroke();
			c.closePath();
		}
		c.strokeStyle = this.strokeStyle;
	},
	
	/*
	   Method: translateToCenter
	
	   Translates canvas coordinates system to the center of the canvas object.
	*/
	translateToCenter: function() {
		this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
	},
	

	/*
	   Method: getSize

	   Returns:
	
	      An object that contains the canvas width and height.
	      i.e. { x: canvasWidth, y: canvasHeight }
	*/
	getSize: function () {
		var width = this.canvas.width;
		var height = this.canvas.height;
		return { x: width, y: height };
	},
	
	/*
	   Method: path
	   
	  Performs a _beginPath_ executes _action_ doing then a _type_ ('fill' or 'stroke') and closing the path with closePath.
	*/
	path: function(type, action) {
		this.ctx.beginPath();
		action(this.ctx);
		this.ctx[type]();
		this.ctx.closePath();
	}
	
};


/*
   Class: Complex
	
	 A multi-purpose Complex Class with common methods.

*/


/*
   Constructor: Complex

   Complex constructor.

   Parameters:

      re - A real number.
      im - An real number representing the imaginary part.


   Returns:

      A new Complex instance.
*/
var Complex= function() {
	if (arguments.length > 1) {
		this.x= arguments[0];
		this.y= arguments[1];
		
	} else {
		this.x= null;
		this.y= null;
	}
	
}

Complex.prototype= {
	/*
	   Method: clone
	
	   Returns a copy of the current object.
	
	   Returns:
	
	      A copy of the real object.
	*/
	clone: function() {
		return new Complex(this.x, this.y);
	},

	/*
	   Method: toPolar
	
	   Transforms cartesian to polar coordinates.
	
	   Returns:
	
	      A new <Polar> instance.
	*/
	
	toPolar: function() {
		var rho = this.norm();
		var atan = Math.atan2(this.y, this.x);
		if(atan < 0) atan += Math.PI * 2;
		return new Polar(atan, rho);
	},
	/*
	   Method: norm
	
	   Calculates the complex norm.
	
	   Returns:
	
	      A real number representing the complex norm.
	*/
	norm: function () {
		return Math.sqrt(this.squaredNorm());
	},
	
	/*
	   Method: squaredNorm
	
	   Calculates the complex squared norm.
	
	   Returns:
	
	      A real number representing the complex squared norm.
	*/
	squaredNorm: function () {
		return this.x*this.x + this.y*this.y;
	},

	/*
	   Method: add
	
	   Returns the result of adding two complex numbers.
	   Does not alter the original object.

	   Parameters:
	
	      pos - A Complex initialized instance.
	
	   Returns:
	
	     The result of adding two complex numbers.
	*/
	add: function(pos) {
		return new Complex(this.x + pos.x, this.y + pos.y);
	},

	/*
	   Method: prod
	
	   Returns the result of multiplying two complex numbers.
	   Does not alter the original object.

	   Parameters:
	
	      pos - A Complex initialized instance.
	
	   Returns:
	
	     The result of multiplying two complex numbers.
	*/
	prod: function(pos) {
		return new Complex(this.x*pos.x - this.y*pos.y, this.y*pos.x + this.x*pos.y);
	},

	/*
	   Method: conjugate
	
	   Returns the conjugate por this complex.

	   Returns:
	
	     The conjugate por this complex.
	*/
	conjugate: function() {
		return new Complex(this.x, -this.y);
	},


	/*
	   Method: scale
	
	   Returns the result of scaling a Complex instance.
	   Does not alter the original object.

	   Parameters:
	
	      factor - A scale factor.
	
	   Returns:
	
	     The result of scaling this complex to a factor.
	*/
	scale: function(factor) {
		return new Complex(this.x * factor, this.y * factor);
	},

	/*
	   Method: $add
	
	   Returns the result of adding two complex numbers.
	   Alters the original object.

	   Parameters:
	
	      pos - A Complex initialized instance.
	
	   Returns:
	
	     The result of adding two complex numbers.
	*/
	$add: function(pos) {
		this.x += pos.x; this.y += pos.y;
		return this;	
	},
	
	/*
	   Method: $prod
	
	   Returns the result of multiplying two complex numbers.
	   Alters the original object.

	   Parameters:
	
	      pos - A Complex initialized instance.
	
	   Returns:
	
	     The result of multiplying two complex numbers.
	*/
	$prod:function(pos) {
		var x = this.x, y = this.y
		this.x = x*pos.x - y*pos.y;
		this.y = y*pos.x + x*pos.y;
		return this;
	},
	
	/*
	   Method: $conjugate
	
	   Returns the conjugate for this complex.
	   Alters the original object.

	   Returns:
	
	     The conjugate for this complex.
	*/
	$conjugate: function() {
		this.y = -this.y;
		return this;
	},
	
	/*
	   Method: $scale
	
	   Returns the result of scaling a Complex instance.
	   Alters the original object.

	   Parameters:
	
	      factor - A scale factor.
	
	   Returns:
	
	     The result of scaling this complex to a factor.
	*/
	$scale: function(factor) {
		this.x *= factor; this.y *= factor;
		return this;
	},
	
	/*
	   Method: $div
	
	   Returns the division of two complex numbers.
	   Alters the original object.

	   Parameters:
	
	      pos - A Complex number.
	
	   Returns:
	
	     The result of scaling this complex to a factor.
	*/
	$div: function(pos) {
		var x = this.x, y = this.y;
		var sq = pos.squaredNorm();
		this.x = x * pos.x + y * pos.y; this.y = y * pos.x - x * pos.y;
		return this.$scale(1 / sq);
	}
};

/*
   Class: Polar

   A multi purpose polar representation.

*/

/*
   Constructor: Polar

   Polar constructor.

   Parameters:

      theta - An angle.
      rho - The norm.


   Returns:

      A new Polar instance.
*/

var Polar = function(theta, rho) {
	this.theta = theta;
	this.rho = rho;
};

Polar.prototype = {
	/*
	   Method: clone
	
	   Returns a copy of the current object.
	
	   Returns:
	
	      A copy of the real object.
	*/
	clone: function() {
		return new Polar(this.theta, this.rho);
	},

	/*
	   Method: toComplex
	
	    Translates from polar to cartesian coordinates and returns a new <Complex> instance.
	
	   Returns:
	
	      A new Complex instance.
	*/
	toComplex: function() {
		return new Complex(Math.cos(this.theta), Math.sin(this.theta)).$scale(this.rho);
	},

	/*
	   Method: add
	
	    Adds two <Polar> instances.
	
	   Returns:
	
	      A new Polar instance.
	*/
	add: function(polar) {
		return new Polar(this.theta + polar.theta, this.rho + polar.rho);
	},
	
	/*
	   Method: scale
	
	    Scales a polar norm.
	
	   Returns:
	
	      A new Polar instance.
	*/
	scale: function(number) {
		return new Polar(this.theta, this.rho * number);
	},
	
	/*
	   Method: $add
	
	    Adds two <Polar> instances affecting the current object.
	
	   Returns:
	
	      The changed object.
	*/
	$add: function(polar) {
		this.theta = this.theta + polar.theta; this.rho += polar.rho;
		return this;
	},

	/*
	   Method: $madd
	
	    Adds two <Polar> instances affecting the current object. The resulting theta angle is modulo 2pi.
	
	   Returns:
	
	      The changed object.
	*/
	$madd: function(polar) {
		this.theta = (this.theta + polar.theta) % (Math.PI * 2); this.rho += polar.rho;
		return this;
	},

	
	/*
	   Method: $scale
	
	    Scales a polar instance affecting the object.
	
	   Returns:
	
	      The changed object.
	*/
	$scale: function(number) {
		this.rho *= number;
		return this;
	},
	
	/*
	   Method: interpolate
	
	    Calculates a polar interpolation between two points at a given delta moment.
	
	   Returns:
	
	      A new Polar instance representing an interpolation between _this_ and _elem_
	*/
	interpolate: function(elem, delta) {
		var pi2 = Math.PI * 2;
		var ch = function(t) {
			return (t < 0)? (t % pi2) + pi2 : t % pi2;
		};
		var tt = ch(this.theta) , et = ch(elem.theta);
		var sum;
		if(Math.abs(tt - et) > Math.PI) {
			if(tt - et > 0) {
				sum =ch((et + ((tt - pi2) - et)* delta)) ;
			} else {
				sum =ch((et - pi2 + (tt - (et - pi2))* delta));
			}
			
		} else {
				sum =ch((et + (tt - et)* delta)) ;
		}
		var  t = (sum);
		var r = (this.rho - elem.rho) * delta + elem.rho;
		return new Polar(t, r);
	}
};




/*
   Object: Config

   <RGraph> global configuration object. Contains important properties to enable customization and proper behavior for the <RGraph>.
*/

var Config= {
		//Property: labelContainer
		//Id for label container. The label container is a div dom element that must be explicitly added to your page in order to enable the RGraph.
		labelContainer: 'label_container',
		
		nodeLabelPrefix: "rgraph_",
		//Property: drawConcentricCircles
		//show/hide concentricCircles
		drawConcentricCircles: true,
		
		//Property: concentricCirclesColor
		//The color of the concentric circles
		concentricCirclesColor: '#444',

		//Property: levelDistance
		//The actual distance between levels
		levelDistance: 200,
		
		//Property: nodeRadius
		//The radius of the nodes displayed
		nodeRadius: 4,
		
		//Property: allowVariableNodeDiameters
		//Set this to true if you want your node diameters to be proportional to you first dataset object value property (i.e _data[0].value_).
		//This will allow you to represent weighted tree/graph nodes.
		allowVariableNodeDiameters: false,
		
		//Property: nodeRangeDiameters
		//Diameters range. For variable node weights.
		nodeRangeDiameters: {
			min: 10,
			max: 35
		},
			
		//Property: nodeRangeValues
		// The interval of the values of the first object of your dataSet.
		// A superset of the values can also be specified.
		nodeRangeValues: {
			min: 1,
			max: 35
		},

		//Property: fps
		//animation frames per second
		fps:35,
		
		//Property: animationTime
		animationTime: 1500,
		
		//Property: interpolation
		interpolation: 'other'
};

/*
   Object: GraphUtil

   A multi purpose object to do graph traversal and processing.
*/

var GraphUtil = {
	/*
	   Method: eachNode
	
	   Iterates over graph nodes performing an action.
	*/
	eachNode: function(graph, action) {
		for(var i in graph.nodes) action(graph.nodes[i]);
	},
	
	/*
	   Method: getNode
	
	   Returns a node from a specified id.
	*/
	getNode: function(graph, id) {
		return graph.nodes[id];
	},
	
	/*
	   Method: eachAdjacency
	
	   Iterates over a _node_ adjacencies applying the _action_ function.
	*/
	eachAdjacency: function(graph, node, action) {
		for(var i=0, adjs = node.adjacencies; i<adjs.length; i++) action(adjs[i], i);
	},

	/*
	   Method: eachBFS
	
	   Performs a BFS traversal of a graph beginning by the node of id _id_ and performing _action_ on each node.
	*/
	eachBFS: function(graph, id, action) {
		var that = this;
		GraphUtil.clean(graph);
		var queue = [this.getNode(graph, id)];
		while(queue.length != 0) {
			var node = queue.pop();
			node._flag = true;
			action(node, node._depth);
			for(var i=0, adj = node.adjacencies; i<adj.length; i++) {
				var n = adj[i].nodeTo;
				if(n._flag == false) {
					n._depth = node._depth + 1;
					queue.unshift(n);
				}
			}
		}
	},
	
	/*
	   Method: eachSubnode
	
	   After a BFS traversal the _depth_ property of each node has been modified. Now the graph can be traversed as a tree. This method iterates for each subnode that has depth larger than the specified node.
	*/
	eachSubnode: function(graph, node, action) {
		var d = node._depth;
		for(var i=0, ad = node.adjacencies; i<ad.length; i++) {
			var n = ad[i].nodeTo;
			if(n._depth > d) action(n);
		}
	},

	/*
	   Method: getParents
	
	   Returns all nodes having a depth that is less than the node's depth property.
	*/
	getParents: function(graph, node) {
		var adj = node.adjacencies;
		var ans = new Array();
		for(var i=0; i<adj.length; i++) {
			var n = adj[i].nodeTo;
			if(n._depth < node._depth) ans.push(n);
		}
		return ans;
	},
	
	/*
	   Method: clean
	
	   Cleans flags from nodes (by setting the _flag_ property to false).
	*/
	clean: function(graph) { this.eachNode(graph, function(elem) { elem._flag = false; }); }
	
};

/*
   Object: GraphPlot

   An object that performs specific radial layouts for a generic graph structure.
*/
var GraphPlot = {
	//Property: labelsHidden
	//A flag value indicating if node labels are being displayed or not.
	labelsHidden: false,
	displacement: {'x':0, 'y':0},

	/*
	   Method: hideLabels
	
	   Hides all labels.
	*/
	hideLabels: function (hide) {
		var container = document.getElementById(Config.labelContainer);
		//if(hide) container.style.display = 'none';
		//else container.style.display = '';
		this.labelsHidden = hide;
	},

	/*
	   Method: animate
	
	   Animates the graph mantaining a radial layout.
	*/
	animate: function(graph, id, canvas, controller) {
		var that = this;
		//this.hideLabels(true);
		var comp = function(from, to, delta){ return (to.$add(from.scale(-1))).$scale(delta).$add(from); };
		var compPolar = function(from, to, delta){ 
			var p = to.interpolate(from, delta);
			return p;
		};
		//can also interpolate polar coordinates.
		var interpolate = function(elem, delta) {
			if(Config.interpolation == 'polar') {
				var from = elem.startPos;
				var to = elem.endPos;
				elem.pos = compPolar(from, to, delta);
			} else {
				var from = elem.startPos.toComplex();
				var to = elem.endPos.toComplex();
				elem.pos = comp(from, to, delta).toPolar();
			}

		};
		var animationController = {
			compute: function(delta) {
				canvas.clear();
				if(Config.drawConcentricCircles) canvas.drawConcentricCircles(Config.drawConcentricCircles);
				GraphUtil.eachNode(graph, function(node) { interpolate(node, delta); });
				that.plot(graph, id, canvas, controller);
			},
			
			complete: function() {
				that.hideLabels(false);
				GraphUtil.eachNode(graph, function(elem) {elem.startPos = elem.pos});
				that.plot(graph, id, canvas, controller);
				controller.onAfterCompute();
			}		
		};
		var that = this;
		Animation.controller = animationController;
		Animation.start();
	},

	/*
	   Method: plot
	
	   Plots a Graph.
	*/
	plot: function(graph, id, canvas, controller) {
		var aGraph = graph;
		var that = this;
		canvas.clear();
		if(Config.drawConcentricCircles) canvas.drawConcentricCircles();
		GraphUtil.clean(graph);
		GraphUtil.eachBFS(aGraph, id, function(node) {
			GraphUtil.eachAdjacency(aGraph, node, function(adj) {
				if(!adj.nodeTo._flag) {
					controller.onBeforePlotLine(adj);
					that.plotLine(adj, canvas,controller);
					controller.onAfterPlotLine(adj);
				}
			});
			that.plotNode(node, canvas,controller);
	 		if(!that.labelsHidden) that.plotLabel(canvas, node, controller);
			node._flag = true;
		});
	},
	
	
	/*
	   Method: plotNode
	
	   Plots a graph node.
	*/
	plotNode: function(node, canvas,controller) {
		var pos = node.pos.toComplex();
		var d = controller.getOffset();

		canvas.path('fill', function(context) {
	  		//jon add
	  		context.arc(pos.x +d.x, pos.y +d.y, node._radius, 0, Math.PI*2, true);	

		});		
	},
	
	/*
	   Method: plotLine
	
	   Plots a line connecting _node_ and _child_ nodes.
	*/
	

	plotLine: function(adj, canvas,controller) {
		
		var d = controller.getOffset();
		var node = adj.nodeFrom, child = adj.nodeTo;
		var pos = node.pos.toComplex();
		var posChild = child.pos.toComplex();
		canvas.path('stroke', function(context) {
			var x1 = pos.x + d.x;
			var y1 = pos.y + d.y;
			var x2 = posChild.x+d.x;
			var y2 = posChild.y+d.y;
			context.moveTo(x1, y1);//jon hack
		context.lineTo(x2, y2); //jon hack
		
		//GraphPlot.drawArrowHead(context,x1,y1,x2,y2);
	
			/*
			context.moveTo(posChild.x+dx, posChild.y+dy);//jon hack
			context.lineTo(posChild.x+dx+5, posChild.y+dy+20); //jon hack
			context.moveTo(posChild.x+dx, posChild.y+dy);//jon hack
			context.lineTo(posChild.x+dx-5, posChild.y+dy+20); //jon hack
			*/
		});
	},
	
	
	rotateShape: function(shape,ang) {
	    var rv = [];
	    for(p in shape)
	        rv.push(GraphPlot.rotatePoint(ang,shape[p][0],shape[p][1]));
	    return rv;
	},
	rotatePoint: function(ang,x,y) {
	    return [
	        (x * Math.cos(ang)) - (y * Math.sin(ang)),
	        (x * Math.sin(ang)) + (y * Math.cos(ang))
	    ];
	},
	
	
	drawArrowHead: function(ctx,x1,x2,y1,y2) {

		var shape = [[ 2, 0 ],[ -10, -4 ],[ -10, 4]];
		
		var ang = Math.atan2(y2-y1,x2-x1);
		
		shape = GraphPlot.rotateShape(shape,ang);
	   
		ctx.moveTo(shape[0][0],shape[0][1]);
 		
console.log(shape);
		for(p in shape){
			console.log(p);
			if (p > 0) ctx.lineTo(shape[p][0],shape[p][1]);
			console.log("drawn?@"+p);
		}
		console.log("drawn?@xx");
		ctx.lineTo(shape[0][0],shape[0][1]);
		
		ctx.fill();
	

	},
	/*
	   Method: plotLabel
	
	   Plots a label for a given node.
	*/
	plotLabel: function(canvas, node, controller) {
		
		var d = controller.getOffset();
		
		//canvas.setPosition();
		var size = node._radius;
		var id = controller.getNodeLabelPrefix() + node.id;
		var tag = false;
		if(!(tag = document.getElementById(id))) {
			tag = document.createElement('div');
			var container = document.getElementById(controller.getNodeLabelContainer());
			container.style.position= 'relative';
			container.appendChild(tag);
			controller.onCreateLabel(tag, node);
		}
		var pos = node.pos.toComplex();
		var radius= canvas.getSize();
		var labelPos= {
			x: Math.round((pos.x  + radius.x/2 - size /2) +d.x),
			y: Math.round((pos.y + radius.y/2 - size /2) +d.y)
		};
		tag.id = id;
		tag.className = 'node';
		tag.style.position = 'absolute';
		tag.style.width = size + 'px';
		tag.style.height = size + 'px';
		tag.style.left = labelPos.x + 'px';
		tag.style.top = labelPos.y  + 'px';
		if(this.fitsInCanvas(labelPos, canvas)) tag.style.display = '';
		else tag.style.display = 'none';
		controller.onPlaceLabel(tag, node);
	},
	
	/*
	   Method: fitsInCanvas
	
	   Returns _true_ or _false_ if the label for the node is contained on the canvas dom element or not.
	*/
	fitsInCanvas: function(pos, canvas) {
		//canvas.setPosition();
	    var size = canvas.getSize();
		var offset1 = parseInt(size.x);
		var offset2 = parseInt(size.y);
		if(pos.x <  0 || pos.x > offset1 || pos.y < 0 || pos.y > offset2) return false;
		else
		  return true;						
	}
	

};

/*
   Class: RGraph

	An animated Graph with radial layout.

	Go to <http://blog.thejit.org> to know what kind of JSON structure feeds this object.
	
	Go to <http://blog.thejit.org/?p=8> to know what kind of controller this class accepts.
	
	Refer to the <Config> object to know what properties can be modified in order to customize this object. 

	The simplest way to create and layout a RGraph is:
	
	(start code)

	  var canvas= new Canvas('infovis', '#ccddee', '#772277');
	  var rgraph= new RGraph(canvas, controller);
	  rgraph.loadTreeFromJSON(json);
	  rgraph.compute();
	  rgraph.plot();

	(end code)

	A user should only interact with the Canvas, RGraph and Config objects/classes.
	By implementing RGraph controllers you can also customize the RGraph behavior.
*/

/*
 Constructor: RGraph

 Creates a new RGraph instance.
 
 Parameters:

    canvas - A <Canvas> instance.
    controller - _optional_ a RGraph controller <http://blog.thejit.org/?p=8>
*/
var RGraph = function(canvas, controller) {
	var innerController = {
		onBeforeCompute: $_.fn(),
		onAfterCompute:  $_.fn(),
		onCreateLabel:   $_.fn(),
		onPlaceLabel:    $_.fn(),
		onCreateElement: $_.fn(),
		onComplete:      $_.fn(),
		onBeforePlotLine: $_.fn(),
		onAfterPlotLine: $_.fn(),
		request:         false
	};
	
	this.controller = $_.merge(innerController, controller);
	this.graph = new Graph();
	this.json = null;
	this.canvas = canvas;
	this.root = null;
	
	Animation.duration = Config.animationTime;
	Animation.fps = Config.fps;
	
};

RGraph.prototype = {
	/*
	 Method: loadTree
	
	 Loads a Graph from a json tree object <http://blog.thejit.org>
	 
	*/
	loadTree: function(json) {
		var ch = json.children;
		this.graph.addNode(json);
		for(var i=0; i<ch.length; i++) {
			this.graph.addAdjacence(json, ch[i]);
			this.loadTree(ch[i]);
		}
	},

	/*
	 Method: loadGraph
	
	 Loads a Graph from a json graph object <http://blog.thejit.org>
	 
	*/
	loadGraph: function(json) {
		var getNode = function(id) {
			for(var w=0; w<json.length; w++) if(json[w].id == id) return json[w];
		};
		
		for(var i=0; i<json.length; i++) {
			this.graph.addNode(json[i]);
			for(var j=0, adj = json[i].adjacencies; j<adj.length; j++) {
				var node = adj[j], data;
				if(typeof adj[j] != 'string') {
					data = node.data; node = node.nodeTo;
				}
				
				this.graph.addAdjacence(json[i], getNode(node), data);
			}
		}
	},
	
	/*
	 Method: flagRoot
	
	 Flags a node specified by _id_ as root.
	*/
	flagRoot: function(id) {
		this.unflagRoot();
		this.graph.nodes[id]._root = true;
	},

	/*
	 Method: unflagRoot
	
	 Unflags all nodes.
	*/
	unflagRoot: function() {
		GraphUtil.eachNode(this.graph, function(elem) {elem._root = false;});
	},

	/*
	 Method: getRoot
	
	 Returns the node flagged as root.
	*/
	getRoot: function() {
		var root = false;
		GraphUtil.eachNode(this.graph, function(elem){ if(elem._root) root = elem; });
		return root;
	},
	
	/*
	 Method: loadTreeFromJSON
	
	 Loads a RGraph from a _json_ object <http://blog.thejit.org>
	*/
	loadTreeFromJSON: function(json) {
		this.json = json;
		this.loadTree(json);
		this.root = json.id;
	},
	
	/*
	 Method: loadGraphFromJSON
	
	 Loads a RGraph from a _json_ object <http://blog.thejit.org>
	*/
	loadGraphFromJSON: function(json, i) {
		this.json = json;
		this.loadGraph(json);
		this.root = json[i? i : 0].id;
	},
	
	/*jon hack */
	offsetCenter: function(x,y){
		var d =this.controller.getOffset();
		d.x += x;
		d.y += y;
		this.controller.setOffset(d);
	},
	
	/*
	 Method: plot
	
	 Plots the RGraph
	*/
	plot: function() {
		GraphPlot.plot(this.graph, this.root, this.canvas, this.controller);
	},
	
	/*
	 Method: compute
	
	 Computes the graph nodes positions and stores this positions on _property_.
	*/
	compute: function(property) {
		var prop = property || ['pos', 'startPos'];
		var node = GraphUtil.getNode(this.graph, this.root);
		node._depth = 0;
		this.flagRoot(this.root);
		this.computeAngularWidths();
		this.computePositions(prop);
	},
	
	/*
	 Method: computePositions
	
	 Performs the main algorithm for computing node positions.
	*/
	computePositions: function(property) {
		var propArray = (typeof property == 'array' || typeof property == 'object')? property : [property];
		var aGraph = this.graph;
		var root = GraphUtil.getNode(this.graph, this.root);

		for(var i=0; i<propArray.length; i++)
			root[propArray[i]] = new Polar(0, 0);
		
		root.angleSpan = {
			begin: 0,
			end: 2 * Math.PI
		};
		root._rel = 1;
		var that = this;
		//console.log(that.controller.getZoomLevel(),"ghe");
		GraphUtil.eachBFS(this.graph, this.root, function (elem) {
			var angleSpan = elem.angleSpan.end - elem.angleSpan.begin;
			var rho = (elem._depth + 1) * that.controller.getZoomLevel();
			var angleInit = elem.angleSpan.begin;
			var totalAngularWidths = (function (element){
				var total = 0;
				GraphUtil.eachSubnode(aGraph, element, function(sib) {
					total += sib._treeAngularWidth;
				});
				return total;
			})(elem);
			
			GraphUtil.eachSubnode(aGraph, elem, function(child) {
				if(!child._flag) {
					child._rel = child._treeAngularWidth / totalAngularWidths;
					var angleProportion = child._rel * angleSpan;
					var theta = angleInit + angleProportion / 2;
					for(var i=0; i<propArray.length; i++)
						child[propArray[i]] = new Polar(theta, rho);

					child.angleSpan = {
						begin: angleInit,
						end: angleInit + angleProportion
					};
					angleInit += angleProportion;
				}
			});
		});
	},
	
	/*
	 Method: setAngularWidthForNodes
	
	 Sets nodes angular widths.
	*/
	setAngularWidthForNodes: function() {
		var rVal = Config.nodeRangeValues, rDiam = Config.nodeRangeDiameters, nr = Config.nodeRadius; 
		var diam = function(value) { return (((rDiam.max - rDiam.min)/(rVal.max - rVal.min)) * (value - rVal.min) + rDiam.min) };
		GraphUtil.eachBFS(this.graph, this.root, function(elem, i) {
			var dataValue = (Config.allowVariableNodeDiameters && elem.data && elem.data.length > 0)? elem.data[0].value : nr;
			var diamValue = diam(dataValue);
			var rho = this.controller.getZoomLevel() * i;
			elem._angularWidth = diamValue / rho;
			elem._radius = diamValue / 2;
		});
	},
	
	/*
	 Method: setSubtreesAngularWidths
	
	 Sets subtrees angular widths.
	*/
	setSubtreesAngularWidth: function() {
		var that = this;
		GraphUtil.eachNode(this.graph, function(elem) {
			that.setSubtreeAngularWidth(elem);
		});
	},
	
	/*
	 Method: setSubtreeAngularWidth
	
	 Sets the angular width for a subtree.
	*/
	setSubtreeAngularWidth: function(elem) {
		var that = this, nodeAW = elem._angularWidth, sumAW = 0;
		GraphUtil.eachSubnode(this.graph, elem, function(child) {
			that.setSubtreeAngularWidth(child);
			sumAW += child._treeAngularWidth;
		});
		elem._treeAngularWidth = Math.max(nodeAW, sumAW);
	},
	
	/*
	 Method: computeAngularWidths
	
	 Computes nodes and subtrees angular widths.
	*/
	computeAngularWidths: function () {
		this.setAngularWidthForNodes();
		this.setSubtreesAngularWidth();
	},
	
	/*
	 Method: getNodeAndParentAngle
	
	 Returns the _parent_ of the given node, also calculating its angle span.
	*/
	getNodeAndParentAngle: function(id) {
		var theta = false;
		var n  = GraphUtil.getNode(this.graph, id);
		var ps = GraphUtil.getParents(this.graph, n);
		var p  = (ps.length > 0)? ps[0] : false;
		if(p) {
			var posParent = p.pos.toComplex(), posChild = n.pos.toComplex();
			var newPos    = posParent.add(posChild.scale(-1));
			theta = (function(pos) {
				var t = Math.atan2(pos.y, pos.x);
				if(t < 0) t = 2 * Math.PI + t;
				
				return t;
			})(newPos);
		}
		return {_parent: p, theta: theta};
		
	},
	
	/*
	 Method: onClick
	
	 Performs all calculations and animation when clicking on a label specified by _id_. The label id is the same id as its homologue node.
	*/
	onClick: function(id) {
		if(this.root != id) {
			//GraphPlot.displacement.x =0;
			//GraphPlot.displacement.y = 0;
			//we apply first constraint to the algorithm
			
			var obj = this.getNodeAndParentAngle(id);
			console.log(obj);
			this.root = id;
			this.controller.onBeforeCompute(GraphUtil.getNode(this.graph, id));
			this.compute('endPos');
			var thetaDiff = obj.theta - obj._parent.endPos.theta;
			GraphUtil.eachNode(this.graph, function(elem) {
				elem.endPos = elem.endPos.add(new Polar(thetaDiff, 0));
			});
			GraphPlot.animate(this.graph, id, this.canvas, this.controller);
		}		
	}
};

/*
 Class: Graph

 A generic Graph class.
 
*/	

/*
 Constructor: Graph

 Creates a new Graph instance.
 
*/	
var Graph= function()  {
	//Property: nodes
	//graph nodes
	this.nodes= {};
};
	
	
Graph.prototype= {
	/*
	 Method: addAdjacence
	
	 Connects nodes specified by *obj* and *obj2*. If not found, nodes are created.
	 
	 Parameters:
	
	    obj - a <Graph.Node> object.
	    obj2 - Another <Graph.Node> object.
	*/	
  addAdjacence: function (obj, obj2, weight) {
  	if(!this.hasNode(obj.id)) this.addNode(obj);
  	if(!this.hasNode(obj2.id)) this.addNode(obj2);
	obj = this.nodes[obj.id]; obj2 = this.nodes[obj2.id];
	
  	for(var i in this.nodes) {
  		if(this.nodes[i].id == obj.id) {
  			if(!this.nodes[i].adjacentTo(obj2)) {
  				this.nodes[i].addAdjacency(obj2, weight);
  			}
  		}
  		
  		if(this.nodes[i].id == obj2.id) {	
  			if(!this.nodes[i].adjacentTo(obj)) {
  				this.nodes[i].addAdjacency(obj, weight);
  			}
  		}
  	}
 },

	/*
	 Method: addNode
	
	 Adds a node.
	 
	 Parameters:
	
	    obj - A <Graph.Node> object.
	*/	
  addNode: function(obj) {
  	if(!this.nodes[obj.id]) {
	  	this.nodes[obj.id] = new Graph.Node(obj.id, obj.name, obj.data);
  	}
  	return this.nodes[obj.id];
  },


	/*
	 Method: hasNode
	
	 Returns a Boolean instance indicating if node belongs to graph or not.
	 
	 Parameters:
	
	    id - Node id.

	 Returns:
	  
	 		A Boolean instance indicating if node belongs to graph or not.
	*/	
  hasNode: function(id) {
  	for(var index in this.nodes) {
  		if (index== id) {
  			return true;
  		}
  	}
  	return false;	
  }
};
/*
   Class: Graph.Node
	
	 Behaviour of the <Graph> node.

*/
/*
   Constructor: Graph.Node

   Node constructor.

   Parameters:

      id - The node *unique identifier* id.
      name - A node's name.
      data - Place to store some extra information (can be left to null).


   Returns:

      A new <Graph.Node> instance.
*/
Graph.Node = function(id, name, data) {
	//Property: id
	this.id= id;
	//Property: name
	this.name = name;
	//Property: data
	//The dataSet object <http://blog.thejit.org/?p=7>
	this.data = data;
		
	//Property: drawn
	//Node flag
	this.drawn= false;

	//Property: angle span
	//allowed angle span for adjacencies placement
	this.angleSpan= {
		begin:0,
		end:0
	};

	//Property: pos
	//node position
	this.pos= new Polar(0, 0);
	
	//Property: startPos
	//node from position
	this.startPos= new Polar(0, 0);
	
	//Property: endPos
	//node to position
	this.endPos= new Polar(0, 0);
	
	//Property: adjacencies
	//node adjacencies
	this.adjacencies= new Array();
	
}

Graph.Node.prototype= {
	
		/*
	   Method: adjacentTo
	
	   Indicates if the node is adjacent to the node indicated by the specified id

	   Parameters:
	
	      id - A node id.
	
	   Returns:
	
	     A Boolean instance indicating whether this node is adjacent to the specified by id or not.
	*/
	adjacentTo: function(node) {
		for(var index=0; index<this.adjacencies.length; index++) {
			if(node.id == this.adjacencies[index].nodeTo.id) {
				return true;
			}
		}
		return false;
	},

		/*
	   Method: addAdjacency
	
	   Connects the node to the specified by id.

	   Parameters:
	
	      id - A node id.
	*/	
	addAdjacency: function(node, data) {
		var adj = new Graph.Adjacence(this, node, data);
		this.adjacencies.push(adj);
	}
};
/*
   Class: Graph.Adjacence
	
	 Creates a new <Graph> adjacence.

*/
Graph.Adjacence = function(node, node2, data) {
	this.nodeFrom = node;
	this.nodeTo    = node2;
	this.data     = data;
};

/*
   Object: Trans
	
	 An object containing multiple type of transformations. Based on the mootools library <http://mootools.net>.

*/
var Trans = {
	linear: function(p) { return p;	},
	Quart: function(p) {
		return Math.pow(p, 4);
	},
	easeIn: function(transition, pos){
		return transition(pos);
	},
	easeOut: function(transition, pos){
		return 1 - transition(1 - pos);
	},
	easeInOut: function(transition, pos){
		return (pos <= 0.5) ? transition(2 * pos) / 2 : (2 - transition(2 * (1 - pos))) / 2;
	}
};

/*
   Object: Animation
	
	 An object that performs animations. Based on Fx.Base from Mootools.

*/

var Animation = {

	duration: Config.animationTime,
	fps: Config.fps,
	transition: function(p) {return Trans.easeInOut(Trans.Quart, p);},
	//transition: Trans.linear,
	controller: false,
	
	getTime: function() {
		var ans = (Date.now)? Date.now() : new Date().getTime();
		return ans;
	},
	
	step: function(){
		var time = this.getTime();
		if (time < this.time + this.duration){
			var delta = this.transition((time - this.time) / this.duration);
			this.controller.compute(delta);
		} else {
			this.timer = clearInterval(this.timer);
			this.controller.compute(1);
			this.controller.complete();
		}
	},

	start: function(){
		this.time = 0;
		this.startTimer();
		return this;
	},


	startTimer: function(){
		if (this.timer) return false;
		this.time = this.getTime() - this.time;
		this.timer = setInterval((function () { Animation.step(); }), Math.round(1000 / this.fps));
		return true;
	}
};
}}}