// Depends on JQuery for offset function
if(!console){
	var console = function(){};

	console.prototype.log = function(){};
	
}
Array.prototype.contains = function(item)
{
	return this.indexOf(item) != -1;
};

if(!Array.indexOf) {
Array.prototype.indexOf = function(item,from)
{
	if(!from)
		from = 0;
	for(var i=from; i<this.length; i++) {
		if(this[i] === item)
			return i;
	}
	return -1;
};}

// Resolve the target object of an event
function resolveTarget(e)
{
	var obj;
	if(e.target)
		obj = e.target;
	else if(e.srcElement)
		obj = e.srcElement;
	if(obj.nodeType == 3) // defeat Safari bug
		obj = obj.parentNode;
	return obj;
}

var minLon = 1000;
var maxLon = -1000;
var minLat = 1000;
var maxLat = -1000;
var EasyMap = function(divID){

	this.renderTime = 0;
	this.calculateTime= 0;
	var wrapper = document.getElementById(divID);	
	this.wrapper = wrapper;

	wrapper.style.position = "relative";
	this.mousemoveHandler = function(e,shape){
	};
	
	
	this.clickHandler = function(e,shape){
	};
	
	this._maxX = 0;
	this._maxY = 0;
	
	this.controls = {};
	var canvas = document.createElement('canvas');
	
	/*canvas.width = parseInt(wrapper.style.width);
	canvas.height = parseInt(wrapper.style.height);
	if(canvas.width == 0){
		canvas.width = 600;
		canvas.height = 400;
	}*/
	canvas.width = 600;
	canvas.height = 400;
	canvas.id = divID + "_canvas";
	canvas.style["z-index"] = -1;
	wrapper.appendChild(canvas);
	this.canvas = canvas;

	/*this.drawOnDemand = false;
	if(!canvas.getContext){
		this.drawOnDemand = true;
		G_vmlCanvasManager.init_(document); //ie hack	
	}*/
	if(!canvas.getContext) {
		G_vmlCanvasManager.initElement(canvas);
	}
	this.ctx = canvas.getContext('2d');

	this.scale = {'x':1, 'y':1};
	this.translate = {'x':0, 'y':0};
	this.rotate = {'x': 0, 'y':1.6, 'z':0};
	this.spherical = false;
	this.radius = 100;

	//this.memory = [];
	
	this.oldcolor = null;
	this.oldstrokecolor = null;

	//this.myElement = document.getElementById('myDomElement'); ??
	this.utils = EasyMapUtils;
};

