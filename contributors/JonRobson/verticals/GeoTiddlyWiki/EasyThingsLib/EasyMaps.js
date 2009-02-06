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
	
	canvas.style.zIndex = 1;
	canvas.style.position = "absolute";
	this.canvas = canvas;

	this.feature_reference = {};
	if(!canvas.getContext) {
		this.settings.browser = 'ie';
	}
	else
		this.settings.browser = 'good';
	
	this.easyClicking = new EasyClicking(wrapper);
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
	getProjection: function(){
		return this.settings.projection;
	}
	,setProjection: function(projection){
		var easymap = this;
		if(projection == 'GLOBE'){
			easymap._fittocanvas = false;
			this.settings.beforeRender = function(t){
					easymap._createGlobe(easymap.getProjection().getRadius(t.scale ));
			};
			
			this.settings.projection= {
					name: "GLOBE",
					nowrap:true,
					radius: 10,
					direction: 0
					,init: function(){
						this.direction = 0;
					}
					,getRadius: function(){
						return this.radius;
					}
					,inversexy: function(x,y,t){
							var radius =this.getRadius(t.scale);
							var res = EasyMapUtils._undospherify(x,y,t,radius);
							return res;
					}
					,xy: function(x,y,t){
						var radius =this.getRadius(t.scale);
						var res = EasyMapUtils._spherifycoordinate(x,y,t,radius);
						/*
						if(res.movedNorth && this.direction >= 0){
							this.direction = -1;
							res.move= true;
						}
						else if(res.movedSouth && this.direction <= 0){
							this.direction = 1;
							res.move = true;
						}
						
						if(res.y > radius - 10 || res.y < 10-radius){
							
							res.y = false;
						}*/
						return res;
					}
			};
			
			var heightR = parseInt(easymap.wrapper.style.height)  /2;
			var widthR= parseInt(easymap.wrapper.style.width) /2;
			if(widthR > heightR){
				this.settings.projection.radius = heightR;
			}
			else{
				this.settings.projection.radius = widthR;
			}
			
		}
		else{
			this.settings.projection = projection;
		}
	}
	,clear: function(){ /* does this work in IE? */


		this._maxX = 0;
		this._maxY = 0;

		
		if(!this.canvas.getContext) {
			
			return;
		}
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);		
		
		
	},
	
	drawFromGeojson: function(geojson){
			if(typeof geojson == 'string'){
				geojson = eval('(' +geojson+ ')');
			}		
			this._lastgeojson = geojson;
			if(this._fittocanvas){
			 	var t = EasyMapUtils.fitgeojsontocanvas(geojson,this.canvas);
			
				var p =this.getProjection();
				if(p && p.name == "GLOBE") {
					t.translate = {x:0,y:0};
				}
				this.controller.setTransformation(t);
			}

			var type =geojson.type.toLowerCase();		

			if(type == "featurecollection"){
				var features = geojson.features;
				this.drawGeoJsonFeatures(features);
			}  else if(type =='feature') {
				this.drawGeoJsonFeature(geojson);
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
	}

	,getTransformation: function(){
		return this.canvas.transformation;
	}
	,setTransformation: function(transformation){
		var w =parseInt(this.wrapper.style.width);
		var h = parseInt(this.wrapper.style.height);
		var t =transformation.translate;
		var s = transformation.scale;
	
		this.canvas.transformation = transformation;
		if(!transformation.origin){
			this.canvas.transformation.origin = {};
			var origin = this.canvas.transformation.origin;
			origin.x =w / 2;
			origin.y =h / 2;
		}
		
		if(s.x < 1) s.x = 1;
		if(s.y < 1) s.y = 1;
		
		if(t.x > 180) t.x = 180;
		if(t.x < -180) t.x = -180;
		
		if(t.y > 85.0511) t.y = 85.0511;
		if(t.y < -85.0511) t.y = -85.0511;
		
		var p =this.getProjection();
		if(p && p.name == "GLOBE"){
			if(!this.canvas.transformation.rotate){
				this.canvas.transformation.rotate = {x:0,y:0,z:0};
			}
			
		}
		this.easyClicking.transformation = this.canvas.transformation;
		
	}
	,moveTo: function(longitude,latitude,zoom){
		var newt = {translate:{},scale:{}};
		var transformation =this.getTransformation();
		
		var newxy={};
		newxy.x = - parseFloat(latitude);
		newxy.y = parseFloat(longitude);
		
		if(this.settings.projection){
		 	newxy = this.settings.projection.xy(newxy.x,newxy.y,transformation);
		}
		newt.translate.x = newxy.x;
		newt.translate.y = newxy.y;
		
		if(!zoom){
			zoom =transformation.scale.x;
		}
		else{
			zoom = parseFloat(zoom);
		}
		newt.scale.x = zoom;
		newt.scale.y = zoom;
		this.controller.setTransformation(newt)
		
	}
	,attachBackground: function(imgpath){
		if(this.settings.background){
			this.wrapper.style.background=this.settings.background;
		}
		else{
			this.wrapper.style.background = "";
		}

		if(imgpath) this.settings.backgroundimg = imgpath;
		if(this.settings.backgroundimg){
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

		this.setTransformation(transformation);
		this.redraw();

	},


	/*onmouseup and onmousemove are functions with following parameters:
		e,shape,mouse,longitude_latitude,feature
		
	*/
	setMouseFunctions: function(onmouseup,onmousemove,onrightclick,onkeypress){
			if(onmousemove)this.moveHandler =onmousemove;
			if(onmouseup)this.clickHandler = onmouseup;
			//if(ondblclick)this.dblclickHandler = ondblclick;
			if(onrightclick) this.rightclickHandler = onrightclick;
			if(onkeypress) this.keyHandler = onkeypress;
	}
	,_createGlobe: function(radius){
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
	
	
		var radgrad = ctx.createRadialGradient(0,0,10,0,0,radius);

		radgrad.addColorStop(0,"#AFDCEC");
		//radgrad.addColorStop(0.5, '#00C9FF');
		radgrad.addColorStop(1, '#00B5E2');
		//radgrad.addColorStop(1, 'rgba(0,201,255,0)');

		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI*2, true);
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
		var tran =this.canvas.transformation;

		var mem =this.easyClicking.getMemory();
		this._setupCanvasEnvironment()
		var that = this;
		if(this.settings.beforeRender) {
			this.settings.beforeRender(tran);
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
	drawGeoJsonFeature: function(feature){
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
	drawGeoJsonFeatures: function(features){
			var avg1 = 0;
			for(var i=0; i < features.length; i++){
				this.drawGeoJsonFeature(features[i]);
			}

	}

	,_setupMouseHandlers: function(e){
		var eMap = this;
		var _defaultClickHandler = function(e,shape,mousepos,ll,easymap){};	
		
		var _defaultMousemoveHandler = function(e,shape,mousepos,ll,feature,easymap){
			if(mousepos){
				var wid =easymap.wrapper.id+'_tooltip';
				var tt =document.getElementById(wid);
				if(!tt){
					tt = document.createElement('div');
					tt.style.position = "absolute";
					tt.id = wid;
					tt.style.zIndex = 4;
					tt.setAttribute("class","easymaptooltip");
					easymap.wrapper.appendChild(tt);
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
			
			var code;
			//console.log(e.keyCode,e.which);
			if (e.which) code =e.which;
			else if (e.keyCode) code = e.keyCode;
			
			
		
			var character;
			if(code) character = String.fromCharCode(code);
			
			
			var t = EasyClickingUtils.resolveTargetWithEasyClicking(e);
			if(t.getAttribute("class") == 'easyControl') return false;
			var shape = eMap.easyClicking.getShapeAtClick(e);
			if(shape) {
				result.shape = shape;
				result.feature = eMap.geofeatures[eMap.easyClicking.getMemoryID(shape)];
			}
		
			
			var pos = EasyClickingUtils.getMouseFromEvent(e);
			var x =pos.x;
			var y = pos.y;
			result.mouse = pos;
			result.longitude_latitude = EasyMapUtils.getLongLatFromMouse(x,y,eMap);
			
			result.event = e;
			result.keypressed = character;
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
			try{
			eMap.moveHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,eMap);
			}
			catch(e){};
		};
		
		var onmouseup = function(e){
			var r = getParameters(e);
			var button = e.button;
			
			if(!button || button == 0){ //left click
				try{eMap.clickHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed,eMap);
				}
				catch(e){}
			}
			else if(button == 2){ //right click
				if(eMap.rightclickHandler){
					var r = getParameters(e);
					try{eMap.rightclickHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed,eMap);
					}
					catch(e){};
				}	
			}
			
		};


		var onkeypress = function(e){
			var r = getParameters(e);
			if(eMap.keyHandler){
				try{
				eMap.keyHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed);
				}
				catch(e){};
			}
		};
		var keypressed = function(event,shape,mouse,lola,feature,key){
			//console.log(key + " was pressed");
		};
		
		var dblclick = function(e){
			
		}
		jQuery(this.wrapper).click(function(e) {
			onmouseup(e);
		});
		
		/*
		$(this.wrapper).dblclick(function(e) {
			alert("Dblclicked!");
			//onmouseup(e);
		});
		*/
		
		document.onkeypress = onkeypress;
		//this.wrapper.onmouseup = onmouseup;
		this.wrapper.onmousemove = onmousemove;
		this.setMouseFunctions(_defaultClickHandler,_defaultMousemoveHandler,false,keypressed);

		
	}
	};

