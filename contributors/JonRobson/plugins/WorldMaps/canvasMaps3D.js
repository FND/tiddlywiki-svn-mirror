/*
A package for rendering geojson polygon and point features easily
*/

var GeoTag = function(longitude,latitude,properties){
	var geo = {};
	geo.type = "feature";
	geo.geometry = {};
	geo.geometry.type = "point";
	geo.geometry.coordinates = [longitude,latitude];
	geo.properties = properties;
	return geo;	
};



var EasyMap = function(wrapper){

	var wrapper;
	if(typeof wrapper == 'string')
		wrapper = document.getElementById(wrapper);
	else
		wrapper = wrapper;
		
		
	this.wrapper = wrapper;
	wrapper.style.position = "relative";
	var that = this;
	this.settings = {};
	this.settings.background = "#AFDCEC";
	//this.settings.projection = {x:function(x){return x;}, y: function(y){return y;}};
	this.settings.optimisations = false;
	
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
		this.browser = 'ie';
	}
	else
		this.browser = 'good';
	this.spherical = false; //experimental!! fiddle with at your own risk! :)

	this.canvas.memory = [];
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
		var pos = EasyMapUtils.getMouseFromEvent(e);
		var x =pos.x;
		var y = pos.y;
		if(!x || !y ) return;
		var sensitivity = 1;
		if(this.lastMouseMove && x < this.lastMouseMove.x + sensitivity && x > this.lastMouseMove.x -sensitivity) {return;}
		if(this.lastMouseMove &&  y < this.lastMouseMove.y + sensitivity && y > this.lastMouseMove.y -sensitivity) {return;}

		this.lastMouseMove = {};
		this.lastMouseMove.x = x;this.lastMouseMove.y = y;


		var shape = EasyMapUtils.getShapeAtClick(e);
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

	
	//run stuff
	this.transform(this.controller.transformation); //set initial transformation
	this._fittocanvas = true;
	this.clear();
};  
EasyMap.prototype = {	
	clear: function(){
		var mapCanvas = this.canvas;
		var ctx = mapCanvas.getContext('2d');

		this._maxX = 0;
		this._maxY = 0;
		if(!this.canvas.transformation.spherical && this.settings.background){
			ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
			ctx.fillStyle = this.settings.background;
			ctx.fill();
		}
		else{
			ctx.clearRect(0,0,this.canvas.width,this.canvas.height);		
		}
		
	},
	
	drawFromGeojson: function(responseText){

			var geojson;
			if(typeof responseText == 'string'){
				geojson = eval('(' +responseText + ')');
				//console.log("eval done: ",geojson);
			}
			else
				geojson = responseText;
			
			this._lastgeojson = geojson;
			if(!geojson.points && this._fittocanvas){
				geojson = EasyMapUtils.fitgeojsontocanvas(geojson,this.canvas);
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
				if(this.spherical) {
					geojson.transform.translate = {x:0,y:0};
				}
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
			this.render();
	},
	drawFromGeojsonFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		
			that.drawFromGeojson(responseText);
		};
		EasyMapUtils.loadRemoteFile(file,callback);
	},	
	drawFromSVG: function(representation){
		var xml = EasyMapUtils._getXML(representation);

		var json = EasyMapSVGUtils.convertSVGToMultiPolygonFeatureCollection(xml,this.canvas);
		this.drawFromGeojson(json);			
		
	},
	drawFromSVGFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
			

			that.drawFromSVG(responseText);
			
		};
		EasyMapUtils.loadRemoteFile(file,callback);		
			
	},	
	redraw: function(){
		this.clear();
		this.render();
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
	
	csstransform: function(transformation){
		this.canvas.transformation = transformation;
		


		if(!transformation.origin){
	
			var w =parseInt(this.canvas.width);  		
			var h = parseInt(this.canvas.height);
			this.canvas.transformation.origin = {};
			var origin = this.canvas.transformation.origin;
			origin.x =w / 2;
			origin.y =h / 2;
		}
		var tran = this.canvas.transformation;
		var s = tran.scale;
		var o = tran.origin;
		var t = tran.translate;
		var shapes = this.canvas.childNodes[0].childNodes;
		for(var i=0; i < shapes.length; i++){
			var shape =shapes[i];
			if(!shape.initialStyle) {
				var initTop = parseInt(shape.style.top);
				if(!initTop) initTop = 0;
				initTop += o.y;
				var initLeft = parseInt(shape.style.left);
				if(!initLeft) initLeft = 0;
				initLeft += o.x;
				
				shape.initialStyle = {top: initTop, left: initLeft, width: parseInt(shape.style.width), height: parseInt(shape.style.height)};
			}
			
			var initialStyle= shape.initialStyle;
			
			var style = shape.style;			
			var newtop,newleft;
			newtop = initialStyle.top;
			newleft = initialStyle.left;

			//scale
			var newwidth = initialStyle.width * s.x;
			var newheight = initialStyle.height * s.y; 	
			
			//translate into right place
			
			var temp;
			temp = (t.x - o.x) * s.x;
			newleft += temp;
			
			temp = (t.y - o.y) * s.x;
			newtop += temp;						


			style.left = newleft;
			style.top = newtop;
						
			style.width = newwidth;
			style.height = newheight;

			
		}
	},
	_addShapeToMemory: function(easyShape){ //add shape to memory
		var memory = this.canvas.memory;
		easyShape.id = memory.length;
		memory[easyShape.id] = easyShape;	
	},
	_createGlobe: function(){
		var t =this.canvas.transformation;
		var ctx = this.canvas.getContext('2d');
		var rad =t.spherical.radius;
	
	  var radgrad = ctx.createRadialGradient(0,0,10,0,0,rad);

	radgrad.addColorStop(0,"#AFDCEC");
		  //radgrad.addColorStop(0.5, '#00C9FF');
		radgrad.addColorStop(1, '#00B5E2');
	  //radgrad.addColorStop(1, 'rgba(0,201,255,0)');


		ctx.beginPath();
		ctx.arc(0, 0, rad, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fillStyle = radgrad;
		ctx.fill();
		

	},
	render: function(flag){
		var ctx = this.canvas.getContext('2d');
		this.ctx = ctx;
		var that = this;
		if(!flag && this.settings.backgroundimg){
			
			var img = new Image();
			img.src=this.settings.backgroundimg;
			img.width = this.canvas.width;
			img.height = this.canvas.height;
			img.onload = function(){
				ctx.globalAlpha = 1;
				ctx.drawImage(img,0,0);
				ctx.globalAlpha = 0.4;
				that.render(true);

			};
			return;
			
		}
		
		var mem =this.canvas.memory;


		var t =this.canvas.transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
		
		ctx.lineWidth = (1 / s.x);
		ctx.lineJoin = 'round'; //miter or bevel or round
		ctx.save();	
		ctx.translate(o.x,o.y);
		ctx.scale(s.x,s.y);
		ctx.translate(tr.x,tr.y);
		
		if(t.spherical){
			this.settings.projection= {
					nowrap:true,
					xy: function(x,y){
						var res = EasyMapUtils._spherifycoordinate(x,y,t);
						return res;
					}
			};
			this._createGlobe();
		}
		var left = 0;
		var top = 0;
		var right =  parseInt(this.canvas.width) + left; 
		var bottom = parseInt(this.canvas.height) + top;

		var transformedGrid = {};
		var t= this.canvas.transformation;
		var topleft = EasyMapUtils.undotransformation(left,top,t);
		var bottomright = EasyMapUtils.undotransformation(right,bottom,t);
		
		var frame = {};
		frame.top = topleft.y;
		frame.bottom = bottomright.y;
		frame.right = bottomright.x;
		frame.left = topleft.x;

		for(var i=0; i < mem.length; i++){
			mem[i].render(ctx,t,this.settings.projection,frame,this.settings.optimisations);
		}
		ctx.restore();
		
		//if(this.browser == 'ie') {this.transform = this.csstransform;}
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
		var s = new EasyShape(p,coordinates,"geojson",this.settings.projection);
		this._addShapeToMemory(s);
	},
	_drawGeoJsonPointFeature: function(coordinates,properties){
		var p = properties;
		p.shape = 'point';
		var s = new EasyShape(p,coordinates,"geojson", this.settings.projection);
		this._addShapeToMemory(s);
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


var EasyShape = function(properties,coordinates,geojson){
	this.grid = {};
	this.coords = [];
	if(geojson){
		this.constructFromGeoJSONObject(properties,coordinates);
	}
	else{
		this.constructBasicPolygon(properties,coordinates);
	}
	
	this._calculateBounds();

};
EasyShape.prototype={
	_calculateBounds: function(coords){
			if(!coords) coords = this.coords;
			this.grid.x1 = coords[0];
			this.grid.y1 = coords[1];
			this.grid.x2 = coords[0];
			this.grid.y2 = coords[1];
			
			this._deltas = []
			var d = this._deltas;

			var lastX, lastY;
			var index = 0;
		
			lastX = coords[0];
			lastY = coords[1];
			for(var i=0; i < coords.length-1; i+=2){
				var xPos = parseFloat(coords[i]); //long
				var yPos = parseFloat(coords[i+1]); //lat
				var deltax =xPos - lastX;
				var deltay= yPos - lastY;
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
			this.pointcoords = [x,y];
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
	//converts [[x1,y1], [x2,y2],...[xn,yn]] to [x1,y1,x2,y2..xn,yn]
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

	,applyProjection: function(projection){
		var c = this.coords;
		if(!projection) return c;
		
		var newc = [];
		for(var i=0; i < c.length-1; i+=2){
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);
			
			if(projection.xy){
				var t = projection.xy(c[i],c[i+1]);
				newx= t.x;
				newy= t.y;
			}

			cok = true;
			//check we haven't wrapped around world (For flat projections sss)
			if(!projection.nowrap){
				var diff;
				if(newx > x) diff = newx - x;
				if(x > newx) diff = x - newx;
				if(diff > 100) cok = false; //too extreme change
			}
			
			if(cok){
				if(typeof newx == 'number' && typeof newy =='number'){
				newc.push(newx);
				newc.push(newy);
				}
	
			}
			
			
		}	

		this._tcoords = newc;
		this._calculateBounds(this._tcoords);
		return newc;
	}
	
	/*
	render the shape using canvas ctx 
	using ctx and a given transformation in form {translate: {x:<num>, y:<num>}, scale:{translate: {x:<num>, y:<num>}}
	projection: a function that takes xy coordinates and spits out a new x and y
	in a given viewableArea 
	optimisations: boolean - apply optimisations if required
	*/
	,render: function(ctx,transformation,projection,viewableArea,optimisations){
		var scale = transformation.scale;
		var frame = viewableArea;
		var shapetype = this.properties.shape;
		if(shapetype=='polygon'){		//good shape
		}
		else if(shapetype == 'point'){
			var x =this.pointcoords[0];
			var y =this.pointcoords[1];
			this.coords = [x,y];		
			var ps = 5 / scale.x;
			var newcoords =[[x-ps,y-ps],[x+ps,y-ps],[x+ps,y+ps],[x-ps, y+ps]];
			var c = this._convertGeoJSONCoords(newcoords);
			this.coords = c;
		} 
		else{
			console.log("no idea how to draw" +this.properties.shape);return;
		}		
		
		if(optimisations){
			if(shapetype != 'point' && frame && this.grid){ //check if worth drawing
					var g = this.grid;
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
		}	
		ctx.beginPath();
		var c;
		
		if(projection)
			c = this.applyProjection(projection);
		else
			c = this.coords;
			
		if(c.length == 0) return;
		
		var deltas = this._deltas;
		var initialX = parseFloat(c[0]);
		var initialY = parseFloat(c[1]);

		var pathLength = {x: 0, y:0};
		var threshold = 2;
		ctx.moveTo(initialX,initialY);

		for(var i=2; i < c.length-1; i+=2){
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);
		
			pathLength.x += deltas[i];
			pathLength.y += deltas[i+1];

			var deltax = parseFloat(pathLength.x) * scale.x;
			var deltay = parseFloat(pathLength.y)* scale.y;
			if(optimisations ||( shapetype == 'point' ||(deltax > threshold || deltay > threshold))){
				ctx.lineTo(x,y);
				pathLength.x = 0;
				pathLength.y = 0;
			}

		}
		//connect last to first
		ctx.lineTo(initialX,initialY);
		ctx.closePath();

		
		if(!this.properties.hidden) {
			ctx.strokeStyle = this.properties.stroke;
			if(typeof this.properties.fill == 'string') 
				fill = this.properties.fill;
			else
				fill = "#ffffff";
				
			ctx.fillStyle = fill;
			ctx.stroke();
			ctx.fill();
		}
		
		
	}/*
	,spherify: function(transformation){
		var newcoords = [];
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
		this._tcoords = newcoords;
		this.createGrid(newcoords);
		return newcoords;
	}*/
	/*,transformcoordinates: function(transformation,spherical,radius){		
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
	}*/
};/*requires EasyShapes and EasyController */

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
	        	if (!e) /* For IE. */
	                e = window.event;
			e.preventDefault();		
					
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;

	
	
			var t = EasyMapUtils.resolveTarget(e);
		
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
				var newx = s.x+ delta;
				var newy = s.y + delta;
				if(newx > 0 && newy > 0){
					s.x = newx;
					s.y = newy;
					that.transform();					
				}

			}
			
			this.lastdelta = delta;
			
			return false;

		}

		
		var element = this.wrapper;
		if (element.addEventListener){
		        /** DOMMouseScroll is for mozilla. */
		
		        element.addEventListener('DOMMouseScroll', onmousewheel, false);
		
		}
		else if(element.attachEvent){
			element.attachEvent("mousewheel", onmousewheel); //safari
		}
		else{ //it's ie.. or something non-standardised. do nowt
		//window.onmousewheel = document.onmousewheel = onmousewheel;	
		}

		
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
			var t = EasyMapUtils.resolveTarget(e);
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
			var target = EasyMapUtils.resolveTarget(e);
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
		var rad = angle ? EasyMapUtils._degToRad(angle) : 0;
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

		newCanvas.controller = this;
		if(!newCanvas.getContext) {
			G_vmlCanvasManager.init_(document);
		}
		newCanvas.memory = [];
		//return clickableCanvas(newCanvas);
		return newCanvas;
	},
	addPanningActions: function(controlDiv){
		var panCanvas = this._createcontrollercanvas(44,44);		
		panCanvas.memory.push(this.drawButton(panCanvas,10,180,{x:16,y:2},{'actiontype':'N','name':'pan north','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,270,{x:30,y:16},{'actiontype':'E','name':'pan east','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,90,{x:16,y:16},{'actiontype':'O','name':'re-center','buttonType': ''}));
		
		panCanvas.memory.push(this.drawButton(panCanvas,10,90,{x:2,y:16},{'actiontype':'W','name':'pan west','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,0,{x:16,y:30},{'actiontype':'S','name':'pan south','buttonType': 'arrow'}));			
		panCanvas.onmouseup = this._panzoomClickHandler;		

	},
	addRotatingActions: function(){
		
		var rotateCanvas = this._createcontrollercanvas(44,40);		
		rotateCanvas.memory.push(this.drawButton(rotateCanvas,10,270,{x:30,y:16},{'actiontype':'rotatezright','name':'rotate to right','buttonType': 'arrow'}));
		rotateCanvas.memory.push(this.drawButton(rotateCanvas,10,90,{x:2,y:16},{'actiontype':'rotatezleft','name':'rotate to left','buttonType': 'arrow'}));
		rotateCanvas.onmouseup = this._panzoomClickHandler;

	},	
	addZoomingActions: function(){
		var zoomCanvas = this._createcontrollercanvas(20,30);

		var left = 14;
		var top = 50;
		zoomCanvas.style.left = left +"px";
		zoomCanvas.style.top = top + "px";
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:2},{'actiontype':'in','name':'zoom in','buttonType': 'plus'}));		
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:16},{'actiontype':'out','name':'zoom out','buttonType': 'minus'}));
		zoomCanvas.onmouseup = this._panzoomClickHandler;	
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
		var controller = this.controller;
			
		var hit = controller.utils.getShapeAtClick(e);
		if(!hit) {
		
			return false;
		}

		var pan = {};
		var t =controller.transformation;
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
			case "O":
				t.translate.x = 0;
				t.translate.y = 0;
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
		controller.transform();

		return false;
	}
};
/*
Some common utils used throughout package 
depends on jquery
*/

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


