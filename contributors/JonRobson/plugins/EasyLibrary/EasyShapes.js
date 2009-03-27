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
		normal: [],
		optimised: {},
		incurrentprojection:false
	};
	this.grid = {};
	this.setProperties(properties);
	if(coordinates[0] && coordinates[0].length == 2){
		coordinates = EasyOptimisations.unpackCoordinates(coordinates);	
	}
	
	this._constructBasicShape(properties,coordinates);
	this.browser =false;

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

	,render: function(canvas,transformation,projection,optimisations, browser){
		var optimisations = true;
		
		if(!transformation){
			transformation = {};
		}
		if(!transformation.origin)transformation.origin = {x:0,y:0};
		if(!transformation.scale)transformation.scale = {x:1,y:1};
		if(!transformation.translate)transformation.translate = {x:0,y:0};
		
	
		if(this._prepareShape(canvas,transformation,projection,optimisations)){
		
			if(this.getRenderMode(canvas) == 'ie'){
				
				this._ierender(canvas,transformation,projection,optimisations); 
			}
			else{
			
				this._canvasrender(canvas,transformation,projection,optimisations);
			}
		}
		
	}
	
	,setCoordinates: function(coordinates){
		this.coordinates.normal = coordinates;
		this.coordinates.projected= false;
		var i;
		for(i in this.coordinates.optimised){
			delete this.coordinates[i];
		}
		this.grid = {}; //an enclosing grid
		this._calculateBounds();
		if(this.vml) this.vml.path = false; //reset path so recalculation will occur
	}
	,getProjectedCoordinates: function(){
		if(this.coordinates.incurrentprojection) return this.coordinates.incurrentprojection;
		else return false;
	}
	,getCoordinates: function(){
		return this.coordinates.normal;
	}
	,getOptimisedCoords: function(scaleFactor){
		return this.getCoordinates();//until i fix
		var index = parseInt(scaleFactor);
		if(this.coordinates.optimised[index]) {
			return this.coordinates.optimised[index];
		}
		else {
			var res = this._simplifyCoordinates(scaleFactor,this.getCoordinates());
			this._setOptimisedCoords(scaleFactor,res);
			return res;
		}
	}
	,getProperties: function(){
		return this.properties;
	}
	,getRenderMode: function(canvas){
		if(!this.browser){
			if(!canvas.getContext) this._setRenderMode("ie");
			else this._setRenderMode("good");
		}
		return this.browser;
	}
	
	,setProperty: function(name,value){
		this.properties[name] = value;
	}
	,getProperty: function(name){
		return this.properties[name];
	}

	,optimise: function(canvas,transformation){
		var shapetype = this.getProperty("shape");
		
		if(shapetype != 'point' && shapetype != 'path'){ //check if worth drawing				
			if(!this._optimisation_shapeIsTooSmall(transformation)) {
				if(this.vml){var el = this.vml.getVMLElement(); el.style.display = "none";}
				return;	
			}
			if(!this._optimisation_shapeIsInVisibleArea(canvas,transformation)){
				if(this.vml){var el = this.vml.getVMLElement(); el.style.display = "none";}
				return;	
			}	
		}
	}
	,_setRenderMode: function(browser){
		if(browser == 'ie'){
			if(!this.browser){				
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
		}
	}

	,_simplifyCoordinates: function(scaleFactor,coordinates){
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

	,_setOptimisedCoords: function(scaleFactor,coords){
		var index = scaleFactor;
		this.coordinates.optimised[index] = coords;
	}

	,_calculateBounds: function(coords){
		if(this.getProperty("shape") == 'path'){
			this.grid = {x1:0,x2:1,y1:0,y2:1};
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
		
		this.grid.center = {};
		this.grid.center.x = (this.grid.x2 - this.grid.x1) / 2 + this.grid.x1;
		this.grid.center.y = (this.grid.y2 - this.grid.y1) / 2 + this.grid.y1;
	}
	,_preparePointShape: function(coordinates,radius){
		var x = coordinates[0]; var y = coordinates[1];
		var coords = [x,y,radius];
		this._constructCircleShape(coords);
	}
	

	,_constructCircleShape: function(coordinates){ /* x y radius */
		var x = coordinates[0]; var y = coordinates[1];
		this.radius = coordinates[2];
		this.pointcoords = [x,y,this.radius];
		var newcoords =[x-this.radius,y-this.radius,x+this.radius,y-this.radius,x+this.radius,y+this.radius,x-this.radius, y+this.radius];
		this.setCoordinates(newcoords);
	}
	,_constructBasicShape: function(properties, coordinates){


		if(properties.shape == 'point'){
			this._preparePointShape(coordinates,0.5);
		}
		else if(properties.shape == 'polygon' || properties.shape == 'path')
		{
			this.setCoordinates(coordinates);
		}
		else if(properties.shape == 'circle'){
			this._constructCircleShape(coordinates);
		}
		else if(properties.shape == 'image'){
			var w = this.getProperty("width"); h=  this.getProperty("height");
			if(coordinates.length == 2 && w && h){
				var x = coordinates[0];
				var y = coordinates[1];
				coordinates = coordinates.concat([x+w,y, x+w,y+h, x,y+h]);
			}
			this.setCoordinates(coordinates);
		}
		else{
			console.log("don't know how to construct basic shape " + properties.shape);
		}			
		
	}	

	 /*RENDERING */
	,_canvasrender: function(canvas,transformation,projection,optimisations){
		var c;
		if(projection){
			c = this._applyProjection(projection,transformation);
		}
		else{
			c =this.getOptimisedCoords(transformation.scale.x);
		}
		if(c.length == 0) return;
		var ctx = canvas.getContext('2d');
		var o = transformation.origin;
		var tr = transformation.translate;
		var s = transformation.scale;
		var r = transformation.rotate;
		ctx.save();
		if(this.properties.lineWidth){
			ctx.lineWidth = this.properties.lineWidth/ transformation.scale.x;
		}
	
		ctx.translate(o.x,o.y);
		ctx.scale(s.x,s.y);
		ctx.translate(tr.x,tr.y);
		if(r && r.x)ctx.rotate(r.x);
		ctx.beginPath();
		var shapetype =this.getProperty("shape");
		if(shapetype == 'point'){
			var bb =this.getBoundingBox();
			ctx.arc(bb.center.x, bb.center.y, this.radius, 0, Math.PI*2,true);
		}
		else if(shapetype =='image'){
			var img = new Image();  
			img.src = this.getProperty("src");
			var bb= this.getBoundingBox();
			img.onload = function(){
				ctx.drawImage(img, c[0], c[1],bb.x2 - bb.x1,bb.y2 - bb.y1);
			};
			
		}
		else{
			
			var move = true;
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
		ctx.closePath();
		if(!this.properties.hidden) {
			ctx.strokeStyle = this.properties.stroke;
			if(typeof this.properties.fill == 'string') 
				fill = this.properties.fill;
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
	
		var c = this.getCoordinates();
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
		newc = this._simplifyCoordinates(transformation.scale.x,newc);
		this.coordinates.incurrentprojection = newc;
		this._calculateBounds(this.coordinates.incurrentprojection);
		return newc;
	}

	,_optimisation_shapeIsInVisibleArea: function(canvas,transformation){
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
		var g = this.grid;
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
	
	,_optimisation_shapeIsTooSmall: function(transformation){
		var g = this.grid;
		var s = transformation.scale;
		var t1 = g.x2 -g.x1;
		var t2 =g.y2- g.y1;
		var delta = {x:t1,y:t2};
		delta.x *= s.x;
		delta.y *= s.y;
		if(delta.x < 5 && delta.y < 5) 
			{return false;}//too small
		else
			return true;
	}

	,_prepareShape: function(canvas,transformation,projection,optimisations){
		
			var shapetype = this.getProperty("shape");
			if(shapetype == 'point'){
				var ps = 5 / parseFloat(transformation.scale.x);
				var smallest = 1 / this._iemultiplier;
				var largest = 2.5 * transformation.scale.x;
				if(ps < smallest) ps = smallest;
				if(ps > largest) ps = largest;
				this._preparePointShape(this.pointcoords,ps);
			} 
			else if(shapetype == 'image'){

			}
			else if(shapetype == 'path' || shapetype =='polygon' | shapetype == 'circle' |shapetype == 'image'){

			}
			else{
				console.log("no idea how to render " +shapetype+" must be polygon|path|point");
				return false;
			}
			
			if(!projection && optimisations){
				this.optimise(canvas,transformation);
			}
			return true;
	}
};

var EasyVML = function(easyShape,canvas){
	this._iemultiplier = 1000; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..

			this.easyShape=  easyShape;
			var shape = document.createElement("easyShapeVml_:shape");
	this.el = shape;
			//path ="M 0,0 L50,0, 50,50, 0,50 X";
			var nclass= "easyShape";
			
	
			var shapetype =easyShape.getShape();
				
			if(shapetype == 'path') nclass= "easyShapePath";
			shape.setAttribute("class", nclass);
			shape.style.height = canvas.height;
			shape.style.width = canvas.width;
			shape.style.position = "absolute";
			shape.style['z-index'] = 1;
			shape.stroked = "t";
			shape.strokecolor = "#000000";


			if(this.easyShape.getProperty("lineWidth")) {
				shape.strokeweight = this.easyShape.getProperty("lineWidth") + "px";
			}
			else {
				shape.strokeweight = "1px";
			}
			var xspace = parseInt(canvas.width);
			xspace *=this._iemultiplier;
			var yspace =parseInt(canvas.height);
			yspace *= this._iemultiplier;
			coordsize = xspace +"," + yspace;

			shape.coordsize = coordsize;
			shape.easyShape = this.easyShape;	
			

			this.style();
				
		
			
};

EasyVML.prototype = {
	getVMLElement: function(){
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

	,_cssTransform: function(transformation,projection){
		
		var vml = this.el;
		var d1,d2,t;

		if(vml.tagName == 'shape' && (!vml.path || this.easyShape.getShape() =='point')) {
			//causes slow down..
			
			this._createvmlpathstring(transformation,projection);	
		}
		var o = transformation.origin;
		
		var t = transformation.translate;
		var s = transformation.scale;
		
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
		//translate into right place

		var temp;
		temp = (t.x);
		temp *= s.x;
		newleft += temp;

		temp = (t.y);
		temp *= s.x;
		newtop += temp;						

		style.left = newleft +"px";
		style.top = newtop +"px";
		
		if(scalingRequired){
			style.width = newwidth +"px";
			style.height = newheight + "px";
		}
		
		
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
			if(!appendTo){
				appendTo = canvas;
			}
			appendTo.appendChild(shape);
	}
	,style: function(){

		var shapetype = this.easyShape.getShape();

		var shape = this.el;
	
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
