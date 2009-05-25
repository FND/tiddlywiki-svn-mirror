jQuery(document).ready(function() {
	var images = jQuery("img");

	for(var i=0; i < images.length; i++){
	var newel = document.createElement("div");
	newel.className = "zoomyimg";
	var el = images[i];
	var width = jQuery(el).width();
	var height = jQuery(el).height();
	jQuery(newel).css({width: el.width, height: height});
	el.parentNode.appendChild(newel);
	el.parentNode.replaceChild(newel, el);
	var imgproperties = {shape:'image',src:el.src,width:width,height:height};
	var x = new VismoCanvas(newel,[new VismoShape(imgproperties,[-width/2,-height/2])]);
	var c = new VismoController(x,newel);
	x.render();
	}
});

Array.prototype.contains = function(item)
{
	return this.indexOf(item) != -1;
};
Array.prototype.clone = function () {var a = new Array(); for (var property in this) {a[property] = typeof (this[property]) == 'object' ? this[property].clone() : this[property]} return a};

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

var VismoShapeUtils ={
    _isCoordinate: function(c){
        if(c == "M" || c == "q" || c== 'c') return false;
        else {
            if(typeof(c)== 'number') return true;
        }
    }
    ,toRgb: function(hex,opacity){
        var rgb = {};
        if(hex.indexOf("#") == 0 && hex.indexOf(",") == -1){ //hex code argument
			var hexcode = hex.substring(1);
			rgb.red = this._hexToR(hexcode);
			rgb.blue = this._hexToB(hexcode);
			rgb.green = this._hexToG(hexcode);
		}
		if(!opacity) opacity = "1.0";
		return "rgba("+rgb.red+","+ rgb.green +","+ rgb.blue+"," + opacity+")";
    }
	/* thank you http://www.javascripter.net/faq/hextorgb.htm*/
	,_cutHex: function(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
	,_hexToR:function(h){return parseInt((this._cutHex(h)).substring(0,2),16)}
	,_hexToG: function (h) {return parseInt((this._cutHex(h)).substring(2,4),16)}
	,_hexToB:function(h) {return parseInt((this._cutHex(h)).substring(4,6),16)}

};
var VismoUtils = {
	userAgent: navigator.userAgent.toLowerCase(),
	clone: function(obj){
                if(!obj) return;
            if(obj.appendChild) return obj;
	    if(obj == null || typeof(obj) != 'object')return obj;

	    var temp = new obj.constructor(); // changed (twice)

	    for(var key in obj){
	        temp[key] = VismoUtils.clone(obj[key]);
	    }


	    return temp;

	}
	,invertYCoordinates: function(coords){
		var res = [];
		for(var i=0; i < coords.length; i++){
			var x = coords[i][0];
			var y = coords[i][1];
			res.push([x,-y]);
		}
		return res;
	}
};

VismoUtils.browser= {
		isIE: VismoUtils.userAgent.indexOf("msie") != -1 && VismoUtils.userAgent.indexOf("opera") == -1,
		isGecko: VismoUtils.userAgent.indexOf("gecko") != -1,
		ieVersion: /MSIE (\d.\d)/i.exec(VismoUtils.userAgent), // config.browser.ieVersion[1], if it exists, will be the IE version string, eg "6.0"
		isSafari: VismoUtils.userAgent.indexOf("applewebkit") != -1,
		isBadSafari: !((new RegExp("[\u0150\u0170]","g")).test("\u0150")),
		firefoxDate: /gecko\/(\d{8})/i.exec(VismoUtils.userAgent), // config.browser.firefoxDate[1], if it exists, will be Firefox release date as "YYYYMMDD"
		isOpera: VismoUtils.userAgent.indexOf("opera") != -1,
		isLinux: VismoUtils.userAgent.indexOf("linux") != -1,
		isUnix: VismoUtils.userAgent.indexOf("x11") != -1,
		isMac: VismoUtils.userAgent.indexOf("mac") != -1,
		isWindows: VismoUtils.userAgent.indexOf("win") != -1
	};

if(VismoUtils.browser.isIE){
	if (!document.namespaces['vismoShapeVml_']) {
	        document.namespaces.add('vismoShapeVml_', 'urn:schemas-microsoft-com:vml');
	        
	}
	document.namespaces.add('xmlns', 'http://www.w3.org/1999/xhtml');
	document.namespaces.add('svg', 'http://www.w3.org/2000/svg');
	document.namespaces.add('xlink', 'http://www.w3.org/1999/xlink');

	  // Setup default CSS.  Only add one style sheet per document
	 if (!document.styleSheets['vismoShape']) {
	        var ss = document.createStyleSheet();
	        ss.owningElement.id = 'vismoShape';
	        ss.cssText = 'canvas{display:inline;overflow:hidden;' +
	            'text-align:left;}' +
	            'vismoShapeVml_\\:*{behavior:url(#default#VML)}';
	}
}
VismoUtils.svgSupport = function(){
        if(VismoUtils.browser.isIE){
                try {
                 var asv = new ActiveXObject("Adobe.SVGCtl");
                 return true;
                }
                catch(e){ }
        }
        else if(document.implementation) {
                if(VismoUtils.browser.isSafari) return true;
                return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.0");
        }



        return true;
};
/* 
Creates primitive shapes that can be rendered across most browsers
I am not very happy with the code that follows. It is not of the best standard and needs much improvement
coordinates are a string consisting of floats and move commands (M)
*/

var VismoShape = function(properties,coordinates){
    if(!coordinates) {
        coordinates = properties.coordinates;
        delete properties["coordinates"];
    }
    
	this.coordinates = {
		projected: false,
		normal: [],
		optimised: {},
		optimisedandprojected:{}
	};
	this.grid = {};
	this.width = 0;
	this.height =0;
	this.properties = {};
	this.setProperties(properties);
	if(coordinates[0] && coordinates[0].length == 2){
		coordinates = VismoOptimisations.unpackCoordinates(coordinates);	
	}
	
	this._construct(properties,coordinates);
	this.browser =false;
	this.currentResolution = false;
};


VismoShape.prototype={
        clone: function(){
                var coords = this.getCoordinates("normal");
                var props = this.getProperties();
                return new VismoShape(props,coords);
        }
	,getShape: function(){
		return this.getProperty("shape");
	}
	,setProperties: function(properties){
		var newprops = VismoUtils.clone(properties);
		var i;
		for(i in newprops){
		        this.setProperty(i,newprops[i]);
		}
		
		if(!newprops.stroke){
			this.setProperty("stroke",'#000000');		
		}
		
	}
	,getBoundingBox: function(){ /* returns untransformed bounding box */
		return this.grid;
	}

	,render: function(canvas,transformation,projection,optimisations, browser,pointradius){
		var st = this.getShape();
		if(this.getProperty("hidden")){
		        if(this.vml)this.vml.clear();
		        return;
		}
		if(pointradius && st == 'point') this.setRadius(pointradius);
		if(st == 'domElement'){
		        if(!this.vml)this.vml = new VismoVector(this,canvas);
		        this.vml.render(canvas,transformation,projection);
		        return;
		}
		else if(this.getRenderMode(canvas) == 'ie'){
                     
			if(!this.vml){
                                this.vml = new VismoVector(this,canvas);
        		}
        		this.vml.render(canvas,transformation,projection);
        		
		}
		else{	
			var c;
        		var vismoShape = this;
        		var ctx = canvas.getContext('2d');
			if(!ctx) return;
			ctx.save();
			if(transformation){
				var o = transformation.origin;
				var tr = transformation.translate;
				var s = transformation.scale;
				var r = transformation.rotate;
				if(o && s && tr){
					ctx.translate(o.x,o.y);
					ctx.scale(s.x,s.y);
					ctx.translate(tr.x,tr.y);
				}
				if(r && r.x)ctx.rotate(r.x);
			}
			VismoCanvasRenderer.renderShape(canvas,vismoShape);
			ctx.restore();
		}
			
	}
	,getTransformation: function(){
	       var t= this.getProperty("transformation");
	       if(!t) t= {};
	       if(!t.translate) t.translate = {x:0,y:0};
	       if(!t.scale) t.scale = {x:1,y:1};
	       
	       return t;
	}
	
	,setTransformation: function(transformation){
	        this.setProperty("transformation",transformation);
	        this._calculateBounds();
	        
	}
	,setCoordinates: function(coordinates,type){
	        
        var good = [];
        for(var i=0; i < coordinates.length; i++){
            if(coordinates[i] +"" !='NaN')
            {good.push(coordinates[i]);}
        }
     
        if(good.length < 2) {
                throw "cannot set coordinates for VismoShape not enough good coordinates given (coordinates may contain non-number elements)" + coordinates.toString();
        }
        coordinates = good;
                
                
		if(type == 'projected'){ this.coordinates.projected = coordinates;
		return;}
		
		this.coordinates.normal = coordinates;
		this.coordinates.projected= false;
		var i;
		for(i in this.coordinates.optimised){
			delete this.coordinates.optimised[i];
		}
		var j;
		for(j in this.coordinates.optimisedandprojected){
			delete this.coordinates.optimisedandprojected[j];
		}		
		this.grid = {}; //an enclosing grid
		this._calculateBounds();
		if(this.vml) this.vml.path = false; //reset path so recalculation will occur
	}
	,getCoordinates: function(type){
		if(type == 'normal') return this.coordinates.normal;
		if(type == 'projected') return this.coordinates.projected;
		
		var resolution = this.currentResolution;
		if(this.coordinates.projected) {
			if(this.browser != 'ie' && resolution){
				return this._simplifyCoordinates(resolution,this.coordinates.projected);
				var opt=this.coordinates.optimisedandprojected;
				if(!opt[resolution]) opt[resolution] =  this._simplifyCoordinates(resolution,this.coordinates.projected);
				
				return opt[resolution];
			}		
			return this.coordinates.projected;
		}
		else{
			if(this.browser != 'ie' && resolution){
				var opt=this.coordinates.optimised;
				if(!opt[resolution]) opt[resolution] =  this._simplifyCoordinates(resolution,this.coordinates.normal);
				
				return opt[resolution];
			}	
			return this.coordinates.normal;
		}
	}
	,getProperties: function(){
		return this.properties;
	}
	,getRenderMode: function(canvas){
		if(!this.browser){
			if(!canvas.getContext) {				
		                this.browser = "ie";
			}
				
			else 	this.browser = "good";
		}
		return this.browser;
	}
	
	,setProperty: function(name,value){
		this.properties[name] = value;
	}
	,getProperty: function(name){
		return this.properties[name];
	}

	,_calculateBounds: function(coords){
	        var that = this;
		var st = this.getShape();
		if(st == 'path'){
			//this.grid = {x1:0,x2:1,y1:0,y2:1};
			//return;
		}
		else if(st == 'point' || st == 'circle' | st == 'image' | st == 'domElement'){
				var coords = this.getCoordinates().clone();
				var x = coords[0]; var y = coords[1]; 
				var dim = this.getDimensions();
				
				var transform = this.getTransformation();


				
				this.grid.center = {};
				this.grid.center.x = x;
				this.grid.center.y = y;
				
				if(transform){
				        if(transform.translate){
				                var tran_x =0,tran_y =0;
				                 if(transform.translate.x)tran_x = transform.translate.x;
				                if(transform.translate.y)tran_y =  transform.translate.y;
				                /*if(transform.scale){
				                        if(transform.scale.x) tran_x *= transform.scale.x;
				                        if(transform.scale.y) tran_y *= transform.scale.y;
				                }*/
				                
				                this.grid.center.x += tran_x;
				                this.grid.center.y += tran_y;
				        }
				        if(transform.scale){
				                dim.width *= transform.scale.x;
				                dim.height *= transform.scale.y;
				        }
				}
				var newx = this.grid.center.x;
				var newy = this.grid.center.y;
				var radiusw = dim.width / 2;
				var radiush = dim.height / 2;
				this.grid ={x1: newx -radiusw ,x2: newx + radiusw, y1: newy - radiush, y2: newy + radiush,center:{x:newx,y:newy},width: dim.width,height:dim.height};	

				
				//console.log(this.grid.center.x,this.coordinates.normal,this.properties.transformation);
				return;
		}
		if(!coords) coords = this.getCoordinates();
		if(coords.length < 2) return;
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
		this.grid.width = this.grid.x2 - this.grid.x1;
		this.grid.height = this.grid.y2 - this.grid.y1;
		/*var transform = this.getTransformation();
		if(transform && transform.scale){
		        var scale = transform.scale;
		        this.grid.width *= scale.x;
		        this.grid.height *= scale.y;
		        
		}*/
		this.grid.center = {};
		this.grid.center.x = (this.grid.x2 - this.grid.x1) / 2 + this.grid.x1;
		this.grid.center.y = (this.grid.y2 - this.grid.y1) / 2 + this.grid.y1;
		
/*		if(transform && transform.translate){
		        var trans = transform.translate;
		        this.grid.center.x += trans.x;
		        this.grid.center.y += trans.y;
		}
*/
		this.grid.x1 = this.grid.center.x - (this.grid.width / 2);
		this.grid.x2 = this.grid.center.x + (this.grid.width /2);
		this.grid.y1 = this.grid.center.y - (this.grid.height/2);
		this.grid.y2 = this.grid.center.y +(this.grid.height/2);
		//if(st == 'path') console.log(this,this.grid);
	}

	,setRadius: function(r){
		this.setDimensions(r*2,r*2);
		this._calculateBounds();
	}
	,getRadius: function(){
		if(this.width) return this.width /2;
	    else{
	        var bb = this.getBoundingBox();
		    return bb.width / 2;
		}
		
	}
	,setDimensions: function(width,height){
		this.width = width;
		this.height = height;
	}
	,getDimensions: function(){
		return {width: this.width, height: this.height};
	}
	
	,_construct: function(properties, coordinates){
		var shapetype =properties.shape; 
		if(!shapetype) shapetype = 'polygon';
		if(shapetype == 'point' || shapetype == 'circle'){
			var radiusw,radiush;
			if(coordinates[2]) radiusw = coordinates[2];
			else radiusw = 0.5;
			
			if(coordinates[3]) radiush= coordinates[3];
			else radiush = radiusw;
			
			this.setDimensions(radiusw*2,radiush*2);
			this.setCoordinates([coordinates[0],coordinates[1]]);
			
		}
		else if(shapetype == 'polygon' || shapetype == 'path')
		{
			this.setCoordinates(coordinates);
		}
		else if(shapetype == 'domElement'){
					       
		        var w = jQuery(this.getProperty("element")).width(); 
		        var h = jQuery(this.getProperty("element")).height(); 
		        this.setDimensions(w,h);
		        this.setCoordinates(coordinates);

		}
		else if(shapetype == 'image'){
			var src = this.getProperty("src");
			if(!src) throw "all images must carry a property src at minimum";
			var image = new Image();
			image.src= src;
			this.image = image;
			var vismoShape = this;
			var w = vismoShape.getProperty("width"); h=  vismoShape.getProperty("height");
			if(coordinates.length > 2){
				w = coordinates[2]; h = coordinates[3];
			}
			image.onload = function(){
				if(!w && !h){
					vismoShape.setDimensions(w,h);
					vismoShape.setCoordinates([coordinates[0],coordinates[1]]);
				}
				vismoShape.ready = true;
			};
			if(image.complete)vismoShape.ready = true;
		
			vismoShape.setDimensions(w,h);
			vismoShape.setCoordinates([coordinates[0],coordinates[1]]);	
			
		}
		else{
			console.log("don't know how to construct basic shape " + properties.shape);
		}			
		
	}	

	,_applyProjection: function(projection,transformation){
		var c = this.getCoordinates('normal');
	
		if(!projection || !projection.xy) return c;
	
		if(projection.init) projection.init();
		var newc = [];
		for(var i=0; i < c.length-1; i+=2){
			var moved = false;
			if(!VismoShapeUtils._isCoordinate(c[i])){
				i+= 1;
			}
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);
			var newx,newy;
			var projectedCoordinate = projection.xy(c[i],c[i+1],transformation);
			if(projectedCoordinate.x && projectedCoordinate.y){
				newx= projectedCoordinate.x;
				newy= projectedCoordinate.y;
			
				if(projectedCoordinate.move){
					moved  =true;
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
					if(VismoShapeUtils._isCoordinate(x) && VismoShapeUtils._isCoordinate(y)){
						if(moved){
							newc.push("M");
						}
						newc.push(newx);
						newc.push(newy);
					}

				}
			}	
		}	
		if(newc.length < 2) return;
		this.setCoordinates(newc,"projected");
		this._calculateBounds(newc);
		return newc;
	}


	,optimise: function(canvas,transformation,projection){
	        if(this.getShape() == "path") return true;
		if(transformation && transformation.scale) this.currentResolution = Math.min(transformation.scale.x, transformation.scale.y);
		var shapetype = this.getProperty("shape");
		if(projection) this._applyProjection(projection,transformation);
		
		if(shapetype != 'point' && shapetype != 'path' && shapetype !="domElement"){ //check if worth drawing				
			if(VismoOptimisations.vismoShapeIsTooSmall(this,transformation)) {
				if(this.vml)this.vml.clear();
				
				return false;	
			}	
		}
		
		if(!VismoOptimisations.vismoShapeIsInVisibleArea(this,canvas,transformation)){
			if(this.vml)this.vml.clear();
			
			return false;	
		}
		
		return true;
	}

	,_simplifyCoordinates: function(scaleFactor,coordinates){// **
		
		if(this.getProperty("shape") == 'path') return coordinates;
		/*will use http://www.jarno.demon.nl/polygon.htm#ref2 */
		if(!coordinates) throw "give me some coordinates!";
		var originals =coordinates;
		var tolerance;
		var bb = this.getBoundingBox();
		
		var d;
		if(bb.width < bb.height) d = bb.width;
		else d = bb.height;
		tolerance = (d/4) / scaleFactor;
		
		coordinates = VismoOptimisations.packCoordinates(coordinates);
		coordinates = VismoOptimisations.douglasPeucker(coordinates,tolerance);
		
		coordinates = VismoOptimisations.unpackCoordinates(coordinates);	
		
		var diff = originals.length - coordinates.length;
		
		if(diff < 10) return originals;
		else 
		return coordinates;	
	}


};var VismoCanvas = function(element,options){
    this.className = "VismoCanvas";
    if(!options) options = {};
	if(typeof element == 'string') element= document.getElementById(element);
	if(!element) throw "Element doesn't exist!";
	if(element.vismoClicking) {
		var update = element.vismoClicking;
		return update;
	}
	var wrapper = element;
	var canvas = document.createElement('canvas');
	canvas.width = parseInt(wrapper.style.width);
	canvas.height = parseInt(wrapper.style.height);
	if(!element.className)element.className = "VismoCanvas";
	jQuery(canvas).css({width:wrapper.style.width, height:wrapper.style.height,'z-index':1,position:'absolute'});        
	element.appendChild(canvas);
	var labels =  document.createElement("div");
        jQuery(labels).css({position:"absolute","z-index":9});      
        labels.className = "VismoLabels";
        wrapper.appendChild(labels);
        this.labelHolder = labels;
        this.labels = [];
	this.canvas = canvas;
	this.settings = {};
	this.settings.browser = !VismoUtils.browser.isIE ? 'good' : 'ie'
	this.settings.globalAlpha = 1;
	this.memory = [];
	element.vismoClicking = this;

	if(options.shapes) {
		for(var i=0; i < options.shapes.length; i++){
			this.add(options.shapes[i]);
		}
	}
	this.wrapper = wrapper;

	this._setupMouse();
/*
	if(options.panzoom){
	    new VismoController(this,this.getDomElement());
	}*/
	this.mouse({down:options.mousedown,up:options.mouseup,move:options.move,dblclick:options.dblclick,keypress:options.keypress});


};

