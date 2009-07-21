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
            var x = new VismoCanvas(wrapper[i],options);
            result.push(x);
        }
        return x;
    }
    
	if(typeof wrapper == 'string') wrapper = document.getElementById(wrapper);
	else wrapper = wrapper;
		
	this.wrapper = wrapper;
	//wrapper.vismoMap = this;
	wrapper.style.position = "relative";
	var that = this;
	this.settings = {};
	var w= jQuery(wrapper).width();
	var h= jQuery(wrapper).height();
	jQuery(wrapper).css({width:w,height:h});
	
	this.feature_reference = {};
	if(!options) options = {};
	if(options.tooltip){
	    
	    options.tooltipfunction = function(el,s){
	        if(s){
	        el.innerHTML = s.getProperty("name");
            }
	    }
	}
	this.vismoClicking = new VismoCanvas(wrapper,options);
	this._setupMouseHandlers();
	
	var that = this;
	var handler = function(t){
	    that.transform(t);
	}
	if(!options.VismoController) options.VismoController = {};
	options.VismoController.handler = handler;
	this.controller = new VismoController(this.wrapper,options.VismoController);

		
	//run stuff
	this.transform(this.controller.transformation); //set initial transformation
	this._fittocanvas = true;
	this.geofeatures = {};
	this.features = [];
	this.clear();

};  
VismoMap.prototype = {
	setTransparency: function(alpha){
		this.vismoClicking.setTransparency(alpha);
	}
	,getVismoShapes: function(){
		return this.vismoClicking.getMemory();
	}
	,resize: function(width,height){
		this.wrapper.style.width = width+"px";
		this.wrapper.style.height = height +"px";
		var  t=this.getTransformation();
		t.origin.x = width / 2;
		t.origin.y = height / 2;
		this.setTransformation(t);
		this.vismoClicking.resize(width,height);

		this.clear();

	}
	,getProjection: function(){
		return this.settings.projection;
	}
	,setProjection: function(projection){
		this.settings.projection = projection;

	}
	,clear: function(deleteMemory){ /* does this work in IE? */
		this.vismoClicking.clear(deleteMemory);
	},
	
	drawFromGeojson: function(geojson,autosize){
            //if ie 6
            //geojson =VismoMapUtils.optimiseForIE6(geojson);
            
            
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
	drawFromGeojsonFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		
			that.drawFromGeojson(responseText);
		};
		VismoFileUtils.loadRemoteFile(file,callback);
	}

	,getTransformation: function(){
		if(!this.transformation){
			return false;
		}
		else
			return this.transformation;
	}
	,setTransformation: function(transformation){
		if(typeof transformation.translate.x != 'number'||typeof transformation.translate.y != 'number') throw "bad transformation translate given ";
		if(typeof transformation.scale.x != 'number'||typeof transformation.scale.y != 'number') throw "bad transformation scale given ";
		
		this.controller.setTransformation(transformation);
	}
	,moveTo: function(longitude,latitude,zoom){
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

	,redraw: function(){
		this.render();	

	    //alert("average VML render"+ VismoVector.rstats);
	    //alert("total average VML render time"+ VismoVector.rstats * VismoVector.rnum);
	},
		
	transform: function(transformation){
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
		var f = function(){
		    that.vismoClicking.setTransformation(that.transformation);
		    that.redraw();
		}
		window.setTimeout(f,0);

	},


	/*onmouseup and ove are functions with following parameters:
		e,shape,mouse,longitude_latitude,feature
		
	*/
	setMouseFunctions: function(onmouseup,onmousemove,onrightclick,onkeypress,ondblClick){
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
			var shape = eMap.vismoClicking.getShapeAtClick(e);
			if(shape) {
				result.shape = shape;
				result.feature = eMap.geofeatures[eMap.vismoClicking.getMemoryID(shape)];
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
	        var mu = function(e,s){
	                var r = getParameters(e);
	                if(onmouseup) onmouseup(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);
	        };
	        var mm = function(e,s){
	                var r = getParameters(e);
	                if(onmousemove) onmousemove(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);	                
	        };
	        var dbl = function(e,s){
	                var r = getParameters(e);
        	        if(ondblClick) ondblClick(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);
	        };
	        var key = function(e,s){
	                var r = getParameters(e);
                        if(onkeypress) onkeypress(e,s,r.mouse,r.longtitude_latitude,r.feature,r.key,eMap);
	        }
	        this.vismoClicking.setOnMouse(false,mu,mm,dbl,key);
			/*if(onmousemove)this.moveHandler =onmousemove;
			if(onmouseup)this.clickHandler = onmouseup;
			if(onrightclick) this.rightclickHandler = onrightclick;
			if(onkeypress) this.keyHandler = onkeypress;
			if(ondblClick) this.dblClickHandler = ondblClick;*/
	}

	

	,render: function(flag){
		var tran =this.transformation;

		var that = this;


		if(this.settings.beforeRender) {
			this.vismoClicking.options.beforeRender = this.settings.beforeRender;
		}
		this.vismoClicking.render(this.settings.projection);
		if(this.settings.afterRender) {
			this.settings.afterRender(tran);
			
		}
		var t = document.getElementById(that.wrapper.id + "_statustext");
		if(t) {
			t.parentNode.removeChild(t);	
		}
		
	
	},
	
	getFeatures: function(){
	       return this.features;
	}
	,drawGeoJsonFeature: function(featuredata){
	   
		var feature = new VismoMap.Feature(featuredata);		
		var s = feature.getVismoShapes();		
		for(var i=0; i < s.length; i++){
			this.vismoClicking.add(s[i]);
			this.geofeatures[this.vismoClicking.getMemoryID(s[i])] = feature;
		}	
         this.features.push(feature);
	},
	drawGeoJsonFeatures: function(features){
			var avg1 = 0;
				
			for(var i=0; i < features.length; i++){
			
				this.drawGeoJsonFeature(features[i]);
			}

	}
	,_setupMouseHandlers: function(e){
	        /*
		var eMap = this;
		var _defaultClickHandler = function(e,shape,mousepos,ll,vismomap){};	
		
		var _defaultMousemoveHandler = function(e,shape,mousepos,ll,feature,key,vismomap){
			if(mousepos){
				var wid =vismomap.wrapper.id+'_tooltip';
				var tt =document.getElementById(wid);
				if(!tt){
					tt = document.createElement('div');
					tt.style.position = "absolute";
					tt.id = wid;
					tt.style.zIndex = 4;
					tt.setAttribute("class","vismomaptooltip");
					vismomap.wrapper.appendChild(tt);
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
					tt.innerHTML = text;// +geocoords;
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
			
			
			var t = VismoClickingUtils.resolveTargetWithVismo(e);
			if(t.getAttribute("class") == 'vismoControl') return false;
			var shape = eMap.vismoClicking.getShapeAtClick(e);
			if(shape) {
				result.shape = shape;
				result.feature = eMap.geofeatures[eMap.vismoClicking.getMemoryID(shape)];
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
		var onmousemove = function(e){
		
			var pos = VismoClickingUtils.getMouseFromEvent(e);
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
			eMap.moveHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed, eMap);
			}
			catch(e){};
		};
		
		var onmouseup = function(e){
	
			var r = getParameters(e);
			
			e = r.event;
			var button =1;
			if(e && e.button){
				button = e.button;	
			}
			if(!button || button <= 1){ //left click
		
				try{
					eMap.clickHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed,eMap);
				}
				catch(e){
					
				}
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
			
			//find center of wrapper
			//console.log(eMap.settings.wrapper.center);
			if(eMap.keyHandler){
				try{
					eMap.keyHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed,eMap);
				}
				catch(e){};
			}
		};
		var keypressed = function(event,shape,mouse,lola,feature,key){
		};
		
		var dblClickHandler = function(event,shape,mouse,lola,feature,key){};
		this.wrapper.ondblclick = function(e){
				var r = getParameters(e);
				eMap.dblClickHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed,eMap);
		
		};
		
		this.wrapper.onmouseup= onmouseup;
		

		
		
		document.onkeypress = onkeypress;
		//this.wrapper.onmouseup = onmouseup;
		this.wrapper.onmousemove = onmousemove;
		
		this.vismoClicking.setOnMouse(_defaultClickHandler,false,_defaultMousemoveHandler,dblClickHandler,keypressed)
	
		this.setMouseFunctions(_defaultClickHandler,_defaultMousemoveHandler,false,keypressed,dblClickHandler);
                */
		
	}
	,getVismoCanvas: function(){
	        return this.vismoClicking;
	}
};


VismoMap.Feature = function(feature){
	this.init(feature);
};

VismoMap.Feature.prototype = {
	init: function(feature){
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
	}
	,addOuterVismoShape: function(shape){
		this.outers.push(shape);
	}
	,getOuterVismoShapes: function(){
		return this.outers;
	}
	,addVismoShape: function(vismoShape){
		this.vismoShapes.push(vismoShape);
	}
	,getVismoShapes: function(){
		return this.vismoShapes;
	}
	,_drawGeoJsonMultiPolygonFeature: function(coordinates,feature){
		var outer;
		
		for(var i=0; i < coordinates.length; i++){ //it's a list of polygons!
			this._drawGeoJsonPolygonFeature(coordinates[i],feature);
		}
		
	},	
	_drawGeoJsonPolygonFeature: function(coordinates,feature){

		var p = feature.properties;
		p.shape = 'polygon';
		//console.log(coordinates[0]);
		
		var outer = false;
		for(var j=0; j< coordinates.length; j++){//identify and create each polygon
			var coords =coordinates[j];	
			coords = VismoUtils.invertYCoordinates(coords);
			var s = new VismoShape(p,coords);
			this.addVismoShape(s);
		}
		return outer;		
		
	},
	_drawGeoJsonPointFeature: function(coordinates,feature){
		var p = feature.properties;
		p.shape = 'point';
		coordinates[1] = -coordinates[1];
		var s = new VismoShape(p,coordinates);
		this.addVismoShape(s);
	}
	,setProperty: function(id,val){
	    var shapes = this.getVismoShapes();
	    for(var i=0; i < shapes.length;i++){
	        shapes[i].setProperty(id,val);
	    }
	}
};
