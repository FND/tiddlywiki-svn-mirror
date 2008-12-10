
/*
Some common utils used throughout package 
depends on jquery
*/

if(!window.console) {
	console = {
		log:function(message) {
			var d = document.getElementById('consolelogger');
			if(d) {
				d.innerHTML += message+"<<] ";
			}
		}
	};
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
	};
}




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


var EasyMapUtils = {
	_radToDeg: function(rad){
		return rad / (Math.PI /180);
	},
	_degToRad: function(deg) {
		return deg * Math.PI / 180;
	},
	fitgeojsontocanvas: function(json,canvas){
		var view ={};
		var f =json.features;
		for(var i=0; i < f.length; i++){
			var c = f[i].geometry.coordinates;
											
			for(var j=0; j < c.length; j++ ){
				for(var k=0; k < c[j].length; k++){
					

					for(var l=0; l < c[j][k].length;l++){
						
		
						var x =c[j][k][l][0];
						var y = c[j][k][l][1];
						if(!view.x1 || x <view.x1) {
							view.x1 = x;
						}
						else if(!view.x2 || x >view.x2) {
							view.x2 = x;
						}
						
						if(!view.y1 || y <view.y1) {
							view.y1 = y;
						}
						else if(!view.y2 || y >view.y2) {
							view.y2 = y;
						}
						

					}
						
				}
				
			}
		}
		if(!json.transform) json.transform ={};
		if(!json.transform.scale) json.transform.scale = {};
		if(!json.transform.translate) json.transform.translate = {};
		var canvasx =		parseFloat(canvas.width);
		var canvasy =parseFloat(canvas.height);
		view.center = {};
		view.width = (view.x2 - view.x1);
		view.height = (view.y2 - view.y1)
		view.center.x = view.x2 - (view.width/2);
		view.center.y = view.y2 - (view.height/2);
		//console.log(view.center.y, view.height);
		var scale = 1,temp;
		var tempx = parseFloat(canvasx/view.width);
		var tempy = parseFloat(canvasy/view.height);

		if(tempx < tempy) temp = tempx; else temp = tempy;
		json.transform.scale.x = temp;
		json.transform.scale.y = temp;


		
		json.transform.translate.x = -view.center.x;
		json.transform.translate.y = view.center.y;//view.center.y;	
		return json;
	},
	undotransformation: function(x,y,transformation){
		
		var pos = {};
		var t =transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
		if(!x || !y) 
			return false;
		pos.x = x;
		pos.y = y;
		

		pos.x -= o.x;
		pos.y -= o.y;
	
		pos.x /= s.x;
		pos.y /= s.y;
				
		pos.x -= tr.x;
		pos.y -= tr.y;
		/*
		if(t.spherical) {
			pos = this._undospherify(pos.x,pos.y,t);
		}*/

			
			
		return pos;
	},	
	_testCanvas: function(ctx){
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
	
	getMouseFromEventRelativeTo: function (e,x,y){
		
		var pos = this.getMouseFromEvent(e);
		if(!pos) return false;
		pos.x -= x;
		pos.y -= y;

		return pos;
		
	},
	getMouseFromEventRelativeToCenter: function(e){
		var w,h;
		var target = this.resolveTargetWithMemory(e);
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
	},
	getMouseFromEvent : function(e){
			if(!e) e = window.event;
			var target = this.resolveTargetWithMemory(e);
			if(!target)return false;
			
			var offset = $(target).offset();
			if(!offset.left) return false;
			x = e.clientX + window.findScrollX() - offset.left;
			y = e.clientY + window.findScrollY() - offset.top;
			return {'x':x, 'y':y};		
				
	},
	getShapeAtClick: function(e){
		if(!e) {
			e = window.event;
		}
		var target = this.resolveTargetWithMemory(e);
		if(!target) return;
		var offset = $(target).offset();
		

		x = e.clientX + window.findScrollX() - offset.left;
		y = e.clientY + window.findScrollY() - offset.top;
		
		//counter any positioning
		//if(target.style.left) x -= parseInt(target.style.left);
		//if(target.style.top) y -= parseInt(target.style.top);

		var memory = target.memory;
		var transformation = target.transformation;
		//console.log('memory length: '+memory.length);
		if(memory){
			var shape = this.getShapeAt(x,y,memory,transformation);
			return shape;
		} else{
			//console.log("no shapes in memory");
			//return false;
		}
	},
	
	_undospherify: function (x,y,transformation){
		var radius = transformation.spherical.radius;
		var pos= this._spherifycoordinate(x,y,transformation);
		var latitude = Math.asin(y / radius);
		var longitude = Math.asin(parseFloat(x / radius) / Math.cos(latitude));

				
	
		//if(transformation.rotate.z && longitude != 'NaN')longitude -= transformation.rotate.z;
		//longitude = longitude % (6.28318531);
		//if(longitude < 0) longitude = longitude 

		if(transformation.rotate) {
			var r =transformation.rotate.z;
			console.log("from",longitude);
			longitude +=r;
		
			//longitude =longitude% (6.28318531);
			
		}
		var lon = EasyMapUtils._radToDeg(longitude);
		var lat = EasyMapUtils._radToDeg(latitude);
		console.log("to",longitude,r,lon);
		return {x:lon,y:lat};
	},
	_spherifycoordinate: function(lon,lat,transformation){//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var radius = transformation.spherical.radius;
		var utils = EasyMapUtils;
		var res = {};
		
		var longitude = EasyMapUtils._degToRad(lon);
		var latitude = EasyMapUtils._degToRad(lat);
 		
 		// assume rotate values given in radians
		if(transformation && transformation.rotate){
			//latitude += transformation.rotate.x;
			longitude += transformation.rotate.z
			 
		}
		// latitude is 90-theta, where theta is the polar angle in spherical coordinates
		// cos(90-theta) = sin(theta)
		// sin(90-theta) = cos(theta)
		// to transform from spherical to cartesian, we would normally use radius*Math.cos(theta)
		//   hence in this case we use radius*Math.sin(latitude)
		// similarly longitude is phi-180, where phi is the azimuthal angle
		// cos(phi-180) = -cos(phi)
		// sin(phi-180) = -sin(phi)
		// to transform from spherical to cartesian, we would normally use radius*Math.sin(theta)*Math.cos(phi)
		//   we must exchange for theta as above, but because of the circular symmetry
		//   it does not matter whether we multiply by sin or cos of longitude	
	
		longitude = longitude % 6.28318531; //360 degrees		

		res.y = (radius) * Math.sin(latitude);	
		if(longitude < 1.57079633 || longitude > 4.71238898){//0-90 (right) or 270-360 (left) then on other side 
			res.x = (radius) * Math.cos(latitude) * Math.sin(longitude);		
		}
		else{
			res.x = false;
		}
	
		return res;
	},		
	getShapeAt: function(x,y,shapes,transformation) {
		
		if(transformation){
			var pos = this.undotransformation(x,y,transformation);
			x = pos.x;
			y = pos.y;
			
		}
		var hitShapes = [];
		
		for(var i=0; i < shapes.length; i++){
			var g = shapes[i].grid;
			if(x >= g.x1 && x <= g.x2 && y >=  g.y1 && y <=g.y2){
				hitShapes.push(shapes[i]);
			}
		}
		var res;	
		if(hitShapes.length == 1) {
			res = hitShapes[0];
		} else {
			res = this._findNeedleInHaystack(x,y,hitShapes);
		}
			
		return res;
	},
	_findNeedleInHaystack: function(x,y,shapes){
		var hits = [];
		for(var i=0; i < shapes.length; i++){
			if(this._inPoly(x,y,shapes[i])) {
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

	},                     
    	_inPoly: function(x,y,poly) {
		/* _inPoly adapted from inpoly.c
		Copyright (c) 1995-1996 Galacticomm, Inc.  Freeware source code.
		http://www.visibone.com/inpoly/inpoly.c.txt */
		var coords;
		if(poly._tcoords){
			coords = poly._tcoords;
			//console.log("using tcoords",x,y,poly.coords.length,poly._tcoords.length);
		}
		else
			coords= poly.coords;
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
	},	
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
	// Resolve the target object of an event
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
	},

	resolveTargetWithMemory: function(e)
	{
		var node = EasyMapUtils.resolveTarget(e);
		var first = node;
		while(node && !node.memory){
			node = node.parentNode;
		}
		if(!node) node = first;
		return node;
	}
};
