
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


var EasyMap = function(divID){
	
	var wrapper = document.getElementById(divID);
	this.wrapper = wrapper;
	wrapper.style.position = "relative";
	var img = document.createElement('img');
	img.src='spacer.gif';
	img.id = divID + "_img";
	img.style.left = 0;
	img.style.top = 0;
	img.style.border = 0;
	img.style.position = "absolute";
	var canvas = document.createElement('canvas');
	
	canvas.width = parseInt(wrapper.style.width);
	canvas.height = parseInt(wrapper.style.height);
	
	if(canvas.width == 0){
		canvas.width = 600;
		canvas.height = 400;
	}
	canvas.id = divID + "_canvas";
	canvas.style["z-index"] = 1;

	var map = document.createElement('map');
	map.id = divID + "_imgMap";
	map.name = divID +"_imgMap";
	wrapper.appendChild(canvas);
	wrapper.appendChild(img);

	wrapper.appendChild(map);

	
	this._maxX = 0;
	this._maxY = 0;
	this.canvas = document.getElementById(canvas.id);

	this.drawOnDemand = false;
	if(!this.canvas.getContext){
		this.drawOnDemand = true;
		G_vmlCanvasManager.init_(document); //ie hack	
	}
	this.ctx = this.canvas.getContext('2d');
	
	this.overlay = document.getElementById(img.id)
	this.overlay.useMap = "#"+map.name;
	this.overlay.width = this.canvas.width;
	this.overlay.height = this.canvas.height;
	this.overlay.style["z-index"] = 2;
	this.imageMap = document.getElementById(map.id);
	
	this.scale = {'x':1, 'y':1};
	this.translate = {'x':0, 'y':0};
	
	this.memory = [];
	
	this.oldcolor;
	this.oldstrokecolor;
	
	this.myElement = document.getElementById('myDomElement');
	var that = this;
	
	this.mouseoverHandler = function(e,shape){
	};
	
	this.mouseoutHandler = function(e,shape){

	};
	
	this.clickHandler = function(e,shape){
	};
	

	
};

EasyMap.prototype = {

	
	transform: function(shape){

		shape.transform(this.scale, this.translate);
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
	drawPolygon: function(poly){
			
			var left = this.wrapper.offsetLeft;
			var top = this.wrapper.offsetTop;
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
			this.ctx.moveTo(0,0);
			var x = 0;
			var y=0;
			for(var i=0; i < poly.transformedCoords.length-1; i+=2){
				var x =parseFloat(poly.transformedCoords[i]);
				var y=parseFloat(poly.transformedCoords[i+1]);
				this.ctx.lineTo(x,y);
			
				if(x>this._maxX) this._maxX = x;
				if(y>this._maxY) this._maxY = y;
			}
			//connect last to first
			this.ctx.lineTo(poly.transformedCoords[0],poly.transformedCoords[1], poly.transformedCoords[poly.transformedCoords.length-2],poly.transformedCoords[poly.transformedCoords.length-1]);
			this.ctx.closePath();
			if(!poly.fill) 
			  this.ctx.stroke();
			else 
			  this.ctx.fill();
			
								

		this._makePolygonClickable(poly);
		
		

	
		
	},
	redrawShape: function(shape){
		
		//var alpha = shape;

		//this.drawShape(alpha);
		this.drawShape(shape);
	},
	redraw: function(){
		var existingMem = this.memory;	
		this.clear();

		for(var i=0; i < existingMem.length; i++){
			this.drawShape(existingMem[i]);

		}
		
	},
	clear: function(clearmem){
		this.memory = [];

		this._maxX = 0;
		this._maxY = 0;
		if(this.canvasDrawingEnabled)this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		var m = this.imageMap;
		if (m.hasChildNodes() )
		{
		    while (m.childNodes.length >= 1 )
		    {
		        m.removeChild(m.firstChild );       
		    } 
		}
		
	},
	
	_loadRemoteFile: function(url,callback,params)
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
		this._loadRemoteFile(file,callback);		

		
			
	},
	drawFromSVGElement: function(SVGElement){
		var s = new EasyShape(SVGElement);
		this.drawShape(s);

	},
	
	fitToCanvas: function(){
		this.canvas.width = this._maxX;
		this.canvas.height = this._maxY;
	},

	/*draw from image map */
	drawFromImageMap: function(mapID,backimg){
		this.clear(true);
		
		var map = document.getElementById(mapID).getElementsByTagName('AREA');

		var that = this;
		var doIt = function(){

			for(var x = 0; map[x]; x++ ){
				var s = new EasyShape(map[x]);
				that.drawShape(s);
			}
		};
		
		if(backimg){
			var img = new Image();   // Create new Image object 
			var imgDoIt = function(){
				//img.width = img.width * that.scale.x;
				//img.height = img.height *that.scale.y;
				that.canvas.width = img.width;
				that.canvas.height = img.height;
				that.ctx.drawImage(img, 0, 0);
				doIt();

			}

			img.onload = imgDoIt;
			img.src = backimg;

		}
		else{
			doIt();
		}
		
	},

	
	drawGeoJsonFeatures: function(features){
			var t1 = new Date();
			var avg1 = 0;
			for(var i=0; i < features.length; i++){
				var geometry = features[i].geometry;
				if(geometry.type.toLowerCase() == 'multipolygon'){
					var coords = geometry.coordinates;
					
					for(var j=0; j< coords.length; j++){
						
						var s = new EasyShape(features[i],coords[j],this.canvas);
						
						var z1 = new Date();
						this.drawShape(s);
						var z2 = new Date();
						//console.log(z2-z1,s);
					}


				}
				else {	
					//console.log("unsupported geojson geometry type " + geometry.type);
				}
			}
			
			var t2 = new Date();

			//console.log("draw all" ,t2 -t1,"avg time to create shape", avg1);
	},
	
	drawFromGeojson: function(geojson){
			var t = new Date();
			this.clear();

			if(geojson.type.toLowerCase() == "featurecollection"){
				var features = geojson.features;
				this.drawGeoJsonFeatures(features);
			} else {
				console.log("only feature collections currently supported");
				return;
			}
			var t2 = new Date();
		//	console.log(t2 - t);
		
	},
	drawFromGeojsonFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		

			var json = eval('(' +responseText + ')');
			that.drawFromGeojson(json);
			
			var t = document.getElementById(that.wrapper.id + "_statustext");
			if(t) t.innerHTML = "";
		};
		
		this._loadRemoteFile(file,callback);

	},
	_makePolygonClickable: function(elem){
		if(document.getElementById(elem.id)) return;
		var area = document.createElement("AREA");
		area.shape = elem.shape;
		//area.alt = elem.alt;
		area.coords = elem.transformedCoords;
		area.name = elem.name;
		area.title = elem.tooltip;
		area.id = elem.id;
		var that = this;
		//console.log(that.memory);
		area.onclick = function(e){
			that.clickHandler(e,that.memory[this.id]);
			that.redrawShape(that.memory[this.id]);
		};
		
		area.onmouseover = function(e){
			that.mouseoverHandler(e,that.memory[this.id]);
		}
		
		area.onmouseout = function(e){
			that.mouseoutHandler(e,that.memory[this.id]);
		}
		this.imageMap.appendChild(area);		
	}
		

};

