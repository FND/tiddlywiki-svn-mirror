/*
Taken from The JIT RGraph Library (BSD License) by Nicolas Garcia Belmonte
http://thejit.org/

***/
/*
 * File: RGraph.js
 * 
 * Author: Nicolas Garcia Belmonte
 * 

 * 
 * License: BSD License
 * 
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
 */

VismoGraphAlgorithms._utils ={   
    name: "Radial"
    ,labelContainer: 'label_container'

    //Property: drawConcentricCircles
    //show/hide concentricCircles
    ,drawConcentricCircles: 4,

    //Property: concentricCirclesColor
    //The color of the concentric circles
    concentricCirclesColor: '#444',

    //Property: levelDistance
    //The actual distance between levels
    levelDistance: 100,

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
    fps:40,

    //Property: animationTime
    animationTime: 2500,

    //Property: interpolation
    interpolation: 'linear'   
    ,eachBFS: function(graph, id, action, flags) {
        
 		var filter = this.filter(flags);
 		graph.eachNode(function(elem) { elem._flag = false; });
 		
 		var queue = [graph.getNode(id)];
 		while(queue.length != 0) {
 			var node = queue.pop();
 			node._flag = true;
 			action(node, node._depth);
 			
 			graph.eachEdge(node, function(adj) {
 				var n = adj[1];
 				if(n._flag == false && filter(n)) {
 					n._flag = true;
 					queue.unshift(n);
 				}
 			});
 		}
 	}
    ,setAngularWidthForNodes: function(graph) {
 		var rVal = this.nodeRangeValues, rDiam = this.nodeRangeDiameters, nr = this.nodeRadius, allow = this.allowVariableNodeDiameters; 
 		var diam = function(value) { 

 		    var r= (((rDiam.max - rDiam.min)/(rVal.max - rVal.min)) * (value - rVal.min) + rDiam.min);
 		    return r;};
 		var that = this;
 		this.eachBFS(graph, this.root, function(elem, i) {
 			var dataValue = (allow && elem.data && elem.data.length > 0)? elem.data[0].value : nr;
 			var diamValue = diam(dataValue);
 			var rho = that.levelDistance * i;

 			elem._angularWidth = diamValue / rho;
 			elem._radius = allow? diamValue / 2 : nr;
 		}, "ignore");
 	}
 	,setSubtreeAngularWidth: function(graph,elem) {
 		var that = this, nodeAW = elem._angularWidth, sumAW = 0;
 		this.eachSubnode(graph, elem, function(child) {
 			that.setSubtreeAngularWidth(graph,child);
 			sumAW += child._treeAngularWidth;
 		}, "ignore");
 		elem._treeAngularWidth = Math.max(nodeAW, sumAW);
 	}
 	,eachSubnode: function(graph, node, action, flags) {
 		var d = node._depth, filter = this.filter(flags);
 		graph.eachEdge(node, function(adj) {
 			var n = adj[1];
 			if(n._depth > d && filter(n)) action(n);
 		});
 	}
 	,setSubtreesAngularWidth: function(graph) {
 		var that = this;
 		graph.eachNode(function(elem) {
 			that.setSubtreeAngularWidth(graph,elem);
 		});
 	}	
 	,computeAngularWidths: function (graph) {
 		this.setAngularWidthForNodes(graph);
 		this.setSubtreesAngularWidth(graph);
 	}
     /*
   	 Method: flagRoot

   	 Flags a node specified by _id_ as root.
   	*/
   	,flagRoot: function(graph,id) {
   		this.unflagRoot(graph);
   		var node = graph.getNode(id);
   		node._root = true;
   	}

 	,filter: function(param) {
 		if(!param || !param.constructor.toString().match(/string/i)) return function() { return true; };
 		var props = param.split(" ");
 		return function(elem) {
 			for(var i=0; i<props.length; i++) if(elem[props[i]]) return false;
 			return true;
 		};
 	}
 	,getMaximumDepth: function(){
 	    return this.maxDepth;
 	}
    ,computeLevels: function(graph,id, flags) {
        this.maxDepth = 0;
        var that = this;
 		var filterer = this.filter(flags);
 		graph.eachNode(function(elem) {
 			if(filterer(elem)){
 			    elem._flag = false;
 			    elem._depth = -1;
 			}
 		});
 		var root = graph.getNode(id);
 		root._depth = 0;
 		var queue = [root];
 		while(queue.length != 0) {
 			var node = queue.pop();
 			node._flag = true;
 			graph.eachEdge(node, function(adj) {
 				if(filterer(node)){
 				    var n = adj[1];
 				    if(n._flag == false && filterer(n)) {
 					    if(n._depth < 0) n._depth = node._depth + 1;
 					    if(n._depth > that.maxDepth) that.maxDepth = n._depth;
 					    queue.unshift(n);
 				    }
 				}
 			});
 		}
 	}

   	/*
   	 Method: unflagRoot

   	 Unflags all nodes.
   	*/
   	,unflagRoot: function(graph) {
   		graph.eachNode(function(elem) {elem._root = false;});
   	}
 	,computePositions: function(graph,property) {
 		var propArray = (typeof property == 'array' || typeof property == 'object')? property : [property];
 		var aGraph = graph;
 		var root = graph.getNode(this.root);

 		for(var i=0; i<propArray.length; i++)
 			root[propArray[i]] = new Polar(0, 0);

 		root.angleSpan = {
 			begin: 0,
 			end: 2 * Math.PI
 		};
 		root._rel = 1;
 		var that = this;
 		this.eachBFS(graph, this.root, function (elem) {
 			var angleSpan = elem.angleSpan.end - elem.angleSpan.begin;
 			var rho = (elem._depth + 1) * that.levelDistance;
 			var angleInit = elem.angleSpan.begin;
 			var totalAngularWidths = (function (element){
 				var total = 0;
 				that.eachSubnode(aGraph, element, function(sib) {
 					total += sib._treeAngularWidth;
 				}, "ignore");
 				return total;
 			})(elem);

 			that.eachSubnode(aGraph, elem, function(child) {
 				if(!child._flag) {
 					child._rel = child._treeAngularWidth / totalAngularWidths;
 					var angleProportion = child._rel * angleSpan;
 					var theta = angleInit + angleProportion / 2;


 					for(var i=0; i<propArray.length; i++){
 						child[propArray[i]] = new Polar(theta, rho);

                     }
 					child.angleSpan = {
 						begin: angleInit,
 						end: angleInit + angleProportion
 					};
 					angleInit += angleProportion;
 				}
 			}, "ignore");
 		}, "ignore");
 	}



 };
 
