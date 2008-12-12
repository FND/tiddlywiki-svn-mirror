
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

	,applyProjection: function(projection){
		var c = this.coords;
		if(!projection) return c;
		
		var newc = [];
		for(var i=0; i < c.length-1; i+=2){
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);
			
			if(projection.xy){
				var t = projection.xy(c[i],c[i+1]);
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
	
	/*
	render the shape using canvas ctx 
	using ctx and a given transformation in form {translate: {x:<num>, y:<num>}, scale:{translate: {x:<num>, y:<num>}}
	projection: a function that takes xy coordinates and spits out a new x and y
	in a given viewableArea 
	optimisations: boolean - apply optimisations if required
	*/
	,render: function(ctx,transformation,projection,viewableArea,optimisations){
		var scale = transformation.scale;
		var frame = viewableArea;
		var shapetype = this.properties.shape;
		if(shapetype=='polygon'){		//good shape
		}
		else if(shapetype == 'point'){
			var x =this.pointcoords[0];
			var y =this.pointcoords[1];
			this.coords = [x,y];		
			var ps = 5 / scale.x;
			var newcoords =[[x-ps,y-ps],[x+ps,y-ps],[x+ps,y+ps],[x-ps, y+ps]];
			var c = this._convertGeoJSONCoords(newcoords);
			this.coords = c;
		} 
		else{
			console.log("no idea how to draw" +this.properties.shape);return;
		}		
		
		if(optimisations){
			if(shapetype != 'point' && frame && this.grid){ //check if worth drawing
					var g = this.grid;
					if(g.x2 < frame.left) {
						return;}
					if(g.y2 < frame.top) {
						return;}
					if(g.x1 > frame.right){
						return;
					}
					if(g.y1 > frame.bottom){
						return;	
					}
					var t1 = g.x2 -g.x1;
					var t2 =g.y2- g.y1;
					var delta = {x:t1,y:t2};
					delta.x *= scale.x;
					delta.y *= scale.y;

					if(delta.x < 5 || delta.y < 5) {return;}//too small
			}
		}	
		ctx.beginPath();
		var c;
		
		if(projection)
			c = this.applyProjection(projection);
		else
			c = this.coords;
			
		if(c.length == 0) return;
		
		var deltas = this._deltas;
		var initialX = parseFloat(c[0]);
		var initialY = parseFloat(c[1]);

		var pathLength = {x: 0, y:0};
		var threshold = 2;
		ctx.moveTo(initialX,initialY);

		for(var i=2; i < c.length-1; i+=2){
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);
		
			pathLength.x += deltas[i];
			pathLength.y += deltas[i+1];

			var deltax = parseFloat(pathLength.x) * scale.x;
			var deltay = parseFloat(pathLength.y)* scale.y;
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