VismoCanvas.prototype = {
	getDomElement: function(){
		return this.wrapper;
	}
	,addTooltip: function(addContent){
	        if(addContent) this.tooltipAddContent = addContent;
	        if(!this.tooltip){
	                var tooltip =  document.createElement("div");
                        jQuery(tooltip).css({position:"absolute","z-index":10,display:"none"});      
                        tooltip.className = "VismoTooltip";
                        this.wrapper.appendChild(tooltip);
                        this.tooltip = tooltip;
        		                       
                }
                if(!this.tooltipAdded){
                        var move= this.onmousemove;
                        var that = this;
                        var lastshape;
        		var newmove = function(e,shape){
        		        if(!e) e = window.event;
        		        if(!that.tooltip) return;     
                                jQuery(that.tooltip).html("");
                                if(shape && lastshape != shape){
                                       
                           	        var pos = VismoClickingUtils.getMouseFromEvent(e);
                		        jQuery(that.tooltip).css({top:pos.y, left:pos.x});             
                                }
        		        if(that.tooltipAddContent && shape){
        		                that.tooltipAddContent(that.tooltip,shape);
        		                lastshape = shape;
        		                jQuery(that.tooltip).css({display:""});
        		        }
        		        else{
     		                  jQuery(that.tooltip).css({display:"none"});
        		        }     
        		        if(move)move(e,shape);
        		        
        		};
        		this.onmousemove = newmove;
                        this.tooltipAdded = true;
                }
	}
	,getXYWindow: function(e){
	       var t = this.getTransformation();
	       var pos = this.getXY(e);
	       return  VismoTransformations.applyTransformation(pos.x,pos.y,t);
	}
	,getXY: function(e){
		return VismoTransformations.getXY(e,this.getTransformation());
	}
	,mouse: function(args){
	    if(!args){
	        return {up: this.onmouseup, down: this.onmousedown, move: this.onmousemove, dblclick: this.ondblclick,keypress:this.onkeypress};
	    }
	    else{
	        
	        if(args.down)this.onmousedown = args.down;
    		if(args.up)this.onmouseup = args.up;
    		if(args.move)this.onmousemove=  args.move;
    		if(args.dblclick) this.ondblclick = args.dblclick;
    		if(args.keypress) this.onkeypress = args.keypress;

    		//if(this.madeMoveable) this.makeMoveable();
    		//if(this.tooltipAdded) this.addTooltip();	        
	    }
	}
	,setOnMouse: function(down,up,move,dblclick,keypress){ /*kept for historic reasons please use mouse instead*/
        this.mouse({up:up,down:down,move:move,dblclick:dblclick, keypress: keypress});
	}
	,_setupMouse: function(){
		var that = this;
		this.onmousedown = function(e,s,pos){};
		this.onmouseup = function(e,s,pos){};
		this.onmousemove = function(e,s,pos){};
		this.ondblclick = function(e,s,pos){};
		this.onkeypress = function(e){};
	

		this._applyMouseBehaviours(this.wrapper);
		for(var i =0; i < this.wrapper.childNodes.length; i++){
			var child = this.wrapper.childNodes[i];
			//this._applyMouseBehaviours(child);
		}
	
	}
	,_applyMouseBehaviours: function(el){
	        var that = this;
		var newbehaviour = function(e){
				var t = VismoClickingUtils.resolveTargetWithVismo(e);
                                
				if(t && t.getAttribute("class") == 'vismoControl') return false;
				var shape = that.getShapeAtClick(e);
				return shape;
			
		};
	
		
		var down = el.onmousedown;
		var up = el.onmouseup;
		var mv = el.onmousemove;
		var dblclick =el.ondblclick;
		this.initialKeyPress = window.onkeypress;
		el.oncontextmenu=function() {  return false}; 		
		el.onmouseover = function(e){
		        
				if(!that.keypressactive) {
				        
					that.keypressactive =  true;
					/*window.onkeypress = that.onkeypress;
					document.onkeypress = function(e){if(!e) e= window.event;if(that.initialKeyPress)that.initialKeyPress(e);if(!e) e= window.event;var s = newbehaviour(e); 
					        if(that.onkeypress)that.onkeypress(e,s)
					};*/
				}
		};
		el.onmouseout = function(e){if(!e) e= window.event;that.keypressactive = false;};

		jQuery(el).mousedown(function(e){
			var s = newbehaviour(e); 
			if(s){
				if(s.getProperty("onmousedown")){
				        if(that.onmousedown)that.onmousedown(e,s);
				        s.getProperty("onmousedown")(e,s);	
				}
				else{
				    if(that.onmousedown)that.onmousedown(e,s);
				}
			}
			else {
			        if(that.onmousedown)that.onmousedown(e,s);
			        if(down)down(e,s);
			}
			
		});

        jQuery(el).dblclick(function(e){
			if(!e) e= window.event;
			var s = newbehaviour(e); 				
			if(s) {
		
				if(s.getProperty("ondblclick")){
				        s.getProperty("ondblclick")(e,s);
				}
				else if(that.ondblclick){
        			        that.ondblclick(e,s);
        			}
        			else{
        	       
        			
        			}
			}
			else {
				if(that.ondblclick){
        			        that.ondblclick(e,s);
        			}
				if(dblclick){
				        dblclick(e,s);
                                }
			}
		});
        jQuery(el).mouseup(function(e){ 
                var s = newbehaviour(e); 
		        if(s){
		                if(s.getProperty("onmouseup")){
		                        if(that.onmouseup)that.onmouseup(e,s);
		                        s.getProperty("onmouseup")(e,s);
		                }
		                else{
		                    if(that.onmouseup)that.onmouseup(e,s);
		                }
		                
		                
		        }
		        else{
		                if(that.onmouseup)that.onmouseup(e,s);
		                if(up)up(e,s);
		        }
		});
		var defaultCursor;
		jQuery(el).mousemove(function(e){ if(!e) e= window.event;var s = newbehaviour(e);

		        if(!VismoUtils.browser.isIE){
		                if(jQuery(el).hasClass("overVismoShape")) jQuery(el).removeClass("overVismoShape");
		        }
		        if(!VismoUtils.browser.isIE){
		                
		                if(jQuery(el).hasClass("overVismoPoint"))jQuery(el).removeClass("overVismoPoint");
		        }
		        
		        if(s && !s.getProperty("unclickable")){
		  

        		        if(that.ondblclick || that.onmousedown || that.onmouseup) {
        		                var sh;
                		        if(s){
                		               sh  = s.getShape();
                		               if(!VismoUtils.browser.isIE  &&sh == "point") jQuery(el).addClass("overVismoPoint");
                		        }
        		                if(!VismoUtils.browser.isIE)jQuery(el).addClass("overVismoShape");
        	                }
                                
		                if(s.getProperty("onmousemove"))s.getProperty("onmousemove")(e,s);
		        }
		        else{
		                //el.style.cursor = defaultCursor;
		        }
		        if(that.onmousemove)that.onmousemove(e,s); 
		        if(mv)mv(e,s);
		});       	

	}
	,getDimensions: function(){
		return {width: parseInt(this.canvas.style.width), height: parseInt(this.canvas.style.height)};
	}
	,resize: function(width,height){
		
		if(this.canvas.getAttribute("width")){
			this.canvas.width = width;
			this.canvas.height = height;
		}
		jQuery(this.wrapper).css({height:height,width:width});
		jQuery(this.canvas).css({height:height,width:width});
	}
	,setTransparency: function(alpha){	
		this.settings.globalAlpha = alpha
	}
	,_setupCanvasEnvironment: function(){
		if(VismoUtils.browser.isIE) return;
		var ctx = this.canvas.getContext('2d');
		var s =this.getTransformation().scale;
		if(s && s.x)ctx.lineWidth = (0.5 / s.x);
		ctx.globalAlpha = this.settings.globalAlpha;
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		ctx.lineJoin = 'round'; //miter or bevel or round	
	}
	,clear: function(deleteMemory){
		if(deleteMemory){
			this.clearMemory();
		}
		this._maxX = 0;
		this._maxY = 0;

		
		if(!this.canvas.getContext) {
			return;
		}
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);		
		
	}
	
	,render: function(projection){
		this._setupCanvasEnvironment();
		
		var that = this;
		var transformation = this.getTransformation();
	
		if(transformation.scale.x) sc = transformation.scale.x; else sc = 1;
		//determine point size
		var ps = 5 / parseFloat(sc);
		var smallest = 1 / this._iemultiplier;
		var largest = 2.5 * sc;
		if(ps < smallest) ps = smallest;
		if(ps > largest) ps = largest;	
			
			var newfragment = document.createDocumentFragment();
			var mem =that.getMemory();
			if(mem.length > 0){
				
				var tran;
				if(that.settings.browser == 'good'){
				
					var ctx = that.canvas.getContext('2d');
					ctx.save();
					tran = false;

					if(transformation){
						
						var o = transformation.origin;
						var tr = transformation.translate;
						var s = transformation.scale;
						var r = transformation.rotate;
						if(o && s && tr){
							ctx.translate(o.x,o.y);
							ctx.scale(s.x,s.y);
							ctx.translate(tr.x,tr.y);
						}
						if(r && r.x)ctx.rotate(r.x);
					}
					
				}
				else{
					tran = transformation;
				}
				
				var place =that.canvas; 
		 	        /*if(that.settings.browser == 'ie') {
		 	                place = document.createElement("div");
		 	                var c =jQuery(that.canvas);
		 	                jQuery(place).css({width:c.width(),height:c.height()});
		 	        }*/
				 for(var i=0; i < mem.length; i++){
				         var st = mem[i].getShape();
				 	if(mem[i].optimise(that.canvas,transformation,projection)){
				 	        if(st == 'domElement')tran = transformation;
						mem[i].render(place,tran,projection,true,that.settings.browser,ps);
					        
						if(mem[i].vmlfill && that.settings.globalAlpha) {
							mem[i].vmlfill.opacity =that.settings.globalAlpha;
						}
					}

				
				}
		 	        //if(that.settings.browser == 'ie') jQuery(that.canvas).append(jQuery(place).children());
				/*	
				if(!that.settings.browser == 'ie'){
					that._fragment= newfragment.cloneNode(true);
					that.canvas.appendChild(that._fragment);
				}*/
			}
			if(ctx)ctx.restore();
			
	//	};f();
	}
	,getTransformation: function(){
		if(!this.transformation) {
		var ox = parseInt(this.canvas.style.width);
		var oy = parseInt(this.canvas.style.height);
		this.transformation = {scale:{x:1,y:1},translate:{x:0,y:0},origin:{x: ox/2, y: oy/2}};
		//this.transformation = VismoTransformation.getBlankTransformation(this.canvas);
		}
		return this.transformation;
	}
	
	,setTransformation: function(transformation){
	        if(!transformation.origin){
	                transformation.origin = {};
	                transformation.origin.x = jQuery(this.wrapper).width() / 2;
	                transformation.origin.y = jQuery(this.wrapper).height() / 2;
	        }
	      
		if(transformation) this.transformation = transformation;	
	}

	,remove: function(vismoShape){
	       var shapes = this.getMemory();
	       
	     
	       for(var i=0; i < shapes.length; i++){
	            if(shapes[i] == vismoShape){
	                this.memory.splice(i,1);
	            }
	       }
	}
	,add: function(vismoShape){
		if(!this.memory) this.memory = [];
		if(!vismoShape.getProperty("id"))vismoShape.setProperty("id",this.memory.length);
		this.memory.push(vismoShape);
		vismoShape._vismoClickingID = this.memory.length;

		return vismoShape;
	}
	,addLabel:function(domElement,x,y){
	        
	        this.labelHolder.appendChild(domElement);
	        var properties = {element: domElement,shape:"domElement"};
	  
	        var coords = [];
	        coords.push(x);
	        coords.push(y);
	        var shape = new VismoShape(properties,coords);
	        this.add(shape);
	              //console.log(shape);
	        return {element: domElement ,vismoshape: shape};
	}
	,transform: function(t){
		this.setTransformation(t);
		this.render();
	}
	,clearMemory: function(){
		for(var i=0; i < this.memory.length; i++){
			if(this.memory[i].vml){
				this.memory[i].vml.parentNode.removeChild(this.memory[i].vml);
			}
		}
		this.memory = [];

	},
	getMemory: function(){
	    /*return this.memory.sort(function(a,b){
	        var z1 = a.getProperty("z-index");
	        var z2 =b.getProperty("z-index");
	        if(z1 || z2){
	            if(z2 && z1 && z1 > z2){
	                return 0;
	            }
	            else
	            return 1;
	        } 
	        else{
	            return 1;
	        }
	        });
	        */
	        return this.memory;
	}
	,getMemoryID: function(vismoShape){
		if(vismoShape && vismoShape._vismoClickingID)
			return vismoShape._vismoClickingID;
		else{
			return false;
		}
	}
	,getShapeWithID: function(id){
	    var mem = this.getMemory();
	    for(var i=0; i < mem.length; i++){
	        if(mem[i].getProperty("id") == id) {
	            return mem[i];
	        }
	    }
	    return false;
	}
	,getShapeAtClick: function(e){
		if(!e) {
			e = window.event;
		}
	
		var node = VismoClickingUtils.resolveTarget(e);
		//alert(node.tagName);
		if(node && node.tagName && node.tagName.toUpperCase() == 'SHAPE') { //vml vismoShape
			return node.vismoShape;
		}
		var target = VismoClickingUtils.resolveTargetWithVismo(e);
	
		if(!target) return;
		var offset = jQuery(target).offset();

                var xy= VismoClickingUtils.scrollXY();
		x = e.clientX + xy.x - offset.left;
		y = e.clientY + xy.y - offset.top;

		if(this.memory.length > 0){
			var shape = false;
			if(target.vismoClicking){
			shape = target.vismoClicking.getShapeAtPosition(x,y);
			}
			return shape;
		} else{
			return false;
		}
	},
	getShapeAtPosition: function(x,y) {
		var shapes = this.memory;
		if(this.transformation){
			var pos =  VismoClickingUtils.undotransformation(x,y,this.transformation);
			x = pos.x;
			y = pos.y;
		
		}
		var hitShapes = [];
		for(var i=0; i < shapes.length; i++){
			var shape = shapes[i];
			if(!shape.getProperty("unclickable"))
	                {		
	                        var st = shape.getShape();
				var g = shape.getBoundingBox();
				
				if(x >= g.x1 && x <= g.x2 && y >=  g.y1 && y <=g.y2){
					hitShapes.push(shapes[i]);
				}
			}

		}

		if(hitShapes.length > 1){
		        var res = this._findNeedleInHaystack(x,y,hitShapes);
			return res;
		
		}
	        else return hitShapes[0];
	
		// var shapesInsideBox = _findShapesInsideBoundingBox(shapes, ..) TODO RENAME
		// var points = _findPointsInsideShapes(..)
		

	},
	_findNeedleInHaystack: function(x,y,shapes){
		var hits = [];
		for(var i=0; i < shapes.length; i++){
			var st = shapes[i].getShape();
			var itsahit = false;
			if(st == 'polygon'){
				itsahit = this._inPoly(x,y,shapes[i]);
			}
			else if(st == 'path'){
			    itsahit = this._onPath(x,y,shapes[i]);
			}
			else if(st == 'image'){
				itsahit = true;
			}
			else if(st == 'point' || st == 'circle'){
				itsahit = this._inCircle(x,y,shapes[i]);
			}
			if(itsahit) {
				hits.push(shapes[i]);
			}
			
		}

		if(hits.length == 0){
			return null;
		}
		else if(hits.length == 1) 
			return hits[0];
		else {//the click is in a polygon which is inside another polygon
			var g = hits[0].getBoundingBox();
			var mindist = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
		
			var closerEdge = {id:0, closeness:mindist};
			for(var i=1; i < hits.length; i++){
				var g = hits[i].getBoundingBox();
				var mindist = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
			
				if(closerEdge.closeness > mindist) {
					closerEdge.id = i; closerEdge.closeness = mindist;
				}
				
			}
			return hits[closerEdge.id];
		
		}

	}
	,_inCircle: function(x,y,vismoShape){
		var bb = vismoShape.getBoundingBox();
                var transform =vismoShape.getTransformation();
                
		var a =((x - bb.center.x)*(x - bb.center.x)) + ((y - bb.center.y)*(y - bb.center.y));
		var b = vismoShape.getRadius();
		
		if(transform && transform.scale) b *= transform.scale.x;
		b *= b;
		if (a <= b) return true;
		else return false;
	
	}
	,_onPath: function(x,y,vismoShape){
	    var c = vismoShape.getCoordinates();
	    x = parseInt(x);
	    y = parseInt(y);
	    var tolerance =2;
	    for(var i=0; i < c.length; i++){
	        if(!VismoShapeUtils._isCoordinate(c[i])) i +=1;
	        var sx = parseInt(c[i]);
	        var sy = parseInt(c[i+1]);
	        
	        //check to see if sx and sy are on the line between 2 points
	        if(sx > x- tolerance && sx < x + tolerance){ //matches on the x
	            
	        }
	    }
	    return false;
	}
	,_inPoly: function(x,y,vismoShape) {
		/* _inPoly adapted from inpoly.c
		Copyright (c) 1995-1996 Galacticomm, Inc.  Freeware source code.
		http://www.visibone.com/inpoly/inpoly.c.txt */
		var coords;
		coords = vismoShape.getCoordinates();
		var transform = vismoShape.getTransformation();
		
		if(transform){
		        var newpos = VismoTransformations.applyTransformation(x,y,transform);
		        x = newpos.x;
		        y = newpos.y;
		}
		
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
	}


        ,makeMoveable: function(oncompletemove,unmoveable){
                if(!unmoveable)unmoveable = [];
                if(this.madeMoveable) return;
                if(oncompletemove)this.oncompletemove = oncompletemove;
                this.madeMoveable = true;
		var down = this.onmousedown;
		var up = this.onmouseup;
		var move= this.onmousemove;
		
		                
                var el = this.getDomElement();
                var clickablecanvas = this;
  		var selectedshape = false,beginmoving = false,curpos;
  		this.selectedShapes = [selectedshape];
		var beginmoving = false;
		var checkformouseup= function(){
			if(!selectedshape) return;
			if(selectedshape.getShape() != 'circle') return;
			beginmoving = true;
			el.style.cursor = 'move';

		};

		var cancel = function(){
			if(el.vismoController)el.vismoController.enable();
			//autoSaveChanges();
			if(clickablecanvas.oncompletemove){
			        clickablecanvas.oncompletemove(selectedshape);
			        beginmoving = false;selectedshape = false;
                        }
		};
		var oldclick = el.onclick;
		el.onclick = function(e){cancel();if(oldclick)oldclick(e);};
		var moveit = function(){
			var pos = curpos;
			if(selectedshape){
			        el.style.cursor = 'move';
				s = selectedshape;
				s.setCoordinates([pos.x,pos.y,s.getRadius()]); 
				clickablecanvas.render();
				/*
				var x = pos.x/ img.width;
					var y = pos.y / img.height;
				var tid = store.getTiddler(s.getProperty("id"));
				tid.fields.tagx = x+"";
				tid.fields.tagy = y+"";*/

			}
		};
		var movethoseshapes = function(e,s,pos){
			if(!beginmoving) {return true;}
		
			curpos = VismoTransformations.undoTransformation(pos.x,pos.y,clickablecanvas.getTransformation());
			window.setTimeout(moveit,10);
			return false;
		};


		var onmousemove = function(e,s){
			var pos = VismoClickingUtils.getMouseFromEvent(e);
			var cont = movethoseshapes(e,s,pos);
			if(!cont) return;
		};

		var onmousedown = function(e,s){			if(el.vismoController)el.vismoController.disable(); beginmoving = false;selectedshape = s; if(s.getShape() != 'circle') cancel(); window.setTimeout(checkformouseup,200); };
		var onmouseup = function(e,s){cancel(); window.setTimeout(cancel,200);};

                var result = {};
                this.onmouseup = function(e,s){onmouseup(e,s);if(up)up(e,s);};
                this.onmousedown = function(e,s){onmousedown(e,s);if(down)down(e,s);};
                this.onmousemove = function(e,s){
                        if(move)move(e,s);
                        if(unmoveable.contains(s)) return;
                        onmousemove(e,s);
                        var showitsmoveable = function(){
                                el.style.cursor = 'move';
                        };
                        window.setTimeout(showitsmoveable,1000);
                };
                
        }
};
var VismoOptimisations = {
	packCoordinates: function(coordlist){
		var res = [];
		for(var i=0; i < coordlist.length-1; i+=2){
			res.push([coordlist[i],coordlist[i+1]]);
		}
		
		return res;
	}
	,unpackCoordinates: function(coordlist){
		var res = [];
		for(var i=0; i < coordlist.length; i+=1){
			res.push(coordlist[i][0]);
			res.push(coordlist[i][1]);
		}
		return res;	
	}
	//coords in form [[x1,y1],[x2,y2]]
	,douglasPeucker: function(coords,tolerance, start,end){
		var results = [];

		if(!start) start = 0;
		if(!end) end = coords.length - 1;
		if(start >= coords.length || end >= coords.length || start == end -1){
			return [];
		}	
		var midpoint = {};
	
	
		midpoint.x = (coords[end][0] + coords[start][0]) /2;
		midpoint.y = (coords[end][1] + coords[start][1]) /2;
		
		var bestPoint = {distance:-1, index:-1};
		for(var i=start+1; i < end; i++){
			var x = coords[i][0];
			var y = coords[i][1];
			var deltax = midpoint.x - x;
			var deltay= midpoint.y - y;
			
			var perpendicular_d = Math.sqrt((deltax * deltax ) + (deltay *deltay)); //this is not perpendicular distancd.. i think!
			if(perpendicular_d > bestPoint.distance){
				bestPoint.index = i;
				bestPoint.distance = perpendicular_d;
			}
		}
	
		if(bestPoint.index ==-1 || bestPoint.distance<tolerance){
			var res = [];
			res.push(coords[start]);
			//res.push(coords[end])
			return res; //none of these points are interesting except last
		}
		else{
			results.push(coords[start]);
			var ref = bestPoint.index;
			var splice1 = VismoOptimisations.douglasPeucker(coords,tolerance,start+1,ref);
			var splice2 = VismoOptimisations.douglasPeucker(coords,tolerance,ref,end);
			results = results.concat(splice1);
			results = results.concat(splice2);
			results.push(coords[end]);
			return results;
		}
		
	}
  
	,vismoShapeIsInVisibleArea: function(vismoShape,canvas,transformation){
		var left = 0,top = 0;
		var right =  parseInt(canvas.width) + left; 
		var bottom = parseInt(canvas.height) + top;
		var topleft =  VismoClickingUtils.undotransformation(left,top,transformation);
		var bottomright =  VismoClickingUtils.undotransformation(right,bottom,transformation);				
		var frame = {};
		frame.top = topleft.y;
		frame.bottom = bottomright.y;
		frame.right = bottomright.x;
		frame.left = topleft.x;
		var g = vismoShape.getBoundingBox();
		if(g.x2 < frame.left) {
			return false;}
		if(g.y2 < frame.top) {
			return false;}
		if(g.x1 > frame.right){
			return false;
		}
		if(g.y1 > frame.bottom){
			return false;	
		}
		
		return true;
	}
	
	,vismoShapeIsTooSmall: function(vismoShape,transformation){
	
		if(!transformation ||!transformation.scale) return false;
		var g = vismoShape.getBoundingBox();
		var s = transformation.scale;
		var t1 = g.x2 -g.x1;
		var t2 =g.y2- g.y1;
		var delta = {x:t1,y:t2};
		delta.x *= s.x;
		delta.y *= s.y;
		if(delta.x < 5 && delta.y < 5) 
			{return true;}//too small
		else
			return false;
	}

};var VismoClickingUtils = {
        //to be implemented..
        inVisibleArea: function(vismoCanvas,vismoShape){
                var bb = vismoShape.getBoundingBox();
                return true;
        }
        ,scrollXY: function(){
          var scrOfX = 0, scrOfY = 0;
          if( typeof( window.pageYOffset ) == 'number' ) {
            //Netscape compliant
            scrOfY = window.pageYOffset;
            scrOfX = window.pageXOffset;
          } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
            //DOM compliant
            scrOfY = document.body.scrollTop;
            scrOfX = document.body.scrollLeft;
          } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
            //IE6 standards compliant mode
            scrOfY = document.documentElement.scrollTop;
            scrOfX = document.documentElement.scrollLeft;
          }
          return {x: scrOfX,y: scrOfY};
        }
	,getRealXYFromMouse: function(e,t){
		var newpos =VismoClickingUtils.getMouseFromEvent(e);
		newpos = VismoClickingUtils.undotransformation(newpos.x,newpos.y,t);
		return newpos;
	}
	
	,undotransformation: function(x,y,transformation){ //porting to VismoTransformations?
		return VismoTransformations.undoTransformation(x,y,transformation);
	}	
	,resolveTarget:function(e)
	{
		if(!e) e = window.event;
		var obj;
		
		if(e.srcElement)
			obj = e.srcElement;
	        else if(e.target)
        	        obj = e.target;
        	else{
	                obj = false;
	        }
	        try{
                        var x = obj.parentNode;
                }catch(e){return false;}
                /*
		if(obj && obj.nodeType && obj.nodeType == 3) // defeat Safari bug
			obj = obj.parentNode;
			*/
			
			/*try{
                                var x = obj.parentNode;
                        }
                        catch(e){return false;};*/
	        return obj;

		//return obj;
	}
	
	
	,getMouseFromEvent : function(e,target){
			if(!e) e = window.event;
			
			if(!target){
			       
			        var target = this.resolveTargetWithVismo(e);
			        if(!target)return false;
                        }
                        
			var offset = jQuery(target).offset();
               
                        var i;
          
			if(typeof(offset.left) != 'number') return false;
		
		        var scroll = this.scrollXY(e);
			x = e.clientX + scroll.x;
			y = e.clientY + scroll.y;
			//alert(x +"/"+y);
			x -= offset.left;
			y-=  offset.top;
			
			return {'x':x, 'y':y};		
			
	}
	,getMouseFromEventRelativeToTarget : function(e,target){
			if(!e) e = window.event;
			if(!target)return false;

			var offset = jQuery(target).offset();

			
			if(!offset.left) return false;
			var scroll = this.scrollXY();
			x = e.clientX + scroll.x - offset.left;
			y = e.clientY + scroll.y - offset.top;
			return {'x':x, 'y':y};		
			
	}

	,resolveTargetWithVismo: function(e)
	{
		var node = VismoClickingUtils.resolveTarget(e);
                

                
		if(!node)return false;
		var hasVismo = false;
     
                
		while(!hasVismo && node != document && node.parentNode && node.parentNode != document){
		        
		        if(node.vismoCanvas || node.vismoController){
		                hasVismo = true;
			}
			else{
			        node= node.parentNode;
			}
		}
		
		if(!node) return false;
		return node;
	}
	,getMouseFromEventRelativeToElement: function (e,x,y,target){
		if(!e) e = window.event;

		var offset = jQuery(target).offset();
		if(!offset.left) return false;
		
		var scroll = this.scrollXY();
		oldx = e.clientX + scroll.x - offset.left;
		oldy = e.clientY + scroll.y - offset.top;
		var pos = {'x':oldx, 'y':oldy};

		if(!pos) return false;
		pos.x -= x;
		pos.y -= y;
		

		return pos;
		
	}

	,getMouseFromEventRelativeTo: function (e,x,y){
	
		var pos = this.getMouseFromEvent(e);
		if(!pos) return false;
		pos.x -= x;
		pos.y -= y;

		return pos;
	
	}
	,getMouseFromEventRelativeToElementCenter: function(e){ /*redundant?? */
		var w,h;
		var target = this.resolveTargetWithVismo(e);
		if(!target)return;
		if(target.style.width)
			w = parseInt(target.style.width);
		else if(target.width)
			w =parseInt(target.width);

		if(target.style.height)
			h = parseInt(target.style.height);
		else if(target.height)
			h = parseInt(target.height);
	
		if(!w || !h) throw "target has no width or height (vismomaputils)";
	
		return this.getMouseFromEventRelativeTo(e,w/2,h/2);
	}	
	

};