EasyMap.prototype = {

	getShapeAtClick: function(e){
		if(!e) {
			e = window.event;
		}
		var target = resolveTarget(e);
		//var boundingRect = this.canvas.getBoundingClientRect();
		var offset = $('#wrapper').offset();
		x = e.clientX + window.findScrollX() - offset.left;
		y = e.clientY + window.findScrollY() - offset.top;
		var shape = this.getShapeAt(x,y,target.memory);
		return shape;
	},
	
	getShapeAt: function(x,y,shapes) {
		var hitShapes = [];
		for(var i=0; i < shapes.length; i++){
			var g = shapes[i].grid;
			if(x >= g.x1 && x <= g.x2 && y >=  g.y1 && y <=g.y2){
				hitShapes.push(shapes[i]);
			}
		}
		var res;	
		if(hitShapes.length == 1) {
			res = hitShapes[0];
		} else {
			res = this._findNeedleInHaystack(x,y,hitShapes);
		}
		//this.canvas.onmousemove = this.mousemoveHandler;
		//this.canvas.onclick = this.clickHandler;
		return res;
	},

	_findNeedleInHaystack: function(x,y,shapes){
		for(var i=0; i < shapes.length; i++){
			if(this._inPoly(x,y,shapes[i])) {
				return shapes[i];
			}
		}
		return null;
	},
                     
	/* _inPoly adapted from inpoly.c
	Copyright (c) 1995-1996 Galacticomm, Inc.  Freeware source code.
	http://www.visibone.com/inpoly/inpoly.c.txt */                        
	_inPoly: function(x,y,poly) {
		var coords = poly.transformedCoords;
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
	},
	
	_degToRad: function(deg) {
		return deg * Math.PI / 180;
	},

	drawArrowBox: function(ctx,width,angle,offset) {
		var rad = angle ? this._degToRad(angle) : 0;
		var w = width || 100;
		var r = w/2;
		var l = w/10;
		offset = {
			x: offset.x || 0,
			y: offset.y || 0
		};
		ctx.save();
		ctx.lineWidth = l;
		ctx.fillStyle = "rgba(150,150,150,0.8)";
		ctx.beginPath();
		ctx.translate(offset.x+r,offset.y+r);
		ctx.rotate(rad);
		ctx.moveTo(-r,r);
		ctx.lineTo(r,r);
		ctx.lineTo(r,-r);
		ctx.lineTo(-r,-r);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(0,-r);
		ctx.lineTo(0,r);
		ctx.moveTo(0,r);
		ctx.lineTo(-r,0);
		ctx.moveTo(0,r);
		ctx.lineTo(r,0);
		ctx.stroke();
		ctx.restore();
	},

	addControl: function(controlType) {
		var controlDiv = this.wrapper.controlDiv;
		if(!controlDiv) {
			controlDiv = document.createElement('div');
			controlDiv.style.position = "absolute";
			controlDiv.style.top = "0";
			controlDiv.style.left = "0";
			this.wrapper.appendChild(controlDiv);
			this.wrapper.controlDiv = controlDiv;
		}
		var over = function() {
			this.style.cursor='pointer';
		};
		switch(controlType) {
			case "pan":
				var panCanvas = document.createElement('canvas');
				if(!panCanvas.getContext) {
					G_vmlCanvasManager.initElement(panCanvas);
				}
				panCanvas.width = 14;
				panCanvas.height = 50;
				controlDiv.appendChild(panCanvas);
				panCanvas.memory = [];
				panCanvas.emap = this;
				var ctx = panCanvas.getContext('2d');
				var square = new Square(10,{x:2,y:2});
				this.drawArrowBox(ctx,10,180,{x:2,y:2});
				panCanvas.memory.push({
					grid:square.getGrid(),
					transformedcoords:square.sq,
					tooltip:'N'
				});
				square = new Square(10,{x:2,y:14});
				this.drawArrowBox(ctx,10,0,{x:2,y:14});
				panCanvas.memory.push({
					grid:square.getGrid(),
					transformedcoords:square.sq,
					tooltip:'S'
				});
				square = new Square(10,{x:2,y:26});
				this.drawArrowBox(ctx,10,270,{x:2,y:26});
				panCanvas.memory.push({
					grid:square.getGrid(),
					transformedcoords:square.sq,
					tooltip:'E'
				});
				square = new Square(10,{x:2,y:38});
				this.drawArrowBox(ctx,10,90,{x:2,y:38});
				panCanvas.memory.push({
					grid:square.getGrid(),
					transformedcoords:square.sq,
					tooltip:'W'
				});
				panCanvas.onclick = this.panClickHandler;
				break;
			default:
				break;
		}
		/*switch(controlType) {
			case "pan":
				var panControl = document.createElement("div");
				panControl.emap = this;
				panControl.onmouseover = over;
				panControl.onclick = this.panClickHandler;
				var panWest = document.createElement("div");
				panWest.pan = "w";
				panWest.innerHTML = "&larr;";
				panControl.appendChild(panWest);
				var panEast = document.createElement("div");
				panEast.pan = "e";
				panEast.innerHTML = "&rarr;";
				panControl.appendChild(panEast);
				var panNorth = document.createElement("div");
				panNorth.pan = "n";
				panNorth.innerHTML = "&uarr;";
				panControl.appendChild(panNorth);
				var panSouth = document.createElement("div");
				panSouth.pan = "s";
				panSouth.innerHTML = "&darr;";
				panControl.appendChild(panSouth);
				controlDiv.appendChild(panControl);
				break;
			case "zoom":
				var zoomControl = document.createElement("div");
				zoomControl.emap = this;
				zoomControl.onmouseover = over;
				zoomControl.onclick = this.zoomClickHandler;
				var zoomIn = document.createElement("div");
				zoomIn.zoom = 1;
				zoomIn.innerHTML = "+";
				zoomControl.appendChild(zoomIn);
				var zoomOut = document.createElement("div");
				zoomOut.zoom = -1;
				zoomOut.innerHTML = "-";
				zoomControl.appendChild(zoomOut);
				controlDiv.appendChild(zoomControl);
				break;
			default:
				break;
		}*/
	},
	
	panClickHandler: function(e) {
		if(!e) {
			e = window.event;
		}
		var target = resolveTarget(e);
		var emap = target.emap;
		var hit = emap.getShapeAtClick(e);
		if(!hit) {
			return false;
		}
		var pan = {
			x:0,
			y:0
		};
		switch(hit.tooltip) {
			case "W":
				pan.x = 100;
				break;
			case "E":
				pan.x = -100;
				break;
			case "N":
				pan.y = 100;
				break;
			case "S":
				pan.y = -100;
				break;
		}
		emap.pan(pan.x,pan.y);
		return false;
	},
	
	/*
	panClickHandler: function(e) {
		var emap = this.emap;
		var dir = target.pan;
		var pan = {
			x:0,
			y:0
		};
		switch(dir) {
			case "w":
				pan.x = 100;
				break;
			case "e":
				pan.x = -100;
				break;
			case "n":
				pan.y = 100;
				break;
			case "s":
				pan.y = -100;
				break;
			default:
				break;
		}
		emap.pan(pan.x,pan.y);
	},
	*/
	
	zoomClickHandler: function(e) {
		var target = e.target;
		var emap = this.emap;
		var zoom = target.zoom;
		if(zoom > 0) {
			emap.zoom(2,2);
		} else {
			emap.zoom(-2,-2);
		}
	},
	
	spin: function(x,y,z){
		this.rotate.x +=x;
		this.rotate.y +=y;
		this.rotate.z +=z;
	//	console.log(this.rotate.x,this.rotate.y,this.rotate.z);
		this.redraw();
	},
	pan: function(x,y){ //relative to centre
		
		this.translate.x += x;
		this.translate.y += y;
		this.redraw();
	},
	
	zoom: function(scaleX,scaleY){
		this.scale.x += scaleX;
		this.scale.y += scaleY;
		this.redraw();
	},
	
	transform: function(shape){
		shape.transform(this.scale, this.translate,this.rotate,this.spherical,this.radius);
		return shape;
	},

	drawShape: function(easyShape){
		var mapCanvas = this.canvas;
		var memory = mapCanvas.memory;
		easyShape.id = memory.length;
		memory[easyShape.id] = easyShape;
		easyShape = this.transform(easyShape);
		if(easyShape.shape =='polygon') this.drawPolygon(easyShape);
		else return;
		
	},

	drawPolygon: function(poly,dontDrawMe){
			
			var left = 0;
			var top = 0;
			var topright =  parseInt(this.canvas.width) + left; 
			var bottomleft = parseInt(this.canvas.height) + top;

			if(poly.grid){
				if(poly.grid.x2 < left) {
					return;}
				if(poly.grid.y2 < top) {
					return;}
				if(poly.grid.x1 > topright){
					return;
				}

				if(poly.grid.y1 > bottomleft){
					return;	
				}

			}
			
			this.ctx.fillStyle =poly.fillStyle;
			this.ctx.strokeStyle = poly.strokeStyle;
			this.ctx.beginPath();

			var x = parseFloat(poly.transformedCoords[0]);
			var y = parseFloat(poly.transformedCoords[1]);
			this.ctx.moveTo(x,y);
			for(var i=2; i < poly.transformedCoords.length-1; i+=2){
				var x = parseFloat(poly.transformedCoords[i]);
				var y = parseFloat(poly.transformedCoords[i+1]);
				this.ctx.lineTo(x,y);

				if(x>this._maxX) this._maxX = x;
				if(y>this._maxY) this._maxY = y;
			}
			//connect last to first
			this.ctx.lineTo(poly.transformedCoords[0],poly.transformedCoords[1], poly.transformedCoords[poly.transformedCoords.length-2],poly.transformedCoords[poly.transformedCoords.length-1]);
			this.ctx.closePath();
			
			if(!poly.hidden) {
				if(!poly.fill) 
				  this.ctx.stroke();
				else 
				  this.ctx.fill();
			}
	
		
	},
	
	redrawShape: function(shape){
		this.drawShape(shape);
	},
	
	redraw: function(){
		var mapCanvas = this.canvas;
		var ctx = mapCanvas.getContext('2d');
		var existingMem = mapCanvas.memory;	
		this.clear();
		/*
		if(this.spherical) {
			ctx.save();
			ctx.translate(this.translate.x,this.translate.y);
			ctx.scale(this.scale.x,this.scale.y);
			ctx.beginPath();
			//ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
			//this.ctx.arc(0,0,this.radius,0,2*Math.PI,true);
			ctx.closePath();
			ctx.fillStyle = '#42C0FB'; 
			ctx.fill();
			ctx.restore();
		}*/
		alert('going to draw '+existinMem.length+' shapes');
		for(var i=0; i < existingMem.length; i++){
			this.drawShape(existingMem[i]);
		}
		alert('drawn them!');
	},
	
	clear: function(){
		var mapCanvas = this.canvas;
		var ctx = mapCanvas.getContext('2d');
		mapCanvas.memory = [];

		this._maxX = 0;
		this._maxY = 0;
		// you could replace the next line with this.canvas.width = this.canvas.width, as that resets it (don't know what happens in G_VML though...)
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.canvas.onclick = this.clickHandler;
		this.canvas.onmousemove = this.mousemoveHandler;
		
	},
	

	
	drawFromSVG: function(file){
		var that = this;
		this.clear();
		var callback = function(status,params,responseText,url,xhr){
			
			var xml = that._getXML(responseText);
			var polys = xml.getElementsByTagName('polygon');
			for(var i=0; i < polys.length; i++)
				that.drawFromSVGElement(polys[i]);
			
		};
		this.utils.loadRemoteFile(file,callback);		
			
	},
	drawFromSVGElement: function(SVGElement){
		var s = new EasyShape(SVGElement);
		this.drawShape(s);

	},
	

	
	drawGeoJsonFeatures: function(features){
			var avg1 = 0;
			alert('going to draw '+features.length+' features');
			for(var i=0; i < features.length; i++){
				var geometry = features[i].geometry;
				if(geometry.type.toLowerCase() == 'multipolygon'){
					var coords = geometry.coordinates;
					
					for(var j=0; j< coords.length; j++){
						
						var s = new EasyShape(features[i],coords[j],this.canvas);
						this.drawShape(s);
					}

				}
				else {
					//console.log("unsupported geojson geometry type " + geometry.type);
				}
			}
			alert('drawn those features');

	},
	
	drawFromGeojson: function(geojson){
			//add a mandatory translate to make it appear in center of canvas
			var t1 = parseFloat(this.canvas.width) /2;
			var t2 = parseFloat(this.canvas.height) / 2;
			this.translate.x = t1;
			this.translate.y = t2;
			
			this.clear();

			if(geojson.type.toLowerCase() == "featurecollection"){
				var features = geojson.features;
				alert('about to call drawGeoJsonFeatures');
				this.drawGeoJsonFeatures(features);
			} else {
				console.log("only feature collections currently supported");
				return;
			}

		
	},
	drawFromGeojsonFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		
			var json = eval('(' +responseText + ')');
			alert('going to call drawFromGeoJson');
			that.drawFromGeojson(json);
			
			var t = document.getElementById(that.wrapper.id + "_statustext");
			if(t) t.innerHTML = "";
		};
		
		this.utils.loadRemoteFile(file,callback);

	}
		

};

