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
	var x = new EasyClickableCanvas(newel,[new EasyShape(imgproperties,[-width/2,-height/2])]);
	var c = new EasyController(x,newel);
	x.render();
	}
});

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
/*
EasyClicking adds the ability to associate a dom element with a collection of EasyShapes using addToMemory function
The getShapeAtClick function allows click detection on this dom element when used in a dom mouse event handler
*/

// Depends on JQuery for offset function
// Get the current horizontal page scroll position
function findScrollX()
{
	return window.scrollX || document.documentElement.scrollLeft;
}
// Get the current vertical page scroll position
function findScrollY()
{
	return window.scrollY || document.documentElement.scrollTop;
}

/*Turn a dom element into one where you can find EasyShapes based on clicks */
/*
Following to be renamed as EasyClickableCanvas
*/
var EasyClickableCanvas = function(element,easyShapesList){
	if(typeof element == 'string') element= document.getElementById(element);
	if(!element) throw "Element doesn't exist!";
	if(element.easyClicking) {
		var update = element.easyClicking;
		return update;
	}
	var wrapper = element;
	var canvas = document.createElement('canvas');
	
	
		canvas.width = parseInt(wrapper.style.width);
		canvas.height = parseInt(wrapper.style.height);
	if(!element.className)element.className = "EasyClickableCanvas";
	jQuery(canvas).css({width:wrapper.style.width, height:wrapper.style.height,'z-index':1,position:'absolute'});
	element.appendChild(canvas);
	this.canvas = canvas;
	this.settings = {};
	this.settings.browser = !EasyUtils.browser.isIE ? 'good' : 'ie'
	this.settings.globalAlpha = 1;
	this.memory = [];
	element.easyClicking = this;

	if(easyShapesList) {
		for(var i=0; i < easyShapesList.length; i++){
			this.add(easyShapesList[i]);
		}
	}
	this.wrapper = wrapper;
	this._setupMouse();
};