var VismoTransformations= {
	clone: function(transformation){
	
		var t = {};
		t.translate = {x:0,y:0};
		t.scale = {x:1,y:1};

		if(transformation.translate && transformation.translate.x){
			t.translate.x = transformation.translate.x;
			t.translate.y = transformation.translate.y;
		}
		
		if(transformation.scale && transformation.scale.x){
			t.scale.x = transformation.scale.x;
			t.scale.y = transformation.scale.y;		
		}
		
		return t;
	}
	,applyTransformation: function(x,y,t){

		var res= {};
		res.x = x;
		res.y = y;



		if(t.translate){
			res.x +=  t.translate.x;
			res.y += t.translate.y;
		}
		if(t.scale){
			res.x *= t.scale.x;
			res.y *= t.scale.y;
		}

		if(t.origin){
			res.x += t.origin.x;
			res.y += t.origin.y;
		}
		return res;
		
	}
	,mergeTransformations: function(a,b){
		if(!b) return a;
		if(!a) return b;
		
		var result = {};
		var i;
		for(i in a){
			result[i] = a[i];
		}
		
		for(i in b){
			if(result[i]){
				var oldt = result[i];
				var newt = b[i];
				
				result[i].x = oldt.x + newt.x;
				result[i].y = oldt.y + newt.y;
			}
			else{
				result[i] = b[i];
			}
		}
		return result;
	}
	,undoTransformation: function(x,y,transformation){
		var pos = {};
		var t =transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
		if(s ===false || o ===false || tr ===false) return false;
		
		if(x ===false || y ===false)return false;
		pos.x = x - o.x;
		pos.y = y -o.y;
		//pos.x -= x;
		//pos.y += y;
		
		if(pos.x !== 0)
			pos.x /= s.x;
		
		if(pos.y !== 0)
			pos.y /= s.y;
			
		pos.x -= tr.x;
		pos.y -= tr.y;			
		return pos;	
	}
	,getXY: function(e,t){
		var pos =VismoClickingUtils.getMouseFromEvent(e);
		return this.undoTransformation(pos.x,pos.y,t);
	}
};/*requires VismoShapes
Adds controls such as panning and zooming to a given dom element.

Mousewheel zooming currently not working as should - should center on location where mousewheel occurs
Will be changed to take a handler parameter rather then a targetjs
 */