var Square = function(width,offset) {
	width = width || 10;
	offset = offset || {x:0,y:0};
	this.sq = [
		offset.x, offset.y,
		offset.x + width, offset.y,
		offset.x + width, offset.y + width,
		offset.x, offset.y + width
	];
};

Square.prototype = {
	getGrid: function() {
		var grid = {};
		grid.x1 = this.sq[0];
		grid.y1 = this.sq[1];
		grid.x2 = this.sq[2];
		grid.y2 = this.sq[this.sq.length-1];
		return grid;
	}
};

var EasyShape = function(node,coordinates,canvas){
	this.strokeStyle = '#000000';
	this.grid = {};
	this.properties = {};
	this.fillStyle = "#000000"
	this.threshold = 1.7;
	this.width = canvas.width;
	this.origin= {'x': canvas.width/2, 'y':canvas.height/2};
	if(node){
		if(coordinates) {
			this.constructFromGeoJSON(node,coordinates,canvas);
		} else if(node.tagName == "AREA") {
			this.constructFromAreaTag(node);
		} else if(node.tagName.toLowerCase() == "polygon") {
			this.constructFromSVGPolygon(node);
		}
	}

};

EasyShape.prototype={
	
	
	constructFromSVGPolygon: function(svgpoly){
		this.shape = "polygon";
		this.coords = this._convertFromSVGCoords(svgpoly.getAttribute("points"));
		this.coords_start = this.coords;
		this.href= svgpoly.getAttribute("xlink");
	
		if(svgpoly.getAttribute("fill")) {
			this.fillStyle = svgpoly.getAttribute("fill"); 
			this.fill = true;
			//console.log(this.fillStyle);
		}
		else {
			this.fillStyle = "rgb(0,0,0)"; 
			this.fill = false;
		}
		
	},

/*multi-polygons */
	constructFromGeoJSON: function(node,coordinates,canvas){
		this.shape = "polygon";	
		
		this.coords = this._convertGeoJSONCoords(coordinates,canvas);
		this.transformedCoords = this.coords;
		this.href = "#";
		this.properties = node.properties;
		this.tooltip = node.properties.name;
		this.fill = true;
		this.fillStyle =  node.properties.colour;
		this.grid = {}; //an enclosing grid

	},
		
	constructFromAreaTag: function(node){
		this.shape = node.shape.toLowerCase();
		if(this.shape == 'poly') this.shape= "polygon";
		this.coords = this._getArrayFromString(node.coords);
		
		this.href = node.href;
		this.fill = false;
		this.fillStyle =  "rgb(0,0,0)";
	},
	_convertGeoJSONCoords: function(coords,canvas){
		var res = [];
		for(var i=0; i < coords[0].length; i++){
			// x is longitude, y is latitude
			// longitude goes from -180 (W) to 180 (E), latitude from -90 (S) to 90 (N)
			// in our data, lat goes from 90 (S) to -90 (N), so we negate
			var x = coords[0][i][0];
			var y = -coords[0][i][1];
			res.push(x);
			res.push(y);
		}
		return res;
	},
	
	_getArrayFromString: function(coords){
		var y = new Array();
		var x =coords.split(",");
		for(i in x){
			y[i] = x[i];
		}

		return y;
	},
	
	_convertFromSVGCoords: function(SVGCoordinates,canvas){
		var pointPairs = [];
		
		if(SVGCoordinates) {
			SVGCoordinates = SVGCoordinates.replace(/^\s*(.*?)\s*$/, "$1");  
			pointPairs = SVGCoordinates.split(" ");
		}

		var numPairs = pointPairs.length;
		var points = [];

		if(numPairs > 0) {

		 	var coords, numCoords;

			for(var i=0; i<numPairs; i++) {
				coords = pointPairs[i].split(",");
				numCoords = coords.length;
				if(numCoords > 1) {
					if(coords.length == 2)
						coords[2] = null;
				}
				points[points.length] = coords[0];
				points[points.length] = coords[1];
			}
		}
		return points;

	},	

	// convert degrees to radians
	_convertDegToRad: function(deg){
		return Math.PI * (deg / 180);
	},
	_spherify: function(lon,lat,rotate,radius){//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var res = {};
		if(lon>maxLon)maxLon=lon;
		if(lon<minLon)minLon=lon;
		if(lat>maxLat)maxLat=lat;
		if(lat<minLat)minLat=lat;
		
		var longitude = this._convertDegToRad(lon);
		var latitude = this._convertDegToRad(lat);
 		
 		// assume rotate values given in radians
		longitude += rotate.z;
		
		// latitude is 90-theta, where theta is the polar angle in spherical coordinates
		// cos(90-theta) = sin(theta)
		// sin(90-theta) = cos(theta)
		// to transform from spherical to cartesian, we would normally use radius*Math.cos(theta)
		//   hence in this case we use radius*Math.sin(latitude)
		// similarly longitude is phi-180, where phi is the azimuthal angle
		// cos(phi-180) = -cos(phi)
		// sin(phi-180) = -sin(phi)
		// to transform from spherical to cartesian, we would normally use radius*Math.sin(theta)*Math.cos(phi)
		//   we must exchange for theta as above, but because of the circular symmetry
		//   it does not matter whether we multiply by sin or cos of longitude
		yPos = (radius) * Math.sin(latitude);
		xPos = (radius) * Math.cos(latitude) * Math.sin(longitude);

		res.x = xPos;
		res.y = yPos;
		res.latitude = latitude;
		res.longitude = longitude;
		return res;
	},

	transform: function(scaling, translation,rotate,spherical,radius){
		var performScale = true;
		var performTranslate = true; 
		var performRotate = false;
		
		if(scaling.x == 1 && scaling.y == 1) {
			performScale = false;
		}
		if(translation.x == 0 && translation.y == 0) {
			performTranslate = false;
		}
		if(rotate) {
			performRotate = true;
		}
		
		this.longitudes = [];
		this.latitudes = [];
		this.transformedCoords = [];

		this.grid.x1 = 2000;
		this.grid.y1 = 2000;
		this.grid.x2 = 0;
		this.grid.y2 = 0;
		
		var lastX, lastY;
		var index = 0;
		var coordOK;
		for(var i=0; i < this.coords.length-1; i+=2){
			coordOK= true;
			var lon = parseFloat(this.coords[i]);
			var lat = parseFloat(this.coords[i+1]);
			var xPos, yPos;

			if(spherical){
				/* JRL - I'm not entirely sure these two lines make sense - x is in radians, radius is in metres?
				x -= radius;
				y -= radius;*/
				var t = this._spherify(lon,lat,rotate,radius);
				xPos = t.x;
				yPos = t.y;
				this.latitudes[i] = t.latitude;
				this.longitudes[i] = t.longitude;
			} else {
				xPos = lon;
				yPos = lat;
			}
			/* JRL - removing rotations about the z axis for now (it says y below, but should be z)
			if(performRotate){
				if(rotate.y){
					u = x ;
					v = y ;
					x =  (u * Math.cos(rotate.y)) - (v * Math.sin(rotate.y));
					y = (v * Math.cos(rotate.y)) + (u * Math.sin(rotate.y));
				}
			}*/
			if(performScale){
				xPos *= scaling.x;
				yPos *= scaling.y;
			}
			if(performTranslate){
				xPos = xPos + parseFloat(translation.x);
				yPos = yPos + parseFloat(translation.y);
			}

			if(xPos < this.grid.x1) this.grid.x1 = xPos;
			if(yPos < this.grid.y1) this.grid.y1 = yPos;	
			if(xPos > this.grid.x2) this.grid.x2 = xPos;
			if(yPos > this.grid.y2) this.grid.y2 = yPos;

			if(index > 0){
				var l = (xPos-lastX)*(xPos-lastX) + (yPos-lastY) * (yPos-lastY);
			} else {
				l = this.threshold*this.threshold;
			}
			if(l < this.threshold*this.threshold) {
				coordOK = false;
			}
			if(coordOK){ //draw
				this.transformedCoords.push(xPos);
				this.transformedCoords.push(yPos);
				index+=2;
				lastX = xPos; lastY = yPos;
			}
		}

		// JRL - is this line needed? why 3 coords?
		if(this.transformedCoords.length < 3) this.transformedCoords = [0,0,0];
	}
};