EasyClickableCanvas.prototype = {
	getXY: function(e){
		return EasyTransformations.getXY(e,this.getTransformation());
	}
	,setOnMouse: function(down,up,move,dblclick){
		if(down)this.onmousedown = down;
		if(up)this.onmouseup = up;
		if(move)this.onmousemove=  move;
		if(dblclick) this.ondblclick = dblclick;
	}
	,_setupMouse: function(){
		var that = this;
		var newbehaviour = function(e){
				var t = EasyClickingUtils.resolveTargetWithEasyClicking(e);
				if(t.getAttribute("class") == 'easyControl') return false;
				var shape = that.getShapeAtClick(e);
				return shape;
			
		};
		this.onmousedown = function(e,s,pos){};
		this.onmouseup = function(e,s,pos){};
		this.onmousemove = function(e,s,pos){};
		this.ondblclick = function(e,s,pos){};
		var down = this.wrapper.onmousedown;
		var up = this.wrapper.onmouseup;
		var mv = this.wrapper.onmousemove;
		var dblclick = this.wrapper.ondblclick;
		var that = this;
		
		this.wrapper.onmousedown = function(e){ 
			var s = newbehaviour(e); 
			//var pos = EasyTransformations.getXY(e,that.getTransformation());
			if(down)down(e,s);
			if(s && s.getProperty("onmousedown"))s.getProperty("onmousedown")(e,s);		
			else that.onmousedown(e,s);
		}

		this.wrapper.ondblclick = function(e){var s = newbehaviour(e); if(dblclick)dbclick(e,s);if(s && s.getProperty("ondblclick"))s.getProperty("ondblclick")(e,s);else that.ondblclick(e,s);};
		this.wrapper.onmouseup = function(e){ var s = newbehaviour(e); if(up)up(e,s);	if(s && s.getProperty("onmouseup"))s.getProperty("onmouseup")(e,s);else that.onmouseup(e,s);}
		
		this.wrapper.onmousemove = function(e){ var s = newbehaviour(e); if(mv)mv(e,s); if(s && s.getProperty("onmousemove"))s.getProperty("onmousemove")(e,s);else that.onmousemove(e,s);}
	}
	,resize: function(width,height){
		if(this.canvas.getAttribute("width")){
			this.canvas.width = width;
			this.canvas.height = height;
		}
		this.canvas.style.height = height+"px";
		this.canvas.style.width = width +"px";
	}
	,setTransparency: function(alpha){	
		this.settings.globalAlpha = alpha
	}
	,_setupCanvasEnvironment: function(){
		if(EasyUtils.browser.isIE) return;
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
	
		//var f = function(){
		var ps = 5 / parseFloat(transformation.scale.x);
		var smallest = 1 / this._iemultiplier;
		var largest = 2.5 * transformation.scale.x;
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
				
				 for(var i=0; i < mem.length; i++){
				 	if(mem[i].optimise(that.canvas,transformation,projection)){
						mem[i].render(that.canvas,tran,projection,true,that.settings.browser,ps);
					
						if(mem[i].vmlfill && that.settings.globalAlpha) {
							mem[i].vmlfill.opacity =that.settings.globalAlpha;
						}
					}
				
				}
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
		//this.transformation = EasyTransformation.getBlankTransformation(this.canvas);
		}
		return this.transformation;
	}
	
	,setTransformation: function(transformation){
		if(transformation) this.transformation = transformation;	
	}
	,add: function(easyShape){
		if(!this.memory) this.memory = [];
		easyShape._easyClickingID = this.memory.length;
		this.memory.push(easyShape);
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
		return this.memory;
	}
	,getMemoryID: function(easyShape){
		if(easyShape && easyShape._easyClickingID)
			return easyShape._easyClickingID;
		else{
			return false;
		}
	}
	,getShapeAtClick: function(e){
		if(!e) {
			e = window.event;
		}
		
		var node = EasyClickingUtils.resolveTarget(e);
		//alert(node.tagName);
		if(node.tagName.toUpperCase() == 'SHAPE') { //vml easyShape
			return node.easyShape;
		}
		var target = EasyClickingUtils.resolveTargetWithEasyClicking(e);
	
		if(!target) return;
		var offset = jQuery(target).offset();

		x = e.clientX + window.findScrollX() - offset.left;
		y = e.clientY + window.findScrollY() - offset.top;

		if(this.memory.length > 0){
			var shape = false;
			if(target.easyClicking){
			shape = target.easyClicking.getShapeAtPosition(x,y);
			}
			return shape;
		} else{
			//console.log("no shapes in memory");
			//return false;
		}
	},
	getShapeAtPosition: function(x,y) {
		var shapes = this.memory;
		if(this.transformation){
			var pos =  EasyClickingUtils.undotransformation(x,y,this.transformation);
			x = pos.x;
			y = pos.y;
		
		}
		var hitShapes = [];
	
		for(var i=0; i < shapes.length; i++){
			var shape = shapes[i];
			var st = shape.getShape();
				var g = shape.getBoundingBox();
				if(x >= g.x1 && x <= g.x2 && y >=  g.y1 && y <=g.y2){
					hitShapes.push(shapes[i]);
				}

		}
		var res = this._findNeedleInHaystack(x,y,hitShapes);
	
	
		// var shapesInsideBox = _findShapesInsideBoundingBox(shapes, ..) TODO RENAME
		// var points = _findPointsInsideShapes(..)
		
		return res;
	},
	_findNeedleInHaystack: function(x,y,shapes){
		var hits = [];
		for(var i=0; i < shapes.length; i++){
			var st = shapes[i].getShape();
			var itsahit = false;
			if(st == 'polygon'){
				itsahit = this._inPoly(x,y,shapes[i]);
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
		
			var g = hits[0].grid;
			var min = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
		
			var closerEdge = {id:0, closeness:min};
			for(var i=1; i < hits.length; i++){
				g = hits[i].grid;
			var min = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
			
				if(closerEdge.closeness > min) {
					closerEdge.id = i; closerEdge.closeness = min;
				}
				return hits[closerEdge.id];
			}
		
		}

	}
	,_inCircle: function(x,y,easyShape){
		var bb = easyShape.getBoundingBox();

		var a =((x - bb.center.x)*(x - bb.center.x)) + ((y - bb.center.y)*(y - bb.center.y));
		var b = easyShape.getRadius();
		b *= b;
		if (a <= b) return true;
		else return false;
	
	}
	,_inPoly: function(x,y,easyShape) {
		/* _inPoly adapted from inpoly.c
		Copyright (c) 1995-1996 Galacticomm, Inc.  Freeware source code.
		http://www.visibone.com/inpoly/inpoly.c.txt */
		var coords;
		coords = easyShape.getCoordinates();
		
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

};

var EasyOptimisations = {
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
			var splice1 = EasyOptimisations.douglasPeucker(coords,tolerance,start+1,ref);
			var splice2 = EasyOptimisations.douglasPeucker(coords,tolerance,ref,end);
			results = results.concat(splice1);
			results = results.concat(splice2);
			results.push(coords[end]);
			return results;
		}
		
	}
  
	,easyShapeIsInVisibleArea: function(easyShape,canvas,transformation){

		var left = 0,top = 0;
		var right =  parseInt(canvas.width) + left; 
		var bottom = parseInt(canvas.height) + top;
		var topleft =  EasyClickingUtils.undotransformation(left,top,transformation);
		var bottomright =  EasyClickingUtils.undotransformation(right,bottom,transformation);				
		var frame = {};
		frame.top = topleft.y;
		frame.bottom = bottomright.y;
		frame.right = bottomright.x;
		frame.left = topleft.x;
		var g = easyShape.getBoundingBox();
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
	
	,easyShapeIsTooSmall: function(easyShape,transformation){
		if(!transformation) return false;
		var g = easyShape.getBoundingBox();
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

};
var EasyClickingUtils = {
	getRealXYFromMouse: function(e,t){
		var newpos =EasyClickingUtils.getMouseFromEvent(e);
		newpos = EasyClickingUtils.undotransformation(newpos.x,newpos.y,t);
		return newpos;
	}
	
	,undotransformation: function(x,y,transformation){ //porting to EasyTransformations?
		return EasyTransformations.undoTransformation(x,y,transformation);
	}	
	,resolveTarget:function(e)
	{
		if(!e) e = window.event;
		var obj;
		if(e.target)
			obj = e.target;
		else if(e.srcElement)
			obj = e.srcElement;
		if(obj.nodeType == 3) // defeat Safari bug
			obj = obj.parentNode;
		return obj;
	}
	
	
	,getMouseFromEvent : function(e){
			if(!e) e = window.event;
			var target = this.resolveTargetWithEasyClicking(e);
			if(!target)return false;

			var offset = jQuery(target).offset();

			
			if(!offset.left) return false;
			x = e.clientX + window.findScrollX() - offset.left;
			y = e.clientY + window.findScrollY() - offset.top;
			return {'x':x, 'y':y};		
			
	}
	,getMouseFromEventRelativeToTarget : function(e,target){
			if(!e) e = window.event;
			if(!target)return false;

			var offset = jQuery(target).offset();

			
			if(!offset.left) return false;
			x = e.clientX + window.findScrollX() - offset.left;
			y = e.clientY + window.findScrollY() - offset.top;
			return {'x':x, 'y':y};		
			
	}

	,resolveTargetWithEasyClicking: function(e)
	{
		var node = EasyClickingUtils.resolveTarget(e);
		var first = node;
		while(node && !node.easyClicking){
			node = node.parentNode;
		}
		if(!node) node = first;
		return node;
	}
	,getMouseFromEventRelativeToElement: function (e,x,y,target){
		if(!e) e = window.event;

		var offset = jQuery(target).offset();
		if(!offset.left) return false;
		
		oldx = e.clientX + window.findScrollX() - offset.left;
		oldy = e.clientY + window.findScrollY() - offset.top;
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
		var target = this.resolveTargetWithEasyClicking(e);
		if(!target)return;
		if(target.style.width)
			w = parseInt(target.style.width);
		else if(target.width)
			w =parseInt(target.width);

		if(target.style.height)
			h = parseInt(target.style.height);
		else if(target.height)
			h = parseInt(target.height);
	
		if(!w || !h) throw "target has no width or height (easymaputils)";
	
		return this.getMouseFromEventRelativeTo(e,w/2,h/2);
	}	
	

};

var EasyTransformations= {
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
		if(!s || !o || !tr) return false;
		
		if(!x || !y) 
			return false;
		pos.x = x;
		pos.y = y;
		pos.x -= o.x;
		pos.y -= o.y;
		
		if(pos.x != 0)
			pos.x /= s.x;
		
		if(pos.y != 0)
			pos.y /= s.y;
			
		pos.x -= tr.x;
		pos.y -= tr.y;			
		return pos;	
	}
	,getXY: function(e,t){
		var pos =EasyClickingUtils.getMouseFromEvent(e);
		return this.undoTransformation(pos.x,pos.y,t);
	}
};/*requires EasyShapes
Adds controls such as panning and zooming to a given dom element.

Mousewheel zooming currently not working as should - should center on location where mousewheel occurs
Will be changed to take a handler parameter rather then a targetjs
 */

