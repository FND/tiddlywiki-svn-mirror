/*
A package for rendering geojson polygon and point features easily to create maps
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

var VismoMap = function(wrapper,options){  
    
    if(wrapper.length){ //for jquery
        var result = [];
        for(var i=0; i < wrapper.length; i++){
            var x = new VismoMap(wrapper[i],options);
            result.push(x);
        }
        return x;
    }
    
	if(typeof wrapper == 'string') wrapper = document.getElementById(wrapper);
	else wrapper = wrapper;
		
	this.wrapper = wrapper;
	wrapper.vismoMap = this;
	//wrapper.style.position = "relative";
	var that = this;
	this.settings = {};
	var w= jQuery(wrapper).width();
	var h= jQuery(wrapper).height();
	jQuery(wrapper).css({width:w,height:h});
	
	this.feature_reference = {};
	if(!options) options = {};


	var that = this;
	var handler = function(t){
	    that.transform(t);
	}
	//if(!options.vismoController) options.vismoController = {};
	if(options.vismoController)options.vismoController.handler = handler;

	this.vismoCanvas = new VismoCanvas(wrapper,options);
	this.controller = this.vismoCanvas.vismoController;
	
	//run stuff
	if(this.controller)this.transform(this.controller.transformation); //set initial transformation
	this._fittocanvas = true;
	this.geofeatures = {};
	this.features = [];
	this.clear();
	
	var proj = options.projection;
	var eMap = this;
	this._hijackMouseFunctions();
	if(options.tooltip){
	    this.vismoCanvas.addTooltip(function(el,s){
	        if(s){
	        el.innerHTML = s.getProperty("name");
            }
	    });
	    
	}
		this.mouse({down:options.mousedown,up:options.mouseup,move:options.move,dblclick:options.dblclick,keypress:options.keypress});
	
	var eMap = this;
	if(proj){
		if(proj == 'globe' || proj == 'spinnyglobe'){
			eMap = new VismoGlobe(this);
			if(proj == 'spinnyglobe'){
				eMap.toggleSpin();
			}
		}
		if(proj == 'google'){
			eMap.settings.projection = VismoSlippyMap.prototype.getGoogleMercatorProjection();
		}
		else if(proj == 'slippystaticmap'){
			eMap = new VismoSlippyMap(this);					
		}
		
	}
	
	if(options.geojson){
	    this.drawFromGeojson(options.geojson,options.fullscreen);
	}
	else if(options.georss){
	    this.drawFromGeojson(VismoConversion.geoRssToGeoJson(options.georss),options.fullscreen);
	}
	else if(options.kml){
	    this.drawFromGeojson(VismoConversion.kmlToGeoJson(options.kml),options.fullscreen);
	}
	return eMap;
};  
VismoMap.prototype = {
	setTransparency: function(args){
	    var alpha = arguments[0];
		this.vismoCanvas.setTransparency(alpha);
	}
	,getVismoShapes: function(args){
		return this.vismoCanvas.getMemory();
	}
	,resize: function(args){
	    var width = arguments[0];
	    var height = arguments[1];
		this.wrapper.style.width = width+"px";
		this.wrapper.style.height = height +"px";
		var  t=this.getTransformation();
		t.origin.x = width / 2;
		t.origin.y = height / 2;
		this.setTransformation(t);
		this.vismoCanvas.resize(width,height);

		this.clear();

	}
	,getProjection: function(args){
		return this.settings.projection;
	}
	,setProjection: function(args){
	    var projection = arguments[0];
		this.settings.projection = projection;

	}
	,clear: function(args){ /* does this work in IE? */
		var deleteMemory = arguments[0];
		this.vismoCanvas.clear(deleteMemory);
	},
	
	drawFromGeojson: function(args){
        var geojson = arguments[0];
        var autosize = arguments[1];
			if(typeof geojson == 'string'){
				geojson = eval('(' +geojson+ ')');
			}
							
			this._lastgeojson = geojson;
			if(autosize){
			 	var t = VismoMapUtils.fitgeojsontocanvas(geojson,this.wrapper);

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
	drawFromGeojsonFile: function(args){
	    var file = arguments[0];
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		
			that.drawFromGeojson(responseText);
		};
		VismoFileUtils.loadRemoteFile(file,callback);
	}

	,getTransformation: function(args){
		if(!this.transformation){
			return false;
		}
		else
			return this.transformation;
	}
	,setTransformation: function(args){
	    var transformation = arguments[0];
		if(typeof transformation.translate.x != 'number'||typeof transformation.translate.y != 'number') throw "bad transformation translate given ";
		if(typeof transformation.scale.x != 'number'||typeof transformation.scale.y != 'number') throw "bad transformation scale given ";
		
		this.controller.setTransformation(transformation);
	}
	,moveTo: function(args){
	    var longitude= arguments[0];
	    var latitude = arguments[1];
	    var zoom = arguments[2];
		var newt = {translate:{},scale:{}};
		var transformation =this.getTransformation();
		
		var newxy={};
		newxy.x = parseFloat(longitude);
		newxy.y = parseFloat(latitude);
		
		if(this.settings.projection){
		 	newxy = this.settings.projection.xy(newxy.x,newxy.y,transformation);
		}
		newt.translate.x = - newxy.x;
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

	,redraw: function(args){
		this.render();	

	    //alert("average VML render"+ VismoVector.rstats);
	    //alert("total average VML render time"+ VismoVector.rstats * VismoVector.rnum);
	},
		
	transform: function(args){
	    var transformation = arguments[0];
		//console.log(arguments);
		var w =parseInt(this.wrapper.style.width);
		var h = parseInt(this.wrapper.style.height);
		var t =transformation.translate;
		var s = transformation.scale;
	
		this.transformation = transformation;
		/*if(!transformation.origin){
			this.transformation.origin = {};
			var origin = this.transformation.origin;
			origin.x =w / 2;
			origin.y =h / 2;
		}*/
		
		if(s.x < 0.5) s.x = 0.5;
		if(s.y < 0.5) s.y = 0.5;
		
		if(t.x > 180) t.x = 180; //t.x=Math.min(t.x, 180)
		if(t.x < -180) t.x = -180;
		
		if(t.y > 85.0511) t.y = 85.0511;
		if(t.y < -85.0511) t.y = -85.0511;
		
		if(!this.transformation.rotate){
				this.transformation.rotate = {x:0,y:0,z:0};
		}
			
		
		var that = this;
		var f = function(args){
		    that.vismoCanvas.setTransformation(that.transformation);
		    that.redraw();
		}
		window.setTimeout(f,0);

	},


	/*onmouseup and ove are functions with following parameters:
		e,shape,mouse,longitude_latitude,feature
		
	*/
	mouse: function(args){
 	    if(!args){
	        return {up: this.onmouseup, down: this.onmousedown, move: this.onmousemove, dblclick: this.ondblclick,keypress:this.onkeypress};
	    }
			if(args.move)this.onmousemove =args.move;
			if(args.up)this.onmouseup = args.up;
			if(args.down)this.onmouseup = args.down;
			if(args.keypress) this.onkeypress = args.keypress;
			if(args.dblclick) this.ondblClick = args.dblclick;
	}

	,_hijackMouseFunctions: function(args){
	        var eMap = this;
	        var getParameters = function(e){
			var result = {};
			var code;
			if (e.which) code =e.which;
			else if (e.keyCode) code = e.keyCode;
			var character;
			if(code) character = String.fromCharCode(code);	
			var t = VismoClickingUtils.resolveTargetWithVismo(e);
			if(t && t.getAttribute("class") == 'vismoControl') return false;
			var shape = eMap.vismoCanvas.getShapeAtClick(e);
			if(shape) {
				result.shape = shape;
				result.feature = eMap.geofeatures[eMap.vismoCanvas.getMemoryID(shape)];
			}
		
			
			var pos = VismoClickingUtils.getMouseFromEvent(e);
			var x =pos.x;
			var y = pos.y;
			result.mouse = pos;
			result.longitude_latitude = VismoMapUtils.getLongLatFromMouse(x,y,eMap);
			result.event = e;
			result.keypressed = character;
			return result;
			
		};
		
		 var md = function(e,s){
	                var r = getParameters(e);
	                if(eMap.onmousedown) eMap.onmousedown(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);
	        };
	        
	        var mu = function(e,s){
	                var r = getParameters(e);
	                if(eMap.onmouseup) eMap.onmouseup(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);
	        };
	        var mm = function(e,s){
	            
	                var r = getParameters(e);
	                if(eMap.onmousemove) eMap.onmousemove(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);	                
	        };
	        var dbl = function(e,s){
	                var r = getParameters(e);
        	        if(eMap.ondblClick) eMap.ondblClick(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);
	        };
	        var key = function(e,s){
	                var r = getParameters(e);
                        if(eMap.onkeypress) eMap.onkeypress(e,s,r.mouse,r.longtitude_latitude,r.feature,r.key,eMap);
	        }
	        this.vismoCanvas.mouse({mousedown:md,mouseup:mu,mousemove:mm,dblclick:dbl,keypress:key});
	}

	,render: function(args){
	    var d1 = new Date();
	    var flag = arguments[0];
		var tran =this.transformation;

		var that = this;

		this.vismoCanvas.render(this.settings.projection);
		if(this.settings.afterRender) {
			this.settings.afterRender(tran);
			
		}
		var t = document.getElementById(that.wrapper.id + "_statustext");
		if(t) {
			t.parentNode.removeChild(t);	
		}
		var d2 = new Date();
		var id="mapRender";
		if(!VismoTimer[id]) VismoTimer[id] = 0;
		VismoTimer[id] += (d2 - d1);
		
		
		
	
	},
	
	getFeatures: function(args){
	       if(arguments[0] && this.features[arguments[0]]) return this.features[arguments[0]];
	       return this.features;
	}
	,drawGeoJsonFeature: function(args){
	    var featuredata = arguments[0];
	    var props = arguments[1];
		var feature = new VismoMap.Feature(featuredata,props);		
		var s = feature.getVismoShapes();		
		for(var i=0; i < s.length; i++){
			this.vismoCanvas.add(s[i]);
			//this.geofeatures[this.vismoCanvas.getMemoryID(s[i])] = feature;
		}	
         this.features.push(feature);
	},
	drawGeoJsonFeatures: function(args){
	    var features = arguments[0];
			var avg1 = 0;
				
			for(var i=0; i < features.length; i++){
			
				this.drawGeoJsonFeature(features[i],{featureid:i});
			}

	}
	,getVismoCanvas: function(args){
	        return this.vismoCanvas;
	}
};


VismoMap.Feature = function(feature,props){
	this.init(feature,props);
};

VismoMap.Feature.prototype = {
	init: function(args){
	    var feature = arguments[0];
	    if(arguments[1])extra_properties = arguments[1];
	    else extra_properties = {};
		this.properties = feature.properties;
		this.geometry = feature.geometry;
		this.outers = [];
		this.vismoShapes = [];
		var geometry = this.geometry;
		var type =geometry.type.toLowerCase();

		if(type == 'multipolygon'){
			this._drawGeoJsonMultiPolygonFeature(feature.geometry.coordinates,feature);
		}
		else if(type == 'linestring' || type=='multilinestring' || type == 'multipoint' || type=='geometrycollection'){
			console.log(type + " not supported yet");
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
        var x = this.getVismoShapes();
        var f;
  
        for(f in extra_properties){
    
             for(var i=0; i < x.length; i++){
                x[i].setProperty(f,extra_properties[f]);
            }
        }
	}
	,addOuterVismoShape: function(args){
		var shape = arguments[0];
		this.outers.push(shape);
	}
	,getOuterVismoShapes: function(args){
		return this.outers;
	}
	,addVismoShape: function(args){
	    var vismoShape = arguments[0];
		this.vismoShapes.push(vismoShape);
	}
	,getVismoShapes: function(args){
		return this.vismoShapes;
	}
	,_drawGeoJsonMultiPolygonFeature: function(args){
	    var coordinates=  arguments[0];
	    var feature = arguments[1];
		var outer;
		
		for(var i=0; i < coordinates.length; i++){ //it's a list of polygons!
			var s = this._drawGeoJsonPolygonFeature(coordinates[i],feature,i);
			
		}
		
	},	
	_drawGeoJsonPolygonFeature: function(args){
        var coordinates=  arguments[0];
	    var feature = arguments[1];
	    var featureid = arguments[2];
		var p = feature.properties;
		p.shape = 'polygon';
		//console.log(coordinates[0]);
		
		var outer = false;
		for(var j=0; j< coordinates.length; j++){//identify and create each polygon
			var coords =coordinates[j];	
			coords = VismoUtils.invertYCoordinates(coords);
			var s = new VismoShape(p,coords);
			s.properties.geometryid = featureid;
			s.properties.geometryid2 = j;
			this.addVismoShape(s);
		}
		return outer;		
		
	},
	_drawGeoJsonPointFeature: function(args){
	    var coordinates=  arguments[0];
	    var feature = arguments[1];

		var p = feature.properties;
		p.shape = 'point';
		coordinates[1] = -coordinates[1];
		var s = new VismoShape(p,coordinates);
		this.addVismoShape(s);
	}
	,setProperty: function(args){
	    var id = arguments[0];
	    var val = arguments[1];
	    var shapes = this.getVismoShapes();
	    for(var i=0; i < shapes.length;i++){
	        shapes[i].setProperty(id,val);
	    }
	}
};
