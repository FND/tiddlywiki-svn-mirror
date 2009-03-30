/*Jon's JIT Hacks */

Config.animationTime = 1000;

/*RGRAPH*/
RGraph.prototype.offsetCenter= function(x,y){
	var d =this.controller.getOffset();
	d.x = x;
	d.y = y;
	this.controller.setOffset(d);
};

RGraph.prototype.setAngularWidthForNodes= function() {
	var rVal = Config.nodeRangeValues, rDiam = Config.nodeRangeDiameters, nr = Config.nodeRadius, allow = Config.allowVariableNodeDiameters; 
	
	var zoom = this.controller.getZoomLevel();
	var diam = function(value) { return (((rDiam.max - rDiam.min)/(rVal.max - rVal.min)) * (value - rVal.min) + rDiam.min) };
	GraphUtil.eachBFS(this.graph, this.root, function(elem, i) {
		var dataValue = (allow && elem.data && elem.data.length > 0)? elem.data[0].value : nr;
		var diamValue = diam(dataValue);

		var rho = zoom * i;//jon
		elem._angularWidth = diamValue / rho;
		elem._radius = allow? diamValue / 2 : nr;
	}, "ignore");
};



RGraph.prototype.computePositions= function(property) {
	var propArray = (typeof property == 'array' || typeof property == 'object')? property : [property];
	var aGraph = this.graph;
	var GUtil = GraphUtil;
	var root = this.graph.getNode(this.root);

	for(var i=0; i<propArray.length; i++)
		root[propArray[i]] = new Polar(0, 0);
	
	root.angleSpan = {
		begin: 0,
		end: 2 * Math.PI
	};
	root._rel = 1;
	var zoom =this.controller.getZoomLevel();
	GUtil.eachBFS(this.graph, this.root, function (elem) {
		var angleSpan = elem.angleSpan.end - elem.angleSpan.begin;
		var rho = (elem._depth + 1) * zoom;//jon
		var angleInit = elem.angleSpan.begin;
		var totalAngularWidths = (function (element){
			var total = 0;
			GUtil.eachSubnode(aGraph, element, function(sib) {
				total += sib._treeAngularWidth;
			}, "ignore");
			return total;
		})(elem);
		
		GUtil.eachSubnode(aGraph, elem, function(child) {
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
		}, "ignore");
	}, "ignore");
};



RGraph.prototype.onClick= function(id) { //weird bug in here
		
		if(this.root != id) {//jon
			this.busy = true;
			//we apply first constraint to the algorithm
			var obj = this.getNodeAndParentAngle(id);
			this.root = id, that = this;
			this.controller.onBeforeCompute(this.graph.getNode(id));

			this.compute('endPos');

			var thetaDiff = obj.theta - obj._parent.endPos.theta;

			GraphUtil.eachNode(this.graph, function(elem) {
				elem.endPos = elem.endPos.add(new Polar(thetaDiff, 0));
			});
			
			var mode = (Config.interpolation == 'linear')? 'linear' : 'polar';


			this.controller.modes = [mode];//jon
			GraphPlot.animate(this, this.controller);//jon
		}

};
/*GRAPH PLOT */

GraphPlot.plotLine = function(adj, canvas,controller) {//jon
	var d = controller.getOffset();//jon
	var node = adj.nodeFrom, child = adj.nodeTo;
	var pos = node.pos.toComplex();
	var posChild = child.pos.toComplex();
	canvas.path('stroke', function(context) {
		
		pos.x += d.x;//jon..
		pos.y += d.y;
		posChild.x += d.x;
		posChild.y += d.y;//..jon
		
		context.moveTo(pos.x, pos.y);
	  	context.lineTo(posChild.x, posChild.y);
		
		 

			
		
	});
};


GraphPlot.getLabelContainer = function(controller){
	return document.getElementById(controller.getNodeLabelContainer());
};



GraphPlot.fitsInCanvas= function(pos, canvas) {
	//canvas.setPosition();
    var size = canvas.getSize();
	var offset1 = parseInt(size.x);
	var offset2 = parseInt(size.y);
	if(pos.x <  0 || pos.x > offset1 || pos.y < 0 || pos.y > offset2) return false;
	else
	  return true;						
};

GraphPlot.plotLabel= function(canvas, node, controller) {
	
	var size = node._radius;
	var id = controller.getNodeLabelPrefix() + node.id;//jon change
	var d = controller.getOffset(); //jon

	var pos = node.pos.toComplex();
	var radius= canvas.getSize();
	canvas.setPosition(); //jon
	var cpos = canvas.getPosition();
	
	var labelPos= {
		x: Math.round((pos.x  + radius.x/2 - size /2) +d.x),//jon
		y: Math.round((pos.y + radius.y/2 - size /2) +d.y)//jon
	};

	var tag = this.getLabel(id);
	
	if(!this.fitsInCanvas(labelPos,canvas)) {
		
		//if(tag && tag.parentNode)tag.parentNode.removeChild(tag);
		return;
	}
	
	if(!tag && !(tag = document.getElementById(id))) {
		tag = document.createElement('div');
		var container = this.getLabelContainer(controller); //jon change
		container.style.position= 'relative';//jon change
		container.appendChild(tag);
		tag.id = id;
		tag.className = 'node';
		tag.style.position = 'absolute';
		controller.onCreateLabel(tag, node);
	}

	tag.style.width = size + 'px';
	tag.style.height = size + 'px';
	tag.style.left = labelPos.x + 'px';
	tag.style.top = labelPos.y  + 'px';
	tag.style.display = this.fitsInCanvas(labelPos, canvas)? '' : 'none';
	controller.onPlaceLabel(tag, node);
};


/*overriding of several functions */
GraphPlot.plotNode =  function(node, canvas,controller) {
	var pos = node.pos.toComplex();
	var d = controller.getOffset();

	if(node.data.nodraw == undefined)  		//jon
	canvas.path('fill', function(context) {
  		context.arc(pos.x +d.x, pos.y +d.y, node._radius, 0, Math.PI*2, true);	//jon

	});		
};


GraphPlot.plot= function(viz, opt) {

	var aGraph = viz.graph, canvas = viz.canvas, id = viz.root;

	var controller = viz.controller;//jon
	var container = this.getLabelContainer(controller); //jon change
	
	container.innerHTML = "";
	var that = this, ctx = canvas.getContext(), GUtil = GraphUtil;
	canvas.clear();
	if(Config.drawConcentricCircles) canvas.drawConcentricCircles(Config.drawConcentricCircles);
	var T = !!aGraph.getNode(id).visited;
	GUtil.eachNode(aGraph, function(node) {
		GUtil.eachAdjacency(node, function(adj) {
			if(!!adj.nodeTo.visited === T) {
				opt.onBeforePlotLine(adj);
				ctx.save();
				ctx.globalAlpha = Math.min(Math.min(node.alpha, adj.nodeTo.alpha), adj.alpha);
				that.plotLine(adj, canvas,controller);//jon
				ctx.restore();
				opt.onAfterPlotLine(adj);
			}
		});
		ctx.save();
		ctx.globalAlpha = node.alpha;
		that.plotNode(node, canvas,controller); //jon
 		if(!that.labelsHidden && ctx.globalAlpha >= .95) that.plotLabel(canvas, node, opt);
 		else if(!that.labelsHidden && ctx.globalAlpha < .95) that.hideLabel(node);
		ctx.restore();
		node.visited = !T;
	});
};


