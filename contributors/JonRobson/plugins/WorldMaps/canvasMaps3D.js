
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
	if(!e) e = window.event;
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

var EasyMapController = function(targetjs,elem){ //elem must have style.width and style.height
	this.wrapper = elem; //a dom element to detect mouse actions
	this.targetjs = targetjs; //a js object to run actions on (with pan and zoom functions)	
	this.utils = EasyMapUtils; //some utilities that it may find useful
	
	var controlDiv = this.wrapper.controlDiv;
	if(!controlDiv) {
		controlDiv = document.createElement('div');
		controlDiv.style.position = "absolute";
		controlDiv.style.top = "0";
		controlDiv.style.left = "0";
		this.wrapper.appendChild(controlDiv);
		this.wrapper.controlDiv = controlDiv;
	}
	this.transformation = {'translate':{x:0,y:0}, 'scale': {x:1, y:1},'rotate': {x:0,y:0,z:0}};	
	//looks for specifically named function in targetjs
	if(!this.targetjs.transform) alert("no transform function defined in " + targetjs+"!");
};
EasyMapController.prototype = {
	addMouseWheelZooming: function(){
		var mw = this.wrapper.onmousewheel;
		var that = this;
		var onmousewheel = function(e){
		
					
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;
	        	if (!e) /* For IE. */
	                e = window.event;
	
			var t = resolveTarget(e);
		
			if(t != that.wrapper && t.parentNode !=that.wrapper) return;
	       	 	if (e.wheelDelta) { /* IE/Opera. */
		                delta = e.wheelDelta/120;
		                /** In Opera 9, delta differs in sign as compared to IE.
		                 */
		                if (window.opera)
		                        delta = -delta;
		        } else if (e.detail) { /** Mozilla case. */
		                /** In Mozilla, sign of delta is different than in IE.
		                 * Also, delta is multiple of 3.
		                 */
		                delta = -e.detail/3;
		        }
	
			var sensitivity = 0.3;
			if(!this.lastdelta) this.lastdelta = delta;
			
			if(delta > this.lastdelta + sensitivity || delta < this.lastdelta - sensitivity){
				var s =that.transformation.scale;
				var pos = that.utils.getMouseFromEventRelativeToCenter(e);
				var t=  that.transformation.translate;
				//t.x = -pos.x / s.x;
				//t.y = pos.y / s.y;
				var newx = s.x+ delta;
				var newy = s.y + delta;
				if(newx > 0 && newy > 0){
					s.x = newx;
					s.y = newy;
					that.transform();					
				}

			}
			
			this.lastdelta = delta;
	        
		}

		if (window.addEventListener)
		        /** DOMMouseScroll is for mozilla. */
		        window.addEventListener('DOMMouseScroll', onmousewheel, false);
		/** IE/Opera. */
		window.onmousewheel = document.onmousewheel = onmousewheel;
		
		
	},

	addMousePanning: function(){
		var that = this;
		var md = that.wrapper.onmousedown;
		var mu = that.wrapper.onmouseup;	
		var mm = that.wrapper.onmousemove;
		var onmousemove = function(e){
			
			var p =this.panning;
			if(!p) return;
			if(!p) return;
			var t = resolveTarget(e);
			if(t.getAttribute("class") == "easyControl") return;
			var pos = that.utils.getMouseFromEventRelativeTo(e,p.clickpos.x,p.clickpos.y);		
			if(!pos)return;
			
			var t = that.transformation;
			if(this.transformation) t = this.transformation;
			var sc = t.scale;
			
			var xd =parseFloat(pos.x /sc.x);
			var yd = parseFloat(pos.y / sc.y);
			t.translate.x = p.translate.x + xd;
			t.translate.y =p.translate.y +yd;

			that.transform();
			
			if(pos.x > 5 || pos.y > 5) p.isClick = false;
			if(pos.x < 5 || pos.y < 5) p.isClick = false;
			return false;	
		};
		
		this.wrapper.onmousedown = function(e){
			if(md) md(e);
			var target = resolveTarget(e);
			if(!target) return;
			if(target.getAttribute("class") == "easyControl") return;
			
			var t = that.transformation.translate;
			var sc =that.transformation.scale; 
			var realpos = that.utils.getMouseFromEvent(e);
			if(!realpos) return;

			this.panning= {clickpos: realpos, translate:{x: t.x,y:t.y},isClick:true};
			that.wrapper.onmousemove = onmousemove;
			that.wrapper.style.cursor= "move";
			this.style.cursor = "move";

		};
		
		this.wrapper.onmouseup = function(e){
			
			that.wrapper.style.cursor= '';
			that.wrapper.onmousemove = mm;
			if(this.panning && this.panning.isClick && mu){ mu(e);}
			this.panning = null;

			
			return false;
		};
	
	
	},
	setTransformation: function(t){
		if(!t.scale && !t.translate && !t.rotate) alert("bad transformation applied - any call to setTransformation must contain translate,scale and rotate");
		this.transformation = t;
		this.wrapper.transformation = t;
		this.targetjs.transform(t);
		//console.log("transformation set to ",t);
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
		
		var coords = [
			offset.x, offset.y,
			offset.x + width, offset.y,
			offset.x + width, offset.y + width,
			offset.x, offset.y + width
		];
		var button = new EasyShape(properties,coords);
		return button;
	},	
	addControl: function(controlType) {
		switch(controlType) {
			//case "zoom":
			case "pan":
				this.addPanningActions();
				break;
			case "zoom":
				this.addZoomingActions();
				break;
			case "mousepanning":
				this.addMousePanning();
				break;
			case "mousewheelzooming":
				this.addMouseWheelZooming();
				break;
			case "rotation":
		
				this.addRotatingActions();
				break;
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
		newCanvas.style["z-index"] = 3;
		newCanvas.setAttribute("class","easyControl");
		this.wrapper.appendChild(newCanvas);

		newCanvas.emap = this;
		if(!newCanvas.getContext) {
			G_vmlCanvasManager.init_(document);
		}
		newCanvas.memory = [];
		//return clickableCanvas(newCanvas);
		return newCanvas;
	},
	addPanningActions: function(controlDiv){
		var panCanvas = this._createcontrollercanvas(44,64);		
		panCanvas.memory.push(this.drawButton(panCanvas,10,180,{x:16,y:2},{'actiontype':'N','name':'pan north','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,270,{x:30,y:16},{'actiontype':'E','name':'pan east','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,90,{x:2,y:16},{'actiontype':'W','name':'pan west','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,0,{x:16,y:30},{'actiontype':'S','name':'pan south','buttonType': 'arrow'}));			
		panCanvas.onclick = this._panzoomClickHandler;		

	},
	addRotatingActions: function(){
		
		var rotateCanvas = this._createcontrollercanvas(44,40);		
		rotateCanvas.memory.push(this.drawButton(rotateCanvas,10,270,{x:30,y:16},{'actiontype':'rotatezright','name':'rotate to right','buttonType': 'arrow'}));
		rotateCanvas.memory.push(this.drawButton(rotateCanvas,10,90,{x:2,y:16},{'actiontype':'rotatezleft','name':'rotate to left','buttonType': 'arrow'}));
		rotateCanvas.onclick = this._panzoomClickHandler;

	},	
	addZoomingActions: function(){
		var zoomCanvas = this._createcontrollercanvas(20,30);

		var left = 14;
		var top = 50;
		zoomCanvas.style.left = left +"px";
		zoomCanvas.style.top = top + "px";
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:2},{'actiontype':'in','name':'zoom in','buttonType': 'plus'}));		
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:16},{'actiontype':'out','name':'zoom out','buttonType': 'minus'}));
		zoomCanvas.onclick = this._panzoomClickHandler;	
	},	
	
	transform: function(){
		var t = this.transformation;
		var s = t.scale;
		var tr = t.translate;
		var style = this.wrapper.style;
		
		
		var width = parseInt(style.width);
		var height = parseInt(style.height);
		if(s.x <= 0) s.x = 0.1;
		if(s.y <= 0) s.y = 0.1;
		if(width && height){
			var max = {};
			max.x = parseFloat((width) - 10) * s.x;//the maximum possible translation
			max.y = parseFloat((height) - 10) * s.y;//the maximum possible translation
	
			if(tr.x > max.x){
				tr.x = max.x;
			}
			else if(tr.x < -max.x){
				tr.x= -max.x;
			}
		
			if(tr.y > max.y){
				tr.y = max.y;
			}
			else if(tr.y < -max.y){
				tr.y= -max.y;
			}
		}
		this.targetjs.transform(this.transformation);
	},
	_panzoomClickHandler: function(e) {
		
		if(!e) {
			e = window.event;
		}
		var emap = this.emap;
			
		var hit = emap.utils.getShapeAtClick(e);
		if(!hit) {
		
			return false;
		}

		var pan = {};
		var t =emap.transformation;
		var scale =t.scale;
		pan.x = parseFloat(30 / scale.x);
		pan.y = parseFloat(30 / scale.y);
		if(!t.scale) t.scale = {x:1,y:1};
		if(!t.translate) t.translate = {x:0,y:0};
		if(!t.rotate) t.rotate = {x:0,y:0,z:0};
		

		switch(hit.properties.actiontype) {
			case "W":
				t.translate.x += pan.x;
				break;
			case "E":
				t.translate.x -= pan.x;
				break;
			case "N":
				t.translate.y += pan.y;
				break;
			case "S":
				t.translate.y -= pan.y;
				break;
			case "in":
				scale.x *= 2;
				scale.y *= 2;
				break;
			case "out":
				scale.x /= 2;
				scale.y /= 2;			
				break;
			case "rotatezright":
				t.rotate.z -= 0.1;
				var left =6.28318531;
				
				if(t.rotate.z <0 )t.rotate.z =left;
				break;
			case "rotatezleft":
				t.rotate.z += 0.1;
				break;
			default:
				break;
		}
		emap.transform();

		return false;
	}
};
/*
A package for rendering geojsons easily
*/
var GeoTag = function(longitude,latitude,properties){
	var geo = {};
	geo.type = "feature";
	geo.geometry = {};
	geo.geometry.type = "point";
	geo.geometry.coordinates = [longitude,latitude];
	geo.properties = properties;
	return geo;	
}


