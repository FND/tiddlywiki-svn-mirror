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
	this.settings.globalAlpha = 1;
	this.settings.renderPolygonMode = true; //choose not to render polygon shapes (good if you just want to display points)
	
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

	this.feature_reference = {};
	if(!canvas.getContext) {
		this.settings.browser = 'ie';
	}
	else
		this.settings.browser = 'good';
		
	this.spherical = false; //experimental!! fiddle with at your own risk! :)

	this.easyClicking = new EasyClicking(wrapper);
	//this.canvas.memory = [];

	wrapper.appendChild(canvas);
	wrapper.easyMaps = this;


	this._setupMouseHandlers();

	this.controller = new EasyMapController(this,this.wrapper);

		
	//run stuff
	this.transform(this.controller.transformation); //set initial transformation
	this._fittocanvas = true;
	this.geofeatures = {};
	this.clear();
};  
EasyMap.prototype = {
	clear: function(){


		this._maxX = 0;
		this._maxY = 0;

		
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
		EasyFileUtils.loadRemoteFile(file,callback);
	},	

	attachBackground: function(imgpath){
		if(!this.canvas.transformation.spherical && this.settings.background){
			this.wrapper.style.background=this.settings.background;
		}
		else{
			this.wrapper.style.background = "";
		}
		
		//if(!this._rendered) return;
		if(imgpath) this.settings.backgroundimg = imgpath;
		if(!this.canvas.transformation.spherical && this.settings.backgroundimg){
			if(this.settings.renderPolygonMode) this.settings.globalAlpha = 0.8;
			
			this.wrapper.style.backgroundImage = "url('"+this.settings.backgroundimg +"')";		
		}
		else{
			this.wrapper.style.backgroundImage ="none";
		}
	
	}
	,redraw: function(){
		var that = this;

		var f = function(){
			that.clear();
			that.render();
		};
		
		window.setTimeout(f,0);
	},
		
	transform: function(transformation){
		if(this.settings.beforeTransform) {
			this.settings.beforeTransform(transformation);
		}
		this.canvas.transformation = transformation;
		//set origin
		var w =parseInt(this.wrapper.style.width);
		var h = parseInt(this.wrapper.style.height);
		
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
				this.canvas.transformation.rotate = {x:0,y:0,z:0};
			}
			
			if(!this.canvas.transformation.spherical.radius){
				var heightR = (parseInt(this.wrapper.style.height) / s.y) /2;
				var widthR= (parseInt(this.wrapper.style.width) / s.x) /2;
			
			
				if(widthR > heightR)
					this.canvas.transformation.spherical.radius = heightR;
				else
					this.canvas.transformation.spherical.radius = widthR;
			}
		}
		this.easyClicking.transformation = this.canvas.transformation;
		

		this.redraw();
		if(this.settings.afterTransform) {
		try{
			this.settings.afterTransform(transformation);
		}	
		catch(e){
			throw e;
		}
		}
	},


	/*onmouseup and onmousemove are functions with following parameters:
		e,shape,mouse,longitude_latitude,feature
		
	*/
	setMouseFunctions: function(onmouseup,onmousemove){
			if(onmousemove)this.moveHandler =onmousemove;
			if(onmouseup)this.clickHandler = onmouseup;
	}
	,_createGlobe: function(){
		if(!this.canvas.getContext) {return;}
		var ctx = this.canvas.getContext('2d');
		if(!ctx) return;
		var t =this.controller.transformation;
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

	}
	
	,_setupCanvasEnvironment: function(){
		if(!this.canvas.getContext) return;
		var ctx = this.canvas.getContext('2d');
		var s =this.controller.transformation.scale;
		if(s && s.x)ctx.lineWidth = (1.5 / s.x);
		ctx.globalAlpha = this.settings.globalAlpha;
		ctx.lineJoin = 'round'; //miter or bevel or round	
	},
	render: function(flag){
		var mem =this.easyClicking.getMemory();
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


		var that = this;

		var f = function(){
			var newfragment = document.createDocumentFragment();
			var t1=new Date();
				
			 for(var i=0; i < mem.length; i++){
				mem[i].render(that.canvas,tran,that.settings.projection,that.settings.optimisations,that.settings.browser,newfragment);
			}
			var t2=new Date();
			var time = t2-t1;
			//console.log("done!"+time);
			if(!this._fragment){
				this._fragment= newfragment.cloneNode(true);
				that.canvas.appendChild(this._fragment);
			}
			else{
				//newfragment.childNodes
				//for(var i=0; i < newfragment.childNodes; i++){
					
				//}
			}
			
			//console.log("done in "+ time+"! ");
			var t = document.getElementById(that.wrapper.id + "_statustext");
			if(t) {
				t.parentNode.removeChild(t);	
			}
		};
		if(this.settings.renderPolygonMode)f();
		this.attachBackground();
		
	
	},
	_drawGeoJsonMultiPolygonFeature: function(coordinates,feature){
		for(var j=0; j< coordinates.length; j++){//identify and create each polygon	
			this._drawGeoJsonPolygonFeature(coordinates[j],feature);
		}
		
	},	
	_drawGeoJsonPolygonFeature: function(coordinates,feature){
		var p = feature.properties;
		p.shape = 'polygon';
		var s = new EasyShape(p,coordinates,"geojson",this.settings.projection);
		this.easyClicking.addToMemory(s);
		this.geofeatures[this.easyClicking.getMemoryID(s)] = feature;
	},
	_drawGeoJsonPointFeature: function(coordinates,feature){
		var p = feature.properties;
		p.shape = 'point';
		var s = new EasyShape(p,coordinates,"geojson", this.settings.projection);
		this.easyClicking.addToMemory(s);
		this.geofeatures[this.easyClicking.getMemoryID(s)] = feature;

	},	
	_drawGeoJsonFeature: function(feature){
			var geometry = feature.geometry;
			var type =geometry.type.toLowerCase();
			
			if(type == 'multipolygon'){
				this._drawGeoJsonMultiPolygonFeature(feature.geometry.coordinates,feature);
			}
			else if(type == 'polygon'){
				this._drawGeoJsonPolygonFeature(feature.geometry.coordinates,feature);
			}
			else if(type == 'point'){
				this._drawGeoJsonPointFeature(feature.geometry.coordinates,feature);				
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

	,_setupMouseHandlers: function(e){
		var eMap = this;
		var _defaultClickHandler = function(e,shape,mousepos,ll){};	
		
		var _defaultMousemoveHandler = function(e,shape,mousepos,ll){
			if(mousepos){
				var wid =eMap.wrapper.id+'_tooltip';
				var tt =document.getElementById(wid);
				if(!tt){
					tt = document.createElement('div');
					tt.style.position = "absolute";
					tt.id = wid;
					tt.setAttribute("class","easymaptooltip");
					eMap.wrapper.appendChild(tt);
				}

				var text ="";
				if(shape){
					text =shape.properties.name +"<br>";
				}	
				else{	
					//tt.style.display = "none";
				}
				if(ll){
					var geocoords = "(long:"+ll.longitude+",lat:"+ll.latitude+")";
					tt.innerHTML = text +geocoords;
				}
			
				var x = mousepos.x + 10;
				var y = mousepos.y + 10;
			
				tt.style.left = x + "px";
				tt.style.top = y +"px";
				tt.style.display = "";
				tt.style["z-index"] = 2;
			}
		};
		
		var getParameters = function(e){
			var result = {};
			if(!e) {
				e = window.event;
			}
			
			var t = EasyClickingUtils.resolveTargetWithEasyClicking(e);
			if(t.getAttribute("class") == 'easyControl') return false;
			var shape = eMap.easyClicking.getShapeAtClick(e);
			if(shape) {
				result.shape = shape;
			}
		
			
			var pos = EasyClickingUtils.getMouseFromEvent(e);
			var x =pos.x;
			var y = pos.y;
			result.mouse = pos;
			result.longitude_latitude = EasyMapUtils.getLongLatFromMouse(x,y,eMap);
			result.feature = eMap.geofeatures[eMap.easyClicking.getMemoryID(shape)];
			return result;
			
		};
		var onmousemove = function(e){
		
			var pos = EasyClickingUtils.getMouseFromEvent(e);
			var x =pos.x;
			var y = pos.y;
			if(!x || !y ) return;
			var sensitivity = 1;
			if(this.lastMouseMove && x < this.lastMouseMove.x + sensitivity && x > this.lastMouseMove.x -sensitivity) {return;}
			if(this.lastMouseMove &&  y < this.lastMouseMove.y + sensitivity && y > this.lastMouseMove.y -sensitivity) {return;}
			this.lastMouseMove = {};
			this.lastMouseMove.x = x;this.lastMouseMove.y = y;
			
			var r = getParameters(e);
			eMap.moveHandler(e,r.shape,r.mouse,r.longitude_latitude,r.feature);
		};
		
		var onmouseup = function(e){
			var r = getParameters(e);
			console.log("clicked!",r);
			eMap.clickHandler(e,r.shape,r.mouse,r.longitude_latitude,r.feature);
		};
		this.wrapper.onmouseup = onmouseup;
		this.wrapper.onmousemove = onmousemove;
		this.setMouseFunctions(_defaultClickHandler,_defaultMousemoveHandler);

		
	}
	};

