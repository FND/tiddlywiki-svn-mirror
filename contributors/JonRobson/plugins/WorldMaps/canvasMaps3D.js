if(!console){
	var console = function(){};

	console.prototype.log = function(){};
	
}
Array.prototype.contains = function(item)
{
	return this.indexOf(item) != -1;
};

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
};}


var EasyMap = function(divID,imageURL){

	this.renderTime = 0;
	this.calculateTime= 0;
	var wrapper = document.getElementById(divID);	
	this.wrapper = wrapper;

	wrapper.style.position = "relative";
	this.mousemoveHandler = function(e,shape){
	};
	
	
	this.clickHandler = function(e,shape){
	};
	
	this._maxX = 0;
	this._maxY = 0;
	
	this.controls = {};
	var canvas = document.createElement('canvas');
	
	canvas.width = parseInt(wrapper.style.width);
	canvas.height = parseInt(wrapper.style.height);
	if(canvas.width == 0){
		canvas.width = 600;
		canvas.height = 400;
	}
	canvas.id = divID + "_canvas";
	canvas.style["z-index"] = -1;
	wrapper.appendChild(canvas);
	this.canvas = document.getElementById(canvas.id);

	this.drawOnDemand = false;
	if(!this.canvas.getContext){
		this.drawOnDemand = true;
		G_vmlCanvasManager.init_(document); //ie hack	
	}
	this.ctx = this.canvas.getContext('2d');

	this.scale = {'x':1, 'y':1};
	this.translate = {'x':0, 'y':0};
	this.rotate = {'x': 0, 'y':0, 'z':1.6};
	this.spherical =true;
	this.radius = 50;

	this.memory = [];
	
	this.oldcolor;
	this.oldstrokecolor;

	this.myElement = document.getElementById('myDomElement');
	var that = this;
	this.utils = new EasyMapUtils();

	

	
};