var EasyMap = function(wrapper){

	var wrapper;
	if(typeof wrapper == 'string')
		wrapper = document.getElementById(wrapper);
	else
		wrapper = wrapper;
		
		
	this.wrapper = wrapper;
	wrapper.style.position = "relative";
	var that = this;

	var canvas = document.createElement('canvas');
	canvas.width = parseInt(wrapper.style.width) || 600;
	canvas.height = parseInt(wrapper.style.height) || 400;
	
	if(!wrapper.style.width) wrapper.style.width = canvas.width + "px";
	if(!wrapper.style.height) wrapper.style.height = canvas.height + "px";
	canvas.style["z-index"] = 1;
	wrapper.appendChild(canvas);
	canvas.style.position = "absolute";
	this.canvas = canvas;

	if(!canvas.getContext) {
		G_vmlCanvasManager.init_(document);
	}
	this.spherical = false; //experimental!! fiddle with at your own risk! :)

	this.utils = EasyMapUtils;
	
	var _defaultMousemoveHandler = function(e){
		if(!e) {
			e = window.event;
		}
		var wid =wrapper.id+'_tooltip';
		var tt =document.getElementById(wid);
		if(!tt){
			tt = document.createElement('div');
			tt.style.position = "absolute";
			tt.id = wid;
			tt.setAttribute("class","easymaptooltip");
			that.wrapper.appendChild(tt);
		}
		var pos = that.utils.getMouseFromEvent(e);
		var x =pos.x;
		var y = pos.y;
		var sensitivity = 1;
		if(this.lastMouseMove && x < this.lastMouseMove.x + sensitivity && x > this.lastMouseMove.x -sensitivity) {return;}
		if(this.lastMouseMove &&  y < this.lastMouseMove.y + sensitivity && y > this.lastMouseMove.y -sensitivity) {return;}

		this.lastMouseMove = {};
		this.lastMouseMove.x = x;this.lastMouseMove.y = y;


		var shape = that.utils.getShapeAtClick(e);
		if(shape){
			var text =shape.properties.name;

			if(shape.properties.content) text += "<p>"+content+"</p>"
			tt.innerHTML = text;
			x += 10;
			y +=10;
			tt.style.left = x + "px";
			tt.style.top = y +"px";
			tt.style.display = "";
			tt.style["z-index"] = 2;

		}	
		else
			tt.style.display = "none";




	};
	var _defaultClickHandler = function(e){};	
	this.wrapper.onmouseup = _defaultClickHandler;
	this.wrapper.onmousemove = _defaultMousemoveHandler;	
	this.controller = new EasyMapController(this,this.wrapper);
	this.transform(this.controller.transformation); //set initial transformation

	this._fittocanvas = true;
	this.clear();
};  
EasyMap.prototype = {	
	addControl: function(controlType) {
		this.controller.addControl(controlType);
	},
	
	clear: function(){
		var mapCanvas = this.canvas;
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
			
			if(!geojson.points && this._fittocanvas){
				geojson = this.utils.fitgeojsontocanvas(geojson,this.canvas);
			}
			//this.clear();
			// NB: removing this statustext node so it doesn't mess up offsets in IE
			// this problem needs to be fixed so that we're either not adding div's in
			// places where they shouldn't be, or so they don't affect things
			var t = document.getElementById(this.wrapper.id + "_statustext");
			if(t) {
				t.parentNode.removeChild(t);	
			}
			var type =geojson.type.toLowerCase();

			if(geojson.transform && this._fittocanvas){
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
		this.canvas.transformation = transformation;
		//set origin
		var w =parseInt(this.canvas.width);
		var h = parseInt(this.canvas.height);
		
		if(!transformation.origin){
			this.canvas.transformation.origin = {};
			var origin = this.canvas.transformation.origin;
			origin.x =w / 2;
			origin.y =h / 2;
		}
		var t =this.canvas.transformation.translate;
		var s = this.canvas.transformation.scale;

		if(this.spherical){
			if( !this.canvas.transformation.spherical){
				this.canvas.transformation.spherical = {};
				this.canvas.transformation.spherical.seaColor = "#AFDCEC";
			}
			if(!this.canvas.transformation.rotate){
				this.canvas.transformation.rotate = {};
				this.canvas.transformation.rotate.z =0;
			}
			
			if(!this.canvas.transformation.spherical.radius){
			var heightR = (parseInt(this.canvas.height) / s.y) /2;
			var widthR= (parseInt(this.canvas.width) / s.x) /2;
			
			
			if(widthR > heightR)
				this.canvas.transformation.spherical.radius = heightR;
			else
				this.canvas.transformation.spherical.radius = widthR;
			}
		};
		
		this.redraw();
	},
	_buildShapeInMemory: function(easyShape){ //add shape to memory
		var mapCanvas = this.canvas;
		var memory = mapCanvas.memory;
		easyShape.id = memory.length;
		memory[easyShape.id] = easyShape;	
	},
	_createGlobe: function(){
		var t =this.canvas.transformation;
		var ctx = this.canvas.getContext('2d');
		var rad =t.spherical.radius;
	
				
		ctx.beginPath();
		ctx.arc(0, 0, rad, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fillStyle =t.spherical.seaColor;
		ctx.fill();
		

	},
	_renderShapes: function(){
		var mem =this.canvas.memory;
		var ctx = this.canvas.getContext('2d');
		this.ctx = ctx;

		var t =this.canvas.transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
	
		ctx.lineWidth = 0.09;
		ctx.save();	
		ctx.translate(o.x,o.y);
		ctx.scale(s.x,s.y);
		ctx.translate(tr.x,tr.y);
		
		if(t.spherical){
			this._createGlobe();
		}
		var left = 0;
		var top = 0;
		var right =  parseInt(this.canvas.width) + left; 
		var bottom = parseInt(this.canvas.height) + top;

		var transformedGrid = {};
		var t= this.canvas.transformation;
		var topleft = this.utils.undotransformation(left,top,t);
		var bottomright = this.utils.undotransformation(right,bottom,t);
		
		var frame = {};
		frame.top = topleft.y;
		frame.bottom = bottomright.y;
		frame.right = bottomright.x;
		frame.left = topleft.x;

		for(var i=0; i < mem.length; i++){
			this._renderShape(mem[i],frame);
		}
		ctx.restore();
	},
	_renderShape: function(shape,frame){ //is this really a drawPolygon or a drawLines
		var scale =this.canvas.transformation.scale;
		var shapetype =shape.properties.shape;
		if(shapetype=='polygon' || shapetype == 'point'){
		//good shape
		} 
		else{
			console.log("no idea how to draw" +shape.properties.shape);return;
		}		
		if(shapetype != 'point' && shape.grid){ //check if worth drawing
				var g = shape.grid;
				if(g.x2 < frame.left) {
					return;}
				if(g.y2 < frame.top) {
					return;}
				if(g.x1 > frame.right){
					return;
				}
				if(g.y1 > frame.bottom){
					return;	
				}
				var t1 = g.x2 -g.x1;
				var t2 =g.y2- g.y1;
				var delta = {x:t1,y:t2};
				delta.x *= scale.x;
				delta.y *= scale.y;

				if(delta.x < 5 || delta.y < 5) {return;}//too small
			}
			
			this.ctx.beginPath();
			var c;
	
			if(this.spherical) c = shape.spherify(this.canvas.transformation);
			else c = shape.coords;
	
			if(c.length == 0) return;
			
			var deltas = shape.distanceToNext;
			var initialX = parseFloat(c[0]);
			var initialY = parseFloat(c[1]);

			var pathLength = {x: 0, y:0};
			var threshold = 2;
			this.ctx.moveTo(initialX,initialY);

		
			
			
			for(var i=2; i < c.length-1; i+=2){
				var x = parseFloat(c[i]);
				var y = parseFloat(c[i+1]);
			
				pathLength.x += deltas[i];
				pathLength.y += deltas[i+1];

				var deltax = parseFloat(pathLength.x) * scale.x;
				var deltay = parseFloat(pathLength.y)* scale.y;
				
				if(shapetype == 'point' ||(deltax > threshold || deltay > threshold)){
					this.ctx.lineTo(x,y);
					pathLength.x = 0;
					pathLength.y = 0;
				}

			}
			//connect last to first
			this.ctx.lineTo(initialX,initialY);
			this.ctx.closePath();

			
			if(!shape.properties.hidden) {
				if(!shape.properties.fill) {
					if(shape.properties.stroke){
						this.ctx.strokeStyle = shape.properties.stroke;
						this.ctx.stroke();
					}
				}
				else {
					if(typeof shape.properties.fill == 'string'){
					this.ctx.fillStyle =shape.properties.fill;
					this.ctx.stroke();
					this.ctx.fill();
					}
				}
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
		var s = new EasyShape(p,coordinates,"geojson");
		this._buildShapeInMemory(s);
	},	
	_drawGeoJsonFeature: function(feature){
			var geometry = feature.geometry;
			var type =geometry.type.toLowerCase();
			var p = feature.properties;
			
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

var EasyShape = function(properties,coordinates,sourceType){

	this.grid = {};
	this.coords = [];

	if(sourceType){
		if(sourceType == "geojson") {
			this.constructFromGeoJSONObject(properties,coordinates);
		}
	}
	else{
		this.constructBasicPolygon(properties,coordinates);
	}
	this.createGrid();

};
EasyShape.prototype={
	createGrid: function(){
			this.grid.x1 = this.coords[0];
			this.grid.y1 = this.coords[1];
			this.grid.x2 = this.coords[0];
			this.grid.y2 = this.coords[1];
			
			this.distanceToNext = []
			var d = this.distanceToNext;

			var lastX, lastY;
			var index = 0;
			var coordOK;
			lastX = this.coords[0];
			lastY = this.coords[1];
			this.perimeter = 0;
			
			
			for(var i=0; i < this.coords.length-1; i+=2){
				coordOK= true;
				var xPos = parseFloat(this.coords[i]); //long
				var yPos = parseFloat(this.coords[i+1]); //lat
				
				var deltax =xPos - lastX;
				var deltay= yPos - lastY;
				
				
				this.perimeter += Math.sqrt((deltax*deltax) + (deltay*deltay));
				
				if(deltax < 0) deltax = - deltax;
				if(deltay < 0) deltay = -deltay;
				d.push(deltax);
				d.push(deltay);
				
				
				
				if(xPos < this.grid.x1) this.grid.x1 = xPos;
				if(yPos < this.grid.y1) this.grid.y1 = yPos;	
				if(xPos > this.grid.x2) this.grid.x2 = xPos;
				if(yPos > this.grid.y2) this.grid.y2 = yPos;
				
				lastX = xPos;
				lastY = yPos;
			}
	},
	constructFromGeoJSONObject: function(properties,coordinates){
		if(properties.shape == 'polygon'){
			this.constructFromGeoJSONPolygon(properties,coordinates);	
		}
		else if(properties.shape == 'point'){
			var x = coordinates[0]; var y = coordinates[1];
			var ps = 0.5;
			var newcoords =[[x-ps,y-ps],[x+ps,y-ps],[x+ps,y+ps],[x-ps, y+ps]];
			newcoords = this._convertGeoJSONCoords(newcoords);
			this.constructBasicPolygon(properties,newcoords);
		}
		else
			console.log("don't know what to do with shape " + element.shape);
	},
	constructBasicPolygon: function(properties, coordinates){
		this.coords = coordinates;
		this.shape = "polygon";
		//this.transformedCoords = this.coords;
		//this.href = "#";
		if(!properties.stroke)properties.stroke = '#000000';
		

		
		if(properties.colour){
			properties.fill =  properties.colour;
		}
		
		this.properties = properties;
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
	}	

	,spherify: function(transformation){
		var newcoords = [];
		var radius =transformation.spherical.radius;
		var xPos, yPos;
		for(var i=0; i < this.coords.length-1; i+=2){
			coordOK= true;
			var lon = parseFloat(this.coords[i]);
			var lat = parseFloat(this.coords[i+1]);
			var t = EasyMapUtils._spherifycoordinate(lon,lat,transformation);
			if(t.x && t.y){
				newcoords.push(t.x);
				newcoords.push(t.y);
			}
		}

		return newcoords;
	}
	,transformcoordinates: function(transformation,spherical,radius){		
		var performScale = true;
		var performTranslate = true; 
		var performRotate = false;
		if(!transformation){
			performScale = false;
			performTranslate = false;
			performRotate = false;
		}
		else{
			var scaling = transformation.scale;
			var translation = transformation.translate;
			if(scaling.x == 1 && scaling.y == 1) {
				performScale = false;
			}
			if(translation.x == 0 && translation.y == 0) {
				performTranslate = false;
			}
			if(transformation.rotate) {
				performRotate = true;
				var rotate = transformation.rotate;
			}
		}
		var transformedCoords = [];
		
		var lastX, lastY;
		var index = 0;
		var coordOK;
		for(var i=0; i < this.coords.length-1; i+=2){
			coordOK= true;
			var lon = parseFloat(this.coords[i]);
			var lat = parseFloat(this.coords[i+1]);
			var xPos, yPos;

			if(spherical){
				var t = EasyMapUtils._spherifycoordinate(lon,lat,rotate,radius);
				xPos = t.x;
				yPos = t.y;
			} else {
				xPos = lon;
				yPos = lat;
			}

			
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
			
			
			if(coordOK){ //draw
				transformedCoords.push(xPos);
				transformedCoords.push(yPos);
				index+=2;
				lastX = xPos; lastY = yPos;
			}
		}
		return transformedCoords;
	}
};
/*
Some common utils used throughout package 
*/

var EasyMapUtils = {
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
		//console.log(view.center.y, view.height);
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
	undotransformation: function(x,y,transformation){
		
		var pos = {};
		var t =transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
		if(!x || !y) 
			return false;
		pos.x = x;
		pos.y = y;
		

		pos.x -= o.x;
		pos.y -= o.y;
	
		pos.x /= s.x;
		pos.y /= s.y;
				
		pos.x -= tr.x;
		pos.y -= tr.y;
		

		if(t.spherical) {
			pos = this._undospherify(pos.x,pos.y,t);
		}

			
			
		return pos;
	},	
	convertSVGToMultiPolygonFeatureCollection: function(xml,canvas){			
		var svgu = EasyMapSVGUtils;
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
	
	_radToDeg: function(rad){
		return rad / (Math.PI /180);
	},
	_degToRad: function(deg) {
		return deg * Math.PI / 180;
	},
	getMouseFromEventRelativeTo: function (e,x,y){
		
		var pos = this.getMouseFromEvent(e);
		if(!pos) return false;
		pos.x -= x;
		pos.y -= y;

		return pos;
		
	},
	getMouseFromEventRelativeToCenter: function(e){
		var w,h;
		var target = resolveTargetWithMemory(e);
		if(!target)return;
		if(target.style.width)
			w = parseInt(target.style.width);
		else if(target.width)
			w =parseInt(target.width);

		if(target.style.height)
			h = parseInt(target.style.height);
		else if(target.height)
			h = parseInt(target.height);
		
		if(!w || !h) throw "target has no width or height (easymaputils)";
		
		return this.getMouseFromEventRelativeTo(e,w/2,h/2);
	},
	getMouseFromEvent : function(e){
			if(!e) e = window.event;
			var target = resolveTargetWithMemory(e);
			if(!target)return false;
			
			var offset = $(target).offset();
			if(!offset.left) return false;
			x = e.clientX + window.findScrollX() - offset.left;
			y = e.clientY + window.findScrollY() - offset.top;
			return {'x':x, 'y':y};		
				
	},
	getShapeAtClick: function(e){
		if(!e) {
			e = window.event;
		}
		var target = resolveTargetWithMemory(e);
		if(!target) return;
		var offset = $(target).offset();
		

		x = e.clientX + window.findScrollX() - offset.left;
		y = e.clientY + window.findScrollY() - offset.top;
		
		//counter any positioning
		//if(target.style.left) x -= parseInt(target.style.left);
		//if(target.style.top) y -= parseInt(target.style.top);

		var memory = target.memory;
		var transformation = target.transformation;
		//console.log('memory length: '+memory.length);
		if(memory){
			var shape = this.getShapeAt(x,y,memory,transformation);
			return shape;
		} else{
			//console.log("no shapes in memory");
			//return false;
		}
	},
	
	_undospherify: function (x,y,transformation){
		var radius = transformation.spherical.radius;
		
		
		var latitude = Math.asin(y / radius);
		var longitude = Math.asin(parseFloat(x / radius) / Math.cos(latitude));


				
		if(transformation.rotate && longitude != 'NaN')longitude -= transformation.rotate.z;
		longitude = longitude % 6.28318531;
		
		var lon = this._radToDeg(longitude);
		var lat = this._radToDeg(latitude);
		
		return {x:lon,y:lat};
	},
	_spherifycoordinate: function(lon,lat,transformation){//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var radius = transformation.spherical.radius;
		var utils = EasyMapUtils;
		var res = {};
		
		var longitude = this._degToRad(lon);
		var latitude = this._degToRad(lat);
 		
 		// assume rotate values given in radians
		if(transformation && transformation.rotate){
			//latitude += transformation.rotate.x;
			longitude += transformation.rotate.z
			 
		}
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
	
		longitude = longitude % 6.28318531; //360 degrees		

		res.y = (radius) * Math.sin(latitude);	
		if(longitude < 1.57079633 || longitude > 4.71238898){//0-90 (right) or 270-360 (left) then on other side 
			res.x = (radius) * Math.cos(latitude) * Math.sin(longitude);		
		}
	
		return res;
	},		
	getShapeAt: function(x,y,shapes,transformation) {
		
		if(transformation){
			var pos = this.undotransformation(x,y,transformation);
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
		var coords = poly.coords;
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
var EasyMapSVGUtils= {
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
			f.properties.fill = svgpoly.getAttribute("fill"); 
		}
		
		return f;
		
	},	
	createFeatureFromSVGPathElement: function(svgpath){
		
		var f = {};
		f.type = 'Feature';
		
		f.properties = {};
		f.properties.colour = '#cccccc';
		f.properties.fill = svgpath.getAttribute("fill"); 
		//f.properties.fill = false; //UNCOMMENT ME FOR EDITING MODE
		f.properties.name = svgpath.getAttribute("id");
		f.properties.href= svgpath.getAttribute("xlink");
		f.geometry = {};
		f.geometry.type = "MultiPolygon";
		var p =svgpath.getAttribute("d");
		var t =svgpath.getAttribute("transform");
		var parent = svgpath.parentNode;

		if(!t && parent && parent.getAttribute("transform") && parent.tagName =='g'){
			t = parent.getAttribute("transform");
		}
		
		
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
				c = c.replace(/([A-Z] *-?\d*\.?\d*) *(-?\d*.?\d* *[A-Z])/gi,"$1,$2")
			}
			
			while(c.search(/([A-Z]\d*\.?\d*) *(\d*\.?\d*[A-Z])/gi) > -1){
				c = c.replace(/([A-Z]\d*\.?\d*) *(\d*\.?\d*[A-Z])/gi,"$1,$2");	
			}
				
			//end fixes
			
			c = c.replace(/(c|L|M|V|H)/gi, " $1"); //create spacing
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
					
					if(coords.length > 0){
						var relative = false;
						var x =coords[0];
						var y = coords[1];
						
						if(x.search(/V|H/i) == 0){ //vertical or horizontal command
							if(x.search(/V/) ==0){//vertical absolute
								x = x.substring(1);
								y = last.y;
							}
							else if(x.search(/v/) ==0 ){//vertical relative
								x = parseFloat(last.x + x.substring(1));
								y = last.y;								
							}
							else if(x.search(/h/)==0){//horizontal relative
								y = parseFloat(last.y + x.substring(1));
								x = last.x;								
							}
							else { //horizontal absolute x
								y = x.substring(1);
								x = last.x;	
							}
						
						}
				
					else if(x.search(/[a-z]/) == 0){ //its relative
							relative = true;
							x = x.substring(1);
						
						}

					x =parseInt(x);
					y=parseInt(y);
					}
					
					
					if(x && y){
						
						
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