var EasyUtils = {
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


/* 
Creates primitive shapes that can be rendered across most browsers
I am not very happy with the code that follows. It is not of the best standard and needs much improvement
coordinates are a string consisting of floats and move commands (M)
*/

var EasyShape = function(properties,coordinates){
	this.grid = {};
	this.coords = [];
	if(coordinates[0] && coordinates[0].length == 2){
		coordinates = EasyOptimisations.unpackCoordinates(coordinates);	
	}
	this._constructBasicShape(properties,coordinates);
	this._iemultiplier = 1000; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..
};


EasyShape.prototype={
	getProperties: function(){
		return this.properties;
	}
	,_simplifyCoordinates: function(scaleFactor,coordinates){
		if(this.getProperty("shape") == 'path') return coordinates;
		/*will use http://www.jarno.demon.nl/polygon.htm#ref2 */
		if(!coordinates) throw "give me some coordinates!";
		
		var tolerance = 3 / scaleFactor;
		coordinates = EasyOptimisations.packCoordinates(coordinates);
		coordinates = EasyOptimisations.douglasPeucker(coordinates,tolerance);
		
		coordinates = EasyOptimisations.unpackCoordinates(coordinates);	
		var originals =this.getCoordinates();
		var diff = originals.length - coordinates.length;
		
		if(diff < 10) return originals;
		else 
		return coordinates;	
	}
	,_getOptimisedCoords: function(scaleFactor){
		var index = parseInt(scaleFactor);
		if(this._optimisedcoords[index]) {
			return this._optimisedcoords[index];
		}
		else {
			var res = this._simplifyCoordinates(scaleFactor,this.getCoordinates());
			this._setOptimisedCoords(scaleFactor,res);
			return res;
		}
	}
	,_setOptimisedCoords: function(scaleFactor,coords){
		var index = scaleFactor;
		this._optimisedcoords[index] = coords;
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
		
		
		var shapetype = this.getProperty("shape");
		if(shapetype == 'point'){
			var ps = 5 / parseFloat(transformation.scale.x);
			var smallest = 1 / this._iemultiplier;
			var largest = 2.5 * transformation.scale.x;
			if(ps < smallest) ps = smallest;
			if(ps > largest) ps = largest;
			this._constructPointShape(this.pointcoords,ps);
		} 
		else if(shapetype == 'image'){
		
		}
		else if(shapetype == 'path' || shapetype =='polygon' | shapetype == 'circle' |shapetype == 'image'){
			
		}
		else{
			console.log("no idea how to render " +shapetype+" must be polygon|path|point");
			return;
		}		
		//optimisations = false;
		if(!projection && optimisations){
			this.optimise(canvas,transformation);
		}	

		if(this.vml) this.vml.style.display = '';
		
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
			
			this._ierender(canvas,transformation,projection,optimisations); 

	
		}
		else{
			this._canvasrender(canvas,transformation,projection,optimisations);

		}
		
	}
	
	,setCoordinates: function(coordinates){
		this._optimisedcoords = {};
		this.coords = coordinates;
		this.grid = {}; //an enclosing grid
		this._calculateBounds();
	 

		if(this.vml) this.vml.path = false; //reset path so recalculation will occur
	}
	,getCoordinates: function(){
		return this.coords;
	}
	,_calculateBounds: function(coords){
		if(this.getProperty("shape") == 'path'){
			this.grid = {x1:0,x2:1,y1:0,y2:1};
			return;
		}
		if(!coords) coords = this.coords;
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
	,_constructPointShape: function(coordinates,radius){
		var x = coordinates[0]; var y = coordinates[1];
		var coords = [x,y,radius];
		this._constructCircleShape(coords);
	}
	
	,_ierenderImageShape: function(canvas,transformation,projection,optimisations){
		if(!this.imageEl){
			this.imageEl =document.createElement("img");
			this.imageEl.style.position ="absolute";
			this.imageEl.src= this.getProperty("src");
			this.imageEl.alt = this.getProperty("alt");
			this.imageEl.title = this.getProperty("title");
			canvas.appendChild(this.imageEl);
		}
		this._cssTransform(this.imageEl,transformation,projection);
			
	}
	,_constructCircleShape: function(coordinates){ /* x y radius */
		var x = coordinates[0]; var y = coordinates[1];
		this.radius = coordinates[2];
		var radius= this.radius;
		this.pointcoords = [x,y,radius];
		var newcoords =[x-radius,y-radius,x+radius,y-radius,x+radius,y+radius,x-radius, y+radius];
		this.setCoordinates(newcoords);
	}
	,_constructPolygonShape: function(coordinates){
		this.setCoordinates(coordinates);
	}
	,_constructBasicShape: function(properties, coordinates){
		var properties =EasyUtils.clone(properties);
		this.properties = properties;
		if(!properties.stroke){
			this.setProperty("stroke",'#000000');		
		}
		if(properties.colour){
			this.setProperty("fill",properties.colour);
			delete properties.colour;
		}
		if(properties.shape == 'point'){
			this._constructPointShape(coordinates,0.5);
		}
		else if(properties.shape == 'polygon' || properties.shape == 'path')
		{
			this._constructPolygonShape(coordinates);
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
			this._constructPolygonShape(coordinates);
		}
		else{
			console.log("don't know how to construct basic shape " + properties.shape);
		}		
		
		
	}	

	 /*RENDERING */
	,_canvasrender: function(canvas,transformation,projection,optimisations){
		var c;	
		var shapetype = this.properties.shape;
		c =this._getOptimisedCoords(transformation.scale.x);
		
		if(projection){
			c = this._applyProjection(projection,transformation);
		}

	
		if(c.length == 0) return;
		var ctx = canvas.getContext('2d');

		var o = transformation.origin;
		var tr = transformation.translate;
		var s = transformation.scale;
		var r = transformation.rotate;
		ctx.save();
		if(this.properties.lineWidth){
			ctx.lineWidth = this.properties.lineWidth;
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
	,_createvmlpathstring: function(vml,transformation,projection){ //mr bottleneck
		if(!vml) return;
		var o = transformation.origin;
		var t = transformation.translate;
		var s = transformation.scale;
		var path;
		
		var buffer = [];
		var c =this.getCoordinates();
	
		if(projection){
			c = this._applyProjection(projection,transformation);
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

	,_cssTransform: function(vml,transformation,projection){
		var d1,d2,t;
		if(!vml) return;
	
		if(vml.tagName == 'shape' && (!vml.path || this.properties.shape =='point')) {
			//causes slow down..
			this._createvmlpathstring(vml,transformation,projection);
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
		var style = vml.style;			
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
	
	,_ierenderVML: function(canvas,transformation,projection,optimisations,appendTo){
		var shape;
		if(this.vml){
			fill =this.getProperty("fill");
			shape = this.vml;
			if(fill && shapetype != 'path'){
				shape.filled = "t";
				if(!this.vmlfill){
					this.vmlfill =document.createElement("easyShapeVml_:fill");
					shape.appendChild(this.vmlfill); 
				}
		/*look for rgba fill for transparency*/
				if(fill.indexOf("rgba") != -1 &&fill.match(/rgba\([0-9]*,[0-9]*,[0-9]*,(.*)\)/)){
					var match =fill.match(/(rgba\([0-9]*,[0-9]*,[0-9]*),(.*)\)/);
				
					if(match[2]){
						fill = match[1] +")";
						this.vmlfill.opacity = match[2];
					}
				}
				this.vmlfill.color = fill;					
			}
			this._cssTransform(shape,transformation,projection);
			return;
		}
		else{
			shape = document.createElement("easyShapeVml_:shape");
			var o = transformation.origin;
			var t = transformation.translate;
			var s = transformation.scale;


			//path ="M 0,0 L50,0, 50,50, 0,50 X";
			var nclass= "easyShape";
			var shapetype =this.properties.shape;
			if(shapetype == 'path') nclass= "easyShapePath";
			shape.setAttribute("class", nclass);
			shape.style.height = canvas.height;
			shape.style.width = canvas.width;
			shape.style.position = "absolute";
			shape.style['z-index'] = 1;
			shape.stroked = "t";
			shape.strokecolor = "#000000";

			if(this.properties.fill && shapetype != 'path'){
				shape.filled = "t";
				shape.fillcolor = this.properties.fill;			
			}

			if(this.properties.lineWidth) {
				shape.strokeweight = this.properties.lineWidth + "pt";
			}
			else {
				shape.strokeweight = ".75pt";
			}
			var xspace = parseInt(canvas.width);
			xspace *=this._iemultiplier;
			var yspace =parseInt(canvas.height);
			yspace *= this._iemultiplier;
			coordsize = xspace +"," + yspace;

			shape.coordsize = coordsize;
			shape.easyShape = this;
			if(!appendTo){
				appendTo = canvas;
			}


			this._cssTransform(shape,transformation,projection);	
			this.vml = shape;
			appendTo.appendChild(shape);
		}	
	}	
	,_ierender: function(canvas,transformation,projection,optimisations,appendTo){
		if(this.getProperty("shape") != "image"){
			this._ierenderVML(canvas,transformation,projection,optimisations,appendTo);
		}
	}
	,setProperty: function(name,value){
		this.properties[name] = value;
	}
	,getProperty: function(name){
		return this.properties[name];
	}

	,_applyProjection: function(projection,transformation){
		var c;
		var opt =this._getOptimisedCoords(transformation.scale.x);
		if(opt){
			c = opt;
		}
		else{
			c = this.getCoordinates();
		}
		
		if(!projection) return c;
		if(!projection.xy){
			return;
		}	
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


		this._tcoords = newc;
		this._calculateBounds(this._tcoords);
		return newc;
	}

	,optimise: function(canvas,transformation){
		var shapetype = this.getProperty("shape");
		if(shapetype != 'point' && shapetype != 'path'){ //check if worth drawing				
			if(!this._optimisation_shapeIsTooSmall(transformation)) {
				if(this.vml) this.vml.style.display = "none";
				return;	
			}
			if(!this._optimisation_shapeIsInVisibleArea(canvas,transformation)){
				if(this.vml) this.vml.style.display = "none";
				return;	
			}	
		}
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

};