var EasyShape = function(node,coordinates,canvas){
	this.strokeStyle = '#000000';
	this.grid = {};
	this.properties = {};
	this.fillStyle = "#000000"
	this.threshold = 1.7;
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
			
			
			t1 = parseFloat(canvas.width) /2;
			t2 = parseFloat(canvas.height) / 2;
			this.translateMandatory = {'x':t1,'y':t2};
			//this.translateMandatory = {'x':0,'y':0};
			//x += t1;
			//y += t2;
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

	transform: function(scaling, translation){
		//this.transformedCoords = this.coords;return;
		var performScale = true;
		var performTranslate = true;
		
		if(scaling.x == 1 && scaling.y == 1) performScale = false;
		if(translation.x == 0 && translation.y == 0) performTranslate = false;
		
		this.transformedCoords = [];

		this.grid.x1 = 2000;
		this.grid.y1 = 2000;
		this.grid.x2 = 0; this.grid.y2 = 0;
		var lastX, lastY;
		var index = 0;
		for(var i=0; i < this.coords.length-1; i+=2){
			var x =parseFloat(this.coords[i]);
			var y =parseFloat(this.coords[i+1]);

		
			if(performTranslate){

				x = x + parseFloat(translation.x);
				y = y + parseFloat(translation.y);
			}
			if(performScale){
				x *=  scaling.x;
				y *= scaling.y;
			}

			if(this.translateMandatory){
				x += parseFloat(this.translateMandatory.x);
				y += parseFloat(this.translateMandatory.y);
			}
			
			if(x < this.grid.x1) this.grid.x1 = x;
			if(y < this.grid.y1) this.grid.y1 = y;
			
			if(x > this.grid.x2) this.grid.x2 = x;
			if(y > this.grid.y2) this.grid.y2 = y;
			
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
			//else
			//console.log("ignored");
		}
		
		this.grid.midX = this.grid.x1 + (this.grid.x2 - this.grid.x1);
		this.grid.midY = this.grid.y2 + (this.grid.y2 - this.grid.y1);
	

	}
};



