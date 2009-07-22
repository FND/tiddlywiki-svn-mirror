
var VismoCanvasRenderer = {
	renderShape: function(canvas,vismoShape){
	    var ctx = canvas.getContext('2d');
		var shapetype =vismoShape.properties.shape;
		if(vismoShape.properties["lineWidth"]){
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
		if(!t) t= {};
		//ctx.save(); //issue with this in safari..
		if(!t.translate)t.translate = {x:0,y:0};
		if(!t.scale) t.scale = {x:1,y:1};
		    

		//ctx.scale(t.scale.x,t.scale.y);
		if(!t.translate.y) t.translate.y = 0;
		if(!t.translate.x) t.translate.x = 0;
		if(!t.scale.x) t.scale.x = 1;
		if(!t.scale.y) t.scale.y = 1;

		var bb = vismoShape.getBoundingBox();
		if(bb.center){
		    ctx.translate(bb.center.x-(bb.center.x*t.scale.x),bb.center.y-(bb.center.y*t.scale.y));
            ctx.scale(t.scale.x,t.scale.y);	
            ctx.translate(t.translate.x,t.translate.y);
        }
		var bb = vismoShape.getBoundingBox();
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
	
		//ctx.restore(); //issue with this in safari..
	}
	,renderPoint: function(ctx,vismoShape){
	        //ctx.restore();
		var bb =vismoShape.getBoundingBox();
		var dim =vismoShape.getDimensions();
		var radiusx = dim.width / 2;
		var radiusy = dim.height/2;
		var transform = vismoShape.getTransformation();
		if(transform && transform.scale) radiusx*= transform.scale.x;
		
		
		ctx.arc(bb.center.x, bb.center.y, radiusx, 0, Math.PI*2,true);
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
};
var VismoVector = function(vismoShape,canvas){
	this._iemultiplier = 10; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..
	this.vismoShape=  vismoShape;

	this.cache = {};
	this.maxResolution_id_x = 1;
	this.initShape(vismoShape,canvas);
    
	
			
};

VismoVector.prototype = {
	scrub: function(){
	    if(this.el){
	    this.el.parentNode.removeChild(this.el);
	    this.el = false;
	    }
	}
	,initShape: function(vismoShape,canvas){
	    this.coordinatesHaveChanged();
	    this.el = false;
	    var isVML;
    	var shapetype =vismoShape.getShape();        
        this.initialshapetype= shapetype;
        
		if(shapetype == 'point' || shapetype == 'circle'){
    		this._initArc(vismoShape,canvas);
    		isVML = false;
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
                //this.el.vismoShape = this.vismoShape;
    	        var nclass= "vismoShape";			
    	        if(shapetype == 'path') nclass= "vismoShapePath";
    	        this.el.setAttribute("class", nclass);
    	        this.style();
    	}
    	var that= this;
	    jQuery(window).bind("unload", function(){that.el= null;});
		
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
		this.el.setAttribute("name",vismoShape.properties.name);
		var w = jQuery(canvas).width();
		var h = jQuery(canvas).height();

		
		jQuery(this.el).css({"height": h,"width": w,"position":"absolute","z-index":4});
		
	}
	,getVMLElement: function(){
		return this.el;
	}
	,_createvmlpathstring: function(transformation,projection){ //mr bottleneck
	    var t1 = new Date();
		var vml = this.el;
		var o = transformation.origin;
		var t = transformation.translate;
		var s = transformation.scale;
		
		var cindex = s.x+","+s.y;
		if(!this.cache) {this.cache = {};}
	    if(!this.cache[cindex]){ this.cache[cindex] = {};}
	
		if(!this.cache[cindex]["pathstring"]){
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
        
		    if(this.vismoShape.getShape() != "path")buffer.push(" XE");
		    this.cache[cindex]["pathstring"] = buffer.join("");
		//console.log(buffer.join(""));
	    }
        
	
	

        var t2 = new Date();
        VismoTimer.createvmlpathstring += (t2 -t1);
		return this.cache[cindex]["pathstring"];
	
	}

	,transformDomElement: function(transformation,projection){
	
		var o = transformation.origin, t = transformation.translate,s = transformation.scale;
		var top,left,width,height;

		var bb = this.vismoShape.getBoundingBox();
	

			
		dx = bb.x1;
		dy = bb.y1;
		width = bb.width * s.x;
		height = bb.height * s.y;		
	    var top = o.y +((dy+t.y) * s.y);
		var left = o.x + ((dx +t.x) * s.x);
        

		
/*	this.el.style.setAttribute('cssText',"position:absolute;top:"+top+";left:"+left+";width:"+width+";height:"+height+";",0);*/
	jQuery(this.el).css({position:"absolute",width:width,height:height,top:top,left:left});

	}
	
	,coordinatesHaveChanged: function(){
	    this.coordinatesChanged = true;
	}
	,_cssTransform: function(transformation,projection){
		var t1 = new Date();
		var vml = this.el;
		var d1,d2,t;
		var st = this.vismoShape.getShape();
		//var transform = this.vismoShape.getTransformation();
		//this._lastVismoShapeTransform = transform;
		if(vml.tagName == 'arc' || vml.tagName == 'IMG' || st == 'domElement'){
			this.transformDomElement(transformation,projection);
			return;
		}

		var o = transformation.origin, t = transformation.translate,s = transformation.scale;
		var ckey_1 = s.x+","+s.y;
		var ckey_2 = t.x+","+t.y;
		if(!this.cache[ckey_1]) this.cache[ckey_1] = {};
		if(this.coordinatesChanged) {//causes slow down..
			vml.path = this._createvmlpathstring(transformation,projection);	
			this.coordinatesChanged = false;
		}
	
		if(!this.cache[ckey_1][ckey_2]){
			this.cachemisses += 1;
			if(!this.initialStyle) { //remember original placement
				var initTop = parseInt(vml.style.top);
				if(!initTop) initTop = 0;
				var initLeft = parseInt(vml.style.left);
				if(!initLeft) initLeft = 0;
				var w =parseInt(vml.style.width);
				var h = parseInt(vml.style.height)
				this.initialStyle = {top: initTop, left: initLeft, width: w, height: h};
			}
			var translatingRequired = true;
			var initialStyle= this.initialStyle;
			var style = this.el.style;			
			var newtop,newleft;
			newtop = initialStyle.top;
			newleft = initialStyle.left;
			//var bb = this.vismoShape.getBoundingBox();
			//var scalefactor = {x: s.x *transform.scale.x,y:s.y * transform.scale.y};      
			var scalefactor = {x: s.x,y:s.y};      
			newleft += o.x;//- (bb.center.x * transform.scale.x);// - (bb.center.x * scalefactor.x));
			newtop += o.y;// - (bb.center.y * transform.scale.y);// - (bb.center.y * scalefactor.y));;
			
			var newwidth = initialStyle.width * scalefactor.x;
			var newheight = initialStyle.height * scalefactor.y; 	
			
			var temp,left,top;
		/*    	newleft += ((t.x + (transform.translate.x * transform.scale.x)) * s.x);
				newtop += ((t.y + (transform.translate.y * transform.scale.y)) * s.y);		

				newleft += (bb.center.x  - (bb.center.x* transform.scale.x)) * s.x; 				
				newtop += (bb.center.y - (bb.center.y * transform.scale.y)) * s.y;
				*/
			newleft += (t.x * s.x);
			newtop += (t.y * s.y);		
			//newleft += (bb.center.x  - (bb.center.x* transform.scale.x)) * s.x; 				
			//newtop += (bb.center.y - (bb.center.y * transform.scale.y)) * s.y; 

			this.cache[ckey_1][ckey_2] = {left:newleft+"px",top:newtop+"px", width:newwidth+"px",height:newheight+"px"};

		}
		else{
			VismoMap.cachehits += 1;
		}
		var scalingRequired = true;
		if(this._lastTransformation && this._lastTransformation.scale)scalingRequired = eval(this._lastTransformation.scale.x != s.x ||this._lastTransformation.scale.y != s.y)
		
		var that = this;
			if(scalingRequired){
			
		//this.el.style += "filter:progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand')"; 

                /*
				var cssString = "position:absolute;left:"+that.cache[ckey_1][ckey_2].left+";top:"+that.cache[ckey_1][ckey_2].top+";width:"+that.cache[ckey_1][ckey_2].width+";height:"+that.cache[ckey_1][ckey_2].height+";";			
				*/

			
				//that.el.style.setAttribute('cssText',"");
				var style = that.el.style;
				style.left = that.cache[ckey_1][ckey_2].left;
    			style.top =  that.cache[ckey_1][ckey_2].top;
				style.width =  that.cache[ckey_1][ckey_2].width;
				style.height = that.cache[ckey_1][ckey_2].height;
			
				//style.cssText = cssString;
				//that.el.style.zoom = 2;
			}
			else{
			    /*var cssString = "position:absolute;left:"+that.cache[ckey_1][ckey_2].left+";top:"+that.cache[ckey_1][ckey_2].top+";";
			    that.el.style.cssText = cssString;*/
			    var style = that.el.style;
				style.left = that.cache[ckey_1][ckey_2].left;
				style.top =  that.cache[ckey_1][ckey_2].top;
			}
	
		if(transformation.rotate && transformation.rotate.x){
		    style.rotation = VismoMapUtils._radToDeg(transformation.rotate.x);
		}
	
		

			var f = function(){
				//var path = obj._createvmlpathstring(transformation,projection);
				//vml.path = path;
				var nexttransformation = {origin:{},scale:{},translate:{x:0,y:0}};
				nexttransformation.scale.x = transformation.scale.x *2;
				nexttransformation.scale.y = transformation.scale.y *2;
				nexttransformation.origin.x = transformation.origin.x;
				nexttransformation.origin.y = transformation.origin.y;

				//obj._createvmlpathstring(nexttransformation,projection);
				
			};
			if(this.timeout)window.clearTimeout(this.timeout);
			this.timeout = window.setTimeout(f,1000);
			
		this._lastTransformation = {scale:{}};
		this._lastTransformation.scale.x = s.x;
		this._lastTransformation.scale.y = s.y;
		var t2 = new Date();
		VismoTimer.cssTransform += (t2 -t1);
	}
	,clear: function(){
			var el = this.getVMLElement();
			
			try{
			        if(el)jQuery(el).css({display:"none"});
			}catch(e){
			};
	}
	,render: function(canvas,transformation,projection){
	    var t1 = new Date();
        var that = this;
        if(!this.el){ //try again later
                var f= function(){
                        that.render(canvas,transformation);
                }
                window.setTimeout(f,10);
                return;
        }
        this.el._vismoClickingID = this.vismoShape.properties.id;
		this.style();
		var shape = this.getVMLElement();	
		if(this.initialshapetype != this.vismoShape.properties.shape){ //shape type has changed force restart
		   this.scrub();
		   this.initShape(this.vismoShape,canvas);
		   this.haveAppended = false;
		}
		if(this.vismoShape.properties.shape!="domElement")shape.style.display = "";
		this._cssTransform(transformation,projection);
		if(!this.haveAppended){ //append element to dom
			var shape = this.getVMLElement();
			canvas.appendChild(shape);
			this.haveAppended = true;
		}
        var t2 = new Date();
        VismoTimer.render += (t2-t1);
	}
	,style: function(){
        var t1 = new Date();
		var shapetype = this.vismoShape.getShape();

		var shape = this.el;
		shape.stroked = "t";
		

		
		if(this.vismoShape.properties["z-index"]){
		    shape.style.zIndex = this.vismoShape.properties["z-index"];
		}
		if(this.vismoShape.properties.lineWidth) {
			shape.strokeweight = this.vismoShape.properties.lineWidth + "px";
		}
		else {
			shape.strokeweight = "1px";
		}
	
	
	    var strokergba = this.vismoShape.properties.stroke;
        if(strokergba.indexOf("#") == 0 || strokergba.indexOf("rgb(") == 0){
		            shape.strokecolor = strokergba;
				}
				else{
		    		if(!this.vmlstroke){
    					this.vmlstroke =document.createElement("vismoShapeVml_:stroke");
    					shape.appendChild(this.vmlstroke); 
    				}
				
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
    		    }
    		    	
		if(!this.vismoShape.properties["fill"] || shapetype == 'path'){
		    shape.filled = "f";

					return;
		}
	
		
		var fill = this.vismoShape.properties["fill"];
		shape.filled = "t";
		if(fill.indexOf("#") == 0 || fill.indexOf("rgb(") == 0){
	        shape.fillcolor = this.vismoShape.properties.fill;
	   
	    }
	    else{
	        if(!this.vmlfill && shape){
				this.vmlfill =document.createElement("vismoShapeVml_:fill");
				shape.appendChild(this.vmlfill); 
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

        		
				

		var t2 = new Date();
		VismoTimer.style += (t2 - t1);
	}

};


var VismoTimer = {
    "VismoCanvas.render":0,
    VismoShape_render:0,
    cssTransform:0,
    style:0,
    render: 0,
    createvmlpathstring: 0
};


