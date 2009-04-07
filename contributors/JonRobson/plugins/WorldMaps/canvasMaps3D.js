//geojson should be handled here - maybe create from geojson

/*coordinates are a string consisting of floats and move commands (M)*/
var VismoShape = function(properties,coordinates,geojson){
	this.grid = {};
	this.coords = [];
	if(geojson){
		this._constructFromGeoJSONObject(properties,coordinates);
	}
	else{
		this._constructBasicShape(properties,coordinates);
	}

	this._iemultiplier = 1000; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..
};
VismoShape.prototype={
	
	render: function(canvas,transformation,projection,optimisations, browser){
		var optimisations = true;
		if(!transformation){
			transformation = {};
		}
		if(!transformation.origin)transformation.origin = {x:0,y:0};
		if(!transformation.scale)transformation.scale = {x:1,y:1};
		if(!transformation.translate)transformation.translate = {x:0,y:0};
		
		var frame = this._calculateVisibleArea(canvas,transformation);
		var shapetype = this.properties.shape;
		if(shapetype == 'text'){
			this._renderTextShape(canvas,transformation);
		}
		else if(shapetype == 'point'){
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
		
		if(shapetype == 'text'){
			//special treatment!
		}
		else if(!canvas.getContext) {
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
		this.coords = coordinates;
		this.grid = {}; //an enclosing grid
		this._calculateBounds();
		if(this.vml) this.vml.path = false; //reset path so recalculation will occur
	}

	,_calculateBounds: function(coords){
		if(this.properties.shape == 'path' | this.properties.shape =='text'){
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
	,_constructTextShape: function(properties,coordinates){
		this.properties = properties;
		var t = document.createElement("div");
		t.className = "easyShape";
		t.style.position = "absolute";
		this._textLabel = t;
		this.setCoordinates(coordinates);
	}
	
	,_constructPolygonShape: function(properties,coordinates){
		this.properties = properties;
		this.setCoordinates(coordinates);
		if(!properties.stroke)properties.stroke = '#000000';		
		if(properties.colour){
			properties.fill =  properties.colour;
		}
	}
	,_constructBasicShape: function(properties, coordinates){
		if(properties.shape == 'text'){
			this._constructTextShape(properties,coordinates);
		}
		else if(properties.shape == 'point'){
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
	
	 /*following 3 functions may be better in VismoMaps*/
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
	,_renderTextShape: function(canvas,transformation){
		var t =this._textLabel;
		var coordinates = this.coords;
		var x= coordinates[0];
		var y =coordinates[1];
		t.innerHTML = this.properties.name;


		
		if(t.parentNode == null){
			t.style.left =   parseInt(x) +"px";
			t.style.top = parseInt(y)+"px";
			t.style.width =  "200px";
			t.style.height = "200px";
			t.style.textAlign = "center";
			
			canvas.appendChild(this._textLabel);
		}
		
		this._cssTransform(t,transformation,false);
		t.style.lineHeight = t.style.height;
	}
	,_canvasrender: function(canvas,transformation,projection,optimisations){
		var c;	
		var shapetype = this.properties.shape;	
		if(projection)
			c = this._applyProjection(projection,transformation);
		else
			c = this.coords;
		
		if(c.length == 0) return;
		
		/*var initialX,initialY;
		var start;
		if(c[0] == 'M'){//starts with an "M"
			initialX = parseFloat(c[1]);
			initialY = parseFloat(c[2]);
			start = 3;
		}
		else{
			initialX = parseFloat(c[0]);
			initialY = parseFloat(c[1]);
			start = 2;			
		}*/

		
		var threshold = 2;

		var ctx = canvas.getContext('2d');

		if(this.properties.lineWidth) ctx.lineWidth = this.properties.lineWidth;
		
		var o = transformation.origin;
		var tr = transformation.translate;
		var s = transformation.scale;
		var r = transformation.rotate;
		ctx.save();

		ctx.translate(o.x,o.y);
		ctx.scale(s.x,s.y);
		ctx.translate(tr.x,tr.y);
		//if(r && r.x)ctx.rotate(r.x,o.x,o.y);

		ctx.beginPath();
		
		//ctx.moveTo(initialX,initialY);

		var move = true;
		for(var i=0; i < c.length-1; i+=2){
			if(c[i]== "M") {
				i+= 1; 
				move=true;
			}
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);	
			if(x == NaN || y == NaN){
				throw "error in VismoShape render: the coordinates for this VismoShape contain invalid numbers";
			}
			else{
				if(move){
					ctx.moveTo(x,y);
					
					//console.log("i found and moved to",x,y);
					move = false;
				}
				else{
					//console.log("line to", x,y);
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
		
		if(projection){
			c = this._applyProjection(projection,transformation);
		}
		else{
			c = this.coords;
		}	
		if(c.length < 2) return;
		

		
		var x =o.x  + c[0];
		var y =o.y+c[1];		
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
			var x =o.x+c[i];
			var y =o.y+c[i+1];
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
	
		if(vml.tagName == 'shape' && (!vml.path || this.properties.shape =='point' ||projection)) {
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
			initTop += o.y;
			var initLeft = parseInt(vml.style.left);
			if(!initLeft) initLeft = 0;
			initLeft += o.x;
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

		//scale
		if(scalingRequired){
			var newwidth = initialStyle.width * s.x;
			var newheight = initialStyle.height * s.y; 	
		}
		//translate into right place

		var temp;
		temp = (t.x - o.x);
		temp *= s.x;
		newleft += temp;

		temp = (t.y - o.y);
		temp *= s.x;
		newtop += temp;						

		style.left = newleft +"px";
		style.top = newtop +"px";
		
		if(scalingRequired){
			style.width = newwidth +"px";
			style.height = newheight + "px";
		}
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
			shape.strokeweight = ".75pt";

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

	
	,_applyProjection: function(projection,transformation){
		var c = this.coords;
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
			/*
			if(!projection.nowrap){
				var diff;
				if(newx > x) diff = newx - x;
				if(x > newx) diff = x - newx;
				if(diff > 100) cok = false; //too extreme change
			}
			*/
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
		var topleft =  VismoClickingUtils.undotransformation(left,top,transformation);
		var bottomright =  VismoClickingUtils.undotransformation(right,bottom,transformation);				
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
		var largest = 2.5;
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
		var area = delta.x * delta.y;
		if(area < 40) 
		{return false;}//too small
		else
			return true;
	}
	
	/*
	render the shape using canvas ctx 
	using ctx and a given transformation in form {translate: {x:<num>, y:<num>}, scale:{translate: {x:<num>, y:<num>}}
	projection: a function that takes xy coordinates and spits out a new x and y
	in a given viewableArea 
	optimisations: boolean - apply optimisations if required
	*/
};
/*requires VismoShapes and VismoController */

var VismoMapController = function(targetjs,elem){ //elem must have style.width and style.height
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
		this.wrapper.appendChild(controlDiv);
		this.wrapper.controlDiv = controlDiv;
	}
	this.transformation = {'translate':{x:0,y:0}, 'scale': {x:1, y:1},'rotate': {x:0,y:0,z:0}};	
	//looks for specifically named function in targetjs
	if(!this.targetjs.transform) alert("no transform function defined in " + targetjs+"!");
	this.wrapper.easyController = this;
	

};
VismoMapController.prototype = {
	addMouseWheelZooming: function(){ /*not supported for internet explorer*/
		var mw = this.wrapper.onmousewheel;
		var that = this;
		var onmousewheel = function(e){
	        	if (!e) /* For IE. */
	                e = window.event;
			e.preventDefault();		
					
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;

	
			var t = VismoClickingUtils.resolveTarget(e);
			
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
	
			var sensitivity = 0.3;
			if(!this.lastdelta) this.lastdelta = delta;
			
			if(delta > this.lastdelta + sensitivity || delta < this.lastdelta - sensitivity){
				
			
				var s =that.transformation.scale;
				
				var pos = VismoClickingUtils.getMouseFromEventRelativeToCenter(e);
				var t=  that.transformation.translate;
				
				var newx,newy;
				if(delta > 0){
					newx = parseFloat(s.x) * 2;
					newy = parseFloat(s.y) * 2;					
				}
				else{
					newx = parseFloat(s.x) / 2;
					newy = parseFloat(s.y) / 2;
				}

				if(newx > 0 && newy > 0){
					s.x = newx;
					s.y = newy;
					that.transform();					
				}

			}
			
			this.lastdelta = delta;
			
			return false;

		}

		
		var element = this.wrapper;
		if (element.addEventListener){
		        /** DOMMouseScroll is for mozilla. */
		
		        element.addEventListener('DOMMouseScroll', onmousewheel, false);
		
		}
		else if(element.attachEvent){
			element.attachEvent("mousewheel", onmousewheel); //safari
		}
		else{ //it's ie.. or something non-standardised. do nowt
		//window.onmousewheel = document.onmousewheel = onmousewheel;	
		}

		
	},

	addMousePanning: function(){
		var that = this;
		var md = that.wrapper.onmousedown;
		var mu = that.wrapper.onmouseup;	
		var mm = that.wrapper.onmousemove;
		var onmousemove = function(e){
			if(!this.easyController)return;
			var p =this.easyController.panning_status;
			if(!p) return;
			if(!p) return;
			var t =  VismoClickingUtils.resolveTarget(e);
	
			if(t.getAttribute("class") == "easyControl") return;
			var pos =  VismoClickingUtils.getMouseFromEventRelativeToElement(e,p.clickpos.x,p.clickpos.y,p.elem);		
			if(!pos)return;
			
			var t = that.transformation;
			//if(this.transformation) t = this.transformation;
			var sc = t.scale;
			
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
			var target =  VismoClickingUtils.resolveTarget(e);
			if(!target) return;

			if(target.getAttribute("class") == "easyControl") return;

			var t = that.transformation.translate;
			var sc =that.transformation.scale; 
			var realpos = VismoClickingUtils.getMouseFromEvent(e);
			if(!realpos) return;
			this.easyController = that;
			
			var element = VismoClickingUtils.resolveTargetWithVismoClicking(e);
			that.panning_status =  {clickpos: realpos, translate:{x: t.x,y:t.y},elem: element,isClick:true};
			
			that.wrapper.onmousemove = onmousemove;
			that.wrapper.style.cursor= "move";
			this.style.cursor = "move";
		
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
		if(!t.scale && !t.translate && !t.rotate) alert("bad transformation applied - any call to setTransformation must contain translate,scale and rotate");
		this.transformation = t;
		//console.log("transformation set",t);
		//this.wrapper.transformation = t;
		this.targetjs.transform(t);
		//console.log("transformation set to ",t);
	},
	createButtonLabel: function(r,type){
		var properties=  {'shape':'path', stroke: '#000000',lineWidth: '1'};
		
		var coords=[];
		if(type == 'earrow'){
			coords =[r,0,-r,0,'M',r,0,0,-r,"M",r,0,0,r];
		}
		else if(type =='warrow'){
			coords =[-r,0,r,0,'M',-r,0,0,r,"M",-r,0,0,-r]; 
		}
		else if(type == 'sarrow'){
			coords =[0,-r,0,r,'M',0,r,-r,0,"M",0,r,r,0];	
		}
		else if(type == 'narrow'){
			coords =[0,-r,0,r,'M',0,-r,r,0,"M",0,-r,-r,0];	
		}
		else if(type == 'plus'){
			coords =[-r,0,r,0,"M",0,-r,0,r];
		}
		else if(type == 'minus'){
			coords = [-r,0,r,0];
		}
		
		return new VismoShape(properties,coords);
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
		var button = new VismoShape(properties,coords);
		button.render(canvas,{translate:{x:0,y:0}, scale:{x:1,y:1},origin:{x:0,y:0}});
		var label = this.createButtonLabel(r,properties.buttonType);
		label.render(canvas,{translate:{x:0,y:0}, scale:{x:1,y:1},origin:{x:offset.x + r,y:offset.y + r}});
		
		canvas.easyClicking.addToMemory(button);
		return button;
	},	
	addControl: function(controlType) {
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
		newCanvas.style.width = width;
		newCanvas.style.height = height;
		newCanvas.width = width;
		newCanvas.height = height;
		newCanvas.style.position = "absolute";
		newCanvas.style.left = 0;
		newCanvas.style.top = 0;
		newCanvas.style.zIndex = 3;
		newCanvas.setAttribute("class","easyControl");
		this.wrapper.appendChild(newCanvas);

		if(!newCanvas.getContext) {
			newCanvas.browser = 'ie';
		}
		newCanvas.easyController = this;
		newCanvas.easyClicking = new VismoClicking(newCanvas);
		
		//newCanvas.memory = [];
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
		var t = this.transformation;
		var s = t.scale;
		var tr = t.translate;
		var style = this.wrapper.style;
		
		
		var width = parseInt(style.width);
		var height = parseInt(style.height);
		if(s.x <= 0) s.x = 0.1125;
		if(s.y <= 0) s.y = 0.1125;
		
		if(s.x > this._maxscale) s.x = this._maxscale;
		if(s.y > this._maxscale) s.y = this._maxscale;
		
		
		if(width && height){
			var max = {};
			max.x = parseFloat((width) - 10) * s.x;//the maximum possible translation
			max.y = parseFloat((height) - 10) * s.y;//the maximum possible translation
	
			if(tr.x > max.x){
				tr.x = max.x;
			}
			else if(tr.x < -max.x){
				tr.x= -max.x;
			}
		
			if(tr.y > max.y){
				tr.y = max.y;
			}
			else if(tr.y < -max.y){
				tr.y= -max.y;
			}
		}

		//console.log(this.transformation.rotate,"rotate");
		this.targetjs.transform(this.transformation);


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
		if(!hit.properties) return false;
		
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
/*
Some common utils used throughout package 
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




var VismoMapUtils = {
	googlelocalsearchurl: "http://ajax.googleapis.com/ajax/services/search/local?v=1.0&q="

	 ,tile2long: function(x,z) {
	  return (x/Math.pow(2,z)*360-180);
	 }
	 ,tile2lat: function(y,z) {
	  var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
	  return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
	 }
	,getLongLatAtXY: function(x,y,eMap){
		
		var res = VismoMapUtils.getLongLatFromMouse(x,y,eMap);
	
		
		return res;
	}
	,getSlippyTileNumber: function(lo,la,zoomL,eMap){
		/*if(eMap && eMap.settings.projection){
			var lola= eMap.settings.projection.xy(lo,la);
			lo = lola.x;
			la =lola.y;
		}
		*/
		var n = Math.pow(2,zoomL);
		
	
		
		var x = lo;
		
		/*var y = Math.log(Math.tan(lat_rad) + (1/Math.cos(lat_rad)));
		var tiley = ((1- (y / Math.PI) ))/2;
		tiley *= n;
		tiley = Math.floor(tiley);
		*/
		
		var tilex = ((lo + 180)/360) *n;

		tilex = Math.floor(tilex);
		tiley =(Math.floor((1-Math.log(Math.tan(la*Math.PI/180) + 1/Math.cos(la*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoomL)));
		
		
		
		return {x: tilex, y:tiley};
	}
	,getLocationsFromQuery: function(query,callback){
		var that = this;
		var fileloadedcallback = function(status,params,responseText,url,xhr){
				var response = eval("("+responseText+")");

				if(response.responseStatus == 200){
					var results = response.responseData.results;
					callback(results);
					
					return;
				}

		};
			
	
		VismoFileUtils.loadRemoteFile(that.googlelocalsearchurl+query,fileloadedcallback);
	}
	,getLongLatFromMouse: function(x,y,easyMap){



		var t =easyMap.controller.transformation;
		var pos = VismoClickingUtils.undotransformation(x,y,t);	
		
		if(easyMap.settings.projection) {
			pos = easyMap.settings.projection.inversexy(pos.x,pos.y,t);
		}

		var lo = pos.x;
		var la = -pos.y;
		
		
		if(la > 85.0511) la =85;
		if(la < -85.0511) la = -85;
		if(lo < -180) lo = -179;
		if(lo > 180) lo=179;
		
		return {latitude: la, longitude: lo};
	}
	,_radToDeg: function(rad){
		return rad / (Math.PI /180);
	},
	_degToRad: function(deg) {
		//return ((deg + 180)/360) ;
		
		return (deg * Math.PI) / 180.0;
	},
	fitgeojsontocanvas: function(json,canvas){ /*canvas must have style width and height properties*/
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
		if(!json.transform.scale) json.transform.scale = {x:1, y:1};
		if(!json.transform.translate) json.transform.translate = {x:0,y:0};
		
		var canvasx =		parseFloat(canvas.style.width);
		var canvasy =parseFloat(canvas.style.height);
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
		
		var transform = {scale:{},translate:{}};
		transform.scale.x = temp;
		transform.scale.y = temp;

		transform.boundingBox = view;

		transform.translate.x = -view.center.x;
		transform.translate.y = view.center.y;//view.center.y;	
		return transform;
	},
	/*does not yet support undoing rotating */
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
	_undospherify: function (x,y,transformation,radius){
		var pos= this._spherifycoordinate(x,y,transformation);
		var latitude = Math.asin(y / radius);
		var longitude = Math.asin(parseFloat(x / radius) / Math.cos(latitude));

				
	
		//if(transformation.rotate.z && longitude != 'NaN')longitude -= transformation.rotate.z;
		//longitude = longitude % (6.28318531);
		//if(longitude < 0) longitude = longitude 

		if(transformation.rotate) {
			var r =transformation.rotate.z;
			//console.log("from",longitude);
			longitude +=r;
		
			//longitude =longitude% (6.28318531);
			
		}
		var lon = VismoMapUtils._radToDeg(longitude);
		var lat = VismoMapUtils._radToDeg(latitude);
		//console.log("to",longitude,r,lon);
		return {x:lon,y:lat};
	},
	_spherifycoordinate: function(lon,lat,transformation,radius){
		//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var utils = VismoMapUtils;
		var res = {};
		
		var longitude = VismoMapUtils._degToRad(lon);
		var latitude = VismoMapUtils._degToRad(lat);
 		var wraplat = false;
 		// assume rotate values given in radians
		if(transformation && transformation.rotate){
			//latitude += transformation.rotate.x;
			
			var rotation =transformation.rotate.z;
			//rotation = transformation.translate.x;
			if(rotation){
				var r =parseFloat(rotation);
			
				var newl =parseFloat(longitude+r);
			
				//console.log(longitude,"->",newl,longitude,r,transformation.rotate.z);
			
				longitude +=r;
			}
			if(transformation.rotate.y){
				latitude += parseFloat(transformation.rotate.y);
				/*var limit =VismoMapUtils._degToRad(85);
				if(latitude <-limit){
					latitude += (2 * limit);
					res.movedNorth = true;
					
				}
				
				if(latitude > limit){
					latitude -= (2 * limit);
					res.movedSouth = true;
					
					
				}
				*/	
				
				//latitude = latitude % 6.28318531;
				
			} 
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
		//console.log(latitude);
		//if(wraplat) res.y = ["M",res.y];
		/*
		
		if(latitude > 85.0511){
			res.y = (-radius) * Math.sin(latitude);	
		}
		else{
		res.y = (radius) * Math.sin(latitude);		
		}
		*/
		
		//if(latitude > 85.0511)
		
		
		if(longitude < 1.57079633 || longitude > 4.71238898){//0-90 (right) or 270-360 (left) then on other side 
			res.x = (radius) * Math.cos(latitude) * Math.sin(longitude);		
		}
		else{
			//console.log(longitude,"bad",transformation.rotate.z);
			res.x = false;
		}
	
		return res;
	}

};
var s = VismoMapUtils.getSlippyTileNumber(0.422812,51.642283,10);
if(s.x == 513 && s.y == 339){
	console.log("ok");
}
else{
	throw "problem with slippy tile number";
}/*
SVG targeted functions withe goal to convert to a geojson structure
*/
var VismoMapSVGUtils= {
	convertSVGToMultiPolygonFeatureCollection: function(xml){			
		var svgu = VismoMapSVGUtils;
		var res = new Object();
		res.type = "FeatureCollection";
		res.features = [];

		var objs = xml.getElementsByTagName("svg:polygon");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPolygonElements(objs));
		objs = xml.getElementsByTagName("polygon");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPolygonElements(objs));
		objs =xml.getElementsByTagName("svg:path");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPathElements(objs));
		objs =xml.getElementsByTagName("path");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPathElements(objs));
		res.transform = {};
		res.transform.translate = {'x':0, 'y':0};
		res.transform.scale = {'x':1, 'y':1};
		return res;
	},
	createFeatureFromSVGPolygonElement: function(svgpoly){
		
		var f = {};
		f.type = 'Feature';
		f.geometry = {};
		f.geometry.type = "MultiPolygon";
		
		//this.shape = "polygon";
		f.geometry.coordinates = this._convertFromSVGPathCoords(svgpoly.getAttribute("points"));
		f.properties = {};
		
		f.properties.name = svgpoly.getAttribute("name")
		f.properties.href= svgpoly.getAttribute("xlink");
	
		if(svgpoly.getAttribute("fill")) {
			f.properties.fill = svgpoly.getAttribute("fill"); 
		}
		
		return f;
		
	},	
	createFeatureFromSVGPathElement: function(svgpath){
		
		var f = {};
		f.type = 'Feature';
		
		f.properties = {};
		f.properties.colour = '#cccccc';
		f.properties.fill = svgpath.getAttribute("fill"); 
		//f.properties.fill = false; //UNCOMMENT ME FOR EDITING MODE
		f.properties.name = svgpath.getAttribute("id");
		f.properties.href= svgpath.getAttribute("xlink");
		f.geometry = {};
		f.geometry.type = "MultiPolygon";
		var p =svgpath.getAttribute("d");
		var t =svgpath.getAttribute("transform");
		var parent = svgpath.parentNode;

		if(!t && parent && parent.getAttribute("transform") && parent.tagName =='g'){
			t = parent.getAttribute("transform");
		}
		
		
		var newp = this._convertFromSVGPathCoords(p,t);
		//if(f.properties.name == 'it_6')console.log(p,newp);
		var coords = newp;
		//console.log(coords[0].length,f.properties.name,f);
		//if(coords[0].length == 1)console.log(coords[0]);
		f.geometry.coordinates = coords;
		return f;
	},
	createFeaturesFromSVGPolygonElements: function(polys){
		var res = [];
		
		for(var i=0; i< polys.length; i++){
			var el = polys[i];
			res.push(this.createFeatureFromSVGPolygonElement(el));
		}
		return res;
	},		
	createFeaturesFromSVGPathElements: function(paths){
		var res = [];
		
		for(var i=0; i< paths.length; i++){
			var el = paths[i];
			var f=this.createFeatureFromSVGPathElement(el);
			res.push(f);
		}
		return res;
	},
	
	_convertFromSVGPathCoords: function(SVGCoordinates,transformation){
		//transformation in form matrix(0.5,0,0,0.5,-180,0)
		var matrix =[],translate=[];
		var bads = [];
		if(transformation){
			if(transformation.indexOf("translate") > -1){ //matrix given!
				transformation=transformation.replace("translate(","");
				transformation=transformation.replace(")","");
				transformation=transformation.replace(" ","");
				translate  = transformation.split(",");
			}			
			if(transformation.indexOf("matrix") > -1){ //matrix given!
				transformation=transformation.replace("matrix(","");
				transformation=transformation.replace(")","");
				transformation=transformation.replace(" ", "");
				matrix  = transformation.split(",");
			}
		}
		var pointPairs = [];
		
		if(SVGCoordinates) {
			var c = SVGCoordinates;

			

			
			c = c.replace(/^\s*(.*?)\s*$/, "$1");
			
			 //fix the svg lazy bug (allowing coordinates in form 4-2 rather than 4,-2) 
			while(c.search(/-?(\d*\.+\d*)\-/g) >-1){
				//console.log("!");
				c = c.replace(/(-?\d*\.?\d*)\-/g,"$1,-")
			}
			
			while(c.search(/([A-Z] *-?\d*\.?\d*) *(-?\d*.?\d* *[A-Z])/gi) >-1){ //sorts out M xx.xx yy.yyL -> M xx.xx,yy.yyL 
				c = c.replace(/([A-Z] *-?\d*\.?\d*) *(-?\d*.?\d* *[A-Z])/gi,"$1,$2")
			}
			
			while(c.search(/([A-Z]\d*\.?\d*) *(\d*\.?\d*[A-Z])/gi) > -1){
				c = c.replace(/([A-Z]\d*\.?\d*) *(\d*\.?\d*[A-Z])/gi,"$1,$2");	
			}
				
			//end fixes
			
			c = c.replace(/(c|L|M|V|H)/gi, " $1"); //create spacing
			c = c.replace(/C|L|M/g, "");//get rid of abs path markers.. absolute coordinates are great
			c = c.replace(/z/gi, " z ");
			//console.log("help",c);
			
			pointPairs = c.split(" ");
			
		}

		var numPairs = pointPairs.length;
		var points = [[]];
		var polyc = [];
		if(numPairs > 0) {
			
		 	var coords, numCoords;

			var last = {'x':0,'y':0};
			for(var i=0; i<numPairs; i++) {
				var pair = pointPairs[i];
				var closeme = false;

				
				if(pair.search(/z|Z/) >-1){
					closeme = true;
					pair = pair.replace("z",""); //close path		
				}		

				if(pair.length > 0){				
					coords = pair.split(",");
					
					if(coords.length > 0){
						var relative = false;
						var x =coords[0];
						var y = coords[1];
						
						if(x.search(/V|H/i) == 0){ //vertical or horizontal command
							if(x.search(/V/) ==0){//vertical absolute
								x = x.substring(1);
								y = last.y;
							}
							else if(x.search(/v/) ==0 ){//vertical relative
								x = parseFloat(last.x + x.substring(1));
								y = last.y;								
							}
							else if(x.search(/h/)==0){//horizontal relative
								y = parseFloat(last.y + x.substring(1));
								x = last.x;								
							}
							else { //horizontal absolute x
								y = x.substring(1);
								x = last.x;	
							}
						
						}
				
					else if(x.search(/[a-z]/) == 0){ //its relative
							relative = true;
							x = x.substring(1);
						
						}

					x =parseInt(x);
					y=parseInt(y);
					}
					
					
					if(x && y){
						
						
						if(relative){
							x+= last.x; y+= last.y;
							//console.log(coords,x,y);
							
						}
						last.x = x; last.y = y;
						if(matrix.length == 6){
							var ox = x, oy=y;							
							x = parseInt((ox * matrix[0]) +   matrix[4]);
							y = parseInt(oy * matrix[3]);
						}
						
						if(translate.length == 2){
							x += parseFloat(translate[0]);
							y += parseFloat(translate[1]);
						}
					
						//console.log(x,y);
						if(typeof x == 'number' && typeof y =='number')	{
							
							polyc.push([x,-y]);
						}
					}
					else{
						//if(coords.length !=0 && coords.indexOf('-'))bads.push(pair);
					} 
				}
				if(closeme){
					points[0].push(polyc);
					polyc = [];
				}

			}
		}
		if(polyc.length >0) points[0].push(polyc);
		//console.log("read error!",bads);
		return points;
	}	
};
var VismoFileUtils= {
	loadRemoteFile: function(url,callback,params,headers,data,contentType,username,password,allowCache)
	{
		//callback parameters: status,params,responseText,url,xhr
		return this._httpReq("GET",url,callback,params,headers,data,contentType,username,password,allowCache);
	}
	/*currently doesnt work with jpg files - ok formats:gifs pngs*/
	,saveImageLocally: function(sourceurl,dest,dothiswhensavedlocally) {
		
		var localPath = getLocalPath(document.location.toString());
		var savePath;
		if((p = localPath.lastIndexOf("/")) != -1) {
			savePath = localPath.substr(0,p) + "/" + dest;
		} else {
			if((p = localPath.lastIndexOf("\\")) != -1) {
				savePath = localPath.substr(0,p) + "\\" + dest;
			} else {
				savePath = localPath + "." + dest;
			}
		}

		
		var onloadfromweb = function(status,params,responseText,url,xhr){
			try{
				saveFile(savePath,responseText);
			}
			catch(e){
				console.log("error saving locally..");
			}
			//eMap.attachBackground(dest);
			var f = function(){
				if(dothiswhensavedlocally)
				dothiswhensavedlocally(dest);
			};
			window.setTimeout(f,0);
		};
		
		var onloadlocally = function(status,params,responseText,url,xhr){
			if(dothiswhensavedlocally)
				dothiswhensavedlocally(dest);
		};
		try{
			VismoFileUtils.loadRemoteFile(savePath,onloadlocally,null,null,null,null,null,null,true);
		}
		catch(e){//couldnt load probably doesn't exist!
			VismoFileUtils.loadRemoteFile(sourceurl,onloadfromweb,null,null,null,null,null,null,true);		
		}
		
		
	}
	,fileExists: function(url){
		
	}
	,_httpReq: function (type,url,callback,params,headers,data,contentType,username,password,allowCache)
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
			else{
				url = url + (url.indexOf("?") < 0 ? "?" : "&");
			}
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
		x.overrideMimeType('text/plain; charset=x-user-defined');
			x.send(data);
		} catch(ex) {
			//console.log(ex);
			throw ex;
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

	,getChildNodeValue: function(ofThisNode){
		var value= "";
		if(ofThisNode.childNodes){
			
			for(var k=0; k < ofThisNode.childNodes.length; k++){
			
				if(ofThisNode.childNodes[k].nodeValue){
					value += ofThisNode.childNodes[k].nodeValue;
				}
			}
		}
		return value;
	}
};
/*some conversion functions that convert to geojson */
var VismoConversion ={
	svgToGeoJson: function(svg,canvas){
		var svgxml = VismoFileUtils._getXML(svg);
		var res = VismoMapSVGUtils.convertSVGToMultiPolygonFeatureCollection(svgxml);
		
		
		//res = VismoMapUtils.fitgeojsontocanvas(res,canvas);
		//console.log(res.boundingBox);
		//res
		//work out here where origin should be (half of the maximum width of the svg coordinate space should be 0)
		return res;
	},
	geoRssToGeoJson : function (georss){
	
		var geojson = {type:"FeatureCollection", features:[]};
		
		var xml =VismoFileUtils._getXML(georss);
		var items = xml.getElementsByTagName("item");
		
		for(var i=0; i < items.length; i++){
			
			var feature = {type:'Feature', geometry:{type:'MultiPolygon', coordinates:[]},properties:{'name':'georss'}};
						
			var fail = false;
			var att = items[i].childNodes;
			for(var j=0; j < att.length; j++){

				
				if(att[j].tagName == 'title' && att[j].firstChild){
					feature.properties.name =att[j].firstChild.nodeValue;
				}
				if(att[j].tagName == 'description' && att[j].firstChild){
					feature.properties.description =att[j].firstChild.nodeValue;
				}
				
				if(att[j].tagName == 'georss:polygon'){
					var geocoordinates = [];
					//console.log(att[j].innerHTML,att[j].firstChild,"inner");

					var geometry = VismoFileUtils.getChildNodeValue(att[j]);
					

					var values = geometry.split(" ");
					if(values[0] != values[values.length-2] |values[1] != values[values.length-1]){
						fail = true;
						console.log("Fail!",geometry.length,geometry);
					
					
					}
					for(var k=0; k < values.length - 1; k+= 2){
						var latitude = parseFloat(values[k]);
						var longitude= parseFloat(values[k+1]);
						geocoordinates.push([longitude,latitude]);
					}
					//console.log(geocoordinates);
					feature.geometry.coordinates.push([geocoordinates]);
				}
				
			}
			if(!fail){
				geojson.features.push(feature);
			}
			else{
				console.log("Unable to construct feature " +feature.properties.name+". Invalid georss coordinates: first and last coordinates should be same. ");
			}
		}

		return geojson;
	}

};
var VismoClickingUtils = {
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

		if(pos.x != 0)
			pos.x /= s.x;
		
		if(pos.y != 0)
			pos.y /= s.y;
			
		pos.x -= tr.x;
		pos.y -= tr.y;			
		return pos;
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
			var target = this.resolveTargetWithVismoClicking(e);
			if(!target)return false;

			var offset = jQuery(target).offset();

			
			if(!offset.left) return false;
			x = e.clientX + window.findScrollX() - offset.left;
			y = e.clientY + window.findScrollY() - offset.top;
			return {'x':x, 'y':y};		
			
	}


	,resolveTargetWithVismoClicking: function(e)
	{
		var node = VismoClickingUtils.resolveTarget(e);
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
	,getMouseFromEventRelativeToCenter: function(e){
		var w,h;
		var target = this.resolveTargetWithVismoClicking(e);
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

/*
VismoClicking adds the ability to associate a dom element with lots of VismoShapes using addToMemory function
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

var VismoClicking = function(element,transformation,easyShapesList){
	if(element.easyClicking) {
		console.log("already has easyClicking");
		var update = element.easyClicking;
		return update;
	}

	this.memory = [];
	element.easyClicking = this;
	if(easyShapesList) this.memory = easyShapesList;
	if(transformation) this.transformation = transformation;
	
};

VismoClicking.prototype = {

	addToMemory: function(easyShape){
		if(!this.memory) this.memory = [];
		easyShape._easyClickingID = this.memory.length;
		this.memory.push(easyShape);
	}
	
	,clearMemory: function(){
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
		
		var node = VismoClickingUtils.resolveTarget(e);
		if(node.getAttribute("class") == 'easyShape') { //vml easyShape
			return node.easyShape;
		}
		var target = VismoClickingUtils.resolveTargetWithVismoClicking(e);
	
		if(!target) return;
		var offset = jQuery(target).offset();
	

		x = e.clientX + window.findScrollX() - offset.left;
		y = e.clientY + window.findScrollY() - offset.top;

		//counter any positioning
		//if(target.style.left) x -= parseInt(target.style.left);
		//if(target.style.top) y -= parseInt(target.style.top);

	
		//var memory = target.memory;
		//var transformation = target.transformation;
		//console.log('memory length: '+memory.length);
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
			var pos =  VismoClickingUtils.undotransformation(x,y,this.transformation);
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
		var res = this._findNeedleInHaystack(x,y,hitShapes);
		
		
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
	}

};

/*
A package for rendering geojson polygon and point features easily
*/

var GeoTag = function(longitude,latitude,properties){
	var geo = {};
	geo.type = "feature";
	geo.geometry = {};
	geo.geometry.type = "point";
	geo.geometry.coordinates = [longitude,latitude];
	geo.properties = properties;
	return geo;	
};

var VismoMap = function(wrapper){  
	var wrapper;
	if(typeof wrapper == 'string')
		wrapper = document.getElementById(wrapper);
	else
		wrapper = wrapper;
		
	this.wrapper = wrapper;
	wrapper.style.position = "relative";
	var that = this;
	this.settings = {};
	this.settings.background = "#AFDCEC";
	this.settings.globalAlpha = 1;
	this.settings.renderPolygonMode = true; //choose not to render polygon shapes (good if you just want to display points)
	
	//this.settings.projection = {x:function(x){return x;}, y: function(y){return y;}};
	this.settings.optimisations = false;
	
	if(!wrapper.style.width) wrapper.style.width = "600px";
	if(!wrapper.style.height) wrapper.style.height= "200px";
	
	var canvas = document.createElement('canvas');
	canvas.width = parseInt(wrapper.style.width);
	canvas.height = parseInt(wrapper.style.height);
	canvas.style.width = wrapper.style.width;
	canvas.style.height = wrapper.style.height;	
	
	canvas.style.zIndex = 1;
	canvas.style.position = "absolute";
	this.canvas = canvas;

	this.feature_reference = {};
	if(!canvas.getContext) {
		this.settings.browser = 'ie';
	}
	else
		this.settings.browser = 'good';
	
	this.easyClicking = new VismoClicking(wrapper);
	wrapper.appendChild(canvas);
	wrapper.easyMaps = this;


	this._setupMouseHandlers();

	this.controller = new VismoMapController(this,this.wrapper);

		
	//run stuff
	this.transform(this.controller.transformation); //set initial transformation
	this._fittocanvas = true;
	this.geofeatures = {};
	this.clear();
};  
VismoMap.prototype = {
	getProjection: function(){
		return this.settings.projection;
	}
	,setProjection: function(projection){
		var easymap = this;
		if(projection == 'GLOBE'){
			easymap._fittocanvas = false;
			this.settings.beforeRender = function(t){
					easymap._createGlobe(easymap.getProjection().getRadius(t.scale ));
			};
			
			this.settings.projection= {
					name: "GLOBE",
					nowrap:true,
					radius: 10,
					direction: 0
					,init: function(){
						this.direction = 0;
					}
					,getRadius: function(){
						return this.radius;
					}
					,inversexy: function(x,y,t){
							var radius =this.getRadius(t.scale);
							var res = VismoMapUtils._undospherify(x,y,t,radius);
							return res;
					}
					,xy: function(x,y,t){
						var radius =this.getRadius(t.scale);
						var res = VismoMapUtils._spherifycoordinate(x,y,t,radius);
						/*
						if(res.movedNorth && this.direction >= 0){
							this.direction = -1;
							res.move= true;
						}
						else if(res.movedSouth && this.direction <= 0){
							this.direction = 1;
							res.move = true;
						}
						
						if(res.y > radius - 10 || res.y < 10-radius){
							
							res.y = false;
						}*/
						return res;
					}
			};
			
			var heightR = parseInt(easymap.wrapper.style.height)  /2;
			var widthR= parseInt(easymap.wrapper.style.width) /2;
			if(widthR > heightR){
				this.settings.projection.radius = heightR;
			}
			else{
				this.settings.projection.radius = widthR;
			}
			
		}
		else{
			this.settings.projection = projection;
		}
	}
	,clear: function(){ /* does this work in IE? */


		this._maxX = 0;
		this._maxY = 0;

		
		if(!this.canvas.getContext) {
			
			return;
		}
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);		
		
		
	},
	
	drawFromGeojson: function(geojson){
			if(typeof geojson == 'string'){
				geojson = eval('(' +geojson+ ')');
			}		
			this._lastgeojson = geojson;
			if(this._fittocanvas){
			 	var t = VismoMapUtils.fitgeojsontocanvas(geojson,this.canvas);
			
				var p =this.getProjection();
				if(p && p.name == "GLOBE") {
					t.translate = {x:0,y:0};
				}
				this.controller.setTransformation(t);
			}

			var type =geojson.type.toLowerCase();		

			if(type == "featurecollection"){
				var features = geojson.features;
				this.drawGeoJsonFeatures(features);
			}  else if(type =='feature') {
				this.drawGeoJsonFeature(geojson);
			} else {
				console.log("only feature collections currently supported");
			}
			this.render();
	},
	drawFromGeojsonFile: function(file){
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		
			that.drawFromGeojson(responseText);
		};
		VismoFileUtils.loadRemoteFile(file,callback);
	}

	,getTransformation: function(){
		return this.canvas.transformation;
	}
	,setTransformation: function(transformation){
		var w =parseInt(this.wrapper.style.width);
		var h = parseInt(this.wrapper.style.height);
		var t =transformation.translate;
		var s = transformation.scale;
	
		this.canvas.transformation = transformation;
		if(!transformation.origin){
			this.canvas.transformation.origin = {};
			var origin = this.canvas.transformation.origin;
			origin.x =w / 2;
			origin.y =h / 2;
		}
		
		if(s.x < 1) s.x = 1;
		if(s.y < 1) s.y = 1;
		
		if(t.x > 180) t.x = 180;
		if(t.x < -180) t.x = -180;
		
		if(t.y > 85.0511) t.y = 85.0511;
		if(t.y < -85.0511) t.y = -85.0511;
		
		var p =this.getProjection();
		if(p && p.name == "GLOBE"){
			if(!this.canvas.transformation.rotate){
				this.canvas.transformation.rotate = {x:0,y:0,z:0};
			}
			
		}
		this.easyClicking.transformation = this.canvas.transformation;
		
	}
	,moveTo: function(longitude,latitude,zoom){
		var newt = {translate:{},scale:{}};
		var transformation =this.getTransformation();
		
		var newxy={};
		newxy.x = - parseFloat(latitude);
		newxy.y = parseFloat(longitude);
		
		if(this.settings.projection){
		 	newxy = this.settings.projection.xy(newxy.x,newxy.y,transformation);
		}
		newt.translate.x = newxy.x;
		newt.translate.y = newxy.y;
		
		if(!zoom){
			zoom =transformation.scale.x;
		}
		else{
			zoom = parseFloat(zoom);
		}
		newt.scale.x = zoom;
		newt.scale.y = zoom;
		this.controller.setTransformation(newt)
		
	}
	,attachBackground: function(imgpath){
		if(this.settings.background){
			this.wrapper.style.background=this.settings.background;
		}
		else{
			this.wrapper.style.background = "";
		}

		if(imgpath) this.settings.backgroundimg = imgpath;
		if(this.settings.backgroundimg){
			if(this.settings.renderPolygonMode) this.settings.globalAlpha = 0.8;	
			this.wrapper.style.backgroundImage = "url('"+this.settings.backgroundimg +"')";		
		}
		else{
			this.wrapper.style.backgroundImage ="none";
		}
	
	}
	,redraw: function(){
		var that = this;

		var f = function(){
			that.clear();
			that.render();
		};
		
		window.setTimeout(f,0);
	},
		
	transform: function(transformation){

		this.setTransformation(transformation);
		this.redraw();

	},


	/*onmouseup and onmousemove are functions with following parameters:
		e,shape,mouse,longitude_latitude,feature
		
	*/
	setMouseFunctions: function(onmouseup,onmousemove,onrightclick,onkeypress){
			if(onmousemove)this.moveHandler =onmousemove;
			if(onmouseup)this.clickHandler = onmouseup;
			//if(ondblclick)this.dblclickHandler = ondblclick;
			if(onrightclick) this.rightclickHandler = onrightclick;
			if(onkeypress) this.keyHandler = onkeypress;
	}
	,_createGlobe: function(radius){
		if(!this.canvas.getContext) {return;}
		var ctx = this.canvas.getContext('2d');
		if(!ctx) return;
		var t =this.controller.transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
		ctx.save();	
		ctx.translate(o.x,o.y);
		ctx.scale(s.x,s.y);
		ctx.translate(tr.x,tr.y);
	
	
		var radgrad = ctx.createRadialGradient(0,0,10,0,0,radius);

		radgrad.addColorStop(0,"#AFDCEC");
		//radgrad.addColorStop(0.5, '#00C9FF');
		radgrad.addColorStop(1, '#00B5E2');
		//radgrad.addColorStop(1, 'rgba(0,201,255,0)');

		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fillStyle = radgrad;
		ctx.fill();
		ctx.restore();

	}
	
	,_setupCanvasEnvironment: function(){
		if(!this.canvas.getContext) return;
		var ctx = this.canvas.getContext('2d');
		var s =this.controller.transformation.scale;
		if(s && s.x)ctx.lineWidth = (1.5 / s.x);
		ctx.globalAlpha = this.settings.globalAlpha;
		ctx.lineJoin = 'round'; //miter or bevel or round	
	},
	render: function(flag){
		var tran =this.canvas.transformation;

		var mem =this.easyClicking.getMemory();
		this._setupCanvasEnvironment()
		var that = this;
		if(this.settings.beforeRender) {
			this.settings.beforeRender(tran);
		}


		var that = this;

		var f = function(){
			var newfragment = document.createDocumentFragment();
			var t1=new Date();
				
			 for(var i=0; i < mem.length; i++){
				mem[i].render(that.canvas,tran,that.settings.projection,that.settings.optimisations,that.settings.browser,newfragment);
			}
			var t2=new Date();
			var time = t2-t1;
			//console.log("done!"+time);
			if(!this._fragment){
				this._fragment= newfragment.cloneNode(true);
				that.canvas.appendChild(this._fragment);
			}
			else{
				//newfragment.childNodes
				//for(var i=0; i < newfragment.childNodes; i++){
					
				//}
			}
			
			//console.log("done in "+ time+"! ");
			var t = document.getElementById(that.wrapper.id + "_statustext");
			if(t) {
				t.parentNode.removeChild(t);	
			}
		};
		if(this.settings.renderPolygonMode)f();
		this.attachBackground();
		
	
	},
	_drawGeoJsonMultiPolygonFeature: function(coordinates,feature){
		for(var j=0; j< coordinates.length; j++){//identify and create each polygon	
			this._drawGeoJsonPolygonFeature(coordinates[j],feature);
		}
		
	},	
	_drawGeoJsonPolygonFeature: function(coordinates,feature){
		var p = feature.properties;
		p.shape = 'polygon';
		var s = new VismoShape(p,coordinates,"geojson",this.settings.projection);
		this.easyClicking.addToMemory(s);
		this.geofeatures[this.easyClicking.getMemoryID(s)] = feature;
	},
	_drawGeoJsonPointFeature: function(coordinates,feature){
		var p = feature.properties;
		p.shape = 'point';
		var s = new VismoShape(p,coordinates,"geojson", this.settings.projection);
		this.easyClicking.addToMemory(s);
		this.geofeatures[this.easyClicking.getMemoryID(s)] = feature;

	},	
	drawGeoJsonFeature: function(feature){
			var geometry = feature.geometry;
			var type =geometry.type.toLowerCase();
			
			if(type == 'multipolygon'){
				this._drawGeoJsonMultiPolygonFeature(feature.geometry.coordinates,feature);
			}
			else if(type == 'polygon'){
				this._drawGeoJsonPolygonFeature(feature.geometry.coordinates,feature);
			}
			else if(type == 'point'){
				this._drawGeoJsonPointFeature(feature.geometry.coordinates,feature);				
			}
			else {	
				console.log("unsupported geojson geometry type " + geometry.type);
			}
	},
	drawGeoJsonFeatures: function(features){
			var avg1 = 0;
			for(var i=0; i < features.length; i++){
				this.drawGeoJsonFeature(features[i]);
			}

	}

	,_setupMouseHandlers: function(e){
		var eMap = this;
		var _defaultClickHandler = function(e,shape,mousepos,ll){};	
		
		var _defaultMousemoveHandler = function(e,shape,mousepos,ll){
			if(mousepos){
				var wid =eMap.wrapper.id+'_tooltip';
				var tt =document.getElementById(wid);
				if(!tt){
					tt = document.createElement('div');
					tt.style.position = "absolute";
					tt.id = wid;
					tt.style.zIndex = 4;
					tt.setAttribute("class","easymaptooltip");
					eMap.wrapper.appendChild(tt);
				}

				var text ="";
				if(shape){
					text =shape.properties.name +"<br>";
				}	
				else{	
					//tt.style.display = "none";
				}
				if(ll){
					var geocoords = "(long:"+ll.longitude+",lat:"+ll.latitude+")";
					tt.innerHTML = text +geocoords;
				}
			
				var x = mousepos.x + 10;
				var y = mousepos.y + 10;
			
				tt.style.left = x + "px";
				tt.style.top = y +"px";
				tt.style.display = "";
				tt.style["z-index"] = 2;
			}
		};
		
		var getParameters = function(e){
			var result = {};
			if(!e) {
				e = window.event;
			}
			
			var code;
			//console.log(e.keyCode,e.which);
			if (e.which) code =e.which;
			else if (e.keyCode) code = e.keyCode;
			
			
		
			var character;
			if(code) character = String.fromCharCode(code);
			
			
			var t = VismoClickingUtils.resolveTargetWithVismoClicking(e);
			if(t.getAttribute("class") == 'easyControl') return false;
			var shape = eMap.easyClicking.getShapeAtClick(e);
			if(shape) {
				result.shape = shape;
				result.feature = eMap.geofeatures[eMap.easyClicking.getMemoryID(shape)];
			}
		
			
			var pos = VismoClickingUtils.getMouseFromEvent(e);
			var x =pos.x;
			var y = pos.y;
			result.mouse = pos;
			result.longitude_latitude = VismoMapUtils.getLongLatFromMouse(x,y,eMap);
			
			result.event = e;
			result.keypressed = character;
			return result;
			
		};
		var onmousemove = function(e){
		
			var pos = VismoClickingUtils.getMouseFromEvent(e);
			var x =pos.x;
			var y = pos.y;
			if(!x || !y ) return;
			var sensitivity = 1;
			if(this.lastMouseMove && x < this.lastMouseMove.x + sensitivity && x > this.lastMouseMove.x -sensitivity) {return;}
			if(this.lastMouseMove &&  y < this.lastMouseMove.y + sensitivity && y > this.lastMouseMove.y -sensitivity) {return;}
			this.lastMouseMove = {};
			this.lastMouseMove.x = x;this.lastMouseMove.y = y;
			
			var r = getParameters(e);
			try{
			eMap.moveHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature);
			}
			catch(e){};
		};
		
		var onmouseup = function(e){
			var r = getParameters(e);
			var button = e.button;
			
			if(!button || button == 0){ //left click
				try{eMap.clickHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed);
				}
				catch(e){}
			}
			else if(button == 2){ //right click
				if(eMap.rightclickHandler){
					var r = getParameters(e);
					try{eMap.rightclickHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed);
					}
					catch(e){};
				}	
			}
			
		};


		var onkeypress = function(e){
			var r = getParameters(e);
			if(eMap.keyHandler){
				try{
				eMap.keyHandler(r.event,r.shape,r.mouse,r.longitude_latitude,r.feature,r.keypressed);
				}
				catch(e){};
			}
		};
		var keypressed = function(event,shape,mouse,lola,feature,key){
			//console.log(key + " was pressed");
		};
		
		var dblclick = function(e){
			
		}
		jQuery(this.wrapper).click(function(e) {
			onmouseup(e);
		});
		
		/*
		$(this.wrapper).dblclick(function(e) {
			alert("Dblclicked!");
			//onmouseup(e);
		});
		*/
		
		document.onkeypress = onkeypress;
		//this.wrapper.onmouseup = onmouseup;
		this.wrapper.onmousemove = onmousemove;
		this.setMouseFunctions(_defaultClickHandler,_defaultMousemoveHandler,false,keypressed);

		
	}
	};

