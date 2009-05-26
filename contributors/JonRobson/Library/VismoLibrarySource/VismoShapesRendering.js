
var VismoCanvasRenderer = {
	renderShape: function(canvas,vismoShape){
	        var ctx = canvas.getContext('2d');
		var shapetype =vismoShape.getProperty("shape");
		if(vismoShape.getProperty("lineWidth")){
			ctx.lineWidth = vismoShape.getProperty("lineWidth");
		}
		
		ctx.save();
                
		ctx.beginPath();
		if(shapetype == 'point' || shapetype =='circle'){
			this.renderPoint(ctx,vismoShape);
		}
		else if(shapetype =='image'){
			this.renderImage(ctx,vismoShape);
		}
		else if(shapetype == "path"){
		       
		        this.renderPath(ctx,vismoShape);
		}
		else{	
			this.renderPath(ctx,vismoShape,true);	
			ctx.closePath();
		        
		}
		
		ctx.strokeStyle = vismoShape.getProperty("stroke")
		if(typeof vismoShape.getProperty("fill") == 'string') 
			fill = vismoShape.getProperty("fill");
		else
			fill = "#ffffff";


		ctx.stroke();
		if(shapetype != 'path') {
			ctx.fillStyle = fill;
			ctx.fill();
		}
	        ctx.restore();
                
                
	        
	}
	,renderPath: function(ctx,vismoShape,join){
		var move = true,quadraticCurve = false,bezierCurve = false;
		var c = vismoShape.getCoordinates();
		var t =vismoShape.getProperty("transformation");
		var t= {}
		if(!t) t= {};
		
		for(var i=0; i < c.length-1; i+=2){
            var isCoord =VismoShapeUtils._isCoordinate(c[i]);
			if(!isCoord){

				if(c[i] == "M"){
				    move=true;
			    }
			    else if(c[i] == "q"){
			        quadraticCurve = true;
			    }
			    else if(c[i] == "c"){
			        bezierCurve = true;
			    }
			    i+=1;
			}
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);	
			
			if(move){ 
				ctx.moveTo(x,y);
			
				move = false;
			}
			else if(quadraticCurve){
			    var x2 = parseFloat(c[i+2]);
			    var y2 = parseFloat(c[i+3]);

			    i+= 2;
			    ctx.quadraticCurveTo(x,y,x2,y2);
			}
			else if(bezierCurve){
			    var x2 = parseFloat(c[i+2]);
			    var y2 = parseFloat(c[i+3]);
                var x3 = parseFloat(c[i+4]);
                var y3 = parseFloat(c[i+5]);
			    i+= 4;
			    ctx.bezierCurveTo(x,y,x2,y2,x3,y3);			    
			}
			else{
			       
				ctx.lineTo(x,y);
			}			
				
				
		}
	}
	,renderPoint: function(ctx,vismoShape){
	        //ctx.restore();
		var bb =vismoShape.getBoundingBox();
		var radius =vismoShape.getRadius();
		var transform = vismoShape.getTransformation();
		if(transform && transform.scale) radius*= transform.scale.x;
		ctx.arc(bb.center.x, bb.center.y, radius, 0, Math.PI*2,true);
	}
	,renderImage: function(ctx,vismoShape){
		var c = vismoShape.getCoordinates();
		var bb = vismoShape.getBoundingBox();
		var draw = function(){
		        if(vismoShape.ready)ctx.drawImage(vismoShape.image,bb.x1,bb.y1,bb.width,bb.height);
		        else window.setTimeout(draw,100);
		};
                draw();

	}
}
var VismoVector = function(vismoShape,canvas){
	this._iemultiplier = 1000; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..
	this.vismoShape=  vismoShape;
	this.el = false;
	var shapetype =vismoShape.getShape();
        var isVML;
        

	if(shapetype == 'point' || shapetype == 'circle'){
		this._initArc(vismoShape,canvas);
		isVML = true;
	}
	else if(shapetype == 'image'){
		this._initImage(vismoShape,canvas);
	}
	else if(shapetype == 'domElement'){
	        this.haveAppended = true;
	        this.el = vismoShape.getProperty("element");
	        this.el.style.position = "absolute";
	        var c = vismoShape.getCoordinates();
	        jQuery(this.el).css({position:"absolute",left:c[0],top:c[1]});
	        return;
	}
	else{
		this._initPoly(vismoShape,canvas);
		isVML = true;
	}
	if(isVML){
        	var xspace = parseInt(canvas.width);
        	xspace *=this._iemultiplier;
        	var yspace =parseInt(canvas.height);
        	yspace *= this._iemultiplier;
        	coordsize = xspace +"," + yspace;
        	this.el.coordsize = coordsize;
	}
        if(this.vismoShape && this.el){
                this.el.vismoShape = this.vismoShape;
	        var nclass= "vismoShape";			
	        if(shapetype == 'path') nclass= "vismoShapePath";
	        this.el.setAttribute("class", nclass);
	        this.style();
	}			
		
			
};