EasyMap.prototype = {

	getShapeAt: function(e,x,y){
		if (!e)var e = window.event;
		if(!x && !y){
			var boundingRect = this.canvas.getBoundingClientRect();
			x = e.clientX - boundingRect.left;
			y = e.clientY - boundingRect.top;
		}

		var hits = [];
		for(var i=0; i < this.memory.length; i++){
			var g =this.memory[i].grid;
			if(x >= g.x1 && x <= g.x2 && y >=  g.y1 && y <=g.y2){
				hits.push(this.memory[i]);
			}
		}
			
		var res;	
		if(hits.length == 1) 
			res = hits[0];
		else{
			res = this._findNeedleInHaystack(x,y,hits);
		}
		
		//this.canvas.onmousemove = this.mousemoveHandler;
		//this.canvas.onclick = this.clickHandler;
		return res;
	},
	
	/*source:http://www.scottandrew.com/*/
	_inPoly: function(px,py,p){
		var c = p.transformedCoords;
	     var npoints = c.length; // number of points in polygon
	     var xnew,ynew,xold,yold,x1,y1,x2,y2,i;
	     var inside=false;

	     if (npoints/2 < 3) { // points don't describe a polygon
	          return false;
	     }
	     xold=c[npoints-2];
	     yold=c[npoints-1];

	     for (i=0 ; i < npoints ; i=i+2) {
	          xnew=c[i];
	          ynew=c[i+1];
	          if (xnew > xold) {
	               x1=xold;
	               x2=xnew;
	               y1=yold;
	               y2=ynew;
	          }
	          else {
	               x1=xnew;
	               x2=xold;
	               y1=ynew;
	               y2=yold;
	          }
	          if ((xnew < px) == (px <= xold) && ((py-y1)*(x2-x1) < (y2-y1)*(px-x1))) {
	               inside=!inside;
	          }
	          xold=xnew;
	          yold=ynew;
	     }
	     return inside;

		
		
	},
	_findNeedleInHaystack: function(x,y,shapes){		

		//if(!this.ctx.isPointInPath)return shapes[0]; //need to find a new method
			
		for(var i=0; i < shapes.length; i++){
			if(this._inPoly(x,y,shapes[i])) return shapes[i];
				
		}
		return false;
	},
	addControl: function(controlType) {
		var controlDiv = this.wrapper.controlDiv;
		if(!controlDiv) {
			controlDiv = document.createElement('div');
			controlDiv.style.position = "absolute";
			controlDiv.style.top = "0";
			controlDiv.style.left = "0";
			this.wrapper.appendChild(controlDiv);
			this.wrapper.controlDiv = controlDiv;
			controlDiv = this.wrapper.controlDiv;
		}
		var over = function() {
			this.style.cursor='pointer';
		};
		switch(controlType) {
			case "pan":
				var panControl = document.createElement("div");
				panControl.emap = this;
				panControl.onmouseover = over;
				panControl.onclick = this.panClickHandler;
				var panWest = document.createElement("div");
				panWest.pan = "w";
				panWest.innerHTML = "&larr;";
				panControl.appendChild(panWest);
				var panEast = document.createElement("div");
				panEast.pan = "e";
				panEast.innerHTML = "&rarr;";
				panControl.appendChild(panEast);
				var panNorth = document.createElement("div");
				panNorth.pan = "n";
				panNorth.innerHTML = "&uarr;";
				panControl.appendChild(panNorth);
				var panSouth = document.createElement("div");
				panSouth.pan = "s";
				panSouth.innerHTML = "&darr;";
				panControl.appendChild(panSouth);
				controlDiv.appendChild(panControl);
				break;
			case "zoom":
				var zoomControl = document.createElement("div");
				zoomControl.emap = this;
				zoomControl.onmouseover = over;
				zoomControl.onclick = this.zoomClickHandler;
				var zoomIn = document.createElement("div");
				zoomIn.zoom = 1;
				zoomIn.innerHTML = "+";
				zoomControl.appendChild(zoomIn);
				var zoomOut = document.createElement("div");
				zoomOut.zoom = -1;
				zoomOut.innerHTML = "-";
				zoomControl.appendChild(zoomOut);
				controlDiv.appendChild(zoomControl);
				break;
			default:
				break;
		}
	},
	
	panClickHandler: function(e) {
		var target = e.target;
		var emap = this.emap;
		var dir = target.pan;
		pan = {
			x:0,
			y:0
		};
		switch(dir) {
			case "w":
				pan.x = 100;
				break;
			case "e":
				pan.x = -100;
				break;
			case "n":
				pan.y = 100;
				break;
			case "s":
				pan.y = -100;
				break;
			default:
				break;
		}
		emap.pan(pan.x,pan.y);
	},
	
	
	zoomClickHandler: function(e) {
		var target = e.target;
		var emap = this.emap;
		var zoom = target.zoom;
		if(zoom > 0) {
			emap.zoom(2,2);
		} else {
			emap.zoom(-2,-2);
		}
	},
	
	spin: function(x,y,z){
		this.rotate.x +=x;
		this.rotate.y +=y;
		this.rotate.z +=z;
		console.log(this.rotate.x,this.rotate.y,this.rotate.z);
		this.redraw();
	},
	pan: function(x,y){ //relative to centre
		
		this.translate.x += x;
		this.translate.y += y;
		this.redraw();
	},
	
	zoom: function(scaleX,scaleY){
		this.scale.x += scaleX;
		this.scale.y += scaleY;
		this.redraw();
	},
	
	transform: function(shape){

		shape.transform(this.scale, this.translate,this.rotate,this.spherical,this.radius);
		return shape;
		
	},
	drawShape: function(easyShape){
		easyShape.id = this.memory.length;
		this.memory[easyShape.id] = easyShape;
		easyShape = this.transform(easyShape);
		if(easyShape.shape =='polygon') this.drawPolygon(easyShape);
		else return;
		
	},
	
	_testCanvas: function(){
		this.clear();
		var ctx = this.ctx;
		ctx.beginPath();
		ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
		ctx.moveTo(110,75);
		ctx.arc(75,75,35,0,Math.PI,false);   // Mouth (clockwise)
		ctx.moveTo(65,65);
		ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
		ctx.moveTo(95,65);
		ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
		ctx.stroke();

	},
	

	drawPolygon: function(poly,dontDrawMe){
			
			var left = 0;
			var top = 0;
			var topright =  parseInt(this.canvas.width) + left; 
			var bottomleft = parseInt(this.canvas.height) + top;

			if(poly.grid){
				if(poly.grid.x2 < left) {
					return;}
				if(poly.grid.y2 < top) {
					return;}
				if(poly.grid.x1 > topright){
					return;
				}

				if(poly.grid.y1 > bottomleft){
					return;	
				}

			}
			
			this.ctx.fillStyle =poly.fillStyle;
			this.ctx.strokeStyle = poly.strokeStyle;
			this.ctx.beginPath();

			var x = parseFloat(poly.transformedCoords[0]);
			var y=parseFloat(poly.transformedCoords[1]);
			for(var i=0; i < poly.transformedCoords.length-1; i+=2){
				//this.ctx.moveTo(x,y);
				var x =parseFloat(poly.transformedCoords[i]);
				var y=parseFloat(poly.transformedCoords[i+1]);
				this.ctx.lineTo(x,y);

				if(x>this._maxX) this._maxX = x;
				if(y>this._maxY) this._maxY = y;
			}
			//connect last to first
			this.ctx.lineTo(poly.transformedCoords[0],poly.transformedCoords[1], poly.transformedCoords[poly.transformedCoords.length-2],poly.transformedCoords[poly.transformedCoords.length-1]);
			this.ctx.closePath();
			
			if(!poly.hidden) {
				if(!poly.fill) 
				  this.ctx.stroke();
				else 
				  this.ctx.fill();
			}
	
		
	},
	redrawShape: function(shape){
		this.drawShape(shape);
	},
	redraw: function(){

		var existingMem = this.memory;	
		this.clear();
		if(this.spherical) {

			this.ctx.save();
			this.ctx.translate(this.translate.x,this.translate.y);
			this.ctx.scale(this.scale.x,this.scale.y);
							this.ctx.beginPath();
				//	ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
			this.ctx.arc(0,0,this.radius,0,2*Math.PI,true);
			this.ctx.closePath();
			this.ctx.fillStyle = '#42C0FB';
			//this.ctx.strokeStyle 
				this.ctx.fill();
			this.ctx.restore();

		}

		for(var i=0; i < existingMem.length; i++){
			this.drawShape(existingMem[i]);

		}
		
	},
	clear: function(){
		this.memory = [];

		this._maxX = 0;
		this._maxY = 0;
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.canvas.onclick = this.clickHandler;
		this.canvas.onmousemove = this.mousemoveHandler;
		
	},
	

	
	drawFromSVG: function(file){
		var that = this;
		this.clear();
		var callback = function(status,params,responseText,url,xhr){
			
			var xml = that._getXML(responseText);
			var polys = xml.getElementsByTagName('polygon');
			for(var i=0; i < polys.length; i++)
				that.drawFromSVGElement(polys[i]);
			
		};
		this.utils.loadRemoteFile(file,callback);		
			
	},
	drawFromSVGElement: function(SVGElement){
		var s = new EasyShape(SVGElement);
		this.drawShape(s);

	},
	

	
	drawGeoJsonFeatures: function(features){
			var avg1 = 0;

			for(var i=0; i < features.length; i++){
				var geometry = features[i].geometry;
				if(geometry.type.toLowerCase() == 'multipolygon'){
					var coords = geometry.coordinates;
					
					for(var j=0; j< coords.length; j++){
						
						var s = new EasyShape(features[i],coords[j],this.canvas);
						this.drawShape(s);
					}


				}
				else {	
					//console.log("unsupported geojson geometry type " + geometry.type);
				}
			}

	},
	
	drawFromGeojson: function(geojson){
			//add a mandatory translate to make it appear in center of canvas
			var t1 = parseFloat(this.canvas.width) /2;
			var t2 = parseFloat(this.canvas.height) / 2;
			this.translate.x = t1;
			this.translate.y = t2;
			
			this.clear();

			if(geojson.type.toLowerCase() == "featurecollection"){
				var features = geojson.features;
				this.drawGeoJsonFeatures(features);
			} else {
				console.log("only feature collections currently supported");
				return;
			}

		
	},
	drawFromGeojsonFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		

			var json = eval('(' +responseText + ')');
			that.drawFromGeojson(json);
			
			var t = document.getElementById(that.wrapper.id + "_statustext");
			if(t) t.innerHTML = "";
		};
		
		this.utils.loadRemoteFile(file,callback);

	}
		

};



