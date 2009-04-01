var EasyUtils = {
	userAgent: navigator.userAgent.toLowerCase(),
	clone: function(obj){

	    if(obj == null || typeof(obj) != 'object')

	        return obj;

	    var temp = new obj.constructor(); // changed (twice)

	    for(var key in obj){
	        temp[key] = EasyUtils.clone(obj[key]);
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

EasyUtils.browser= {
		isIE: EasyUtils.userAgent.indexOf("msie") != -1 && EasyUtils.userAgent.indexOf("opera") == -1,
		isGecko: EasyUtils.userAgent.indexOf("gecko") != -1,
		ieVersion: /MSIE (\d.\d)/i.exec(EasyUtils.userAgent), // config.browser.ieVersion[1], if it exists, will be the IE version string, eg "6.0"
		isSafari: EasyUtils.userAgent.indexOf("applewebkit") != -1,
		isBadSafari: !((new RegExp("[\u0150\u0170]","g")).test("\u0150")),
		firefoxDate: /gecko\/(\d{8})/i.exec(EasyUtils.userAgent), // config.browser.firefoxDate[1], if it exists, will be Firefox release date as "YYYYMMDD"
		isOpera: EasyUtils.userAgent.indexOf("opera") != -1,
		isLinux: EasyUtils.userAgent.indexOf("linux") != -1,
		isUnix: EasyUtils.userAgent.indexOf("x11") != -1,
		isMac: EasyUtils.userAgent.indexOf("mac") != -1,
		isWindows: EasyUtils.userAgent.indexOf("win") != -1
	};
/* 
Creates primitive shapes that can be rendered across most browsers
I am not very happy with the code that follows. It is not of the best standard and needs much improvement
coordinates are a string consisting of floats and move commands (M)
*/

var EasyShape = function(properties,coordinates){
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
		coordinates = EasyOptimisations.unpackCoordinates(coordinates);	
	}
	
	this._construct(properties,coordinates);
	this.browser =false;
	this.currentResolution = false;
};


EasyShape.prototype={
	getShape: function(){
		return this.getProperty("shape");
	}
	,setProperties: function(properties){
		this.properties = EasyUtils.clone(properties);
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
			this._ierender(canvas,transformation,projection,optimisations); 
		}
		else{	
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
						if (!document.namespaces['easyShapeVml_']) {
						        document.namespaces.add('easyShapeVml_', 'urn:schemas-microsoft-com:vml');
						}

						  // Setup default CSS.  Only add one style sheet per document
						 if (!document.styleSheets['easyShape']) {
						        var ss = document.createStyleSheet();
						        ss.owningElement.id = 'easyShape';
						        ss.cssText = 'canvas{display:inline-block;overflow:hidden;' +
						            // default size is 300x150 in Gecko and Opera
						            'text-align:left;}' +
						            'easyShapeVml_\\:*{behavior:url(#default#VML)}';
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
			if(EasyOptimisations.easyShapeIsTooSmall(this,transformation)) {
				if(this.vml){var el = this.vml.getVMLElement(); el.style.display = "none";}
				return false;	
			}
			if(!EasyOptimisations.easyShapeIsInVisibleArea(this,canvas,transformation)){
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
		coordinates = EasyOptimisations.packCoordinates(coordinates);
		coordinates = EasyOptimisations.douglasPeucker(coordinates,tolerance);
		
		coordinates = EasyOptimisations.unpackCoordinates(coordinates);	
		
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
			var easyShape = this;
			var w = easyShape.getProperty("width"); h=  easyShape.getProperty("height");
			if(coordinates.length > 2){
				w = coordinates[2]; h = coordinates[3];
			}
			image.onload = function(){
				if(!w && !h){
					w = easyShape.image.width;
					h = easyShape.image.height;
					easyShape.setDimensions(w,h);
					easyShape.setCoordinates([coordinates[0],coordinates[1]]);
				}
			};
	
			easyShape.setDimensions(w,h);
			easyShape.setCoordinates([coordinates[0],coordinates[1]]);	
			
		}
		else{
			console.log("don't know how to construct basic shape " + properties.shape);
		}			
		
	}	

	,_canvasrender: function(canvas,transformation,projection,optimisations, pointsize){

		var c;
		var easyShape = this;
		var shapetype =easyShape.getProperty("shape");
			var ctx = canvas.getContext('2d');
			ctx.save();
			if(easyShape.getProperty("lineWidth")){
				ctx.lineWidth = easyShape.getProperty("lineWidth")/ transformation.scale.x;
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
			EasyCanvasRenderer.renderShape(ctx,easyShape);
			
			if(!easyShape.getProperty("hidden")) {
				ctx.strokeStyle = easyShape.getProperty("stroke")
				if(typeof easyShape.getProperty("fill") == 'string') 
					fill = easyShape.getProperty("fill");
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
			this.vml = new EasyVML(this,canvas);
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
			
			var projectedCoordinate = projection.xy(c[i],c[i+1],transformation);
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
		this.setCoordinates(newc,"projected");
		this._calculateBounds(newc);
		return newc;
	}



};

var EasyCanvasRenderer = {
	renderShape: function(ctx,easyShape){
		var shapetype =easyShape.getProperty("shape");
		ctx.beginPath();
		
		if(shapetype == 'point' || shapetype =='circle'){
			this.renderPoint(ctx,easyShape);
		}
		else if(shapetype =='image'){
			this.renderImage(ctx,easyShape);
		}
		else{		
			this.renderPolygon(ctx,easyShape);	
		}
		ctx.closePath();
	}
	,renderPolygon: function(ctx,easyShape){
		var move = true;
		var c = easyShape.getCoordinates();
		for(var i=0; i < c.length-1; i+=2){
			if(c[i]=== "M") {
				i+= 1; 
				move=true;
			}
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);	
			
			if(move){
				ctx.moveTo(x,y);
				move = false;
			}
			else{
				ctx.lineTo(x,y);
			}			
				
				
		}
	}
	,renderPoint: function(ctx,easyShape){
		var bb =easyShape.getBoundingBox();
		ctx.arc(bb.center.x, bb.center.y, easyShape.getRadius(), 0, Math.PI*2,true);
	}
	,renderImage: function(ctx,easyShape){
		var c = easyShape.getCoordinates();
		var bb = easyShape.getBoundingBox();
		ctx.drawImage(easyShape.image,bb.center.x,bb.center.y,bb.width,bb.height);
	

	}
}
var EasyVML = function(easyShape,canvas){
	this._iemultiplier = 1000; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..
	this.easyShape=  easyShape;
	var shapetype =easyShape.getShape();

	if(shapetype == 'point' || shapetype == 'circle'){
		this._initArc(easyShape,canvas);
	}
	else if(shapetype == 'image'){
		this._initImage(easyShape,canvas);
	}
	else{
		this._initPoly(easyShape,canvas);
	}
	var xspace = parseInt(canvas.width);
	xspace *=this._iemultiplier;
	var yspace =parseInt(canvas.height);
	yspace *= this._iemultiplier;
	coordsize = xspace +"," + yspace;
	this.el.coordsize = coordsize;
	this.el.easyShape = this.easyShape;
	var nclass= "easyShape";			
	if(shapetype == 'path') nclass= "easyShapePath";
	this.el.setAttribute("class", nclass);
	this.style();
				
		
			
};

EasyVML.prototype = {
	_initImage: function(easyShape,canvas){
		var shape = document.createElement("img");
		this.el = shape;
		shape.src = easyShape.getProperty("src");
		var dim = easyShape.getDimensions();

		jQuery(this.el).css({"height": dim.height, "width": dim.width,"position":"absolute","z-index":4});		
	}
	,_initArc: function(easyShape,canvas){
		var shape = document.createElement("easyShapeVml_:arc");
		shape.startAngle = 0;
		shape.endAngle = 360;
		var radius =  easyShape.getRadius();
		this.el = shape;	
		jQuery(this.el).css({"height": radius, "width": radius,"position":"absolute","z-index":4});			
	}
	,_initPoly: function(easyShape,canvas){
		var shape = document.createElement("easyShapeVml_:shape");
		this.el = shape;
		this.el.setAttribute("name",easyShape.getProperty("name"));
		jQuery(this.el).css({"height": canvas.style.height,"width": canvas.style.width,"position":"absolute","z-index":1});
	
	}
	,getVMLElement: function(){
		return this.el;
	}
	,_createvmlpathstring: function(transformation,projection){ //mr bottleneck
		var vml = this.el;
		var o = transformation.origin;
		var t = transformation.translate;
		var s = transformation.scale;
		var path;
		
		var buffer = [];
		var c =this.easyShape.getCoordinates();
	
		if(projection){
			c = this.easyShape._applyProjection(projection,transformation);
		}
		
		if(c.length < 2) return;
		

		var x,y;
		x = c[0];
		y =c[1];		
		x *=this._iemultiplier;
		y *= this._iemultiplier;
		x = parseInt(x);
		y = parseInt(y);

		//path = "M";
		buffer.push("M");
		//path+= x + "," +y + " L";
		buffer.push([x,",",y," L"].join(""))
		var lineTo = true;
		for(var i =2; i < c.length; i+=2){
			if(c[i] == 'M') {
				//path += " M";
				buffer.push(" M");
				lineTo = false;
				i+=1;
			}
			else if(!lineTo) {
				//path += " L";
				buffer.push(" L");
				lineTo = true;
			}
			else if(lineTo){
				//path += " ";
				buffer.push(" ");
			}
			var x =c[i];
			var y =c[i+1];
			x *= this._iemultiplier;
			y *= this._iemultiplier;
			x = parseInt(x);
			y = parseInt(y);
			buffer.push([x,",",y].join(""));
			//path += x +"," + y;
			
			//if(i < c.length - 2) path += "";
		}
		//path += " XE";	
		buffer.push(" XE");
		//console.log(buffer.join(""));

	path = buffer.join("");
	//if(path != vml.getAttribute("path")){
		
		vml.setAttribute("path", path);	
//	}
	
	}

	,_transformDomElement: function(transformation,projection){
	
		var o = transformation.origin, t = transformation.translate,s = transformation.scale;
		var top,left,width,height;

		var bb = this.easyShape.getBoundingBox();
	
		var top = o.y + ((bb.center.y + t.y) * s.y);
		var left = o.x + ((bb.center.x + t.x) * s.x);
		width = bb.width * s.x;
		height = bb.height * s.y;
		jQuery(this.el).css({'top':top, 'left': left, 'width':width,'height': height});
	}
	,_cssTransform: function(transformation,projection){
		
		var vml = this.el;
		var d1,d2,t;
		if(vml.tagName == 'arc' || vml.tagName == 'IMG'){
			this._transformDomElement(transformation,projection);
			return;
		}
		if(vml.tagName == 'shape' && (!vml.path || this.easyShape.getShape() =='point')) {
			//causes slow down..
			this._createvmlpathstring(transformation,projection);	
		}
		var o = transformation.origin, t = transformation.translate,s = transformation.scale;
		
		if(!this.initialStyle) {
			var initTop = parseInt(vml.style.top);
			if(!initTop) initTop = 0;
			var initLeft = parseInt(vml.style.left);
			if(!initLeft) initLeft = 0;
			var w =parseInt(vml.style.width);
			var h = parseInt(vml.style.height)
			this.initialStyle = {top: initTop, left: initLeft, width: w, height: h};
		}
		var scalingRequired = true;
		var translatingRequired = true;
		if(this._lastTransformation){
			if(s.x == this._lastTransformation.scale.x && s.y == this._lastTransformation.scale.y){			
				scalingRequired = false;
			}

		}
		var initialStyle= this.initialStyle;
		var style = this.el.style;			
		var newtop,newleft;
		newtop = initialStyle.top;
		newleft = initialStyle.left;

		newleft += o.x;
		newtop += o.y;
		//scale
		if(scalingRequired){
			var newwidth = initialStyle.width * s.x;
			var newheight = initialStyle.height * s.y; 	
		}
		var temp,left,top;
		newleft += ((t.x) * s.x);
		newtop += ((t.y) * s.y);						
		left = newleft +"px";
		top = newtop +"px";
		

		if(scalingRequired){
			width = newwidth +"px";
			height = newheight + "px";
		}
		
		jQuery(this.el).css({'left': left, 'top': top, 'width': width, 'height': height});
		
		if(transformation.rotate && transformation.rotate.x)style.rotation = EasyMapUtils._radToDeg(transformation.rotate.x);
		this._lastTransformation = {scale:{}};
		this._lastTransformation.scale.x = s.x;
		this._lastTransformation.scale.y = s.y;
	}
	,clear: function(){
			var el = this.getVMLElement();
			if(el) el.style.display = '';
	}
	,render: function(canvas,appendTo){
		
			var shape = this.getVMLElement();
			shape.style.display = "";
			if(!appendTo){
				appendTo = canvas;
			}
			appendTo.appendChild(shape);
	}
	,style: function(){

		var shapetype = this.easyShape.getShape();

		var shape = this.el;
		shape.stroked = "t";
		shape.strokecolor = "#000000";
		if(this.easyShape.getProperty("lineWidth")) {
			shape.strokeweight = this.easyShape.getProperty("lineWidth") + "px";
		}
		else {
			shape.strokeweight = "1px";
		}
		
		if(!this.easyShape.getProperty("fill") || shapetype == 'path'){
					return
		}
				var fill = this.easyShape.getProperty("fill");

				shape.filled = "t";
					
				if(!this.vmlfill){
					this.vmlfill =document.createElement("easyShapeVml_:fill");
					shape.appendChild(this.vmlfill); 
				}	
				//look for rgba fill for transparency
				if(fill.indexOf("rgba") != -1 &&fill.match(/rgba\([0-9]*,[0-9]*,[0-9]*,(.*)\)/)){
					
					var match =fill.match(/(rgb)a(\([0-9]*,[0-9]*,[0-9]*),(.*)\)/);
					
					if(match[3]){
						fill = match[1] + match[2] +")";
						this.vmlfill.opacity = match[3];
					}
				}
				this.vmlfill.color = fill;	
		
	}

};
