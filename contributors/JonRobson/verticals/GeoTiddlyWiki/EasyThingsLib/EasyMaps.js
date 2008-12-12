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

