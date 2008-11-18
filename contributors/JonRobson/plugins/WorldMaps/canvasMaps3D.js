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

if(!window.console) {
	console = {log:function(message) {document.getElementById('consolelogger').innerHTML += message+"<<] ";}};
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

function resolveTargetWithMemory(target)
{
	while(target && !target.memory) {
		target = target.parentNode;
		console.log('->'+target.nodeName);
	}
	return target;
}

var minLon = 1000;
var maxLon = -1000;
var minLat = 1000;
var maxLat = -1000;


var EasyMapController = function(targetjs,elemid){
	this.wrapper = elemid; //a dom element to detect mouse actions
	this.targetjs = targetjs; //a js object to run actions on (with pan and zoom functions)	
	this.utils = new EasyMapUtils(this.wrapper); //some utilities that it may find useful
	
	var controlDiv = this.wrapper.controlDiv;
	if(!controlDiv) {
		controlDiv = document.createElement('div');
		controlDiv.style.position = "absolute";
		controlDiv.style.top = "0";
		controlDiv.style.left = "0";
		this.wrapper.appendChild(controlDiv);
		this.wrapper.controlDiv = controlDiv;
	}
	this.transformation = {'translate':{x:0,y:0}, 'scale': {x:1, y:1}};	
	//looks for specifically named functions in targetjs
	if(!this.targetjs.transform) alert("no transform function defined in " + targetjs+"!");
};

EasyMapController.prototype = {

	drawButtonLabel: function(ctx,r,type){
		ctx.beginPath();
		if(type == 'arrow'){
			ctx.moveTo(0,-r);
			ctx.lineTo(0,r);
			ctx.moveTo(0,r);
			ctx.lineTo(-r,0);
			ctx.moveTo(0,r);
			ctx.lineTo(r,0);
		}
		else if(type == 'plus'){
			ctx.moveTo(-r,0);
			ctx.lineTo(r,0);
			ctx.moveTo(0,-r);
			ctx.lineTo(0,r);
		}
		else if(type == 'minus'){
			ctx.moveTo(-r,0);
			ctx.lineTo(r,0);

		}
		ctx.stroke();
		ctx.closePath();
		
	},
	
	drawButton: function(canvas,width,angle,offset,properties) {
		var ctx = canvas.getContext('2d');
		var rad = angle ? this.utils._degToRad(angle) : 0;
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
		this.drawButtonLabel(ctx,r,properties.buttonType);
		ctx.restore();
		
		var button = new EasySquare(properties,10,{x:offset.x,y:offset.y});
		return button;
	},
	
	addControl: function(controlType) {
		var controlDiv = this.wrapper.controlDiv;
		switch(controlType) {
			//case "zoom":
			case "pan":
				this.addPanningActions(controlDiv);
				break;
			case "zoom":
				this.addZoomingActions(controlDiv);
			default:
				break;
		}
	
	},

	_createcontrollercanvas: function(width,height){
		var panCanvas = document.createElement('canvas');
		panCanvas.width = width;
		panCanvas.height = height;
		panCanvas.style.position = "absolute";
		panCanvas.id = Math.random();
		this.wrapper.controlDiv.appendChild(panCanvas);
		panCanvas.memory = [];
		panCanvas.emap = this;
		if(!panCanvas.getContext) {
			G_vmlCanvasManager.init_(document);
		}
		return panCanvas;
	},
	
	addPanningActions: function(){
		var panCanvas = this._createcontrollercanvas(44,64);
		panCanvas.memory.push(this.drawButton(panCanvas,10,180,{x:16,y:2},{'actiontype':'N','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,0,{x:16,y:30},{'actiontype':'S','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,270,{x:30,y:16},{'actiontype':'E','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,90,{x:2,y:16},{'actiontype':'W','buttonType': 'arrow'}));
		
		//panCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:50},{'actiontype':'in','buttonType': 'plus'}));		
		//panCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:62},{'actiontype':'out','buttonType': 'minus'}));
		panCanvas.onclick = this.clickHandler;		

	},
	
	addZoomingActions: function(){
		var zoomCanvas = this._createcontrollercanvas(20,30);
		var left = parseInt(this.wrapper.style.width) - 20;

		zoomCanvas.style.left = left;
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:2},{'actiontype':'in','buttonType': 'plus'}));		
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:12},{'actiontype':'out','buttonType': 'minus'}));
		zoomCanvas.onclick = this.clickHandler;	
	},
	
	clickHandler: function(e) {
		if(!e) {
			e = window.event;
		}
		var emap = this.emap;
		var hit = emap.utils.getShapeAtClick(e);
		if(!hit) {
			return false;
		}

		if(hit.properties.action){
			action(x,y);
		}
		
		switch(hit.properties.actiontype) {
			case "W":
				emap.transformation.translate.x += 5;
				break;
			case "E":
				emap.transformation.translate.x -= 5;
				break;
			case "N":
				emap.transformation.translate.y += 5;
				break;
			case "S":
				emap.transformation.translate.y -= 5;
				break;
			case "in":
				emap.transformation.scale.x += 1;
				emap.transformation.scale.y += 1;
				break;
			case "out":
				emap.transformation.scale.x -= 1;
				emap.transformation.scale.y -= 1;
				
				if(emap.transformation.scale.x <= 0) emap.transformation.scale.x = 1;
				if(emap.transformation.scale.y <= 0) emap.transformation.scale.y = 1;				
				break;
		}

		emap.targetjs.transform(emap.transformation);
		//emap.targetjs.zoom(zoom.x,zoom.y);
		//emap.targetjs.pan(pan.x,pan.y)

		return false;
	}

};

