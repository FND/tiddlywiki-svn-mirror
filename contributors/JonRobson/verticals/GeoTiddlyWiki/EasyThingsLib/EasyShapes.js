
var EasyShape = function(properties,coordinates,geojson){
	this.grid = {};
	this.coords = [];
	if(geojson){
		this.constructFromGeoJSONObject(properties,coordinates);
	}
	else{
		this.constructBasicPolygon(properties,coordinates);
	}
	
	this._calculateBounds();

};
EasyShape.prototype={
	_calculateBounds: function(coords){
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
	},
	
	constructFromGeoJSONObject: function(properties,coordinates){
		if(properties.shape == 'polygon'){
			this.constructFromGeoJSONPolygon(properties,coordinates);	
		}
		else if(properties.shape == 'point'){
			var x = coordinates[0]; var y = coordinates[1];
			this.pointcoords = [x,y];
			var ps = 0.5;
			var newcoords =[[x-ps,y-ps],[x+ps,y-ps],[x+ps,y+ps],[x-ps, y+ps]];
			newcoords = this._convertGeoJSONCoords(newcoords);
			this.constructBasicPolygon(properties,newcoords);
		}
		else
			console.log("don't know what to do with shape " + element.shape);
	},
	constructBasicPolygon: function(properties, coordinates){
		this.coords = coordinates;
		this.shape = "polygon";
		//this.transformedCoords = this.coords;
		//this.href = "#";
		if(!properties.stroke)properties.stroke = '#000000';
		

		
		if(properties.colour){
			properties.fill =  properties.colour;
		}
		
		this.properties = properties;
		this.grid = {}; //an enclosing grid
	},	
	constructFromGeoJSONPolygon: function(properties,coordinates){		
		var newcoords = this._convertGeoJSONCoords(coordinates[0]);
		this.constructBasicPolygon(properties,newcoords);
				//we ignore any holes in the polygon (for time being.. coords[1][0..n], coords[2][0..n])
	},	
	_convertGeoJSONCoords: function(coords){
	//converts [[x1,y1], [x2,y2],...[xn,yn]] to [x1,y1,x2,y2..xn,yn]
		var res = [];
		if(!coords) return res;
		for(var i=0; i < coords.length; i++){
			// x is longitude, y is latitude
			// longitude goes from -180 (W) to 180 (E), latitude from -90 (S) to 90 (N)
			// in our data, lat goes from 90 (S) to -90 (N), so we negate
			var x = coords[i][0];
			var y = - coords[i][1];
			res.push(x);
			res.push(y);
		}

		return res;
	}	

	,_applyProjection: function(projection,transformation){
		var c = this.coords;
		if(!projection) return c;
		
		var newc = [];
		for(var i=0; i < c.length-1; i+=2){
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);
			
			if(projection.xy){
				var t = projection.xy(c[i],c[i+1],transformation);
				newx= t.x;
				newy= t.y;
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
				newc.push(newx);
				newc.push(newy);
				}
	
			}
			
			
		}	

		this._tcoords = newc;
		this._calculateBounds(this._tcoords);
		return newc;
	}
	

	,_cssTransform: function(transformation){
		var o = transformation.origin;
		var t = transformation.translate;
		var s = transformation.scale;
		if(!this.initialStyle) {
			var initTop = parseInt(this.vml.style.top);
			if(!initTop) initTop = 0;
			initTop += o.y;
			var initLeft = parseInt(this.vml.style.left);
			if(!initLeft) initLeft = 0;
			initLeft += o.x;
			var w =parseInt(this.vml.style.width);
			var h = parseInt(this.vml.style.height)
			this.initialStyle = {top: initTop, left: initLeft, width: w, height: h};
		}

		var initialStyle= this.initialStyle;

		var style = this.vml.style;			
		var newtop,newleft;
		newtop = initialStyle.top;
		newleft = initialStyle.left;

		//scale
		var newwidth = initialStyle.width * s.x;
		var newheight = initialStyle.height * s.y; 	

		//translate into right place

		var temp;
		temp = (t.x - o.x) * s.x;
		newleft += temp;

		temp = (t.y - o.y) * s.x;
		newtop += temp;						


		style.left = newleft;
		style.top = newtop;

		style.width = newwidth;
		style.height = newheight;
	}
	,ierender: function(canvas,transformation,projection,optimisations){
		
		if(this.vml){
			this._cssTransform(transformation);
			return;
		}
		var shapetype = this.properties.shape;
		if(shapetype == 'point'){
			return;
		}
		
		var o = transformation.origin;
		var t = transformation.translate;
		var s = transformation.scale;
		var shape = document.createElement("g_vml_:shape");
		var path = "M ";
		
		if(this.coords.length < 2) return;
		var x =o.x+ t.x + this.coords[0];
		var y =o.y+t.y+this.coords[1];
		x = parseInt(x);
		y = parseInt(y);
		
		path+= x + "," +y + " L";
		for(var i =2; i < this.coords.length; i+=2){
			var x =o.x+t.x+this.coords[i];
			var y =o.y+t.y+this.coords[i+1];
			x = parseInt(x);
			y = parseInt(y);
			path += x +"," + y;
			if(i < this.coords.length - 2) path += ", ";
		}
		path += " XE";
		//path ="M 0,0 L50,0, 50,50, 0,50 X";
		shape.setAttribute("class", "easyShape");
		shape.style.height = canvas.height;
		shape.style.width = canvas.width;
		shape.style.position = "absolute";
		shape.style['z-index'] = 1;
		shape.stroked = "t";
		shape.strokecolor = "#000000";
		
		if(this.properties.fill){
			shape.filled = "t";
			shape.fillcolor = this.properties.fill;			
		}
		shape.path = path;
		shape.strokeweight = ".75pt";
		shape.coordsize = parseInt(canvas.width)+"," + parseInt(canvas.height);
		//console.log(shape.coordsize);
		shape.easyShape = this;
		canvas.appendChild(shape);
		this.vml = shape;
		
		this._cssTransform(transformation);
		//console.log("appended");
		//coming soon!
	}
	/*
	render the shape using canvas ctx 
	using ctx and a given transformation in form {translate: {x:<num>, y:<num>}, scale:{translate: {x:<num>, y:<num>}}
	projection: a function that takes xy coordinates and spits out a new x and y
	in a given viewableArea 
	optimisations: boolean - apply optimisations if required
	*/
	,_calculateVisibleArea: function(canvas,transformation){
		var left = 0,top = 0;
		var right =  parseInt(canvas.width) + left; 
		var bottom = parseInt(canvas.height) + top;
		var topleft = EasyMapUtils.undotransformation(left,top,transformation);
		var bottomright = EasyMapUtils.undotransformation(right,bottom,transformation);				
		var frame = {};
		frame.top = topleft.y;
		frame.bottom = bottomright.y;
		frame.right = bottomright.x;
		frame.left = topleft.x;
		return frame;
	}
	
	,_renderPoint: function(){
		var x =this.pointcoords[0];
		var y =this.pointcoords[1];
		this.coords = [x,y];		
		var ps = 5 / s.x;
		var newcoords =[[x-ps,y-ps],[x+ps,y-ps],[x+ps,y+ps],[x-ps, y+ps]];
		var c = this._convertGeoJSONCoords(newcoords);
		this.coords = c;
	}
	,_shapeIsInVisibleArea: function(frame){
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
	
	,_shapeIsTooSmall: function(transformation){
		var t1 = g.x2 -g.x1;
		var t2 =g.y2- g.y1;
		var delta = {x:t1,y:t2};
		delta.x *= s.x;
		delta.y *= s.y;

		if(delta.x < 5 || delta.y < 5) {return false;}//too small
		else
			return true;
	}
	,render: function(canvas,transformation,projection,optimisations){
		if(canvas.browser == 'ie') {
			this.ierender(canvas,transformation,projection,optimisations); 
			return;
		}
		var ctx = canvas.getContext('2d');
		var o = transformation.origin;
		var tr = transformation.translate;
		var s = transformation.scale;

		
		var frame = this._calculateVisibleArea(canvas,transformation);
		var shapetype = this.properties.shape;
		if(shapetype == 'point'){
			this._renderPoint();
		} 
		else if(shapetype!='polygon'){
			console.log("no idea how to draw" +this.properties.shape);
			return;
		}		
		
		if(optimisations){
			if(shapetype != 'point' && frame){ //check if worth drawing				
				if(!this._shapeIsTooSmall(transformation)) return;
				if(!this._shapeIsInVisibleArea(frame))return;		
			}
		}	

		var c;
		
		if(projection)
			c = this._applyProjection(projection,transformation);
		else
			c = this.coords;
			
		if(c.length == 0) return;
				
		var deltas = this._deltas;
		var initialX = parseFloat(c[0]);
		var initialY = parseFloat(c[1]);

		var pathLength = {x: 0, y:0};
		var threshold = 2;
		
		ctx.save();
		ctx.translate(o.x,o.y);
		ctx.scale(s.x,s.y);
		ctx.translate(tr.x,tr.y);
		
		ctx.beginPath();
		ctx.moveTo(initialX,initialY);

		for(var i=2; i < c.length-1; i+=2){
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);
		
			pathLength.x += deltas[i];
			pathLength.y += deltas[i+1];

			var deltax = parseFloat(pathLength.x) * s.x;
			var deltay = parseFloat(pathLength.y)* s.y;
			if(optimisations ||( shapetype == 'point' ||(deltax > threshold || deltay > threshold))){
				ctx.lineTo(x,y);
				pathLength.x = 0;
				pathLength.y = 0;
			}

		}
		//connect last to first
		ctx.lineTo(initialX,initialY);
		ctx.closePath();

		
		if(!this.properties.hidden) {
			ctx.strokeStyle = this.properties.stroke;
			if(typeof this.properties.fill == 'string') 
				fill = this.properties.fill;
			else
				fill = "#ffffff";
				
			ctx.fillStyle = fill;
			ctx.stroke();
			ctx.fill();
		}
		ctx.restore();
		
		
	}/*
	,spherify: function(transformation){
		var newcoords = [];
		var xPos, yPos;
		for(var i=0; i < this.coords.length-1; i+=2){
			coordOK= true;
			var lon = parseFloat(this.coords[i]);
			var lat = parseFloat(this.coords[i+1]);
			var t = EasyMapUtils._spherifycoordinate(lon,lat,transformation);
			if(t.x && t.y){
				newcoords.push(t.x);
				newcoords.push(t.y);
			}
		}
		this._tcoords = newcoords;
		this.createGrid(newcoords);
		return newcoords;
	}*/
	/*,transformcoordinates: function(transformation,spherical,radius){		
		var performScale = true;
		var performTranslate = true; 
		var performRotate = false;
		if(!transformation){
			performScale = false;
			performTranslate = false;
			performRotate = false;
		}
		else{
			var scaling = transformation.scale;
			var translation = transformation.translate;
			if(scaling.x == 1 && scaling.y == 1) {
				performScale = false;
			}
			if(translation.x == 0 && translation.y == 0) {
				performTranslate = false;
			}
			if(transformation.rotate) {
				performRotate = true;
				var rotate = transformation.rotate;
			}
		}
		var transformedCoords = [];
		
		var lastX, lastY;
		var index = 0;
		var coordOK;
		for(var i=0; i < this.coords.length-1; i+=2){
			coordOK= true;
			var lon = parseFloat(this.coords[i]);
			var lat = parseFloat(this.coords[i+1]);
			var xPos, yPos;

			if(spherical){
				var t = EasyMapUtils._spherifycoordinate(lon,lat,rotate,radius);
				xPos = t.x;
				yPos = t.y;
			} else {
				xPos = lon;
				yPos = lat;
			}

			
			if(performTranslate){
				xPos = xPos + parseFloat(translation.x);
				yPos = yPos + parseFloat(translation.y);
			}
						
			if(performScale){
				xPos *= scaling.x;
				yPos *= scaling.y;
			}

			//last but not least center if required
			if(transformation.origin){
				
			xPos += transformation.origin.x;
			yPos +=transformation.origin.y;
			}
			
			
			if(coordOK){ //draw
				transformedCoords.push(xPos);
				transformedCoords.push(yPos);
				index+=2;
				lastX = xPos; lastY = yPos;
			}
		}
		return transformedCoords;
	}*/
};