var VismoController = function(targetjs,elem,options){ //elem must have style.width and style.height etM   
        
        if(elem.vismoController) throw "this already has a vismo controller!"
        elem.vismoController = this;              
	this.enabledControls = [];

	if(typeof elem == 'string') elem= document.getElementById(elem);
	this.setLimits({});
	if(!elem.style.position) elem.style.position = "relative";
	this.wrapper = elem; //a dom element to detect mouse actions
	this.targetjs = targetjs; //a js object to run actions on (with pan and zoom functions)	
	this.defaultCursor = "";
	var md = elem.onmousedown;
	var mu = elem.onmouseup;
	var mm = elem.onmousemove;
	for(var i=0; i < elem.childNodes.length; i++){
		var child = elem.childNodes[i];
		child.onmousedown = function(e){if(md)md(e);}
		child.onmouseup = function(e){if(mu)mu(e);}
		child.onmousemove = function(e){if(mm)mm(e);}
	}
        
	controlDiv = document.createElement('div');
	controlDiv.style.position = "absolute";
	controlDiv.style.top = "0";
	controlDiv.style.left = "0";
	controlDiv.className = 'vismoControls';
	jQuery(controlDiv).css({'z-index':30, height:"120px",width:"60px"});
	this.wrapper.appendChild(controlDiv);
	this.controlDiv = controlDiv;
        this.controlCanvas = new VismoCanvas(this.controlDiv);
	this.controlDiv.vismoController = this;
	var vismoController = this;
	var preventDef = function(e){
                if (e && e.stopPropagation) //if stopPropagation method supported
                 e.stopPropagation()
                else
                 e.cancelBubble=true
          return false;      
	};
	var f = function(e,s){
	        vismoController._panzoomClickHandler(e,s,vismoController);
	        return preventDef(e);
	};
	this.controlCanvas.setOnMouse(preventDef,f,preventDef,preventDef,preventDef);

	this.wrapper.vismoController = this;
	
	

	this.transformation = {'translate':{x:0,y:0}, 'scale': {x:1, y:1},'rotate': {x:0,y:0,z:0},origin:{}};	
	             
	this.transformation.origin.x = jQuery(elem).width() / 2;
	this.transformation.origin.y = jQuery(elem).height() / 2;
        var t = this.transformation;

	//looks for specifically named function in targetjs
	if(!this.targetjs.transform) alert("no transform function defined in " + targetjs+"!");
	this.wrapper.vismoController = this;
	this.enabled = true;


	if(!options) options = {};
	if(!options.controls)options.controls =['pan','zoom','mousepanning','mousewheelzooming'];
	this.options = options;
	this.addControls(this.options.controls);


};
VismoController.prototype = {
	setLimits: function(transformation){
	        this.limits = transformation;
	}
	,getEnabledControls: function(){
	        return this.enabledControls;
	}
	,_addEnabledControl: function(controlName){
	        this.enabledControls.push(controlName);      
	}
	,applyLayer: function(){
	        var that = this;
	        var hidebuttons = function(){
	               var shapes = that.controlCanvas.getMemory();
	                for(var i=0; i < shapes.length; i++){
	                        shapes[i].setProperty("hidden",true);
	                }

	                that.controlCanvas.render();
	        };	        
	        this.controlCanvas.render();
	        if(this.options.hidebuttons){
	                hidebuttons();
	                return;
	        }
	        
	       	       
	        if(VismoUtils.browser.isIE) return;
	        var enabled = this.getEnabledControls();
	        var pan,zoom;
	        if(enabled.contains("pan")) pan = true;
	        if(enabled.contains("zoom")) zoom = true;
                var callback = function(response){
                        if(!response)return;
                        if(!VismoUtils.svgSupport())return;
                        
                        var shape;
                        if(false == true){
                                //return;
                                shape = document.createElement("div");
                                shape.innerHTML = response;
                        }
                        else{
                                shape = document.createElement('object');
                                
                                shape.setAttribute('codebase', 'http://www.adobe.com/svg/viewer/install/');
                                if(VismoUtils.browser.isIE)shape.setAttribute('classid', '15');
                                shape.setAttribute('style',"overflow:hidden;position:absolute;z-index:0;width:60px;height:120px;");
                                shape.setAttribute('type',"image/svg+xml");
                                var dataString = 'data:image/svg+xml,'+ response;
                                shape.setAttribute('data', dataString); // the "<svg>...</svg>" returned from Ajax call                                      
                                jQuery(shape).css({width:60,height:120})
                        }
                        that.controlDiv.appendChild(shape);
                        jQuery(that.controlDiv).css({"background-image":"none"});
                        hidebuttons();
                };
	        if(pan && zoom) callback(this.panzoomcontrolsSVG);

        	
	}
	,getTransformation: function(){
		return this.transformation;
	}
	,translate: function(x,y){
	        var t= this.getTransformation();
	        t.translate.x = x;
	        t.translate.y = y;
	        this.transform();
	},
	addMouseWheelZooming: function(){ /*not supported for internet explorer*/
                var that = this;
	        this._addEnabledControl("mousewheelzooming");
	
		this.crosshair = {lastdelta:false};
		this.crosshair.pos = {x:0,y:0};
		if(!this.crosshair.el){
		this.crosshair.el =document.createElement("div");
		jQuery(this.crosshair.el).css({position:"absolute",display:"none"});
		
		this.crosshair.el.className = "vismoController_crosshair";
		this.crosshair.el.appendChild(document.createTextNode("+"));
		this.crosshair.el.style.zIndex = 3;
		var t = this.getTransformation();
		this.crosshair.el.style.left = parseInt(t.origin.x-5) + "px";
		this.crosshair.el.style.top = parseInt(t.origin.y-5) + "px";
		this.crosshair.el.style.width = "10px";
		this.crosshair.el.style.height = "10px";
		this.crosshair.el.style.verticalAlign = "middle";
		this.crosshair.el.style.textAlign = "center";
		this.wrapper.appendChild(this.crosshair.el);
		}
		var mw = this.wrapper.onmousewheel;
		

		var that = this;
		var mm = this.wrapper.onmousemove;
		


		var onmousewheel = function(e){		
				
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;

                        
			if(!that.goodToTransform(e)) return false;
			
			var t = VismoClickingUtils.resolveTargetWithVismo(e);
		        

                       if(t != that.wrapper && t.parentNode !=that.wrapper) return false;
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
	
			var sensitivity = 0.4;
			var transform = that.getTransformation();
			var scale =transform.scale;
			var origin = transform.origin;


			var mousepos = VismoClickingUtils.getMouseFromEvent(e);
	
			var w = parseInt(that.wrapper.style.width) / 2;
			var h = parseInt(that.wrapper.style.height) / 2;
			var translation =  VismoTransformations.undoTransformation(mousepos.x,mousepos.y,that.transformation);
			transform.translate= {x: -translation.x, y: -translation.y};
			//{x: -mousepos.x + w,y: -mousepos.y + h};
			transform.origin = {
											x: mousepos.x,
											y: mousepos.y
										};
			
			that.crosshair.el.style.left = mousepos.x + "px";
			that.crosshair.el.style.top = mousepos.y + "px";
	


			if(delta > that.crosshair.lastdelta + sensitivity || delta < that.crosshair.lastdelta - sensitivity){	
				var newx,newy;
				if(delta > 0){
					newx = parseFloat(scale.x) * 2;
					newy = parseFloat(scale.y) * 2;					
				}
				else{
					newx = parseFloat(scale.x) / 2;
					newy = parseFloat(scale.y) / 2;
				}

				if(newx > 0 && newy > 0){
					scale.x = newx;
					scale.y = newy;
					that.setTransformation(transform);					
				}

			}
			that.crosshair.lastdelta = delta;	
			
                        if (e && e.stopPropagation) //if stopPropagation method supported
                        e.stopPropagation();
                        else
                        e.cancelBubble=true;
                        if(e.preventDefault)e.preventDefault();

			
			return false;

		};

		
		var element = this.wrapper;
                if(VismoUtils.browser.isIE) {
		        document.onmousewheel = function(e){
		                if(!e)e = window.event;
		                var el =  e.srcElement;
		                if(!el) return;
		                while(el.parentNode){
		                        
		                        if(el == element) {
		                                onmousewheel(e); 
		                                
		                                return false;    
		                        }
		                        el = el.parentNode;
		                }
		                return;
		        };
		        return;
		}
		else if (element.addEventListener){
			element.onmousewheel = onmousewheel; //safari
		        element.addEventListener('DOMMouseScroll', onmousewheel, false);/** DOMMouseScroll is for mozilla. */
		
		}
		else if(element.attachEvent){ 	
			element.attachEvent("onmousewheel", onmousewheel); //safari
		}
		else{ //it's ie.. or something non-standardised. do nowt
		//window.onmousewheel = document.onmousewheel = onmousewheel;	
		}

		
	}
	,disable: function(){
		this.enabled = false;
	}
	,enable: function(){
		this.enabled = true;
	}
	
	,goodToTransform: function(e){
		var t =  VismoClickingUtils.resolveTarget(e);

		switch(t.tagName){
			case "INPUT":
				return false;
			case "SELECT":
				return false;
			case "OPTION":
				return false;
		}
		
		if(t && t.getAttribute("class") == "vismoControl") return false;
		
		return true;
		
	}
	,addMousePanning: function(){
	       
	        this._addEnabledControl("mousepanning");
		var that = this;
		var md = that.wrapper.onmousedown;
		var mu = that.wrapper.onmouseup;	
		var mm = that.wrapper.onmousemove;
		var panning_status = false;	
		
		var cancelPanning = function(e){
			panning_status = false;
			
			if(!VismoUtils.browser.isIE)jQuery(that.wrapper).removeClass("panning");
			//style.cursor= that.defaultCursor;
			that.wrapper.onmousemove = mm;
			return false;
		};
		var onmousemove = function(e){

			if(mm)mm(e);
			if(!that.enabled) return;
			if(!panning_status) {
				return;
			}
			if(!that.goodToTransform(e)) return;
			var pos =  VismoClickingUtils.getMouseFromEventRelativeToElement(e,panning_status.clickpos.x,panning_status.clickpos.y,panning_status.elem);		
			if(!pos)return;
			
			var t = that.getTransformation();
			//if(this.transformation) t = this.transformation;
			var sc = t.scale;

			/* work out deltas */
			var xd =parseFloat(pos.x /sc.x);
			var yd = parseFloat(pos.y / sc.y);
			t.translate.x = panning_status.translate.x + xd;
			t.translate.y =panning_status.translate.y +yd;

                        that.setTransform
			that.transform();
			
			if(pos.x > 5  || pos.y > 5) panning_status.isClick = false;
			if(pos.x < 5|| pos.y < 5) panning_status.isClick = false;
			return false;	
		};

		this.wrapper.onmousedown = function(e){
			if(panning_status){
				return;
			}
			if(md) {md(e);}
			if(!that.enabled) return;
			var target =  VismoClickingUtils.resolveTarget(e);
			if(!target) return;

			if(target.getAttribute("class") == "vismoControl") return;
			
			var t = that.transformation.translate;
			var sc =that.transformation.scale; 
			
			var realpos = VismoClickingUtils.getMouseFromEvent(e);
			if(!realpos) return;
			this.vismoController = that;

			var element = VismoClickingUtils.resolveTargetWithVismo(e);
			
			panning_status =  {clickpos: realpos, translate:{x: t.x,y:t.y},elem: element,isClick:true};
			that.wrapper.onmousemove = onmousemove;
			if(!VismoUtils.browser.isIE)jQuery(that.wrapper).addClass("panning");	
		};
			
		this.wrapper.onmouseup = function(e){
			if(panning_status.isClick && mu){mu(e);};
			cancelPanning(e);

		};
		
		jQuery(document).mousemove(function(e){
			if(panning_status){
			        var parent= e.target;
			        while(parent.parentNode){
			                parent = parent.parentNode;
			                if(parent == that.wrapper) return;
			        }
				
				if(parent != that.wrapper)cancelPanning(e);
			}
		});
	
	},
	setTransformation: function(t){
	        if(!t.origin){
	                var w = jQuery(this.wrapper).width();
	                var h = jQuery(this.wrapper).height();
	                t.origin = {x: w/2, y: h/2};
	
	        }
		if(this.enabled){
			if(!t.scale && !t.translate && !t.rotate) alert("bad transformation applied - any call to setTransformation must contain translate,scale and rotate");
			this.transformation = t;
			this.targetjs.transform(t);
		}
		//console.log("transformation set to ",t);
	},
	createButtonLabel: function(r,type,offset){
		var properties=  {'shape':'path', stroke: '#000000',lineWidth: '1'};
		properties.actiontype = type;
		var coords=[];
		if(type == 'E'){
			coords =[r,0,-r,0,'M',r,0,0,-r,"M",r,0,0,r];
		}
		else if(type =='W'){
			coords =[-r,0,r,0,'M',-r,0,0,r,"M",-r,0,0,-r]; 
		}
		else if(type == 'S'){
			coords =[0,-r,0,r,'M',0,r,-r,0,"M",0,r,r,0];	
		}
		else if(type == 'N'){
			coords =[0,-r,0,r,'M',0,-r,r,0,"M",0,-r,-r,0];	
		}
		else if(type == 'in'){
			coords =[-r,0,r,0,"M",0,-r,0,r];
		}
		else if(type == 'out'){
			coords = [-r,0,r,0];
		}
		for(var i=0; i < coords.length; i+=2 ){
		        if(coords[i] == "M") i+=1;
		        coords[i] += offset.x;
		        coords[i+1] += offset.y;
		}
		return new VismoShape(properties,coords);
	},	
	createButton: function(width,direction,offset,properties) {
	        var canvas = this.controlCanvas;
	        if(!canvas) throw "no canvas to create on..";
		if(!width) width = 100;
		var r = width/2;

		offset = {
			x: offset.x || 0,
			y: offset.y || 0
		};
		var coords = [
			offset.x, offset.y,
			offset.x + width, offset.y,
			offset.x + width, offset.y + width,
			offset.x, offset.y + width
		];
		properties.shape = 'polygon';
		properties.fill ='rgba(150,150,150,0.7)';
		var button = new VismoShape(properties,coords);
		var bb = button.getBoundingBox();
		buttoncenter = {x:bb.center.x,y:bb.center.y}; 
		var label = this.createButtonLabel(r,properties.actiontype,buttoncenter);
	        canvas.add(label);
		canvas.add(button);
		return button;
	},
	addControls: function(list){
		for(var i= 0; i < list.length; i++){
			this.addControl(list[i]);
		}
	}
	,addControl: function(controlType) {
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
	
	addPanningActions: function(controlDiv){
	        this._addEnabledControl("pan");
		this.createButton(10,180,{x:-6,y:-54},{'actiontype':'N','name':'pan north','buttonType': 'narrow'});
		this.createButton(10,270,{x:10,y:-38},{'actiontype':'E','name':'pan east','buttonType': 'earrow'});
		//this.createButton(10,90,{x:16,y:16},{'actiontype':'O','name':'re-center','buttonType': ''});
		this.createButton(10,90,{x:-22,y:-38},{'actiontype':'W','name':'pan west','buttonType': 'warrow'});
		this.createButton(10,0,{x:-6,y:-20},{'actiontype':'S','name':'pan south','buttonType': 'sarrow'});			
		this.applyLayer();		

	},
	addRotatingActions: function(){
		/*
		var rotateCanvas = this.controlCanvas.getDomElement();
		this.createButton(rotateCanvas,10,180,{x:16,y:2},{'actiontype':'rotatezup','name':'pan north','buttonType': 'narrow'});
		this.createButton(rotateCanvas,10,0,{x:16,y:30},{'actiontype':'rotatezdown','name':'pan south','buttonType': 'sarrow'});			
			
		this.createButton(rotateCanvas,10,270,{x:30,y:16},{'actiontype':'rotatezright','name':'rotate to right','buttonType': 'earrow'});
		this.createButton(rotateCanvas,10,90,{x:2,y:16},{'actiontype':'rotatezleft','name':'rotate to left','buttonType': 'warrow'});
		rotateCanvas.onmouseup = this._panzoomClickHandler;*/

	},	
	addZoomingActions: function(){
	        this._addEnabledControl("zoom");
		this.createButton(10,180,{x:-6,y:12},{'actiontype':'in','name':'zoom in','buttonType': 'plus'});		
		this.createButton(10,180,{x:-6,y:42},{'actiontype':'out','name':'zoom out','buttonType': 'minus'});	
	        this.applyLayer();
	}	
	
        ,panTo: function(x,y){
                //if(!this.enabled) return;
                var t = this.getTransformation();
                
                var finalX = -x;
                var finalY = -y;
                var thisx,thisy;
                var direction = {};
                var difference = {};
                
                thisx = t.translate.x;
                thisy = t.translate.y;
                
                difference.x=  thisx - finalX;
                difference.y = thisy - finalY;
                
                direction.x = -difference.x / 5;
                direction.y = -difference.y / 5;

                var change = true;
                
                var that = this;
                var f = function(){
                   
                        change= {x: false,y:false};
                        if(thisx > finalX && thisx + direction.x > finalX) {thisx += direction.x;change.x=true;}
                        else if(thisx < finalX && thisx + direction.x < finalX) {thisx += direction.x;change.x=true;}
                        else{
                                t.translate.x = finalX;
                        }
                
                        if(thisy > finalY && thisy + direction.y > finalY) {thisy += direction.y;change.y=true;}
                        else if(thisy < finalY && thisy + direction.y < finalY) {thisy += direction.y;change.y=true;}
                        else{
                                change.x = true;
                                t.translate.y =finalY;
                        }
                
                        if(change.x){
                                t.translate.x = thisx;
                        }
                        else{
                                t.translate.x = finalX;
                        }
                        if(change.y){
                                t.translate.y = thisy;
                        }
                        else{
                                t.translate.y = finalY;
                        }
    
                        if(t.translate.x != finalX && t.translate.y != finalY){
                                that.setTransformation(t); 
                                window.setTimeout(f,5);
                        }
                        else{
                                that.setTransformation(t);
                        }
  
                };
                
                f();
                                       
               

                //window.setTimeout(pan,200);
        }
	,transform: function(){
		if(this.enabled){
			var t = this.getTransformation();
			var s = t.scale;
			var tr = t.translate;
			if(s.x <= 0) s.x = 0.1125;
			if(s.y <= 0) s.y = 0.1125;

                        var ok = true;
                        var lim = this.limits;
                        if(lim.scale){
                                
                                if(s.y > lim.scale.y) t.scale.y = lim.scale.y;
                                if(s.x > lim.scale.x) t.scale.x = lim.scale.x;
		        }
		        
		        this.targetjs.transform(this.transformation);

		}
	},
	_panzoomClickHandler: function(e,hit,controller) {
		var pan = {};
		var t =controller.getTransformation();
		if(!t.scale) t.scale = {x:1,y:1};
		if(!t.translate) t.translate = {x:0,y:0};
		if(!t.rotate) t.rotate = {x:0,y:0,z:0};
		
		var scale =t.scale;
		pan.x = parseFloat(30 / scale.x);
		pan.y = parseFloat(30 / scale.y);
		
		switch(hit.getProperty("actiontype")) {
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
				if(!t.rotate.z) t.rotate.z = 0;
				//console.log("right",t.rotate.z);
				t.rotate.z -= 0.1;
				var left =6.28318531;
				
				if(t.rotate.z <0 )t.rotate.z =left;
				break;
			case "rotatezup":
				if(!t.rotate.y) t.rotate.y = 0;
				t.rotate.y += 0.1;
				break;
			case "rotatezdown":
				if(!t.rotate.y) t.rotate.y = 0;
				t.rotate.y -= 0.1;
				break;
			case "rotatezleft":
				if(!t.rotate.z) t.rotate.z = 0;
				t.rotate.z += 0.1;
				break;
			default:
				break;
		}
		controller.transform();
                //console.log("done",controller);
		return false;
	}
};
VismoController.prototype.panzoomcontrolsSVG ="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   xmlns:dc=\"http://purl.org/dc/elements/1.1/\"   xmlns:cc=\"http://creativecommons.org/ns#\"   xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"   xmlns:svg=\"http://www.w3.org/2000/svg\"   xmlns=\"http://www.w3.org/2000/svg\"   xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"   xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"   width=\"60px\"   height=\"120px\"   id=\"svg3820\"   sodipodi:version=\"0.32\"   inkscape:version=\"0.46\"   sodipodi:docname=\"panzoomcontrols.svg\"   inkscape:output_extension=\"org.inkscape.output.svg.inkscape\">  <defs     id=\"defs3\">    <linearGradient       id=\"linearGradient3735\">      <stop         style=\"stop-color:#ffffff;stop-opacity:1;\"         offset=\"0\"         id=\"stop3737\" />      <stop         style=\"stop-color:#0000f0;stop-opacity:1;\"         offset=\"1\"         id=\"stop3739\" />    </linearGradient>    <linearGradient       id=\"linearGradient3745\">      <stop         style=\"stop-color:#000000;stop-opacity:1;\"         offset=\"0\"         id=\"stop3747\" />      <stop         style=\"stop-color:#ffffef;stop-opacity:0;\"         offset=\"1\"         id=\"stop3749\" />    </linearGradient>    <inkscape:perspective       sodipodi:type=\"inkscape:persp3d\"       inkscape:vp_x=\"0 : 526.18109 : 1\"       inkscape:vp_y=\"6.123234e-14 : 1000 : 0\"       inkscape:vp_z=\"744.09448 : 526.18109 : 1\"       inkscape:persp3d-origin=\"372.04724 : 350.78739 : 1\"       id=\"perspective3826\" />  </defs>  <sodipodi:namedview     inkscape:document-units=\"mm\"     id=\"base\"     pagecolor=\"#ffffff\"     bordercolor=\"#666666\"     borderopacity=\"1.0\"     inkscape:pageopacity=\"0.0\"     inkscape:pageshadow=\"2\"     inkscape:zoom=\"4\"     inkscape:cx=\"14.379355\"     inkscape:cy=\"60.049799\"     inkscape:current-layer=\"layer1\"     showgrid=\"true\"     inkscape:window-width=\"1440\"     inkscape:window-height=\"776\"     inkscape:window-x=\"-84\"     inkscape:window-y=\"22\" />  <metadata     id=\"metadata4\">    <rdf:RDF>      <cc:Work         rdf:about=\"\">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />      </cc:Work>    </rdf:RDF>  </metadata>  <g     inkscape:label=\"Layer 1\"     inkscape:groupmode=\"layer\"     id=\"layer1\">    <rect       style=\"opacity:1;fill:#fafafa;fill-opacity:1;stroke:#000000;stroke-width:1.25095212000000000;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"       id=\"rect4374\"       width=\"3.036346\"       height=\"29.855259\"       x=\"26.456741\"       y=\"77.110023\" />    <path       sodipodi:type=\"arc\"       style=\"opacity:0;fill:#ffc100;fill-opacity:0.18999999;fill-rule:evenodd;stroke:#00d300;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:0.98500001\"       id=\"path2811\"       sodipodi:cx=\"36.681629\"       sodipodi:cy=\"40.457794\"       sodipodi:rx=\"22.848825\"       sodipodi:ry=\"23.466362\"       d=\"M 59.530455,40.457794 A 22.848825,23.466362 0 1 1 13.832804,40.457794 A 22.848825,23.466362 0 1 1 59.530455,40.457794 z\"       transform=\"translate(-10.077156,-13.286926)\" />    <path       sodipodi:type=\"star\"       style=\"fill:#ffffff\"       id=\"path2817\"       sodipodi:sides=\"5\"       sodipodi:cx=\"21.984276\"       sodipodi:cy=\"13.286215\"       sodipodi:r1=\"0.34933102\"       sodipodi:r2=\"0.17466551\"       sodipodi:arg1=\"-0.78539816\"       sodipodi:arg2=\"-0.15707963\"       inkscape:flatsided=\"false\"       inkscape:rounded=\"0\"       inkscape:randomized=\"0\"       d=\"M 22.23129,13.0392 L 22.156791,13.258891 L 22.295532,13.444808 L 22.063572,13.441843 L 21.929628,13.631245 L 21.860769,13.409722 L 21.639246,13.340862 L 21.828648,13.206918 L 21.825683,12.974959 L 22.0116,13.1137 L 22.23129,13.0392 z\"       transform=\"translate(-2.9137398,-0.9362086)\" />    <path       sodipodi:type=\"arc\"       style=\"fill:#fafafa;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.99893030000000005;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;opacity:1\"       id=\"path3847\"       sodipodi:cx=\"113.64216\"       sodipodi:cy=\"108.12209\"       sodipodi:rx=\"23.233507\"       sodipodi:ry=\"20.960665\"       d=\"M 136.87567,108.12209 A 23.233507,20.960665 0 1 1 90.408651,108.12209 A 23.233507,20.960665 0 1 1 136.87567,108.12209 z\"       transform=\"matrix(0.9778731,0,0,-1.0598112,-84.661617,141.94941)\" />    <path       style=\"fill:#dcdcdc;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       d=\"M 39.621219,21.031683 L 47.389849,26.975113 L 39.969679,33.117243 L 41.484209,27.164163 L 39.621219,21.031683 z\"       id=\"north\"       inkscape:label=\"north\"       sodipodi:nodetypes=\"ccccc\" />    <path       style=\"fill:#dcdcdc;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       d=\"M 20.231889,13.770245 L 26.175319,6.0016174 L 32.317449,13.421792 L 26.364359,11.907259 L 20.231889,13.770245 z\"       id=\"path3757\"       inkscape:label=\"north\"       sodipodi:nodetypes=\"ccccc\" />    <path       style=\"fill:#dcdcdc;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       d=\"M 20.048989,40.437803 L 25.992419,48.206433 L 32.134549,40.786253 L 26.181459,42.300793 L 20.048989,40.437803 z\"       id=\"path3761\"       inkscape:label=\"north\"       sodipodi:nodetypes=\"ccccc\" />    <path       style=\"fill:#dcdcdc;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       d=\"M 12.629649,33.160653 L 4.8610222,27.217223 L 12.281197,21.075093 L 10.766664,27.028173 L 12.629649,33.160653 z\"       id=\"path3765\"       inkscape:label=\"north\"       sodipodi:nodetypes=\"ccccc\" />    <path       sodipodi:type=\"arc\"       style=\"fill:#ff0000;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       id=\"path3849\"       sodipodi:cx=\"114.65231\"       sodipodi:cy=\"133.62845\"       sodipodi:rx=\"0\"       sodipodi:ry=\"2.5253813\"       d=\"M 114.65231,133.62845 A 0,2.5253813 0 1 1 114.65231,133.62845 A 0,2.5253813 0 1 1 114.65231,133.62845 z\" />    <path       sodipodi:type=\"arc\"       style=\"fill:#fafafa;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:3.29227274000000003;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;opacity:1\"       id=\"path4600\"       sodipodi:cx=\"113.64216\"       sodipodi:cy=\"108.12209\"       sodipodi:rx=\"23.233507\"       sodipodi:ry=\"20.960665\"       d=\"M 136.87567,108.12209 A 23.233507,20.960665 0 1 1 90.408651,108.12209 A 23.233507,20.960665 0 1 1 136.87567,108.12209 z\"       transform=\"matrix(0.3044572,0,0,-0.3133744,-6.349179,108.99488)\" />    <path       sodipodi:type=\"arc\"       style=\"fill:#fafafa;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:3.29227274000000003;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;opacity:1\"       id=\"path4602\"       sodipodi:cx=\"113.64216\"       sodipodi:cy=\"108.12209\"       sodipodi:rx=\"23.233507\"       sodipodi:ry=\"20.960665\"       d=\"M 136.87567,108.12209 A 23.233507,20.960665 0 1 1 90.408651,108.12209 A 23.233507,20.960665 0 1 1 136.87567,108.12209 z\"       transform=\"matrix(0.3044572,0,0,-0.3133744,-6.5991733,140.49488)\" />    <path       style=\"fill:#dcdcdc;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;fill-opacity:1\"       d=\"M 29.344931,79.34136 L 26.693281,79.164583 L 26.870057,76.336156 L 22.804193,76.159379 L 23.157747,73.330952 L 26.870057,73.507729 L 26.870057,70.856078 L 29.875261,71.032855 L 29.875261,73.684505 L 33.587572,74.038059 L 33.587572,76.512933 L 29.521708,76.336156 L 29.344931,79.34136 z\"       id=\"path3299\" />    <path       style=\"fill:#dcdcdc;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;fill-opacity:1\"       d=\"M 26.781669,107.80241 L 22.715805,107.62563 L 23.069359,104.79721 L 26.781669,104.97398 L 29.786873,105.15076 L 33.499184,105.50431 L 33.499184,107.97919 L 29.43332,107.80241 L 26.781669,107.80241 z\"       id=\"path3301\"       sodipodi:nodetypes=\"ccccccccc\" />  </g></svg>";
