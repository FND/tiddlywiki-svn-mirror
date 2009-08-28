window.onbeforeunload =function(){
    try{
        VismoUtils.scrubNodes(window.documentElement);
        
        if (window.CollectGarbage) {
    	    window.CollectGarbage();
        }
    }
    catch(e){
        //get over it
    }
};

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
    randomColor: function(alpha){
       var r = parseInt(Math.random() * 255);
       var g = parseInt(Math.random() * 255);
       var b = parseInt(Math.random() * 255);
       var a;
       if(alpha) var a = parseInt(Math.random() * 255);
       else a = 1;
       return "rgba("+r+","+g+","+b+","+a+")";
    }
    ,_isCoordinate: function(c){
        if(c == "M" || c == "q" || c== 'c') return false;
        else {
            if(typeof(c)== 'number') return true;
        }
    }
    
    ,toHex: function(rgba){
        if(rgba.indexOf("rgba") == 0){
            rgba = rgba.replace("rgba(","");
            rgba = rgba.replace(")","");
        }
        else if(rgba.indexOf("rgb")==0){
             rgba = rgba.replace("rgb(","");
        }
        
        rgba = rgba.replace(")","");
        rgba = rgba.split(",");
        return "#"+this._tohexadecimal(rgba[0])+this._tohexadecimal(rgba[1]) +this._tohexadecimal(rgba[2]);
    }
    ,_tohexadecimal: function(N){
        if (N==null) return "00";
        N=parseInt(N); if (N==0 || isNaN(N)) return "00";
        N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
        return "0123456789ABCDEF".charAt((N-N%16)/16)
             + "0123456789ABCDEF".charAt(N%16);
        
    }
    ,opacityFrom: function(rgba){
 
        var rgbcode = rgba.replace("rgba(","");
	    rgbcode = rgbcode.replace(")","");
	    rgbcode = rgbcode.split(",");
	    var opvalue = 0;
	    if(rgbcode.length < 4) opvalue = 1;
	    else opvalue =rgbcode[3];
	    
	    return opvalue;
    }
    ,toRgb: function(hex_rgba,opacity){
        var rgb = {};
        if(hex_rgba.indexOf("#") == 0 && hex_rgba.indexOf(",") == -1){ //hex code argument
            var hex = hex_rgba;
			var hexcode = hex.substring(1);
			rgb.red = this._hexToR(hexcode);
			rgb.blue = this._hexToB(hexcode);
			rgb.green = this._hexToG(hexcode);
		}
		else if(hex_rgba.indexOf("rgba") != -1){
		    var rgbcode = hex_rgba.replace("rgba(","");
		    rgbcode = rgbcode.replace(")","");
		    rgbcode = rgbcode.split(",");
		    rgb.red =rgbcode[0];
		    rgb.green =rgbcode[1];
		    rgb.blue =rgbcode[2];
		    opacity = rgbcode[3];
		}
		return {rgb:"rgb("+rgb.red+","+ rgb.green +","+ rgb.blue+")",opacity:opacity};
	}    
    ,toRgba: function(hex,opacity){
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

        if(!obj) return obj;
        if(obj.appendChild) return obj;
	    if(obj == null || typeof(obj) != 'object')return obj;

	    var temp = new obj.constructor(); // changed (twice)

	    for(var key in obj){
	        //console.log(key);
	        temp[key] = VismoUtils.clone(obj[key]);
	        //console.log(temp[key])
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
	},
	scrubNode: function(e)
    {
    	if(!VismoUtils.browser.isIE)
    		return;
    	var att = e.attributes;
    	if(att) {
    		for(var t=0; t<att.length; t++) {
    			var n = att[t].name;
    			if(n !== "style" && (typeof e[n] === "function" || (typeof e[n] === "object" && e[n] != null))) {
    				try {
    					e[n] = null;
    				} catch(ex) {
    				}
    			}
    		}
    	}
    	var c = e.firstChild;
    	while(c) {
    		 VismoUtils.scrubNode(c);
    		c = c.nextSibling;
    	}
    }
    
    ,mergejsons: function(prop1,prop2){
	    
	    var res = {};
	    var i;
	    for(i in prop1){
	        res[i] = prop1[i];
	    }
	    for(i in prop2){
	        res[i] = prop1[i];
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

if(VismoUtils.browser.isIE && VismoUtils.browser.ieVersion[1] == "6.0"){
VismoUtils.browser.isIE6 = true;

}

if(VismoUtils.browser.isIE){
	if (!document.namespaces['vismoShapeVml_']) {
	        document.namespaces.add('vismoShapeVml_', 'urn:schemas-microsoft-com:vml'/*,"#default#VML"*/);
	        
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
	            'vismoShapeVml_\\: * {behavior:url(#default#VML);}';
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
    this._isVismoShape = true;
    this.options = {pointsize:5};
    if(!coordinates) {
        coordinates = properties.coordinates;
        delete properties["coordinates"];
    }
    this._optimise_cache = {};
    
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
	this.vml = false;
	this.unique_id = Math.random() + "_" + this.properties.id;
    this.scale = {x:1,y:1};
};



VismoShape.prototype={
    isCommand: function(i){
        if(i == 'M' || i =='b'){
            return true;
        }
        else{
            return false;
        }
    }
    ,clone: function(){
                var coords = this.getCoordinates("normal");
                var props = this.getProperties();
                var p = VismoUtils.clone(props);
                p.coordinates = coords;
                try{
                    //console.log(p);
                    return new VismoShape(p);
                }
                catch(e){
                    throw e;
                }
    }
    ,translate: function(x,y){
  	    var c = this.getCoordinates("normal");

  	    var newc = [];
  	    for(var i=0; i < c.length; i+=2){
  	         if(this.isCommand(c[i])) i+=1;
  	         var newx,newy;

  	        newx = c[i] + x;
  	        newy = c[i+1] + y;
  	        newc.push(newx);
  	        newc.push(newy);
  	    }

  	    this.setCoordinates(newc);
      }

  	,scale: function(x,y){
  	    this._scale.x = x;
  	    this._scale.y = y;
  	    var c = this.getCoordinates("normal");

  	    var newc = [];
  	    for(var i=0; i < c.length; i+=2){
  	        if(this.isCommand(c[i])) i+=1;
  	        var newx,newy;

  	        newx = c[i] * x;
  	        newy = c[i+1] * y;
  	        newc.push(newx);
  	        newc.push(newy);
  	    }

  	    this.setCoordinates(newc);
  	    return true;
  	}
	,resize: function(x,y){
	    var bb = this.getBoundingBox();
	    var newWidth = x *bb.width;
	    var newHeight = y * bb.height;
	    var offsetx = (bb.center.x * x) - bb.center.x;
	    var offsety = (bb.center.y * y)- bb.center.y;
	    this.scale.x = x;
	    this.scale.y = y;
	    var c = this.getCoordinates("normal");

	    var newc = [];
	    for(var i=0; i < c.length; i+=2){
	        var newx,newy;
	        
	        newx = c[i] * x;
	        newy = c[i+1] * y;
	        newx -= offsetx;
	        newy -= offsety;
	        newc.push(newx);
	        newc.push(newy);
	    }
	  
	    this.setCoordinates(newc);
	    return true;
	}
	,moveTo: function(x,y){
	    var st = this.properties.shape;
	    var dim = this.getDimensions();
	 
	    if(st == "point" || st == 'circle'){
	        this.setCoordinates([x,y,dim.width/2, dim.height/2]);
	    }
	    else if(st == 'polygon' ||st == 'path'){
	        var bb = this.getBoundingBox();
	        var movex = x - bb.center.x;
	        var movey = y - bb.center.y;
	        
	        var c = this.getCoordinates("normal");
	        var newc = [];
	        for(var i=0; i < c.length; i+=2){
	            if(this.isCommand(c[i])) i +=1;
	            newc.push(c[i]+movex);
	            newc.push(c[i+1]+movey);
	        }
	        this.setCoordinates(newc);
	    }
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
		if(!newprops["z-index"]){
		    this.setProperty("z-index","0");
		}
		if(!newprops.stroke){
			this.setProperty("stroke",'#000000');		
		}
		
	}
	,getBoundingBox: function(){ /* returns untransformed bounding box */
	    return this.grid;
	}
	,setPointSize: function(pointsize){
	    VismoTimer.start("VismoShape.setPointSize");
	    var st = this.properties.shape;
	    if(st != "point") return;
	    if(pointsize) {
		    this.options.pointsize = pointsize;
		    var bb= this.getBoundingBox();
		    this.setCoordinates([bb.center.x,bb.center.y,pointsize/2,pointsize/2]);
		}
		VismoTimer.end("VismoShape.setPointSize");
	}
	,render: function(canvas,transformation,projection,optimisations, browser,pointsize){
	    VismoTimer.start("VismoShape.render");
        this.setPointSize(pointsize); 
		var mode = this.getRenderMode(canvas);
		if(mode == 'ie'){
		     this.render_ie(canvas,transformation,projection,optimisations, browser);    
		}
		else{	
	        this.render_canvas(canvas,transformation,projection,optimisations, browser);
	        //this.render = this.render_canvas;
		}
		 VismoTimer.end("VismoShape.render");	
	}
	,render_ie: function(canvas,transformation,projection,optimisations, browser){
	    
	    VismoTimer.start("VismoShape.render_ie");
	    if(this.properties.hidden){
		        if(this.vml)this.vml.clear();
		        return;
		}
	    if(this.vml===false){ //not created
            this.vml = new VismoVector(this,canvas);
            this.donevml = true;
            
        }
        
           

		this.vml.render(canvas,transformation,projection);
        VismoTimer.end("VismoShape.render_ie");
        return;
	}
	,render_canvas: function(canvas,transformation,projection,optimisations, browser){
		VismoTimer.start("VismoShape.render_canvas");
		var c;
		if(this.properties.hidden) {
		    return;
    	}
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
		VismoTimer.end("VismoShape.render_canvas");
	}
	,getTransformation: function(){
	    var transform= this.getProperty("transformation");
	   
	    if(!transform) transform = {translate:false,scale:false};
   		if(!transform.translate)transform.translate = {x:0,y:0};
   		if(!transform.translate.x)transform.translate.x = 0;
   		if(!transform.translate.y)transform.translate.y = 0;
   		if(!transform.scale)transform.scale= {x:1,y:1};
   		if(!transform.scale.x)transform.scale.x = 1;
   		if(!transform.scale.y)transform.scale.y = 1;
	       
	       return transform;
	}
	
    ,setTransformation: function(transformation){
	    this.setProperty("transformation",transformation);
	    this._calculateBounds();
	}
	,setCoordinates: function(coordinates,type){
	    if(this.properties.shape == 'circle' || this.properties.shape == 'point'){
	        if(coordinates.length == 2 && this.coordinates.normal){
	            coordinates.push(this.coordinates.normal[2]);
	            coordinates.push(this.coordinates.normal[3]);
	        }
	    }	        
        var good = [];
        for(var i=0; i < coordinates.length; i++){
            if(coordinates[i] +"" !='NaN')
            {good.push(coordinates[i]);}
        }
     
        if(good.length < 2) {
                throw "cannot set coordinates for VismoShape not enough good coordinates given (coordinates may contain non-number elements)" + coordinates.toString();
        }
        coordinates = good;
                
                
		if(type == 'projected'){ 
		    this.coordinates.projected = coordinates;return;}
		
		this.coordinates.normal = coordinates;
	
		if(this.vml)this.vml.coordinatesHaveChanged();
		this.coordinates.projected= false;
		var i;
		for(i in this.coordinates_optimised){
			delete this.coordinates_optimised[i];
		}
		var j;
		for(j in this.coordinates.optimisedandprojected){
			delete this.coordinates.optimisedandprojected[j];
		}		
		this.grid = {}; //an enclosing grid
		
		if(this.vml) this.vml.path = false; //reset path so recalculation will occur
		var st = this.getShape();
		if(st== 'circle' || st == 'point'){
		    
		    if(coordinates[2] && coordinates[3]) this.setRadius(coordinates[2],coordinates[3]);
		    else this.setDimensions(this.options.pointsize,this.options.pointsize);
		}
		this._calculateBounds();

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
	    VismoTimer.start("VismoShape.getRenderMode");
	    if(!this.browser){
		    if(!canvas.getContext) {				
		                this.browser = "ie";
			}
				
			else 	this.browser = "good";
		}
		VismoTimer.end("VismoShape.getRenderMode");
		return this.browser;
	}
	
	,setProperty: function(name,value){
		this.properties[name] = value;
		 //console.log("Reset",name,this);
		 if(this.vml) {
		    this.vml.nochange = false;
	       
	    }
	}
	,getProperty: function(name){
		return this.properties[name];
	}

	,_calculateBounds: function(coords){
	    VismoTimer.start("VismoShapes._calculateBounds");
	    var that = this;
		var st = this.getShape();
		var transform = this.getTransformation();

        
		if(st == 'path'){
			this.grid = {x1:0,x2:1,y1:0,y2:1,center:{x:0,y:0}};
			return;
		}
		else if(st == 'point' || st == 'circle' | st == 'image' | st == 'domElement'){
				var coords = this.getCoordinates("normal").clone();
				var x = coords[0]; var y = coords[1]; 
				var dim = this.getDimensions();
				this.grid.center = {};
				this.grid.center.x = x;
				this.grid.center.y = y;
				
				if(transform){
				        if(transform.translate){
				                var tran_x = transform.translate.x;
				                var tran_y =  transform.translate.y;
				                
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
		
		//this.grid.x2 *= transform.scale.x;
		//this.grid.y2 *= transform.scale.y;
		this.grid.width = (this.grid.x2 - this.grid.x1);
		this.grid.height = (this.grid.y2 - this.grid.y1);
		/*var transform = this.getTransformation();
		if(transform && transform.scale){
		        var scale = transform.scale;
		        this.grid.width *= scale.x;
		        this.grid.height *= scale.y;
		        
		}*/
		this.grid.center = {};
		this.grid.center.x = (this.grid.x2 - this.grid.x1) / 2 + this.grid.x1;
		this.grid.center.y = (this.grid.y2 - this.grid.y1) / 2 + this.grid.y1;
		
		//recalculate based on scaling
		this.grid.width *= transform.scale.x;
		this.grid.height *= transform.scale.y;
		this.grid.center.x += transform.translate.x;
		this.grid.center.y += transform.translate.y;
		
		var halfw = this.grid.width / 2;
		var halfh = this.grid.height /2;
		this.grid.x1 = this.grid.center.x - halfw;
		this.grid.x2 = this.grid.center.x + halfw;
		this.grid.y1 = this.grid.center.y - halfh;
		this.grid.y2 = this.grid.center.y + halfh;
		
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
		
		VismoTimer.end("VismoShapes._calculateBounds");
		//if(st == 'path') console.log(this,this.grid);
	}

    ,getCanvas: function(){
        return this.vismoCanvas;
    }
	,setRadius: function(rx,ry){
	    if(!ry) ry = rx;
		this.setDimensions(rx*2,ry*2);
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
		if(this.properties.shape == 'point'){
		    this.options.pointsize = width;
		}
		this._calculateBounds();
	    
	}
	,getDimensions: function(){
		return {width: this.width, height: this.height};
	}
	
	,_construct: function(properties, coordinates){
	    VismoTimer.start("VismoShapes._construct");
		var shapetype =properties.shape; 
		if(!shapetype) shapetype = 'polygon';
		if(shapetype == 'point' || shapetype == 'circle'){
			var radiusw,radiush;
			if(coordinates[2]) radiusw = coordinates[2];
			else radiusw = this.options.pointsize/2;
			
			if(coordinates[3]) radiush= coordinates[3];
			else radiush = radiusw;
			
			this.setDimensions(radiusw*2,radiush*2);
			this.setCoordinates([coordinates[0],coordinates[1],radiusw,radiush]);
			
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
		VismoTimer.end("VismoShapes._construct");	
		
	}	

	,_applyProjection: function(projection,transformation){
	    VismoTimer.start("VismoShapes._applyProjection");
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
		VismoTimer.end("VismoShapes._applyProjection");
		return newc;
	}


	
	,optimise: function(canvas,transformation,projection,justcompute){
	    VismoTimer.start("VismoShapes.optimise");
	    var ocache = this._optimise_cache;

	    
	    var cid = transformation["cache"]["id1"];
	    var cid2 =transformation["cache"]["id2"];
	    
	    if(this.scale.x > 1){
	        var newx,newy;
	        newx = this.scale.x  * transformation.scale.x;
	        newy = this.scale.y  * transformation.scale.y;
	        cid = newx + ","+newy;
	    }
	    if(!ocache[cid]) ocache[cid] = {};
	    
        if(typeof(ocache[cid][cid2]) != "undefined"){
	        return ocache[cid][cid2];
        }
	    
	    var shapetype = this.properties.shape;
	    if(shapetype == "path") {
	        ocache[cid][cid2] = true;
	        VismoTimer.end("VismoShapes.optimise");
	        return true;
		}
		if(transformation && transformation.scale) {
		    this.currentResolution = Math.min(transformation.scale.x, transformation.scale.y);
		}
		if(projection) {this._applyProjection(projection,transformation);}
		
		if(shapetype != 'point' && shapetype != 'path' && shapetype !="domElement"){ //check if worth drawing				
			if(VismoOptimisations.vismoShapeIsTooSmall(this,transformation)) {
				if(!justcompute && this.vml)this.vml.clear();
				ocache[cid][cid2] = false;
				VismoTimer.end("VismoShapes.optimise");
				return false;	
			}	
		}
		
		if(!VismoOptimisations.vismoShapeIsInVisibleArea(this,canvas,transformation)){
			if(!justcompute && this.vml)this.vml.clear();
			ocache[cid][cid2] = false;
			VismoTimer.end("VismoShapes.optimise");
			return false;	
		}
		ocache[cid][cid2] = true;
		VismoTimer.end("VismoShapes.optimise");
		return true;
	}
	,optimise_ie: function(canvas,transformation,projection){	
	    VismoTimer.start("VismoShape.optimise_ie");
	    var ocache = this._optimise_cache;
	    var cid = transformation["cache"]["id1"];
        if(typeof(ocache[cid]) != "undefined"){
	        return ocache[cid];
        }
        VismoOptimisations.minradius = 6;
	    var sh = this.properties.shape;
		if(sh == 'path' || sh == 'point') {
		        ocache[cid] =true;
               return true;
        }
        
		if(VismoOptimisations.vismoShapeIsTooSmall(this,transformation)) {
				if(this.vml)this.vml.clear();
                VismoTimer.end("VismoShape.optimise_ie");
				ocache[cid] =false;
				return false;		
		}
        ocache[cid] =true;
        VismoTimer.end("VismoShape.optimise_ie");
		return true;
	}
	
	,_simplifyCoordinates: function(scaleFactor,coordinates){// **
		VismoTimer.start("VismoShapes._simplifyCoordinates");
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
		
		VismoTimer.end("VismoShapes._simplifyCoordinates");
		if(diff < 10) return originals;
		else 
		return coordinates;	
	}


};