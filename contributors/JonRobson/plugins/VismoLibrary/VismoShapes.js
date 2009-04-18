var VismoUtils = {
	userAgent: navigator.userAgent.toLowerCase(),
	clone: function(obj){

	    if(obj == null || typeof(obj) != 'object')

	        return obj;

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
/* 
Creates primitive shapes that can be rendered across most browsers
I am not very happy with the code that follows. It is not of the best standard and needs much improvement
coordinates are a string consisting of floats and move commands (M)
*/

var VismoShape = function(properties,coordinates){
	this.coordinates = {
		projected: false,
		normal: [],
		optimised: {},
		optimisedandprojected:{}
	};
	this.grid = {};
	this.width = 0;
	this.height =0;
	this.setProperties(properties);
	if(coordinates[0] && coordinates[0].length == 2){
		coordinates = VismoOptimisations.unpackCoordinates(coordinates);	
	}
	
	this._construct(properties,coordinates);
	this.browser =false;
	this.currentResolution = false;
};


VismoShape.prototype={
	getShape: function(){
		return this.getProperty("shape");
	}
	,setProperties: function(properties){
		this.properties = VismoUtils.clone(properties);
		if(!properties.stroke){
			this.setProperty("stroke",'#000000');		
		}
		if(properties.colour){
			this.setProperty("fill",properties.colour);
			delete properties.colour;
		}
		
	}
	,getBoundingBox: function(){ /* returns untransformed bounding box */
		return this.grid;
	}

	,render: function(canvas,transformation,projection,optimisations, browser,pointradius){
		var st = this.getShape();
		if(pointradius && st == 'point') this.setRadius(pointradius);
		if(this.getRenderMode(canvas) == 'ie'){
		        if(this.getProperty("hidden")) {this.vml.clear(); return;}
			this._ierender(canvas,transformation,projection,optimisations); 
		}
		else{	
		        if(this.getProperty("hidden")){return;}
			this._canvasrender(canvas,transformation,projection,optimisations);
		}
			
	}
	
	,setCoordinates: function(coordinates,type){
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
				else return opt[resolution];
			}		
			return this.coordinates.projected;
		}
		else{
			if(this.browser != 'ie' && resolution){
				var opt=this.coordinates.optimised;
				if(!opt[resolution]) opt[resolution] =  this._simplifyCoordinates(resolution,this.coordinates.normal);
				else return opt[resolution];
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
						//this has been taken from Google ExplorerCanvas
						if (!document.namespaces['vismoShapeVml_']) {
						        document.namespaces.add('vismoShapeVml_', 'urn:schemas-microsoft-com:vml');
						}

						  // Setup default CSS.  Only add one style sheet per document
						 if (!document.styleSheets['vismoShape']) {
						        var ss = document.createStyleSheet();
						        ss.owningElement.id = 'vismoShape';
						        ss.cssText = 'canvas{display:inline-block;overflow:hidden;' +
						            // default size is 300x150 in Gecko and Opera
						            'text-align:left;}' +
						            'vismoShapeVml_\\:*{behavior:url(#default#VML)}';
						}
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

	,optimise: function(canvas,transformation,projection){
		if(transformation && transformation.scale) this.currentResolution = Math.min(transformation.scale.x, transformation.scale.y);
		var shapetype = this.getProperty("shape");
		if(projection) this._applyProjection(projection,transformation);
		
		if(shapetype != 'point' && shapetype != 'path'){ //check if worth drawing				
			if(VismoOptimisations.vismoShapeIsTooSmall(this,transformation)) {
				if(this.vml){var el = this.vml.getVMLElement(); el.style.display = "none";}
				return false;	
			}
			if(!VismoOptimisations.vismoShapeIsInVisibleArea(this,canvas,transformation)){
				if(this.vml){var el = this.vml.getVMLElement(); el.style.display = "none";}
				return false;	
			}	
		}
		return true;
	}

	,_simplifyCoordinates: function(scaleFactor,coordinates){// **
		
		if(this.getProperty("shape") == 'path') return coordinates;
		/*will use http://www.jarno.demon.nl/polygon.htm#ref2 */
		if(!coordinates) throw "give me some coordinates!";
		var originals =coordinates;
		var tolerance = 5 / scaleFactor;
		coordinates = VismoOptimisations.packCoordinates(coordinates);
		coordinates = VismoOptimisations.douglasPeucker(coordinates,tolerance);
		
		coordinates = VismoOptimisations.unpackCoordinates(coordinates);	
		
		var diff = originals.length - coordinates.length;
		
		if(diff < 10) return originals;
		else 
		return coordinates;	
	}

	,_calculateBounds: function(coords){
		var st = this.getShape();
		if(st == 'path'){
			this.grid = {x1:0,x2:1,y1:0,y2:1};
			return;
		}
		else if(st == 'point' || st == 'circle' | st == 'image'){
				coords = this.getCoordinates();
				var x = coords[0]; var y = coords[1]; 
				var dim = this.getDimensions();
				var radiusw = dim.width / 2;
				var radiush = dim.height / 2;
				this.grid ={x1: x -radiusw ,x2: x + radiusw, y1: y - radiush, y2: y + radiush,center:{x:x,y:y},width: dim.width,height:dim.height};	
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
		this.grid.center = {};
		this.grid.center.x = (this.grid.x2 - this.grid.x1) / 2 + this.grid.x1;
		this.grid.center.y = (this.grid.y2 - this.grid.y1) / 2 + this.grid.y1;
	}

	,setRadius: function(r){
		this.setDimensions(r*2,r*2);
		this._calculateBounds();
	}
	,getRadius: function(){
		return this.width / 2;
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
			var radius;
			if(coordinates[2]) radius = coordinates[2]; else radius = 0.5;
			this.setCoordinates([coordinates[0],coordinates[1]]);
			this.setRadius(radius);
		}
		else if(shapetype == 'polygon' || shapetype == 'path')
		{
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

	,_canvasrender: function(canvas,transformation,projection,optimisations, pointsize){

		var c;
		var vismoShape = this;
		var shapetype =vismoShape.getProperty("shape");
			var ctx = canvas.getContext('2d');
			ctx.save();
			if(vismoShape.getProperty("lineWidth")){
				ctx.lineWidth = vismoShape.getProperty("lineWidth");
			}
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
			VismoCanvasRenderer.renderShape(ctx,vismoShape);
			
			if(!vismoShape.getProperty("hidden")) {
				ctx.strokeStyle = vismoShape.getProperty("stroke")
				if(typeof vismoShape.getProperty("fill") == 'string') 
					fill = vismoShape.getProperty("fill");
				else
					fill = "#ffffff";

				
				ctx.stroke();
				if(shapetype != 'path') {
					ctx.fillStyle = fill;
					ctx.fill();
				}
			}
			ctx.restore();
	}
	
	,_ierender: function(canvas,transformation,projection,optimisations,appendTo){
		if(this.vml){
			this.vml.clear();
			this.vml.style();
			this.vml._cssTransform(transformation,projection);
			return;
		}
		else{
			this.vml = new VismoVML(this,canvas);
			this.vml._cssTransform(transformation,projection);
			this.vml.render(canvas,appendTo);
		}	
	}

	,_applyProjection: function(projection,transformation){
	
		var c = this.getCoordinates('normal');
	
		if(!projection || !projection.xy) return c;
	
		if(projection.init) projection.init();
		var newc = [];
		for(var i=0; i < c.length-1; i+=2){
			var moved = false;
			if(c[i] == "M"){
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
					if(typeof newx == 'number' && typeof newy =='number'){
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



};