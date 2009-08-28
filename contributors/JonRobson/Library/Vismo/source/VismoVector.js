var VismoVector = function(vismoShape,canvas){
	
  VismoTimer.start("VismoVector.init");
	this._iemultiplier = 10; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..
	this.vismoShape=  vismoShape;

	this.cache = {};
	this.maxResolution_id_x = 1;
	this._oldproperties = {};
	this.initShape(vismoShape,canvas);
    
    
	vismoShape.vml = this;
	VismoTimer.end("VismoVector.init");		
};

VismoVector.prototype = {
	scrub: function(){
	     VismoTimer.start("VismoVector.scrub");
	     if(this.el){
	    this.el.parentNode.removeChild(this.el);
	    this.el = false;
	    }
	    VismoTimer.end("VismoVector.scrub");
	}
	,initShape: function(vismoShape,canvas){
	    VismoTimer.start("VismoVector.initShape");
	    this.coordinatesHaveChanged();
	    this.el = false;
	    var isVML;
    	var shapetype =vismoShape.properties.shape;       
        this.initialshapetype= shapetype;
        
		if(shapetype == 'point' || shapetype == 'circle'){
    		this._initArc(vismoShape,canvas);
    		isVML = false;
    	}
    	else if(shapetype == 'image'){
    		this._initImage(vismoShape,canvas);
    	}
    	else if(shapetype == 'domElement'){
    	        //this.haveAppended = true;
    	        this.el = vismoShape.getProperty("element");
    	        this.el.style.position = "absolute";
    	        var el = this.el;
    	   
    	        
    	        return;
    	}
    	else{
    		this._initPoly(vismoShape,canvas);
    		isVML = true;
    	}
    	if(isVML && canvas){
    	    var w,h;
    	    if(!canvas){
    	        throw " i need a canvas to do my magic!";
    	    }
    	    if(canvas.width){
    	        w= canvas.width;
    	    } 
    	    else{
    	        w = jQuery(canvas).width();
    	        canvas.width = w;
    	    }
    	    if(canvas.height){
    	        h= canvas.height;
    	    } 
    	    else{
    	        h = jQuery(canvas).height();
    	        canvas.height= h;
    	    }
            
    	    
            	var xspace = parseInt(w);
            	xspace *=this._iemultiplier;
            	var yspace =parseInt(h);
            	yspace *= this._iemultiplier;
            	coordsize = xspace +"," + yspace;
            	this.el.coordsize = coordsize;
    	}
            if(this.vismoShape && this.el){
                //this.el.vismoShape = this.vismoShape;
    	        var nclass= "vismoShape";			
    	        if(shapetype == 'path'){ nclass= "vismoShapePath";}
    	        this.el.setAttribute("class", nclass);
    	        this.style();
    	}
    	var that= this;
	    //jQuery(window).bind("unload", function(){that.el= null;});
		 VismoTimer.end("VismoVector.initShape");
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
		var bb = vismoShape.getBoundingBox();
		this.el = shape;	
		var diameterx = bb.width;
		var radiusx = bb.width/ 2;
		var diametery =  bb.height;
		var radiusy= bb.height/  2;
		
		jQuery(this.el).css({"height": diametery, left:bb.center.x-radiusx, top: bb.center.y-radiusy,"width":diametery,"position":"absolute","z-index":4});			
	}
	,_initPoly: function(vismoShape,canvas){
		VismoTimer.start("VismoVector._initPoly");
		var shape = document.createElement("vismoShapeVml_:shape");
		
		this.el = shape;
		this.el.name=vismoShape.properties.name;
		//var css = jQuery(canvas).css();
		var w =canvas.width;// css.width;
		var h = canvas.height;//css.height;

		
		jQuery(this.el).css({"height": h,"width": w,"position":"absolute","z-index":4});
		
		VismoTimer.end("VismoVector._initPoly");
	}
	,getVMLElement: function(){
		return this.el;
	}
	,_createvmlpathstring: function(transformation,projection){ //mr bottleneck
	    VismoTimer.start("VismoVector.createvmlpathstring");
		var vml = this.el;
		var o,t,s;
		if(transformation){
		    o = transformation.origin;
		    t = transformation.translate;
		    s = transformation.scale;
		}
		else{
		    o = {x:0,y:0};
		    t = {x:0,y:0};
		    s = {x:1,y:1};
		}
		var cindex;
		if(!s || (!s.x && !s.y)){
		    cindex = "1,1";
		}else{
		     cindex= s.x+","+s.y;
		}
		
		if(!this.cache) {this.cache = {};}
	    if(!this.cache[cindex]){ this.cache[cindex] = {};}
	
		if(!this.cache[cindex]["pathstring"]){
		    var path;
		    var buffer = [];
		    var c;
		    if(this.vismoShape.coordinates.normal){
		        c = this.vismoShape.coordinates.normal;
    		}
    		else{
    		    c =this.vismoShape.getCoordinates("normal");
	        }
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
    			else if(c[i] == 'z'){
    			    buffer.push(" XE");
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
        
		    if(this.vismoShapeProperties.shape != "path"){buffer.push(" XE");}
		    this.cache[cindex]["pathstring"] = buffer.join("");
		//console.log(buffer.join(""));
	    }
        
	
	
        VismoTimer.end("VismoVector.createvmlpathstring");
		return this.cache[cindex]["pathstring"];
	
	}

	,transformDomElement: function(transformation,projection){
	    VismoTimer.start("VismoVector.transformDomElement");
		/*var o = transformation.origin, t = transformation.translate,s = transformation.scale;
		*/
		var shape = this.vismoShape;
		var el = this.el;
		var top,left,width,height;
		var bb = shape.getBoundingBox();
		dx = bb.x1;
		dy = bb.y1;
        jQuery(this.el).css({left:dx,top:dy});
        VismoTimer.end("VismoVector.transformDomElement");
	}
	
	,coordinatesHaveChanged: function(){
	    this.coordinatesChanged = true;
	
	}
	
	,_cacheStyle: function(t,s,o){
	    VismoTimer.start("VismoVector._cacheStyle");
	    var vml = this.el;
		if(!this.initialStyle) { //remember original placement
			var initTop = parseInt(vml.style.top);
			if(!initTop) initTop = 0;
			var initLeft = parseInt(vml.style.left);
			if(!initLeft) initLeft = 0;
			var w =parseInt(vml.style.width);
			var h = parseInt(vml.style.height)
			this.initialStyle = {width: w, height: h};
		}
		var initialStyle= this.initialStyle;

		var newwidth = initialStyle.width * s.x;
		var newheight = initialStyle.height * s.y; 	
			
 
		 VismoTimer.end("VismoVector._cacheStyle");
		return { width:newwidth+"px",height:newheight+"px"};
	}
	,_cssTransform: function(transformation,projection){
	   
		VismoTimer.start("VismoVector._cssTransform");
	
		var vml = this.el;
		var st = this.vismoShapeProperties.shape;
	
		if(st == 'circle' || st == 'img' || st == 'domElement'){
		   
			this.transformDomElement(transformation,projection);
			VismoTimer.end("VismoVector._cssTransform");
			return;
		}
		if(!transformation) return;
		var ckey_1, ckey_2;
		if(transformation.cache){
		    ckey_1 = transformation.cache.id1;
		    ckey_2 = transformation.cache.id2;
		}
		else{
		    ckey_1 = "1,1";
		    ckey_2 = "0,0";
		}
		if(!this.cache[ckey_1]) this.cache[ckey_1] = {};

	
        var s =  transformation.scale;
		if(!this.cache[ckey_1][ckey_2]){
		    var o = transformation.origin, t = transformation.translate;
			this.cache[ckey_1][ckey_2] = this._cacheStyle(t,s,o);
		}
	    var style = this.cache[ckey_1][ckey_2];
	    //jQuery(this.el).css(style); //jon
		VismoTimer.end("VismoVector._cssTransform");
	}
	,clear: function(){
			VismoTimer.start("VismoVector.clear");
			var el = this.el;
			
			try{
			        if(el)jQuery(el).css({display:"none"});
			}catch(e){
			};
			VismoTimer.end("VismoVector.clear");
	}
	,render: function(canvas,transformation,projection){
	    VismoTimer.start("VismoVector.render");
        var that = this;
        var shape = this.el;
        this.vismoShapeProperties = this.vismoShape.properties;
        if(!shape){ //try again later
                var f= function(){
                        that.render(canvas,transformation);
                }
                window.setTimeout(f,50);
                return;
        }
        if(!this.haveAppended){ //append element to dom
		    shape._vismoClickingID = this.vismoShapeProperties.id;
		}
	
		if(this.coordinatesChanged) {
		    this._cssTransform(transformation,projection);
			shape.path = this._createvmlpathstring(transformation,projection);//causes slow down..	
			this.coordinatesChanged = false;
			
		}
		
		
			
		var shtype= this.vismoShapeProperties.shape;
		if(this.initialshapetype != shtype){ //shape type has changed force restart
		   this.scrub();
		   this.initShape(this.vismoShape,canvas);
		   this.haveAppended = false;
		}
		if(shtype!="domElement")shape.style.display = "";
		
		if(!this.haveAppended){ //append element to dom
		    if(transformation)this._cssTransform(transformation,projection);
			canvas.appendChild(shape);
			if(shtype == 'domElement'){
    			var vismoShape = this.vismoShape;
                var c = vismoShape.getCoordinates();
                var rw = jQuery(el).width()/2;
                var rh = jQuery(el).height()/2;
          
                jQuery(el).css({position:"absolute",left:c[0],top:c[1]-rh});            	     
			}
			this.haveAppended = true;
		}
		this.style();
        VismoTimer.end("VismoVector.render");
	}
	,style: function(){
        
        VismoTimer.start("VismoVector.style");
        if(!this.vismoShapeProperties){
             this.vismoShapeProperties = this.vismoShape.properties;
         }
        if(this.vismoShapeProperties.hidden){
            jQuery(this.el).css({display:"none"});
        }
         if(this.nochange){
	       
	     	VismoTimer.end("VismoVector.style");
	        return;
	    }
	     jQuery("#log").append("Exiting");
	     this.nochange = true;
	    //if(this.el.className =='label')alert("!");
        
        
 

	    if(this.el.style.display == 'none') this.el.style.display =""
	    
	    
		var shapetype = this.vismoShapeProperties.shape;

		var shape = this.el;
		shape.stroked = "t";

		
		if(this.vismoShapeProperties["z-index"]){
		    shape.style.zIndex = this.vismoShapeProperties["z-index"];
		}
		if(this.vismoShapeProperties.lineWidth) {
			shape.strokeweight =this.vismoShapeProperties.lineWidth + "em";
		}
		else {
			shape.strokeweight = "1em";
		}
	
	
	    var strokergba = this.vismoShapeProperties.stroke;
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
    		    	
		if(!this.vismoShapeProperties["fill"] || shapetype == 'path'){
		    shape.filled = "f";
                    VismoTimer.end("VismoVector.style");
					return;
		}
	
		
		var fill = this.vismoShapeProperties["fill"];
		shape.filled = "t";
		if(fill.indexOf("#") == 0 || fill.indexOf("rgb(") == 0){
	        shape.fillcolor = this.vismoShapeProperties.fill;
	    
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
	    this._oldproperties = VismoUtils.clone(this.vismoShapeProperties);
		VismoTimer.end("VismoVector.style");
		this.nochange = true;
	}

};


var VismoTimer = {
    startsAt:{},
    timed: {},
    clear: function(){
     
     var i;
     for(i in this.timed){
         this.timed[i] = 0;
     }   
    }
    ,start: function(id){
        if(!this.timed[id]) this.timed[id] = 0;
        this.startsAt[id] = new Date();
    },
    end: function(id){
        var d = new Date();
        this.timed[id] += (d-this.startsAt[id]);
    },
    summarise: function(selector){
        var text ="";
        for(i in this.timed){
             text += i +": " + this.timed[i] .toString() +"\n";
               
        }
        jQuery(selector).val(text);
    }
    ,blankf: function(){}
};
VismoTimer.start = VismoTimer.blankf;
VismoTimer.end = VismoTimer.blankf;
