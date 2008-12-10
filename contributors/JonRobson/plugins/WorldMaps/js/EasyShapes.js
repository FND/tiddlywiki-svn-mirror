
var EasyShape = function(properties,coordinates,geojson,projection){
	if(projection) 
		this.projection = projection;

	this.grid = {};
	this.coords = [];
	if(geojson){
		this.constructFromGeoJSONObject(properties,coordinates);
	}
	else{
		this.constructBasicPolygon(properties,coordinates);
	}
	
	this.createGrid();

};
EasyShape.prototype={
	createGrid: function(coords){
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
			//this.perimeter = 0;
			
			
			for(var i=0; i < coords.length-1; i+=2){
		
				var xPos = parseFloat(coords[i]); //long
				var yPos = parseFloat(coords[i+1]); //lat
				

				
				//this.perimeter += Math.sqrt((deltax*deltax) + (deltay*deltay));
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

	,applyTransformation: function(projection){
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
			if(projection.x && projection.y){
				newx = projection.x(x);
				newy = projection.y(y);
			}
			
			var cok= true;
			if(!projection.nowrap && i >= 2){ //check against wraparound
				if(newx > 0 && c[i-2] < 0 ||newx < 0 && c[i-2] > 0){
					cok= false;
				}
				
				if(newy > 0 && c[i-1] < 0 ||newy < 0 && c[i-1] > 0){
					cok= false;
				}
			}
			
			if(cok){
				if(newx & newy){
					newc.push(newx);
					newc.push(newy);
				}
			}
			
			
		}	
		this._tcoords = newc;
		this.createGrid(this._tcoords);
		return newc;
	}
	/*
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