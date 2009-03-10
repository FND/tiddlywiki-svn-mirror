/* I am not very happy with the code that follows. It is not of the best standard and needs much improvement */
/*coordinates are a string consisting of floats and move commands (M)*/

var EasyShape = function(properties,coordinates,geojson){
	this.grid = {};
	this.coords = [];
	this._maxScaleFactor = {x:1024,y:1024};
	if(geojson){
		this._constructFromGeoJSONObject(properties,coordinates);
	}
	else{
		this._constructBasicShape(properties,coordinates);
	}


	this._iemultiplier = 1000; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..

};
EasyShape.prototype={
	_simplifiedCoordinates: function(scaleFactor,coordinates){
		/*will use http://www.jarno.demon.nl/polygon.htm#ref2 */
		if(!coordinates) throw "give me some coordinates!";
		
		var tolerance = 1/ scaleFactor;
		return coordinates;		
	}
	,getOptimisedCoords: function(scaleFactor){
		var index = parseInt(scaleFactor);
		if(this._optimisedcoords[index]) {
			return this._optimisedcoords[index];
		}
		else {
			var res =this._optimisedcoords[this._maxScaleFactor.x];
			if(res)
				return res;
			else{
				throw "no optimised coordinates found";
			}
		}
	}
	,setOptimisedCoords: function(scaleFactor,coords){
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
		
		var frame = this._calculateVisibleArea(canvas,transformation);
		var shapetype = this.properties.shape;
		if(shapetype == 'point'){
			this._calculatePointCoordinates(transformation);
		} 
		else if(shapetype == 'path' || shapetype =='polygon'){
			
		}
		else{
			console.log("no idea how to render" +this.properties.shape+" must be polygon|path|point");
			return;
		}		
		//optimisations = false;
		if(!projection && optimisations){
			if(shapetype != 'point' && shapetype != 'path' && frame){ //check if worth drawing				
				if(!this._optimisation_shapeIsTooSmall(transformation)) {
					if(this.vml) this.vml.style.display = "none";
					return;	
				}
				if(!this._optimisation_shapeIsInVisibleArea(frame)){
					if(this.vml) this.vml.style.display = "none";
					return;	
				}	
			}
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
	 
		var optimalcoords = this._simplifiedCoordinates(this._maxScaleFactor.x,this.getCoordinates());
		for(var h=1; h < this._maxScaleFactor.x; h*=2){
			var t = {scale:{x:h,y:h}};
			this.setOptimisedCoords(this._maxScaleFactor.x,optimalcoords);
		}
		
		if(this.vml) this.vml.path = false; //reset path so recalculation will occur
	}
	,getCoordinates: function(){
		return this.coords;
	}
	,_calculateBounds: function(coords){
		if(this.properties.shape == 'path'){
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
	}
	,_constructPointShape: function(properties,coordinates){
		var x = coordinates[0]; var y = coordinates[1];
		this.pointcoords = [x,y];
		var ps = 0.5;
		var newcoords =[x-ps,y-ps,x+ps,y-ps,x+ps,y+ps,x-ps, y+ps];
		this._constructPolygonShape(properties,newcoords);
	}
	
	,_constructPolygonShape: function(properties,coordinates){
		var properties =EasyUtils.clone(properties);
		this.properties = properties;
		this.setCoordinates(coordinates);
		if(!properties.stroke)properties.stroke = '#000000';		
		if(properties.colour){
			properties.fill =  properties.colour;
		}
	}
	,_constructBasicShape: function(properties, coordinates){
		if(properties.shape == 'point'){
			this._constructPointShape(properties,coordinates);
		}
		else if(properties.shape == 'polygon' || properties.shape == 'path')
		{
			this._constructPolygonShape(properties,coordinates);
		}
		else{
			console.log("don't know how to construct basic shape " + properties.shape);
		}		
		
		
	}	
	
	 /*following 3 functions may be better in EasyMaps*/
	,_constructFromGeoJSONObject: function(properties,coordinates){
		if(properties.shape == 'polygon'){
			this._constructFromGeoJSONPolygon(properties,coordinates);	
		}
		else if(properties.shape == 'point'){
			this._constructPointShape(properties,coordinates);
		}
		else{
			console.log("don't know what to do with shape " + element.shape);
		}
	}
	,_constructFromGeoJSONPolygon: function(properties,coordinates){		
		var newcoords = this._convertGeoJSONCoords(coordinates[0]);
		this._constructBasicShape(properties,newcoords);
				//we ignore any holes in the polygon (for time being.. coords[1][0..n], coords[2][0..n])
	}	
	,_convertGeoJSONCoords: function(coords){
	//converts [[x1,y1], [x2,y2],...[xn,yn]] to [x1,y1,x2,y2..xn,yn]
		var res = [];
		if(!coords) return res;
		for(var i=0; i < coords.length; i++){
			//geojson says coords order should be longitude,latitude eg. 0,51 for London

			// longitude goes from -180 (W) to 180 (E), latitude from -90 (S) to 90 (N)
			// in our data, lat goes from 90 (S) to -90 (N), so we negate
			
			var x = coords[i][0];
			var y = - coords[i][1];
			
			//var y = -coords[i][0];
			//var x = coords[i][1];
			res.push(x);
			res.push(y);
		}

		return res;
	}	
	 /*RENDERING */
	,_canvasrender: function(canvas,transformation,projection,optimisations){
		var c;	
		var shapetype = this.properties.shape;
		c =this.getOptimisedCoords(transformation);
		
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
		var c =this.getOptimisedCoords(transformation);
	
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
		//	this.vml.parentNode.replaceChild(clonedNode,this.vml);
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
	
	
	,_ierender: function(canvas,transformation,projection,optimisations,appendTo){
		var shape;
		if(this.vml){
			shape = this.vml;
		
			if(this.properties.fill && shapetype != 'path'){
				shape.filled = "t";
				shape.fillcolor = this.properties.fill;			
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
	,setProperty: function(name,value){
		this.properties[name] = value;
	}
	,getProperty: function(name){
		return this.properties[name];
	}
	,_applyProjectionToXY: function(x,y,projection,transformation){
		if(projection && projection.xy){
			return projection.xy(x,y,transformation);
		}
	}
	,_applyProjection: function(projection,transformation){
		var c;
		var opt =this.getOptimisedCoords(transformation);
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
	,_calculateVisibleArea: function(canvas,transformation){
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
		return frame;
	}
	
	,_calculatePointCoordinates: function(transformation){
		if(!this.pointcoords) {
			this.pointcoords = [this.coords[0],this.coords[1]];
		}
		var x =parseFloat(this.pointcoords[0]);
		var y =parseFloat(this.pointcoords[1]);
		this.setCoordinates([x,y]);
		var ps = 5 / parseFloat(transformation.scale.x);
		//should get bigger with scale increasing
		var smallest = 1 / this._iemultiplier;
		var largest = 2.5 * transformation.scale.x;
		if(ps < smallest) ps = smallest;
		if(ps > largest) ps = largest;
		var newcoords =[[x-ps,y-ps],[x+ps,y-ps],[x+ps,y+ps],[x-ps, y+ps]];
		var c = this._convertGeoJSONCoords(newcoords);
		this.setCoordinates(c);
	}
	,_optimisation_shapeIsInVisibleArea: function(frame){
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
	
	,_optimisation_shapeIsTooSmall: function(transformation,projection){
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