var EasyShape = function(node,coordinates,canvas){
	this.strokeStyle = '#000000';
	this.grid = {};
	this.properties = {};
	this.fillStyle = "#000000"
	this.threshold = 1.7;
	this.width = canvas.width;
	this.origin= {'x': canvas.width/2, 'y':canvas.height/2};
	if(node){
		if(coordinates) {
			this.constructFromGeoJSON(node,coordinates,canvas);
		}
		else if(node.tagName == "AREA")
			this.constructFromAreaTag(node);
		else if(node.tagName.toLowerCase() == "polygon"){
			this.constructFromSVGPolygon(node);
		}
	}

};

EasyShape.prototype={
	
	
	constructFromSVGPolygon: function(svgpoly){
		this.shape = "polygon";
		this.coords = this._convertFromSVGCoords(svgpoly.getAttribute("points"));
		this.coords_start = this.coords;
		this.href= svgpoly.getAttribute("xlink");
	
		if(svgpoly.getAttribute("fill")) {
			this.fillStyle = svgpoly.getAttribute("fill"); 
			this.fill = true;
			//console.log(this.fillStyle);
		}
		else {
			this.fillStyle = "rgb(0,0,0)"; 
			this.fill = false;
		}
		
	},

/*multi-polygons */
	constructFromGeoJSON: function(node,coordinates,canvas){
		this.shape = "polygon";	
		
		this.coords = this._convertGeoJSONCoords(coordinates,canvas);
		this.transformedCoords = this.coords;
		this.href = "#";
		this.properties = node.properties;
		this.tooltip = node.properties.name;
		this.fill = true;
		this.fillStyle =  node.properties.colour;
		this.grid = {}; //an enclosing grid

	},
		
	constructFromAreaTag: function(node){
		this.shape = node.shape.toLowerCase();
		if(this.shape == 'poly') this.shape= "polygon";
		this.coords = this._getArrayFromString(node.coords);
		
		this.href = node.href;
		this.fill = false;
		this.fillStyle =  "rgb(0,0,0)";
	},
	_convertGeoJSONCoords: function(coords,canvas){
		var res = [];
		for(var i=0; i < coords[0].length; i++){
			var x =coords[0][i][0];
			var y = -coords[0][i][1];
			res.push(x);
			res.push(y);
		}

		
		return res;
	},
	
	_getArrayFromString: function(coords){
		var y = new Array();
		var x =coords.split(",");
		for(i in x){
			y[i] = x[i];
		}

		return y;
	},
	
	_convertFromSVGCoords: function(SVGCoordinates,canvas){
		var pointPairs = [];
		
		if(SVGCoordinates) {
			SVGCoordinates = SVGCoordinates.replace(/^\s*(.*?)\s*$/, "$1");  
			pointPairs = SVGCoordinates.split(" ");
		}

		var numPairs = pointPairs.length;
		var points = [];

		if(numPairs > 0) {

		 	var coords, numCoords;

			for(var i=0; i<numPairs; i++) {
				coords = pointPairs[i].split(",");
				numCoords = coords.length;
				if(numCoords > 1) {
					if(coords.length == 2)
						coords[2] = null;
				}
				points[points.length] = coords[0];
				points[points.length] = coords[1];
			}
		}
		return points;

	},	

	_spherify: function(x,y,radians,radius){//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var res = {};
		
		// convert lat/long to radians
		latitude = Math.PI * (x / 180);
		longitude = Math.PI * (y/ 180);
		//latitude = - latitude;
		// adjust position by radians
		latitude += 1.6; //rotate 90
		
		latitude += radians.x;

		longitude += radians.y;

			
			// and switch z and y
			xPos = (radius) * Math.sin(latitude) * Math.cos(longitude);
			yPos = (radius) * Math.cos(latitude);


		res.x = xPos;
		res.y =yPos;
		return res;
	},
	transform: function(scaling, translation,rotate,spherical,radius){
		var performScale = true;
		var performTranslate = true; 
		
		if(scaling.x == 1 && scaling.y == 1) performScale = false;
		if(translation.x == 0 && translation.y == 0) performTranslate = false;
		if(rotate) performRotate = true;


		this.transformedCoords = [];

		this.grid.x1 = 2000;
		this.grid.y1 = 2000;
		this.grid.x2 = 0; this.grid.y2 = 0;
		var lastX, lastY;
		var index = 0;
		for(var i=0; i < this.coords.length-1; i+=2){
			var x =parseFloat(this.coords[i]);
			var y =parseFloat(this.coords[i+1]);


		
			if(spherical){
				var t= 	this._spherify(x,y,rotate,radius);
				x = t.x;
				y = t.y;
				if(t.hidden)this.hidden = t.hidden
			}


			if(performRotate){
								if(rotate.z){
									u = x ;
									v = y ;
									x =  (u * Math.cos(rotate.z)) - (v * Math.sin(rotate.z));
									y = (v * Math.cos(rotate.z)) + (u * Math.sin(rotate.z));

									u = x ;
									v = y ;


			}

			
			
			if(performScale){
				x *=  scaling.x;
				y *= scaling.y;
			}
			if(performTranslate){

				x = x + parseFloat(translation.x);
				y = y + parseFloat(translation.y);
			}

	


			if(x < this.grid.x1) this.grid.x1 = x;
			if(y < this.grid.y1) this.grid.y1 = y;
			
			if(x > this.grid.x2) this.grid.x2 = x;
			if(y > this.grid.y2) this.grid.y2 = y;
			

			}
			
			if(index > 0){
			var l = Math.sqrt(((x-lastX)*(x-lastX)) + ((y -lastY) * (y-lastY)));
			}
			else
			l = this.threshold;
			
			if(l >= this.threshold){ //draw
				this.transformedCoords[index] = x;
				this.transformedCoords[index+1] = y;
				index += 2;
				lastX = x; lastY = y;
			}
		}
		


	}
};