var EasyMapUtils = {
	loadRemoteFile: function(url,callback,params)
	{
		return EasyMapUtils._httpReq("GET",url,callback,params,null,null,null,null,null,true);
	},

	_httpReq: function (type,url,callback,params,headers,data,contentType,username,password,allowCache)
	{
		//# Get an xhr object
		var x = null;
		try {
			x = new XMLHttpRequest(); //# Modern
		} catch(ex) {
			try {
				x = new ActiveXObject("Msxml2.XMLHTTP"); //# IE 6
			} catch(ex2) {
			}
		}
		if(!x)
			return "Can't create XMLHttpRequest object";
		//# Install callback
		x.onreadystatechange = function() {
			try {
				var status = x.status;
			} catch(ex) {
				status = false;
			}
			if(x.readyState == 4 && callback && (status !== undefined)) {
				if([0, 200, 201, 204, 207].contains(status))
					callback(true,params,x.responseText,url,x);
				else
					callback(false,params,null,url,x);
				x.onreadystatechange = function(){};
				x = null;
			}
		};
		//# Send request
		if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
			window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		try {
			if(!allowCache)
				url = url + (url.indexOf("?") < 0 ? "?" : "&") + "nocache=" + Math.random();
			x.open(type,url,true,username,password);
			if(data)
				x.setRequestHeader("Content-Type", contentType || "application/x-www-form-urlencoded");
			if(x.overrideMimeType)
				x.setRequestHeader("Connection", "close");
			if(headers) {
				for(var n in headers)
					x.setRequestHeader(n,headers[n]);
			}
		//	x.setRequestHeader("X-Requested-With", "TiddlyWiki " + formatVersion());
			x.send(data);
		} catch(ex) {
			//console.log(ex);
			return ex;
		}
		return x;
	},
	
	_getXML:function(str) {
		if(!str)
			return null;
		var errorMsg;
		try {
			var doc = new ActiveXObject("Microsoft.XMLDOM");
			doc.async="false";
			doc.loadXML(str);
		}
		catch(e) {
			try {
				var parser=  new DOMParser();
				var doc = parser.parseFromString(str,"text/xml");
			}
			catch(e) {
				return e.message;
			}
		}

		return doc;	
	}
};