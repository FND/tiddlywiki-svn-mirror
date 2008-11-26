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
	console = {
		log:function(message) {
			var d = document.getElementById('consolelogger');
			if(d) {
				d.innerHTML += message+"<<] ";
			}
		}
	};
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
	};
}

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

function resolveTargetWithMemory(e)
{
	var node = resolveTarget(e);
	while(node && !node.memory)
		node = node.parentNode;
	return node;
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
	setTransformation: function(t){
		if(!t.scale && !t.translate) alert("bad transformation applied");
		this.transformation = t;
		this.targetjs.transform(t);
	},
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
		var newCanvas = document.createElement('canvas');
		newCanvas.width = width;
		newCanvas.height = height;
		newCanvas.style.position = "absolute";
		newCanvas.style.left = 0;
		newCanvas.style.top = 0;
		//this.wrapper.controlDiv.appendChild(newCanvas);
		this.wrapper.appendChild(newCanvas);
		newCanvas.memory = [];
		newCanvas.emap = this;
		if(!newCanvas.getContext) {
			G_vmlCanvasManager.init_(document);
		}
		return newCanvas;
	},
	addPanningActions: function(){
		var panCanvas = this._createcontrollercanvas(44,64);
		
		panCanvas.memory.push(this.drawButton(panCanvas,10,180,{x:16,y:2},{'actiontype':'N','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,270,{x:30,y:16},{'actiontype':'E','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,90,{x:2,y:16},{'actiontype':'W','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,0,{x:16,y:30},{'actiontype':'S','buttonType': 'arrow'}));
				
		panCanvas.onclick = this.clickHandler;		

	},	
	addZoomingActions: function(){
		var zoomCanvas = this._createcontrollercanvas(20,30);

		var left = 14;
		var top = 50;

		//var left = parseInt(this.targetjs.canvas.width,10) - 20 + "px";


		zoomCanvas.style.left = left +"px";
		zoomCanvas.style.top = top + "px";
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:2},{'actiontype':'in','buttonType': 'plus'}));		
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:16},{'actiontype':'out','buttonType': 'minus'}));
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
		/*console.log("hit!");
		console.log(hit);
		for(var n in hit.properties) {
			console.log(n+": "+hit.properties[n]);
		}*/
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
				emap.transformation.scale.x *= 2;
				emap.transformation.scale.y *= 2;
				break;
			case "out":
				emap.transformation.scale.x /= 2;
				emap.transformation.scale.y /= 2;
				
				if(emap.transformation.scale.x <= 0) emap.transformation.scale.x = 1;
				if(emap.transformation.scale.y <= 0) emap.transformation.scale.y = 1;				
				break;
		}

		emap.targetjs.transform(emap.transformation);

		return false;
	}
};
/*
A package for rendering geojsons easily
*/
var EasyMap = function(wrapper){
	this.renderTime = 0;
	this.calculateTime= 0;
	
	var wrapper;
	if(typeof wrapper == 'string')
		wrapper = document.getElementById(wrapper);
	else
		wrapper = wrapper;
		
		
	this.wrapper = wrapper;
	wrapper.style.position = "relative";
	this.mousemoveHandler = function(e,shape){};
	this.clickHandler = function(e,shape){};	
	this._maxX = 0;
	this._maxY = 0;	
	var canvas = document.createElement('canvas');
	canvas.width = parseInt(wrapper.style.width) || 600;
	canvas.height = parseInt(wrapper.style.height) || 400;
	//canvas.id = divID + "_canvas";
	//canvas.id = "canvas_" + Math.random();
	canvas.style["z-index"] = -1;
	wrapper.appendChild(canvas);
	this.canvas = canvas;

	if(!canvas.getContext) {
		G_vmlCanvasManager.init_(document);
	}
	this.ctx = canvas.getContext('2d');

	this.rotate = {'x': 0, 'y':1.6, 'z':0}; //not used yet
	this.spherical = false; //experimental!! fiddle with at your own risk! :)
	this.radius = 100; //not used yet

	this.utils = new EasyMapUtils(this.wrapper);
	
	this.controller = new EasyMapController(this,wrapper);
	this.transform(this.controller.transformation); //set initial transformation
};
EasyMap.prototype = {	
	addControl: function(controlType) {
		this.controller.addControl(controlType);
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
	drawFromGeojson: function(responseText){

			var geojson;
			if(typeof responseText == 'string'){
				geojson = eval('(' +responseText + ')');
				//console.log("eval done: ",geojson);
			}
			else
				geojson = responseText;
			
			geojson = this.utils.fitgeojsontocanvas(geojson,this.canvas);
			this.clear();
			// NB: removing this statustext node so it doesn't mess up offsets in IE
			// this problem needs to be fixed so that we're either not adding div's in
			// places where they shouldn't be, or so they don't affect things
			var t = document.getElementById(this.wrapper.id + "_statustext");
			if(t) {
				t.parentNode.removeChild(t);	
			}
			var type =geojson.type.toLowerCase();

			if(geojson.transform){
				this.controller.setTransformation(geojson.transform);		
			}
		

			if(type == "featurecollection"){
				var features = geojson.features;
				this._drawGeoJsonFeatures(features);
			}  else if(type =='feature') {
				this._drawGeoJsonFeature(geojson);
			} else {
				console.log("only feature collections currently supported");
			}
			this._renderShapes();
	},
	drawFromGeojsonFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		
			that.drawFromGeojson(responseText);
		};
		this.utils.loadRemoteFile(file,callback);
	},	
	drawFromSVG: function(representation){
		this.clear();
		var xml = this.utils._getXML(representation);

		var json = this.utils.convertSVGToMultiPolygonFeatureCollection(xml,this.canvas);
		this.drawFromGeojson(json);			
		
	},
	drawFromSVGFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
			

			that.drawFromSVG(responseText);
			
		};
		this.utils.loadRemoteFile(file,callback);		
			
	},	
	redraw: function(){

		var mapCanvas = this.canvas;
		var ctx = mapCanvas.getContext('2d');
		var existingMem = mapCanvas.memory;	
		this.clear();

		if(existingMem){		
			for(var i=0; i < existingMem.length; i++){
				this._buildShapeInMemory(existingMem[i]);
			}
			this._renderShapes();			
							
		}
	},	
	transform: function(transformation){
		this.transformation = transformation;
		//set origin
		var w =parseInt(this.canvas.width);
		var h = parseInt(this.canvas.height);
		
		if(!transformation.origin){
			this.transformation.origin = {};
			var origin = this.transformation.origin;
			origin.x =w / 2;
			origin.y =h / 2;
		}

		this.redraw();
	},
	_buildShapeInMemory: function(easyShape){ //add shape to memory
		var mapCanvas = this.canvas;
		var memory = mapCanvas.memory;
		easyShape.id = memory.length;
		memory[easyShape.id] = easyShape;
		easyShape.transform(this.transformation,this.rotate,this.spherical,this.radius);	
	},
	_renderShapes: function(){
		var mem =this.canvas.memory;
		//var ctx = this.ctx;
		//ctx.save();
		//ctx.translate(this.center.x,this.center.y);
		for(var i=0; i < mem.length; i++){
			this._renderShape(mem[i]);
		}
		//ctx.restore();
	},
	_renderShape: function(shape){ //is this really a drawPolygon or a drawLines
		if(shape.shape !='polygon') {console.log("no idea how to draw");return;}		
			var left = 0;
			var top = 0;
			var topright =  parseInt(this.canvas.width) + left; 
			var bottomleft = parseInt(this.canvas.height) + top;

			if(shape.grid){
				if(shape.grid.x2 < left) {
					return;}
				if(shape.grid.y2 < top) {
					return;}
				if(shape.grid.x1 > topright){
					return;
				}

				if(shape.grid.y1 > bottomleft){
					return;	
				}

			}

			if(shape.isSubjectToThreshold) console.log(shape.transformedCoords);
			this.ctx.fillStyle =shape.fillStyle;
			this.ctx.strokeStyle = shape.strokeStyle;
			this.ctx.beginPath();

			var x = parseFloat(shape.transformedCoords[0]);
			var y = parseFloat(shape.transformedCoords[1]);

			var initialX = x;
			var initialY =y;
			this.ctx.moveTo(x,y);
			for(var i=2; i < shape.transformedCoords.length-1; i+=2){
				var x = parseFloat(shape.transformedCoords[i]);
				var y = parseFloat(shape.transformedCoords[i+1]);
				
				this.ctx.lineTo(x,y);

				if(x>this._maxX) this._maxX = x;
				if(y>this._maxY) this._maxY = y;
			}
			//connect last to first
			this.ctx.lineTo(initialX,initialY, x,y);
			this.ctx.closePath();
			
			if(!shape.hidden) {
				if(!shape.fill) 
				  this.ctx.stroke();
				else 
				  this.ctx.fill();
			}
	
		
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
		this._buildShapeInMemory(s);
	},
	_drawGeoJsonPointFeature: function(coordinates,properties){
		var p = properties;
		p.shape = 'point';
		p.fill = true;

		var s = new EasyShape(p,coordinates,"geojson");
		this._buildShapeInMemory(s);
	},	
	_drawGeoJsonFeature: function(feature){
			var geometry = feature.geometry;
			var type =geometry.type.toLowerCase();
			var p = feature.properties;
			//p.center = {};
			//p.center.x = this.center.x;
			//p.center.y = this.center.y;
			
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

	}
};
/*temporary entry point into EasyShape until EasyShape code is cleaned up*/
var EasySquare = function(properties,width,offset) {
	width = width || 10;
	offset = offset || {x:0,y:0};
	var coords = [
		offset.x, offset.y,
		offset.x + width, offset.y,
		offset.x + width, offset.y + width,
		offset.x, offset.y + width
	];
	//var s = new EasyShape(properties,coords);
	var s ={};
	s.properties = properties;
	s.coords = coords;
	s.grid = {x1: coords[0], y1: coords[1], x2: coords[2],y2: coords[3]};
	s.grid.x1 = s.coords[0];
	s.grid.y1 = s.coords[1];
	s.grid.x2 = s.coords[2];
	s.grid.y2 = s.coords[s.coords.length-1];
	return s;
};
/*
Basic Shape structure used in package
*/
var EasyShape = function(element,coordinates,sourceType){
	this.strokeStyle = '#000000';
	this.grid = {};
	this.properties = {};
	this.fillStyle = "#000000"
	this.threshold = 2;

	if(sourceType){
		if(sourceType == "geojson") {
			this.constructFromGeoJSONObject(element,coordinates);
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
			var ps = 0.5;
			var newcoords =[[x-ps,y-ps],[x+ps,y-ps],[x+ps,y+ps],[x-ps, y+ps]];
			newcoords = this._convertGeoJSONCoords(newcoords);
			element.notSubjectToThreshold = true;
			if(!element.fillStyle) element.fillStyle ="#000000";
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
			
		if(typeof this.properties.fill == 'boolean'){	
			this.fill = this.properties.fill;
		}
		this.grid = {}; //an enclosing grid
	},	
	constructFromGeoJSONPolygon: function(properties,coordinates){		
		var newcoords = this._convertGeoJSONCoords(coordinates[0]);
		this.constructBasicPolygon(properties,newcoords);
				//we ignore any holes in the polygon (for time being.. coords[1][0..n], coords[2][0..n])
	},	
	_convertGeoJSONCoords: function(coords){

		var res = [];
		if(!coords) return res;
		for(var i=0; i < coords.length; i++){
			// x is longitude, y is latitude
			// longitude goes from -180 (W) to 180 (E), latitude from -90 (S) to 90 (N)
			// in our data, lat goes from 90 (S) to -90 (N), so we negate
			var x = coords[i][0];
			var y = - coords[i][1];
			res.push(x);
			res.push(y);
		}

		return res;
	},	
	_spherify: function(lon,lat,rotate,radius){//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var utils = new EasyMapUtils("");
		var res = {};
		if(lon>maxLon)maxLon=lon;
		if(lon<minLon)minLon=lon;
		if(lat>maxLat)maxLat=lat;
		if(lat<minLat)minLat=lat;
		
		var longitude = utils._degToRad(lon);
		var latitude = utils._degToRad(lat);
 		
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
			if(transformation.origin){
				
			xPos += transformation.origin.x;
			yPos +=transformation.origin.y;
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

	}
};
/*
Some common utils used throughout package 
*/
var EasyMapUtils = function(wrapper){
	this.wrapper = wrapper;
};
EasyMapUtils.prototype = {
	fitgeojsontocanvas: function(json,canvas){
		var view ={};
		var f =json.features;
		for(var i=0; i < f.length; i++){
			var c = f[i].geometry.coordinates;
											
			for(var j=0; j < c.length; j++ ){
				for(var k=0; k < c[j].length; k++){
					

					for(var l=0; l < c[j][k].length;l++){
						
		
						var x =c[j][k][l][0];
						var y = c[j][k][l][1];
						if(!view.x1 || x <view.x1) {
							view.x1 = x;
						}
						else if(!view.x2 || x >view.x2) {
							view.x2 = x;
						}
						
						if(!view.y1 || y <view.y1) {
							view.y1 = y;
						}
						else if(!view.y2 || y >view.y2) {
							view.y2 = y;
						}
						

					}
						
				}
				
			}
		}
		if(!json.transform) json.transform ={};
		if(!json.transform.scale) json.transform.scale = {};
		if(!json.transform.translate) json.transform.translate = {};
		var canvasx =		parseFloat(canvas.width);
		var canvasy =parseFloat(canvas.height);
		view.center = {};
		view.width = (view.x2 - view.x1);
		view.height = (view.y2 - view.y1)
		view.center.x = view.x2 - (view.width/2);
		view.center.y = view.y2 - (view.height/2);
		console.log(view.center.y, view.height);
		var scale = 1,temp;
		var tempx = parseFloat(canvasx/view.width);
		var tempy = parseFloat(canvasy/view.height);

		if(tempx < tempy) temp = tempx; else temp = tempy;
		json.transform.scale.x = temp;
		json.transform.scale.y = temp;


		
		json.transform.translate.x = -view.center.x;
		json.transform.translate.y = view.center.y;//view.center.y;	
		return json;
	},
	convertSVGToMultiPolygonFeatureCollection: function(xml,canvas){			
		var svgu = new EasyMapSVGUtils();
		var res = new Object();
		res.type = "FeatureCollection";
		res.features = [];

		var objs = xml.getElementsByTagName("svg:polygon");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPolygonElements(objs));
		objs = xml.getElementsByTagName("polygon");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPolygonElements(objs));
		objs =xml.getElementsByTagName("svg:path");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPathElements(objs));
		objs =xml.getElementsByTagName("path");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPathElements(objs));
		res.transform = {};
		res.transform.translate = {'x':0, 'y':0};
		res.transform.scale = {'x':1, 'y':1};
		
		res = this.fitgeojsontocanvas(res,canvas)
		return res;
	},
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
		var target = resolveTargetWithMemory(e);
				//console.log("target: ",target);
				//console.log("target id: "+target.id);
				//console.log("target width: "+target.width); <-- this break in IE...
				//console.log("target nodename: "+target.nodeName);
		var id ="#"+this.wrapper.id;
		
		var offset = $(id).offset();
		
		x = e.clientX + window.findScrollX() - offset.left;
		y = e.clientY + window.findScrollY() - offset.top;
		
		//counter any positioning
		if(target.style.left) x -= parseInt(target.style.left);
		if(target.style.top) y -= parseInt(target.style.top);
		/*console.log('e.clientX: '+e.clientX);
		console.log('window.findScrollX: '+window.findScrollX());
		console.log('offset.left: '+offset.left);
		console.log('target.style.left: '+target.style.left);
		console.log('e.clientY: '+e.clientY);
		console.log('window.findScrollY: '+window.findScrollY());
		console.log('offset.top: '+offset.top);
		console.log('target.style.top: '+target.style.top);*/

		var memory = target.memory;
		//console.log('memory length: '+memory.length);
		if(memory){
			var shape = this.getShapeAt(x,y,memory);
			return shape;
		} else{
			//console.log("no shapes in memory");
			//return false;
		}
	},	
	getShapeAt: function(x,y,shapes) {
		//console.log('looking for hit at x,y: '+x+', '+y);
		var hitShapes = [];
		for(var i=0; i < shapes.length; i++){
			var g = shapes[i].grid;
			/*console.log(g.x1);
			console.log(g.y1);
			console.log(g.x2);
			console.log(g.y2);*/
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
/*
SVG targeted functions withe goal to convert to a geojson structure
*/
var EasyMapSVGUtils = function(){};
EasyMapSVGUtils.prototype = {
	createFeatureFromSVGPolygonElement: function(svgpoly){
		
		var f = {};
		f.type = 'Feature';
		f.geometry = {};
		f.geometry.type = "MultiPolygon";
		
		//this.shape = "polygon";
		f.geometry.coordinates = this._convertFromSVGPathCoords(svgpoly.getAttribute("points"));
		f.properties = {};
		
		f.properties.name = svgpoly.getAttribute("name")
		f.properties.href= svgpoly.getAttribute("xlink");
	
		if(svgpoly.getAttribute("fill")) {
			f.properties.colour = svgpoly.getAttribute("fill"); 
			f.properties.fill = true;
		}
		else {
			f.properties.colour = "rgb(0,0,0)"; 
			f.properties.fill = false;
		}
		
		return f;
		
	},	
	createFeatureFromSVGPathElement: function(svgpath){
		
		var f = {};
		f.type = 'Feature';
		
		f.properties = {};
		f.properties.colour = '#cccccc';
		f.properties.fill = svgpath.getAttribute("fill"); 
		f.properties.fill = false;
		f.properties.name = svgpath.getAttribute("id");
		f.properties.href= svgpath.getAttribute("xlink");
		f.geometry = {};
		f.geometry.type = "MultiPolygon";
		var p =svgpath.getAttribute("d");
		var t =svgpath.getAttribute("transform");
		var parent = svgpath.parentNode;

		if(parent && parent.getAttribute("transform")) t = parent.getAttribute("transform");
		//if(t) console.log(f.properties.name,"has t", t);
		
		var newp = this._convertFromSVGPathCoords(p,t);
		//if(f.properties.name == 'it_6')console.log(p,newp);
		var coords = newp;
		//console.log(coords[0].length,f.properties.name,f);
		//if(coords[0].length == 1)console.log(coords[0]);
		f.geometry.coordinates = coords;
		return f;
	},
	createFeaturesFromSVGPolygonElements: function(polys){
		var res = [];
		for(var i=0; i< polys.length; i++){
			var el = polys[i];
			res.push(this.createFeatureFromSVGPolygonElement(el));
		}
		return res;
	},		
	createFeaturesFromSVGPathElements: function(paths){
		var res = [];
		for(var i=0; i< paths.length; i++){
			var el = paths[i];
			var f=this.createFeatureFromSVGPathElement(el);
			//if(f.geometry.coordinates[0].length >0)
			res.push(f);
		}
		return res;
	},
	_convertFromSVGPathCoords: function(SVGCoordinates,transformation){
		//transformation in form matrix(0.5,0,0,0.5,-180,0)
		var matrix =[],translate=[];
		var bads = [];
		if(transformation){
			if(transformation.indexOf("translate") > -1){ //matrix given!
				transformation=transformation.replace("translate(","");
				transformation=transformation.replace(")","");
				transformation=transformation.replace(" ","");
				translate  = transformation.split(",");
			}			
			if(transformation.indexOf("matrix") > -1){ //matrix given!
				transformation=transformation.replace("matrix(","");
				transformation=transformation.replace(")","");
				transformation=transformation.replace(" ", "");
				matrix  = transformation.split(",");
			}
		}
		var pointPairs = [];
		
		if(SVGCoordinates) {
			var c = SVGCoordinates;

			

			
			c = c.replace(/^\s*(.*?)\s*$/, "$1");
			
			 //fix the svg lazy bug (allowing coordinates in form 4-2 rather than 4,-2) 
			while(c.search(/-?(\d*\.+\d*)\-/g) >-1){
				//console.log("!");
				c = c.replace(/(-?\d*\.?\d*)\-/g,"$1,-")
			}
			
			while(c.search(/([A-Z] *-?\d*\.?\d*) *(-?\d*.?\d* *[A-Z])/gi) >-1){ //sorts out M xx.xx yy.yyL -> M xx.xx,yy.yyL 
				//console.log("!");
				c = c.replace(/([A-Z] *-?\d*\.?\d*) *(-?\d*.?\d* *[A-Z])/gi,"$1,$2")
			}
			
			while(c.search(/([A-Z]\d*\.?\d*) *(\d*\.?\d*[A-Z])/gi) > -1){
				c = c.replace(/([A-Z]\d*\.?\d*) *(\d*\.?\d*[A-Z])/gi,"$1,$2");	
			}
				
			//end fixes
			
			c = c.replace(/(c|L|M|V)/gi, " $1"); //create spacing
			c = c.replace(/C|L|M/g, "");//get rid of abs path markers.. absolute coordinates are great
			c = c.replace(/z/gi, " z ");
			//console.log("help",c);
			
			pointPairs = c.split(" ");
			
		}

		var numPairs = pointPairs.length;
		var points = [[]];
		var polyc = [];
		if(numPairs > 0) {
			
		 	var coords, numCoords;

			var last = {'x':0,'y':0};
			for(var i=0; i<numPairs; i++) {
				var pair = pointPairs[i];
				var closeme = false;

				
				if(pair.search(/z|Z/) >-1){
					closeme = true;
					pair = pair.replace("z",""); //close path		
				}		

				if(pair.length > 0){				
					coords = pair.split(",");
					if(coords.length == 2){
						var relative = false;
						var x =coords[0];
						var y= coords[1];
						
						if(x.search(/[a-z]/) == 0){ //its relative
							relative = true;
							x = x.substring(1); 
						}
				
						numCoords = coords.length;
						x =parseInt(x);
						y=parseInt(y);
						
						if(relative){
							x+= last.x; y+= last.y;
							//console.log(coords,x,y);
							
						}
						last.x = x; last.y = y;
						if(matrix.length == 6){
							var ox = x, oy=y;							
							x = parseInt((ox * matrix[0]) +   matrix[4]);
							y = parseInt(oy * matrix[3]);
						}
						
						if(translate.length == 2){
							x += parseFloat(translate[0]);
							y += parseFloat(translate[1]);
	
						}
					
						//console.log(x,y);
						if(typeof x == 'number' && typeof y =='number')	{
							
							polyc.push([x,-y]);
						}
					}
					else{
						//if(coords.length !=0 && coords.indexOf('-'))bads.push(pair);
					} 
				}
				if(closeme){
					points[0].push(polyc);
					polyc = [];
				}

			}
		}
		if(polyc.length >0) points[0].push(polyc);
		//console.log("read error!",bads);
		return points;
	}	
};