var EasyMapUtils = function(){	};

EasyMapUtils.prototype = {
	loadRemoteFile: function(url,callback,params)
	{
		return this._httpReq("GET",url,callback,params,null,null,null,null,null,true);
	},

	_httpReq: function (type,url,callback,params,headers,data,contentType,username,password,allowCache)
	{
		//# Get an xhr object
		var x = null;
		try {
			x = new XMLHttpRequest(); //# Modern
		} catch(ex) {
			try {
				x = new ActiveXObject("Msxml2.XMLHTTP"); //# IE 6
			} catch(ex2) {
			}
		}
		if(!x)
			return "Can't create XMLHttpRequest object";
		//# Install callback
		x.onreadystatechange = function() {
			try {
				var status = x.status;
			} catch(ex) {
				status = false;
			}
			if(x.readyState == 4 && callback && (status !== undefined)) {
				if([0, 200, 201, 204, 207].contains(status))
					callback(true,params,x.responseText,url,x);
				else
					callback(false,params,null,url,x);
				x.onreadystatechange = function(){};
				x = null;
			}
		};
		//# Send request
		if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
			window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		try {
			if(!allowCache)
				url = url + (url.indexOf("?") < 0 ? "?" : "&") + "nocache=" + Math.random();
			x.open(type,url,true,username,password);
			if(data)
				x.setRequestHeader("Content-Type", contentType || "application/x-www-form-urlencoded");
			if(x.overrideMimeType)
				x.setRequestHeader("Connection", "close");
			if(headers) {
				for(var n in headers)
					x.setRequestHeader(n,headers[n]);
			}
		//	x.setRequestHeader("X-Requested-With", "TiddlyWiki " + formatVersion());
			x.send(data);
		} catch(ex) {
			//console.log(ex);
			return ex;
		}
		return x;
	},
	
	_getXML:function(str) {
		if(!str)
			return null;
		var errorMsg;
		try {
			var doc = new ActiveXObject("Microsoft.XMLDOM");
			doc.async="false";
			doc.loadXML(str);
		}
		catch(e) {
			try {
				var parser=  new DOMParser();
				var doc = parser.parseFromString(str,"text/xml");
			}
			catch(e) {
				return e.message;
			}
		}

		return doc;	
	}
};