var EasyMap = function(divID){

	this.renderTime = 0;
	this.calculateTime= 0;
	var wrapper = document.getElementById(divID);	
	this.wrapper = wrapper;
	this.controller = new EasyMapController(this,wrapper);
	wrapper.style.position = "relative";
	this.mousemoveHandler = function(e,shape){
	};
	
	this.clickHandler = function(e,shape){
	};
	
	this._maxX = 0;
	this._maxY = 0;
	
	this.controls = {};
	var canvas = document.createElement('canvas');
	
	canvas.width = parseInt(wrapper.style.width) || 600;
	canvas.height = parseInt(wrapper.style.height) || 400;
	this.center = {};
	this.center.x = parseFloat(canvas.width) /2;
	this.center.y = parseFloat(canvas.height) / 2;
	
	canvas.id = divID + "_canvas";
	canvas.style["z-index"] = -1;
	wrapper.appendChild(canvas);
	this.canvas = canvas;

	if(!canvas.getContext) {
		G_vmlCanvasManager.init_(document);
	}
	this.ctx = canvas.getContext('2d');

	this.transformation ={'scale':{x:1,y:1}, 'translate':{x:0,y:0}};
	this.additionaltransformation ={'scale':{x:1,y:1}, 'translate':{x:0,y:0}};

	this.rotate = {'x': 0, 'y':1.6, 'z':0};
	this.spherical = false; //experimental!! fiddle with at your own risk! :)
	this.radius = 100;
	this.oldcolor = null;
	this.oldstrokecolor = null;

	this.utils = new EasyMapUtils(this.wrapper);
};