VismoGraphAlgorithms.radial = {
    reset: function(graph){
        var nodes = graph.getNodes();
        for(var i=0; i < nodes.length; i++){
            var node = nodes[i];
            node.XPosition = false;
            node.YPosition = false;
        }
    }
    ,compute: function (graph,options,property) {	

        var root = options.root;


        var prop = property || ['pos', 'startPos', 'endPos'];
        var node = graph.getNode(root);
        node._depth = 0;
        var utils = VismoGraphAlgorithms._utils;
        utils.root = root;

        utils.flagRoot(graph,root);

        utils.computeLevels(graph,root, "ignore");
        utils.computeAngularWidths(graph);
        utils.computePositions(graph,prop);

        var nodes = graph.getNodes();

        for(var i=0; i < nodes.length;i++){
         var node = nodes[i];

         if(node.pos){
             var pos = node.pos.toComplex();
             node.XPosition =  pos.x;
             node.YPosition = pos.y
         }
        }
    }

 };
 
 var Complex= function() {
 	if (arguments.length > 1) {
 		this.x= arguments[0];
 		this.y= arguments[1];

 	} else {
 		this.x= null;
 		this.y= null;
 	}

 };

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
 	   Method: equals

 	   Comparison method.
 	*/
 	equals: function(c) {
 		return this.x == c.x && this.y == c.y;
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

 Complex.KER = new Complex(0, 0);
 
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
 	   Method: equals

 	   Comparison method.
 	*/
 	equals: function(c) {
 		return this.theta == c.theta && this.rho == c.rho;
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

 Polar.KER = new Polar(0, 0);
 