VismoVector.prototype = {
	scrub: function(){
	    if(this.el){
	    this.el.parentNode.removeChild(this.el);
	    }
	}
	,_initImage: function(vismoShape,canvas){

		var that = this;
		var dim = vismoShape.getDimensions();
		var setup = function(){
			var shape = document.createElement("img");
			that.el = shape;
			shape.src = vismoShape.getProperty("src");	
			jQuery(shape).css({"height": dim.height, "width": dim.width,"position":"absolute","z-index":4});		

		};

		var image = new Image();
		image.src = vismoShape.getProperty("src");
		image.onload = function(e){
			setup();
		};
		if(image.complete){
			setup();
		}
		
	}
	,_initArc: function(vismoShape,canvas){
		var shape = document.createElement("vismoShapeVml_:arc");
		shape.startAngle = 0;
		shape.endAngle = 360;
		var radius =  vismoShape.getRadius();
		this.el = shape;	
		jQuery(this.el).css({"height": radius, "width": radius,"position":"absolute","z-index":4});			
	}
	,_initPoly: function(vismoShape,canvas){
		var shape = document.createElement("vismoShapeVml_:shape");
		this.el = shape;
		this.el.setAttribute("name",vismoShape.getProperty("name"));
		var w = jQuery(canvas).width();
		var h = jQuery(canvas).height();
		jQuery(this.el).css({"height": h,"width": w,"position":"absolute","z-index":4});
	
	}
	,getVMLElement: function(){
		return this.el;
	}
	,_createvmlpathstring: function(transformation,projection){ //mr bottleneck
		var vml = this.el;
		var o = transformation.origin;
		var t = transformation.translate;
		var s = transformation.scale;
		var path;
		
		var buffer = [];
		var c =this.vismoShape.getCoordinates();
	
		if(projection){
			c = this.vismoShape._applyProjection(projection,transformation);
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
		buffer.push([x,",",y].join(""))
		var lineTo = false,quadraticCurveTo = false,bezierCurveTo = false;
		for(var i =2; i < c.length; i+=2){
			if(c[i] == 'M') {
				//path += " M";
				buffer.push(" M");
				lineTo = false;
				i+=1;
			}
			else if(c[i] == "q"){
			    quadraticCurveTo = true;
			    i += 1;
			}
			else if(c[i] == "c"){
			    bezierCurveTo = true;
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
			var x =parseInt(c[i] * this._iemultiplier);
			var y =parseInt(c[i+1] * this._iemultiplier);

			
			if(quadraticCurveTo){
			    var x2 =parseInt(c[i+2] * this._iemultiplier);
    			var y2 =parseInt(c[i+3] * this._iemultiplier);
			    buffer.push([" c ",x,",",y,",",x2,",",y2,",",x2,",",y2,""].join(""));
			    i += 2;
			    quadraticCurveTo = false;
			}
			else if(bezierCurveTo){
			    var x2 =parseInt(c[i+2] * this._iemultiplier);
    			var y2 =parseInt(c[i+3] * this._iemultiplier);
    			var x3 = parseInt(c[i+4] * this._iemultiplier);
    			var y3 = parseInt(c[i+5] * this._iemultiplier);
			    buffer.push([" c ",x,",",y,",",x2,",",y2,",",x3,",",y3,""].join(""));
			    i += 4;
			    bezierCurveTo = false;
			}
			else{
			    buffer.push([x,",",y].join(""));
			}
			//path += x +"," + y;
			
			//if(i < c.length - 2) path += "";
		}
		//path += " XE";	
		if(this.vismoShape.getShape() != "path")buffer.push(" XE");
		//console.log(buffer.join(""));

	path = buffer.join("");
	//if(path != vml.getAttribute("path")){
        //if(this.vismoShape.getShape() == "path")alert(path);
		vml.setAttribute("path", path);	
//	}
	
	}

	,transformDomElement: function(transformation,projection){
	
		var o = transformation.origin, t = transformation.translate,s = transformation.scale;
		var top,left,width,height;

		var bb = this.vismoShape.getBoundingBox();
	
		if(this.vismoShape.getShape() == 'image'){
			dx = bb.x1;
			dy = bb.y1;
		}
		else{
			dy = bb.center.y;
			dx = bb.center.x;
		}
		var top = o.y + ((dy + t.y) * s.y);
		var left = o.x + ((dx + t.x) * s.x);
		width = bb.width * s.x;
		height = bb.height * s.y;
		jQuery(this.el).css({'top':top, 'left': left, 'width':width,'height': height});
	}
	,_cssTransform: function(transformation,projection){
		
		var vml = this.el;
		var d1,d2,t;
		var st = this.vismoShape.getShape();
		if(vml.tagName == 'arc' || vml.tagName == 'IMG' || st == 'domElement'){
			this.transformDomElement(transformation,projection);
			return;
		}
		if(vml.tagName == 'shape' && (!vml.path || this.vismoShape.getShape() =='point')) {
			//causes slow down..
			this._createvmlpathstring(transformation,projection);	
		}
		var o = transformation.origin, t = transformation.translate,s = transformation.scale;
		
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
		var temp,left,top;
		newleft += ((t.x) * s.x);
		newtop += ((t.y) * s.y);						
		left = newleft +"px";
		top = newtop +"px";
		

		if(scalingRequired){
			width = newwidth +"px";
			height = newheight + "px";
		}
		
		jQuery(this.el).css({'left': left, 'top': top, 'width': width, 'height': height});
		
		if(transformation.rotate && transformation.rotate.x)style.rotation = VismoMapUtils._radToDeg(transformation.rotate.x);
		this._lastTransformation = {scale:{}};
		this._lastTransformation.scale.x = s.x;
		this._lastTransformation.scale.y = s.y;
	}
	,clear: function(){
			var el = this.getVMLElement();
			
			try{
			        if(el)jQuery(el).css({display:"none"});
			}catch(e){
			};
	}
	,render: function(canvas,transformation,projection){
                var that = this;
	        if(!this.el){
	                var f= function(){
	                        that.render(canvas,transformation);
	                }
	                window.setTimeout(f,10);
	                return;
	        }
		this.style();
		var shape = this.getVMLElement();
		if(this.vismoShape.getShape()!="domElement")shape.style.display = "";
		this._cssTransform(transformation,projection);
		if(!this.haveAppended){
			var shape = this.getVMLElement();
			canvas.appendChild(shape);
			this.haveAppended = true;
		}
	}
	,style: function(){

		var shapetype = this.vismoShape.getShape();

		var shape = this.el;
		shape.stroked = "t";
		

		
		if(this.vismoShape.getProperty("z-index")){
		    shape.style.zIndex = this.vismoShape.getProperty("z-index");
		}
		if(this.vismoShape.getProperty("lineWidth")) {
			shape.strokeweight = this.vismoShape.getProperty("lineWidth") + "px";
		}
		else {
			shape.strokeweight = "1px";
		}
	
		
		if(!this.vismoShape.getProperty("fill") || shapetype == 'path'){
		    shape.filled = "f";
					return;
		}
				var fill = this.vismoShape.getProperty("fill");

				shape.filled = "t";
					
				if(!this.vmlfill){
					this.vmlfill =document.createElement("vismoShapeVml_:fill");
					shape.appendChild(this.vmlfill); 
				}	
				
				if(!this.vmlstroke){
					this.vmlstroke =document.createElement("vismoShapeVml_:stroke");
					shape.appendChild(this.vmlstroke); 
				}
				
				var strokergba = this.vismoShape.getProperty("stroke");
            		if(strokergba){
            		    var stroke;
            		    if(strokergba.indexOf("rgba") != -1 &&strokergba.match(/rgba\([0-9]*,[0-9]*,[0-9]*,(.*)\)/)){
            		        var match =strokergba.match(/(rgb)a(\([0-9]*,[0-9]*,[0-9]*),(.*)\)/);

        					if(match[3]){
        						stroke = match[1] + match[2] +")";
        						this.vmlstroke.opacity = match[3];
        					}
            		    }
            		    else{
            		        stroke = strokergba;
            		    }
            		    this.vmlstroke.color = stroke;
            		}
            		else{
            		    this.vmlstroke.color = "rgb(0,0,0)";
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