var EasyMapUtils = {
	_radToDeg: function(rad){
		return rad / (Math.PI /180);
	},
	_degToRad: function(deg) {
		return deg * Math.PI / 180;
	},
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
		/*
		if(t.spherical) {
			pos = this._undospherify(pos.x,pos.y,t);
		}*/

			
			
		return pos;
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
	
	getMouseFromEventRelativeTo: function (e,x,y){
		
		var pos = this.getMouseFromEvent(e);
		if(!pos) return false;
		pos.x -= x;
		pos.y -= y;

		return pos;
		
	},
	getMouseFromEventRelativeToCenter: function(e){
		var w,h;
		var target = this.resolveTargetWithMemory(e);
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
			var target = this.resolveTargetWithMemory(e);
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
		var target = this.resolveTargetWithMemory(e);
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
		var pos= this._spherifycoordinate(x,y,transformation);
		var latitude = Math.asin(y / radius);
		var longitude = Math.asin(parseFloat(x / radius) / Math.cos(latitude));

				
	
		//if(transformation.rotate.z && longitude != 'NaN')longitude -= transformation.rotate.z;
		//longitude = longitude % (6.28318531);
		//if(longitude < 0) longitude = longitude 

		if(transformation.rotate) {
			var r =transformation.rotate.z;
			console.log("from",longitude);
			longitude +=r;
		
			//longitude =longitude% (6.28318531);
			
		}
		var lon = EasyMapUtils._radToDeg(longitude);
		var lat = EasyMapUtils._radToDeg(latitude);
		console.log("to",longitude,r,lon);
		return {x:lon,y:lat};
	},
	_spherifycoordinate: function(lon,lat,transformation){//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var radius = transformation.spherical.radius;
		var utils = EasyMapUtils;
		var res = {};
		
		var longitude = EasyMapUtils._degToRad(lon);
		var latitude = EasyMapUtils._degToRad(lat);
 		
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
		else{
			res.x = false;
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
	// Resolve the target object of an event
	,resolveTarget:function(e)
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
	},

	resolveTargetWithMemory: function(e)
	{
		var node = EasyMapUtils.resolveTarget(e);
		var first = node;
		while(node && !node.memory){
			node = node.parentNode;
		}
		if(!node) node = first;
		return node;
	}
};
/*
SVG targeted functions withe goal to convert to a geojson structure
*/
var EasyMapSVGUtils= {
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
		
		res = EasyMapUtils.fitgeojsontocanvas(res,canvas)
		return res;
	},
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
// Copyright 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// Known Issues:
//
// * Patterns are not implemented.
// * Radial gradient are not implemented. The VML version of these look very
//   different from the canvas one.
// * Clipping paths are not implemented.
// * Coordsize. The width and height attribute have higher priority than the
//   width and height style values which isn't correct.
// * Painting mode isn't implemented.
// * Canvas width/height should is using content-box by default. IE in
//   Quirks mode will draw the canvas using border-box. Either change your
//   doctype to HTML5
//   (http://www.whatwg.org/specs/web-apps/current-work/#the-doctype)
//   or use Box Sizing Behavior from WebFX
//   (http://webfx.eae.net/dhtml/boxsizing/boxsizing.html)
// * Non uniform scaling does not correctly scale strokes.
// * Optimize. There is always room for speed improvements.

// Only add this code if we do not already have a canvas implementation
if (!document.createElement('canvas').getContext) {
(function() {

  // alias some functions to make (compiled) code shorter
  var m = Math;
  var mr = m.round;
  var ms = m.sin;
  var mc = m.cos;
  var max = m.max;
  var abs = m.abs;
  var sqrt = m.sqrt;

  // this is used for sub pixel precision
  var Z = 10;
  var Z2 = Z / 2;

  /**
   * This funtion is assigned to the <canvas> elements as element.getContext().
   * @this {HTMLElement}
   * @return {CanvasRenderingContext2D_}
   */
  function getContext() {
    return this.context_ ||
        (this.context_ = new CanvasRenderingContext2D_(this));
  }

  var slice = Array.prototype.slice;

  /**
   * Binds a function to an object. The returned function will always use the
   * passed in {@code obj} as {@code this}.
   *
   * Example:
   *
   *   g = bind(f, obj, a, b)
   *   g(c, d) // will do f.call(obj, a, b, c, d)
   *
   * @param {Function} f The function to bind the object to
   * @param {Object} obj The object that should act as this when the function
   *     is called
   * @param {*} var_args Rest arguments that will be used as the initial
   *     arguments when the function is called
   * @return {Function} A new function that has bound this
   */
  function bind(f, obj, var_args) {
    var a = slice.call(arguments, 2);
    return function() {
      return f.apply(obj, a.concat(slice.call(arguments)));
    };
  }

  var G_vmlCanvasManager_ = {
    init: function(opt_doc) {
      if (/MSIE/.test(navigator.userAgent) && !window.opera) {
        var doc = opt_doc || document;
        // Create a dummy element so that IE will allow canvas elements to be
        // recognized.
        doc.createElement('canvas');
        doc.attachEvent('onreadystatechange', bind(this.init_, this, doc));
      }
    },

    init_: function(doc) {
      // create xmlns
      if (!doc.namespaces['g_vml_']) {
        doc.namespaces.add('g_vml_', 'urn:schemas-microsoft-com:vml');
      }

      // Setup default CSS.  Only add one style sheet per document
      if (!doc.styleSheets['ex_canvas_']) {
        var ss = doc.createStyleSheet();
        ss.owningElement.id = 'ex_canvas_';
        ss.cssText = 'canvas{display:inline-block;overflow:hidden;' +
            // default size is 300x150 in Gecko and Opera
            'text-align:left;width:300px;height:150px}' +
            'g_vml_\\:*{behavior:url(#default#VML)}';
      }

      // find all canvas elements
      var els = doc.getElementsByTagName('canvas');
      for (var i = 0; i < els.length; i++) {
        this.initElement(els[i]);
      }
    },

    /**
     * Public initializes a canvas element so that it can be used as canvas
     * element from now on. This is called automatically before the page is
     * loaded but if you are creating elements using createElement you need to
     * make sure this is called on the element.
     * @param {HTMLElement} el The canvas element to initialize.
     * @return {HTMLElement} the element that was created.
     */
    initElement: function(el) {
      if (!el.getContext) {

        el.getContext = getContext;

        // do not use inline function because that will leak memory
        el.attachEvent('onpropertychange', onPropertyChange);
        el.attachEvent('onresize', onResize);

        var attrs = el.attributes;
        if (attrs.width && attrs.width.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setWidth_(attrs.width.nodeValue);
          el.style.width = attrs.width.nodeValue + 'px';
        } else {
          el.width = el.clientWidth;
        }
        if (attrs.height && attrs.height.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setHeight_(attrs.height.nodeValue);
          el.style.height = attrs.height.nodeValue + 'px';
        } else {
          el.height = el.clientHeight;
        }
        //el.getContext().setCoordsize_()
      }
      return el;
    }
  };

  function onPropertyChange(e) {
    var el = e.srcElement;

    switch (e.propertyName) {
      case 'width':
        el.style.width = el.attributes.width.nodeValue + 'px';
        el.getContext().clearRect();
        break;
      case 'height':
        el.style.height = el.attributes.height.nodeValue + 'px';
        el.getContext().clearRect();
        break;
    }
  }

  function onResize(e) {
    var el = e.srcElement;
    if (el.firstChild) {
      el.firstChild.style.width =  el.clientWidth + 'px';
      el.firstChild.style.height = el.clientHeight + 'px';
    }
  }
  G_vmlCanvasManager_.init();

  // precompute "00" to "FF"
  var dec2hex = [];
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 16; j++) {
      dec2hex[i * 16 + j] = i.toString(16) + j.toString(16);
    }
  }

  function createMatrixIdentity() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  function matrixMultiply(m1, m2) {
    var result = createMatrixIdentity();

    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        var sum = 0;

        for (var z = 0; z < 3; z++) {
          sum += m1[x][z] * m2[z][y];
        }

        result[x][y] = sum;
      }
    }
    return result;
  }

  function copyState(o1, o2) {
    o2.fillStyle     = o1.fillStyle;
    o2.lineCap       = o1.lineCap;
    o2.lineJoin      = o1.lineJoin;
    o2.lineWidth     = o1.lineWidth;
    o2.miterLimit    = o1.miterLimit;
    o2.shadowBlur    = o1.shadowBlur;
    o2.shadowColor   = o1.shadowColor;
    o2.shadowOffsetX = o1.shadowOffsetX;
    o2.shadowOffsetY = o1.shadowOffsetY;
    o2.strokeStyle   = o1.strokeStyle;
    o2.globalAlpha   = o1.globalAlpha;
    o2.arcScaleX_    = o1.arcScaleX_;
    o2.arcScaleY_    = o1.arcScaleY_;
    o2.lineScale_    = o1.lineScale_;
  }

  function processStyle(styleString) {
    var str, alpha = 1;

    styleString = String(styleString);
    if (styleString.substring(0, 3) == 'rgb') {
      var start = styleString.indexOf('(', 3);
      var end = styleString.indexOf(')', start + 1);
      var guts = styleString.substring(start + 1, end).split(',');

      str = '#';
      for (var i = 0; i < 3; i++) {
        str += dec2hex[Number(guts[i])];
      }

      if (guts.length == 4 && styleString.substr(3, 1) == 'a') {
        alpha = guts[3];
      }
    } else {
      str = styleString;
    }

    return [str, alpha];
  }

  function processLineCap(lineCap) {
    switch (lineCap) {
      case 'butt':
        return 'flat';
      case 'round':
        return 'round';
      case 'square':
      default:
        return 'square';
    }
  }

  /**
   * This class implements CanvasRenderingContext2D interface as described by
   * the WHATWG.
   * @param {HTMLElement} surfaceElement The element that the 2D context should
   * be associated with
   */
  function CanvasRenderingContext2D_(surfaceElement) {
    this.m_ = createMatrixIdentity();

    this.mStack_ = [];
    this.aStack_ = [];
    this.currentPath_ = [];

    // Canvas context properties
    this.strokeStyle = '#000';
    this.fillStyle = '#000';

    this.lineWidth = 1;
    this.lineJoin = 'miter';
    this.lineCap = 'butt';
    this.miterLimit = Z * 1;
    this.globalAlpha = 1;
    this.canvas = surfaceElement;

    var el = surfaceElement.ownerDocument.createElement('div');
    el.style.width =  surfaceElement.clientWidth + 'px';
    el.style.height = surfaceElement.clientHeight + 'px';
    el.style.overflow = 'hidden';
    el.style.position = 'absolute';
    surfaceElement.appendChild(el);

    this.element_ = el;
    this.arcScaleX_ = 1;
    this.arcScaleY_ = 1;
    this.lineScale_ = 1;
  }

  var contextPrototype = CanvasRenderingContext2D_.prototype;
  contextPrototype.clearRect = function() {
    this.element_.innerHTML = '';
    this.currentPath_ = [];
  };

  contextPrototype.beginPath = function() {
    // TODO: Branch current matrix so that save/restore has no effect
    //       as per safari docs.
    this.currentPath_ = [];
  };

  contextPrototype.moveTo = function(aX, aY) {
    var p = this.getCoords_(aX, aY);
    this.currentPath_.push({type: 'moveTo', x: p.x, y: p.y});
    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.lineTo = function(aX, aY) {
    var p = this.getCoords_(aX, aY);
    this.currentPath_.push({type: 'lineTo', x: p.x, y: p.y});

    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.bezierCurveTo = function(aCP1x, aCP1y,
                                            aCP2x, aCP2y,
                                            aX, aY) {
    var p = this.getCoords_(aX, aY);
    var cp1 = this.getCoords_(aCP1x, aCP1y);
    var cp2 = this.getCoords_(aCP2x, aCP2y);
    bezierCurveTo(this, cp1, cp2, p);
  };

  // Helper function that takes the already fixed cordinates.
  function bezierCurveTo(self, cp1, cp2, p) {
    self.currentPath_.push({
      type: 'bezierCurveTo',
      cp1x: cp1.x,
      cp1y: cp1.y,
      cp2x: cp2.x,
      cp2y: cp2.y,
      x: p.x,
      y: p.y
    });
    self.currentX_ = p.x;
    self.currentY_ = p.y;
  }

  contextPrototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
    // the following is lifted almost directly from
    // http://developer.mozilla.org/en/docs/Canvas_tutorial:Drawing_shapes

    var cp = this.getCoords_(aCPx, aCPy);
    var p = this.getCoords_(aX, aY);

    var cp1 = {
      x: this.currentX_ + 2.0 / 3.0 * (cp.x - this.currentX_),
      y: this.currentY_ + 2.0 / 3.0 * (cp.y - this.currentY_)
    };
    var cp2 = {
      x: cp1.x + (p.x - this.currentX_) / 3.0,
      y: cp1.y + (p.y - this.currentY_) / 3.0
    };

    bezierCurveTo(this, cp1, cp2, p);
  };

  contextPrototype.arc = function(aX, aY, aRadius,
                                  aStartAngle, aEndAngle, aClockwise) {
    aRadius *= Z;
    var arcType = aClockwise ? 'at' : 'wa';

    var xStart = aX + mc(aStartAngle) * aRadius - Z2;
    var yStart = aY + ms(aStartAngle) * aRadius - Z2;

    var xEnd = aX + mc(aEndAngle) * aRadius - Z2;
    var yEnd = aY + ms(aEndAngle) * aRadius - Z2;

    // IE won't render arches drawn counter clockwise if xStart == xEnd.
    if (xStart == xEnd && !aClockwise) {
      xStart += 0.125; // Offset xStart by 1/80 of a pixel. Use something
                       // that can be represented in binary
    }

    var p = this.getCoords_(aX, aY);
    var pStart = this.getCoords_(xStart, yStart);
    var pEnd = this.getCoords_(xEnd, yEnd);

    this.currentPath_.push({type: arcType,
                           x: p.x,
                           y: p.y,
                           radius: aRadius,
                           xStart: pStart.x,
                           yStart: pStart.y,
                           xEnd: pEnd.x,
                           yEnd: pEnd.y});

  };

  contextPrototype.rect = function(aX, aY, aWidth, aHeight) {
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
  };

  contextPrototype.strokeRect = function(aX, aY, aWidth, aHeight) {
    // Will destroy any existing path (same as FF behaviour)
    this.beginPath();
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.stroke();
    this.currentPath_ = [];
  };

  contextPrototype.fillRect = function(aX, aY, aWidth, aHeight) {
    // Will destroy any existing path (same as FF behaviour)
    this.beginPath();
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.fill();
    this.currentPath_ = [];
  };

  contextPrototype.createLinearGradient = function(aX0, aY0, aX1, aY1) {
    return new CanvasGradient_('gradient');
  };

  contextPrototype.createRadialGradient = function(aX0, aY0,
                                                   aR0, aX1,
                                                   aY1, aR1) {
    var gradient = new CanvasGradient_('gradientradial');
    gradient.radius1_ = aR0;
    gradient.radius2_ = aR1;
    gradient.focus_.x = aX0;
    gradient.focus_.y = aY0;
    return gradient;
  };

  contextPrototype.drawImage = function(image, var_args) {
    var dx, dy, dw, dh, sx, sy, sw, sh;

    // to find the original width we overide the width and height
    var oldRuntimeWidth = image.runtimeStyle.width;
    var oldRuntimeHeight = image.runtimeStyle.height;
    image.runtimeStyle.width = 'auto';
    image.runtimeStyle.height = 'auto';

    // get the original size
    var w = image.width;
    var h = image.height;

    // and remove overides
    image.runtimeStyle.width = oldRuntimeWidth;
    image.runtimeStyle.height = oldRuntimeHeight;

    if (arguments.length == 3) {
      dx = arguments[1];
      dy = arguments[2];
      sx = sy = 0;
      sw = dw = w;
      sh = dh = h;
    } else if (arguments.length == 5) {
      dx = arguments[1];
      dy = arguments[2];
      dw = arguments[3];
      dh = arguments[4];
      sx = sy = 0;
      sw = w;
      sh = h;
    } else if (arguments.length == 9) {
      sx = arguments[1];
      sy = arguments[2];
      sw = arguments[3];
      sh = arguments[4];
      dx = arguments[5];
      dy = arguments[6];
      dw = arguments[7];
      dh = arguments[8];
    } else {
      throw Error('Invalid number of arguments');
    }

    var d = this.getCoords_(dx, dy);

    var w2 = sw / 2;
    var h2 = sh / 2;

    var vmlStr = [];

    var W = 10;
    var H = 10;

    // For some reason that I've now forgotten, using divs didn't work
    vmlStr.push(' <g_vml_:group',
                ' coordsize="', Z * W, ',', Z * H, '"',
                ' coordorigin="0,0"' ,
                ' style="width:', W, ';height:', H, ';position:absolute;');

    // If filters are necessary (rotation exists), create them
    // filters are bog-slow, so only create them if abbsolutely necessary
    // The following check doesn't account for skews (which don't exist
    // in the canvas spec (yet) anyway.

    if (this.m_[0][0] != 1 || this.m_[0][1]) {
      var filter = [];

      // Note the 12/21 reversal
      filter.push('M11=', this.m_[0][0], ',',
                  'M12=', this.m_[1][0], ',',
                  'M21=', this.m_[0][1], ',',
                  'M22=', this.m_[1][1], ',',
                  'Dx=', mr(d.x / Z), ',',
                  'Dy=', mr(d.y / Z), '');

      // Bounding box calculation (need to minimize displayed area so that
      // filters don't waste time on unused pixels.
      var max = d;
      var c2 = this.getCoords_(dx + dw, dy);
      var c3 = this.getCoords_(dx, dy + dh);
      var c4 = this.getCoords_(dx + dw, dy + dh);

      max.x = max(max.x, c2.x, c3.x, c4.x);
      max.y = max(max.y, c2.y, c3.y, c4.y);

      vmlStr.push('padding:0 ', mr(max.x / Z), 'px ', mr(max.y / Z),
                  'px 0;filter:progid:DXImageTransform.Microsoft.Matrix(',
                  filter.join(''), ", sizingmethod='clip');")
    } else {
      vmlStr.push('top:', mr(d.y / Z), 'px;left:', mr(d.x / Z), 'px;');
    }

    vmlStr.push(' ">' ,
                '<g_vml_:image src="', image.src, '"',
                ' style="width:', Z * dw, ';',
                ' height:', Z * dh, ';"',
                ' cropleft="', sx / w, '"',
                ' croptop="', sy / h, '"',
                ' cropright="', (w - sx - sw) / w, '"',
                ' cropbottom="', (h - sy - sh) / h, '"',
                ' />',
                '</g_vml_:group>');

    this.element_.insertAdjacentHTML('BeforeEnd',
                                    vmlStr.join(''));
  };

  contextPrototype.stroke = function(aFill) {
    var lineStr = [];
    var lineOpen = false;
    var a = processStyle(aFill ? this.fillStyle : this.strokeStyle);
    var color = a[0];
    var opacity = a[1] * this.globalAlpha;

    var W = 10;
    var H = 10;

    lineStr.push('<g_vml_:shape',
                 ' filled="', !!aFill, '"',
                 ' style="position:absolute;width:', W, ';height:', H, ';"',
                 ' coordorigin="0 0" coordsize="', Z * W, ' ', Z * H, '"',
                 ' stroked="', !aFill, '"',
                 ' path="');

    var newSeq = false;
    var min = {x: null, y: null};
    var max = {x: null, y: null};

    for (var i = 0; i < this.currentPath_.length; i++) {
      var p = this.currentPath_[i];
      var c;

      switch (p.type) {
        case 'moveTo':
          c = p;
          lineStr.push(' m ', mr(p.x), ',', mr(p.y));
          break;
        case 'lineTo':
          lineStr.push(' l ', mr(p.x), ',', mr(p.y));
          break;
        case 'close':
          lineStr.push(' x ');
          p = null;
          break;
        case 'bezierCurveTo':
          lineStr.push(' c ',
                       mr(p.cp1x), ',', mr(p.cp1y), ',',
                       mr(p.cp2x), ',', mr(p.cp2y), ',',
                       mr(p.x), ',', mr(p.y));
          break;
        case 'at':
        case 'wa':
          lineStr.push(' ', p.type, ' ',
                       mr(p.x - this.arcScaleX_ * p.radius), ',',
                       mr(p.y - this.arcScaleY_ * p.radius), ' ',
                       mr(p.x + this.arcScaleX_ * p.radius), ',',
                       mr(p.y + this.arcScaleY_ * p.radius), ' ',
                       mr(p.xStart), ',', mr(p.yStart), ' ',
                       mr(p.xEnd), ',', mr(p.yEnd));
          break;
      }


      // TODO: Following is broken for curves due to
      //       move to proper paths.

      // Figure out dimensions so we can do gradient fills
      // properly
      if (p) {
        if (min.x == null || p.x < min.x) {
          min.x = p.x;
        }
        if (max.x == null || p.x > max.x) {
          max.x = p.x;
        }
        if (min.y == null || p.y < min.y) {
          min.y = p.y;
        }
        if (max.y == null || p.y > max.y) {
          max.y = p.y;
        }
      }
    }
    lineStr.push(' ">');

    if (!aFill) {
      var lineWidth = this.lineScale_ * this.lineWidth;

      // VML cannot correctly render a line if the width is less than 1px.
      // In that case, we dilute the color to make the line look thinner.
      if (lineWidth < 1) {
        opacity *= lineWidth;
      }

      lineStr.push(
        '<g_vml_:stroke',
        ' opacity="', opacity, '"',
        ' joinstyle="', this.lineJoin, '"',
        ' miterlimit="', this.miterLimit, '"',
        ' endcap="', processLineCap(this.lineCap), '"',
        ' weight="', lineWidth, 'px"',
        ' color="', color, '" />'
      );
    } else if (typeof this.fillStyle == 'object') {
      var focus = {x: '50%', y: '50%'};
      var width = max.x - min.x;
      var height = max.y - min.y;
      var dimension = width > height ? width : height;

      focus.x = mr(this.fillStyle.focus_.x / width * 100 + 50) + '%';
      focus.y = mr(this.fillStyle.focus_.y / height * 100 + 50) + '%';

      var colors = [];

      // inside radius (%)
      if (this.fillStyle.type_ == 'gradientradial') {
        var inside = this.fillStyle.radius1_ / dimension * 100;

        // percentage that outside radius exceeds inside radius
        var expansion = this.fillStyle.radius2_ / dimension * 100 - inside;
      } else {
        var inside = 0;
        var expansion = 100;
      }

      var insidecolor = {offset: null, color: null};
      var outsidecolor = {offset: null, color: null};

      // We need to sort 'colors' by percentage, from 0 > 100 otherwise ie
      // won't interpret it correctly
      this.fillStyle.colors_.sort(function(cs1, cs2) {
        return cs1.offset - cs2.offset;
      });

      for (var i = 0; i < this.fillStyle.colors_.length; i++) {
        var fs = this.fillStyle.colors_[i];

        colors.push(fs.offset * expansion + inside, '% ', fs.color, ',');

        if (fs.offset > insidecolor.offset || insidecolor.offset == null) {
          insidecolor.offset = fs.offset;
          insidecolor.color = fs.color;
        }

        if (fs.offset < outsidecolor.offset || outsidecolor.offset == null) {
          outsidecolor.offset = fs.offset;
          outsidecolor.color = fs.color;
        }
      }
      colors.pop();

      lineStr.push('<g_vml_:fill',
                   ' color="', outsidecolor.color, '"',
                   ' color2="', insidecolor.color, '"',
                   ' type="', this.fillStyle.type_, '"',
                   ' focusposition="', focus.x, ', ', focus.y, '"',
                   ' colors="', colors.join(''), '"',
                   ' opacity="', opacity, '" />');
    } else {
      lineStr.push('<g_vml_:fill color="', color, '" opacity="', opacity,
                   '" />');
    }

    lineStr.push('</g_vml_:shape>');

    this.element_.insertAdjacentHTML('beforeEnd', lineStr.join(''));
  };

  contextPrototype.fill = function() {
    this.stroke(true);
  }

  contextPrototype.closePath = function() {
    this.currentPath_.push({type: 'close'});
  };

  /**
   * @private
   */
  contextPrototype.getCoords_ = function(aX, aY) {
    var m = this.m_;
    return {
      x: Z * (aX * m[0][0] + aY * m[1][0] + m[2][0]) - Z2,
      y: Z * (aX * m[0][1] + aY * m[1][1] + m[2][1]) - Z2
    }
  };

  contextPrototype.save = function() {
    var o = {};
    copyState(this, o);
    this.aStack_.push(o);
    this.mStack_.push(this.m_);
    this.m_ = matrixMultiply(createMatrixIdentity(), this.m_);
  };

  contextPrototype.restore = function() {
    copyState(this.aStack_.pop(), this);
    this.m_ = this.mStack_.pop();
  };

  contextPrototype.translate = function(aX, aY) {
    var m1 = [
      [1,  0,  0],
      [0,  1,  0],
      [aX, aY, 1]
    ];

    this.m_ = matrixMultiply(m1, this.m_);
  };

  contextPrototype.rotate = function(aRot) {
    var c = mc(aRot);
    var s = ms(aRot);

    var m1 = [
      [c,  s, 0],
      [-s, c, 0],
      [0,  0, 1]
    ];

    this.m_ = matrixMultiply(m1, this.m_);
  };

  contextPrototype.scale = function(aX, aY) {
    this.arcScaleX_ *= aX;
    this.arcScaleY_ *= aY;
    var m1 = [
      [aX, 0,  0],
      [0,  aY, 0],
      [0,  0,  1]
    ];

    var m = this.m_ = matrixMultiply(m1, this.m_);

    // Get the line scale.
    // Determinant of this.m_ means how much the area is enlarged by the
    // transformation. So its square root can be used as a scale factor
    // for width.
    var det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    this.lineScale_ = sqrt(abs(det));
  };

  /******** STUBS ********/
  contextPrototype.clip = function() {
    // TODO: Implement
  };

  contextPrototype.arcTo = function() {
    // TODO: Implement
  };

  contextPrototype.createPattern = function() {
    return new CanvasPattern_;
  };

  // Gradient / Pattern Stubs
  function CanvasGradient_(aType) {
    this.type_ = aType;
    this.radius1_ = 0;
    this.radius2_ = 0;
    this.colors_ = [];
    this.focus_ = {x: 0, y: 0};
  }

  CanvasGradient_.prototype.addColorStop = function(aOffset, aColor) {
    aColor = processStyle(aColor);
    this.colors_.push({offset: 1 - aOffset, color: aColor});
  };

  function CanvasPattern_() {}

  // set up externs
  G_vmlCanvasManager = G_vmlCanvasManager_;
  CanvasRenderingContext2D = CanvasRenderingContext2D_;
  CanvasGradient = CanvasGradient_;
  CanvasPattern = CanvasPattern_;

})();

} // if