EasyMap.prototype = {

	
	addControl: function(controlType) {
		this.controller.addControl(controlType);
	},


	spin: function(x,y,z){
		this.rotate.x +=x;
		this.rotate.y +=y;
		this.rotate.z +=z;
		this.redraw();
	},
	
	transform: function(transformation){
		this.transformation = transformation;
		this.redraw();
	},

	drawShape: function(easyShape){
		var mapCanvas = this.canvas;
		var memory = mapCanvas.memory;
		easyShape.id = memory.length;
		memory[easyShape.id] = easyShape;
		easyShape.transform(this.transformation,this.rotate,this.spherical,this.radius);
		if(easyShape.shape =='polygon') this.drawPolygon(easyShape);
		else {console.log("no idea how to draw");return;}
		
	},

	drawPolygon: function(poly){ //is this really a drawPolygon or a drawLines
			
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

			var initialX = x;
			var initialY =y;
			this.ctx.moveTo(x,y);
			for(var i=2; i < poly.transformedCoords.length-1; i+=2){
				var x = parseFloat(poly.transformedCoords[i]);
				var y = parseFloat(poly.transformedCoords[i+1]);
				
				this.ctx.lineTo(x,y);

				if(x>this._maxX) this._maxX = x;
				if(y>this._maxY) this._maxY = y;
			}
			//connect last to first
			this.ctx.lineTo(initialX,initialY, x,y);
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
		if(existingMem){		
			for(var i=0; i < existingMem.length; i++){
				this.drawShape(existingMem[i]);
			}
		}
	},
	
	clear: function(){
		var mapCanvas = this.canvas;
		this.canvas.onclick = this.clickHandler;
		var ctx = mapCanvas.getContext('2d');
		mapCanvas.memory = [];

		this._maxX = 0;
		this._maxY = 0;
		// you could replace the next line with this.canvas.width = this.canvas.width, as that resets it (don't know what happens in G_VML though...)
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		


		
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
		var s = new EasyShape(SVGElement,null,"svg");
		this.drawShape(s);

	},
	
	_drawGeoJsonMultiPolygonFeature: function(coordinates,properties){
		var prop = properties;
		var coords = coordinates;
		
		for(var j=0; j< coords.length; j++){//identify and create each polygon	
			this._drawGeoJsonPolygonFeature(coords[j],prop);
		}
		
	},
	
	_drawGeoJsonPolygonFeature: function(coordinates,properties){
		var p = properties;
		p.shape = 'polygon';
		var s = new EasyShape(p,coordinates,"geojson");
		this.drawShape(s);
		
		//coordinates outerring, inner ring1, inner ring 2 etc..
	},
	
	
	_drawGeoJsonPointFeature: function(coordinates,properties){
		var p = properties;
		p.shape = 'point';
		p.fillStyle ="#000000";
		p.fill = true;
		console.log("drawing point");
		var s = new EasyShape(p,coordinates,"geojson");
		this.drawShape(s);
	},
	
	_drawGeoJsonFeature: function(feature){
			var geometry = feature.geometry;
			var type =geometry.type.toLowerCase();
			var p = feature.properties;
			p.center = {};
			p.center.x = this.center.x;
			p.center.y = this.center.y;
			
			if(type == 'multipolygon'){
				this._drawGeoJsonMultiPolygonFeature(feature.geometry.coordinates,p);
			}
			else if(type == 'polygon'){
				this._drawGeoJsonPolygonFeature(feature.geometry.coordinates,p);
			}
			else if(type == 'point'){
				this._drawGeoJsonPointFeature(feature.geometry.coordinates,p);				
			}
			else {	
				console.log("unsupported geojson geometry type " + geometry.type);
			}
	},
	_drawGeoJsonFeatures: function(features){
			var avg1 = 0;
			for(var i=0; i < features.length; i++){
				this._drawGeoJsonFeature(features[i]);
			}

	},
	
	drawFromGeojson: function(responseText){
			var geojson = eval('(' +responseText + ')');
			this.clear();

			var type =geojson.type.toLowerCase();
			if(type == "featurecollection"){
				var features = geojson.features;
				this._drawGeoJsonFeatures(features);
			} 
			else if(type =='feature'){
				this._drawGeoJsonFeature(geojson);
			}
			else {
				console.log("only feature collections currently supported");
				return;
			}
	},
	
	drawFromGeojsonFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		
			that.drawFromGeojson(responseText);
			
			var t = document.getElementById(that.wrapper.id + "_statustext");
			if(t) t.innerHTML = "";
		};
		this.utils.loadRemoteFile(file,callback);
	}
};

var EasySquare = function(properties,width,offset) {
	width = width || 10;
	offset = offset || {x:0,y:0};
	var coords = [
		offset.x, offset.y,
		offset.x + width, offset.y,
		offset.x + width, offset.y + width,
		offset.x, offset.y + width
	];
	var s = new EasyShape(properties,coords);
	s.grid.x1 = s.coords[0];
	s.grid.y1 = s.coords[1];
	s.grid.x2 = s.coords[2];
	s.grid.y2 = s.coords[s.coords.length-1];
	return s;
};

var EasyShape = function(element,coordinates,sourceType){
	this.strokeStyle = '#000000';
	this.grid = {};
	this.properties = {};
	this.fillStyle = "#000000"
	this.threshold = 1.7;

	if(sourceType){
		if(sourceType == 'geojson') {
			this.constructFromGeoJSONObject(element,coordinates);
		} else if(sourceType == "svg") {
			this.constructFromSVGPolygon(element);
		}
	}
	else{
		this.constructBasicPolygon(element,coordinates);
	}

};


