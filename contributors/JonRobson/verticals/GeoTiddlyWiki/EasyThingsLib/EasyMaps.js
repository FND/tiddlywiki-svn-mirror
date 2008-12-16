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
	
	if(!wrapper.style.width) wrapper.style.width = "600px";
	if(!wrapper.style.height) wrapper.style.height= "200px";
	
	var canvas = document.createElement('canvas');
	canvas.width = parseInt(wrapper.style.width);
	canvas.height = parseInt(wrapper.style.height);
	canvas.style.width = wrapper.style.width;
	canvas.style.height = wrapper.style.height;	
	
	canvas.style["z-index"] = 1;
	canvas.style.position = "absolute";
	this.canvas = canvas;


	if(!canvas.getContext) {
		this.canvas.browser = 'ie';
	}
	else
		this.canvas.browser = 'good';
		
	this.spherical = false; //experimental!! fiddle with at your own risk! :)

	this.canvas.memory = [];

	wrapper.appendChild(canvas);
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


		this._maxX = 0;
		this._maxY = 0;
		if(!this.canvas.transformation.spherical && this.settings.background){
			this.wrapper.style.background = this.settings.background;
		}
		else{
			this.wrapper.style.background = "";
		}
		
		if(!this.canvas.getContext) {return;}
		var ctx = this.canvas.getContext('2d');
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
				this.canvas.transformation.rotate = {z:0};
			}
			
			if(!this.canvas.transformation.spherical.radius){
			var heightR = (parseInt(this.canvas.height) / s.y) /2;
			var widthR= (parseInt(this.canvas.width) / s.x) /2;
			
			
			if(widthR > heightR)
				this.canvas.transformation.spherical.radius = heightR;
			else
				this.canvas.transformation.spherical.radius = widthR;
			}
		}
		this.redraw();
	},
	
	_addShapeToMemory: function(easyShape){ //add shape to memory
		var memory = this.canvas.memory;
		easyShape.id = memory.length;
		memory[easyShape.id] = easyShape;	
	},
	_createGlobe: function(){
		if(!this.canvas.getContext) {return;}
		var ctx = this.canvas.getContext('2d');
		if(!ctx) return;
		var t =this.canvas.transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
		ctx.save();	
		ctx.translate(o.x,o.y);
		ctx.scale(s.x,s.y);
		ctx.translate(tr.x,tr.y);
		

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
		ctx.restore();

	},
	
	_renderWithBackgroundImage: function(){
		if(!this.canvas.getContext) return;
		var ctx = this.canvas.getContext('2d');
		
		var that = this;
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
	},
	_setupCanvasEnvironment: function(){
		if(!this.canvas.getContext) return;
		var ctx = this.canvas.getContext('2d');
		var s =this.canvas.transformation.scale;
		ctx.lineWidth = (1 / s.x);
		ctx.lineJoin = 'round'; //miter or bevel or round	
	},
	render: function(flag){

		if(!flag && this.settings.backgroundimg){
			this._renderWithBackgroundImage();
			return;			
		}
		
		var mem =this.canvas.memory;
		this._setupCanvasEnvironment()


		var tran =this.canvas.transformation;

		if(tran.spherical){
			this.settings.projection= {
					nowrap:true,
					xy: function(x,y,t){
						var res = EasyMapUtils._spherifycoordinate(x,y,t);
						return res;
					}
			};
			this._createGlobe();
		}

		for(var i=0; i < mem.length; i++){	
			mem[i].render(this.canvas,tran,this.settings.projection,this.settings.optimisations);
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