var EasyController = function(targetjs,elem,options){ //elem must have style.width and style.height etM
	if(!options) options = ['pan','zoom','mousepanning','mousewheelzooming'];

	if(typeof elem == 'string') elem= document.getElementById(elem);
	this.setMaxScaling(99999999);
	if(!elem.style.position) elem.style.position = "relative";
	this.wrapper = elem; //a dom element to detect mouse actions
	this.targetjs = targetjs; //a js object to run actions on (with pan and zoom functions)	

	var controlDiv = this.wrapper.controlDiv;
	if(!controlDiv) {
		controlDiv = document.createElement('div');
		controlDiv.style.position = "absolute";
		controlDiv.style.top = "0";
		controlDiv.style.left = "0";
		controlDiv.className = 'easyControls'
		this.wrapper.appendChild(controlDiv);
		this.wrapper.controlDiv = controlDiv;
	}
	
	
	this.transformation = {'translate':{x:0,y:0}, 'scale': {x:1, y:1},'rotate': {x:0,y:0,z:0},origin:{}};	
	this.transformation.origin.x = parseInt(elem.style.width) / 2;
	this.transformation.origin.y = parseInt(elem.style.height) / 2;
	//looks for specifically named function in targetjs
	if(!this.targetjs.transform) alert("no transform function defined in " + targetjs+"!");
	this.wrapper.easyController = this;
	this.enabled = true;
	this.addControls(options);

};
EasyController.prototype = {
	getTransformation: function(){
		return this.transformation;
	}
	,addMouseWheelZooming: function(){ /*not supported for internet explorer*/
		if(EasyUtils.browser.isIE) return;
		this.crosshair = {lastdelta:false};
		this.crosshair.pos = {x:0,y:0};
		this.crosshair.el =document.createElement("div");
		this.crosshair.el.style.position = "absolute";
		this.crosshair.el.className = "easyController_crosshair";
		this.crosshair.el.appendChild(document.createTextNode("+"));
		this.crosshair.el.style.zIndex = 3;
		var t = this.getTransformation();
		this.crosshair.el.style.left = parseInt(t.origin.x-5) + "px";
		this.crosshair.el.style.top = parseInt(t.origin.y-5) + "px";
		this.crosshair.el.style.width = "10px";
		this.crosshair.el.style.height = "10px";
		this.crosshair.el.style.display = "table";
		this.crosshair.el.style.verticalAlign = "middle";
		this.crosshair.el.style.textAlign = "center";
		this.wrapper.appendChild(this.crosshair.el);
		var mw = this.wrapper.onmousewheel;
		

		var that = this;
		var mm = this.wrapper.onmousemove;
		


		var onmousewheel = function(e){
	        	if (!e) return;/* For IE. */
	                
			e.preventDefault();		
					
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;

			if(!that.goodToTransform(e)) return;
			var t = EasyClickingUtils.resolveTarget(e);
			
			if(t != that.wrapper && t.parentNode !=that.wrapper) return;
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
	
			var sensitivity = 0.8;
			var scale =that.transformation.scale;
			var origin = that.transformation.origin;


			var mousepos = EasyClickingUtils.getMouseFromEvent(e);
	
			var w = parseInt(that.wrapper.style.width) / 2;
			var h = parseInt(that.wrapper.style.height) / 2;
			var translation =  EasyTransformations.undoTransformation(mousepos.x,mousepos.y,that.transformation);
			that.transformation.translate= {x: -translation.x, y: -translation.y};
			//{x: -mousepos.x + w,y: -mousepos.y + h};
			that.transformation.origin = {
											x: mousepos.x,
											y: mousepos.y
										};
			
			that.crosshair.el.style.left = mousepos.x + "px";
			that.crosshair.el.style.top = mousepos.y + "px";
			if(!that.crosshair.lastdelta) {
				that.crosshair.lastdelta = delta;
			
			
			
			}

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
					that.transform();					
				}

			}
			


			
			return false;

		}

		
		var element = this.wrapper;

		if (element.addEventListener){
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
		var t =  EasyClickingUtils.resolveTarget(e);

		switch(t.tagName){
			case "INPUT":
				return false;
			case "SELECT":
				return false;
			case "OPTION":
				return false;
		}
		
		if(t.getAttribute("class") == "easyControl") return false;
		
		return true;
		
	}
	,addMousePanning: function(){
		var that = this;
		var md = that.wrapper.onmousedown;
		var mu = that.wrapper.onmouseup;	
		var mm = that.wrapper.onmousemove;
		var onmousemove = function(e){
			if(!this.easyController)return;
			var p =this.easyController.panning_status;
			if(!p) return;
			if(!that.goodToTransform(e)) return;
			var pos =  EasyClickingUtils.getMouseFromEventRelativeToElement(e,p.clickpos.x,p.clickpos.y,p.elem);		
			if(!pos)return;
			
			var t = that.transformation;
			//if(this.transformation) t = this.transformation;
			var sc = t.scale;

			/* work out deltas */
			var xd =parseFloat(pos.x /sc.x);
			var yd = parseFloat(pos.y / sc.y);
			t.translate.x = p.translate.x + xd;
			t.translate.y =p.translate.y +yd;

			that.transform();
			
			if(pos.x > 5 || pos.y > 5) p.isClick = false;
			if(pos.x < 5 || pos.y < 5) p.isClick = false;
			return false;	
		};
		
		this.wrapper.onmousedown = function(e){
					
			if(md) md(e);
			var target =  EasyClickingUtils.resolveTarget(e);
			if(!target) return;

			if(target.getAttribute("class") == "easyControl") return;

			var t = that.transformation.translate;
			var sc =that.transformation.scale; 
			var realpos = EasyClickingUtils.getMouseFromEvent(e);
			if(!realpos) return;
			this.easyController = that;
			
			var element = EasyClickingUtils.resolveTargetWithEasyClicking(e);
			that.panning_status =  {clickpos: realpos, translate:{x: t.x,y:t.y},elem: element,isClick:true};
			
			that.wrapper.onmousemove = onmousemove;
			that.wrapper.style.cursor= "move";

		
		};
		
		this.wrapper.onmouseup = function(e){
			that.wrapper.style.cursor= '';
			that.wrapper.onmousemove = mm;
			
			if(!this.easyController && mu){mu(e); return;};
			if(this.easyController.panning_status && this.easyController.panning_status.isClick && mu){ mu(e);}
			this.easyController.panning_status = null;
			
			return false;
		};
	
	
	},
	setTransformation: function(t){
		if(this.enabled){
			if(!t.scale && !t.translate && !t.rotate) alert("bad transformation applied - any call to setTransformation must contain translate,scale and rotate");
			this.transformation = t;
			this.targetjs.transform(t);
		}
		//console.log("transformation set to ",t);
	},
	createButtonLabel: function(r,type){
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
		
		return new EasyShape(properties,coords);
	},	
	createButton: function(canvas,width,direction,offset,properties) {
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
		var button = new EasyShape(properties,coords);
		button.render(canvas,{translate:{x:0,y:0}, scale:{x:1,y:1},origin:{x:0,y:0}});
		var label = this.createButtonLabel(r,properties.actiontype);
		label.render(canvas,{translate:{x:0,y:0}, scale:{x:1,y:1},origin:{x:offset.x + r,y:offset.y + r}});
		canvas.easyClicking.add(button);
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
	
	_createcontrollercanvas: function(width,height){
		var newCanvas = document.createElement('canvas');
		jQuery(newCanvas).css({width: width, height:height,position:"absolute",left:0,top:0,'z-index': 3});
		newCanvas.width = width;
		newCanvas.height = height;
		newCanvas.setAttribute("class","easyControl");
		this.wrapper.appendChild(newCanvas);
		newCanvas.easyController = this;
		newCanvas.easyClicking = new EasyClickableCanvas(newCanvas);
		return newCanvas;
	},
	addPanningActions: function(controlDiv){
		var panCanvas = this._createcontrollercanvas(44,44);		
		this.createButton(panCanvas,10,180,{x:16,y:2},{'actiontype':'N','name':'pan north','buttonType': 'narrow'});
		this.createButton(panCanvas,10,270,{x:30,y:16},{'actiontype':'E','name':'pan east','buttonType': 'earrow'});
		this.createButton(panCanvas,10,90,{x:16,y:16},{'actiontype':'O','name':'re-center','buttonType': ''});
		this.createButton(panCanvas,10,90,{x:2,y:16},{'actiontype':'W','name':'pan west','buttonType': 'warrow'});
		this.createButton(panCanvas,10,0,{x:16,y:30},{'actiontype':'S','name':'pan south','buttonType': 'sarrow'});			
		panCanvas.onmouseup = this._panzoomClickHandler;		

	},
	addRotatingActions: function(){
		
		var rotateCanvas = this._createcontrollercanvas(44,40);	
		this.createButton(rotateCanvas,10,180,{x:16,y:2},{'actiontype':'rotatezup','name':'pan north','buttonType': 'narrow'});
		this.createButton(rotateCanvas,10,0,{x:16,y:30},{'actiontype':'rotatezdown','name':'pan south','buttonType': 'sarrow'});			
			
		this.createButton(rotateCanvas,10,270,{x:30,y:16},{'actiontype':'rotatezright','name':'rotate to right','buttonType': 'earrow'});
		this.createButton(rotateCanvas,10,90,{x:2,y:16},{'actiontype':'rotatezleft','name':'rotate to left','buttonType': 'warrow'});
		rotateCanvas.onmouseup = this._panzoomClickHandler;

	},	
	addZoomingActions: function(){
		var zoomCanvas = this._createcontrollercanvas(20,30);

		var left = 14;
		var top = 50;
		zoomCanvas.style.left = left +"px";
		zoomCanvas.style.top = top + "px";
		this.createButton(zoomCanvas,10,180,{x:2,y:2},{'actiontype':'in','name':'zoom in','buttonType': 'plus'});		
		this.createButton(zoomCanvas,10,180,{x:2,y:16},{'actiontype':'out','name':'zoom out','buttonType': 'minus'});
		zoomCanvas.onmouseup = this._panzoomClickHandler;	
	},	
	
	setMaxScaling: function(max){
		this._maxscale = max;
	}
	,transform: function(){
		if(this.enabled){
			var t = this.transformation;
			var s = t.scale;
			var tr = t.translate;
			if(s.x <= 0) s.x = 0.1125;
			if(s.y <= 0) s.y = 0.1125;

			this.targetjs.transform(this.transformation);

		}
	},
	_panzoomClickHandler: function(e) {

		if(!e) {
			e = window.event;
		}
		
		var controller = this.easyController;
	
		var hit = this.easyClicking.getShapeAtClick(e);	
		if(!hit) {
			return false;
		}
	
		var pan = {};
		var t =controller.transformation;
		//console.log(t.rotate,"hit");
		var scale =t.scale;
		pan.x = parseFloat(30 / scale.x);
		pan.y = parseFloat(30 / scale.y);

		if(!t.scale) t.scale = {x:1,y:1};
		if(!t.translate) t.translate = {x:0,y:0};
		if(!t.rotate) t.rotate = {x:0,y:0,z:0};
		switch(hit.properties.actiontype) {
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

		return false;
	}
};