EasyShape.prototype={
	constructFromGeoJSONObject: function(element,coordinates){
		if(element.shape == 'polygon'){
			this.constructFromGeoJSONPolygon(element,coordinates);	
		}
		else if(element.shape == 'point'){
			var x = coordinates[0]; var y = coordinates[1];
			var ps = 5;
			var newcoords =[x-ps,y-ps,x+ps,y-ps,x+ps,y+ps,x-ps, y+ps];
			console.log(newcoords);
			this.constructBasicPolygon(element,newcoords);	
		}
		else
			console.log("don't know what to do with shape " + element.shape);
	},
	constructBasicPolygon: function(properties, coordinates){
		this.coords = coordinates;
		this.shape = "polygon";
		this.transformedCoords = this.coords;
		//this.href = "#";
		this.properties = properties
		this.fill = true;
		if(this.properties.colour)
			this.fillStyle =  this.properties.colour;
		this.grid = {}; //an enclosing grid
	},
	constructFromSVGPolygon: function(svgpoly){
		this.shape = "polygon";
		this.coords = this._convertFromSVGCoords(svgpoly.getAttribute("points"));
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

	
	constructFromGeoJSONPolygon: function(properties,coordinates){		
		var newcoords = this._convertGeoJSONCoords(coordinates);
		this.constructBasicPolygon(properties,newcoords);
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
	
	_convertFromSVGCoords: function(SVGCoordinates){
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
		return res;
	},

	transform: function(transformation,rotate,spherical,radius){
	
		
		var performScale = true;
		var performTranslate = true; 
		var performRotate = false;
		
		var scaling = transformation.scale;
		var translation = transformation.translate;
		if(scaling.x == 1 && scaling.y == 1) {
			performScale = false;
		}
		if(translation.x == 0 && translation.y == 0) {
			performTranslate = false;
		}
		if(rotate) {
			performRotate = true;
		}
		
			if(this.properties.static) {
				performRotate = false; performTranslate = false; performScale = false;
			}

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
			} else {
				xPos = lon;
				yPos = lat;
			}
			//console.log("before",xPos,yPos);
			

						//console.log("after",xPos,yPos);
			/* JRL - removing rotations about the z axis for now (it says y below, but should be z)
			if(performRotate){
				if(rotate.y){
					u = x ;
					v = y ;
					x =  (u * Math.cos(rotate.y)) - (v * Math.sin(rotate.y));
					y = (v * Math.cos(rotate.y)) + (u * Math.sin(rotate.y));
				}
			}*/

			
			if(performTranslate){
				xPos = xPos + parseFloat(translation.x);
				yPos = yPos + parseFloat(translation.y);
			}
			

			
			
			if(performScale){
				xPos *= scaling.x;
				yPos *= scaling.y;
			}

			//last but not least center if required
			if(this.properties.center){
				xPos += this.properties.center.x;
				yPos += this.properties.center.y;
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

		// JRL - is this line needed? why 3 coords? -
		//JDLR says.. a polygon must have at least 3 coordinates. It's just preventing any invalid polygons from being added
		if(this.transformedCoords.length < 3) this.transformedCoords = [0,0,0];
	}
};

var EasyMapUtils = function(wrapper){
	this.wrapper = wrapper;
};
EasyMapUtils.prototype = {
	_testCanvas: function(ctx){
	ctx.beginPath();
	ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
	ctx.moveTo(110,75);
	ctx.arc(75,75,35,0,Math.PI,false);   // Mouth (clockwise)
	ctx.moveTo(65,65);
	ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
	ctx.moveTo(95,65);
	ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
	ctx.stroke();

	},
	
	_degToRad: function(deg) {
		return deg * Math.PI / 180;
	},
	getShapeAtClick: function(e){
		if(!e) {
			e = window.event;
		}
		var target = resolveTarget(e);
		var memoryTarget = resolveTargetWithMemory(target);
		var memory = memoryTarget.memory;
		console.log("memory length: "+memory.length);
		var id ="#"+this.wrapper.id;
		
		var offset = $(id).offset();
		
		x = e.clientX + window.findScrollX() - offset.left;
		y = e.clientY + window.findScrollY() - offset.top;
		console.log("offset.left: "+offset.left);
		console.log("e.ClientX: "+e.clientX);
		console.log("window.findScrollX(): "+window.findScrollX());
		console.log("offset.top: "+offset.top);
		console.log("e.ClientY: "+e.clientY);
		console.log("window.findScrollY(): "+window.findScrollY());
		console.log("x going in is "+x);
		console.log("y going in is "+y);
		
		//counter any positioning
		if(memoryTarget.style.left) x -= parseInt(memoryTarget.style.left);
		if(memoryTarget.style.top) y -= parseInt(memoryTarget.style.top);
		
		if(memory){
			var shape = this.getShapeAt(x,y,memory);
			return shape;}
		else{
			console.log("no shapes in memory");
			//return false;
		}
	},
	
	getShapeAt: function(x,y,shapes) {
		console.log('x that has come in is: '+x);
		console.log('y that has come in is: '+y);
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
	
	loadRemoteFile: function(url,callback,params)
	{
		return this._httpReq("GET",url,callback,params,null,null,null,null,null,true);
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