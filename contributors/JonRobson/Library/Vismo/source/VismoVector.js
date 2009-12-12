var VismoVector = function(vismoShape,canvas,dimensions){
	
  VismoTimer.start("VismoVector.init");
	this._iemultiplier = 100; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..
	this.vismoShape=  vismoShape;

	this.cache = {};
	this.maxResolution_id_x = 1;
	this._oldproperties = {};
	this.initShape(vismoShape,canvas,dimensions);
    
    
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
	,initShape: function(vismoShape,canvas,dimensions){
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
    	        
    	   
    	        
    	        return;
    	}
    	else{
    		this._initPoly(vismoShape,canvas,dimensions);
    		isVML = true;
    	}
    	var el = this.el;
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
          
    	    

            	el.coordsize = this._getCoordSize(w,h);
    	}
            if(this.vismoShape && el){
                //this.el.vismoShape = this.vismoShape;
    	        var nclass= "vismoShape";			
    	        if(shapetype == 'path'){ nclass= "vismoShapePath";}
    	        el.setAttribute("class", nclass);
    	        this.style();
    	}
    	var that= this;
	    //jQuery(window).bind("unload", function(){that.el= null;});
		 VismoTimer.end("VismoVector.initShape");
	}
	,_getCoordSize: function(w,h){
	  var m =this._iemultiplier;
	  var xspace = parseInt(w);
  	xspace *=m;
  	var yspace =parseInt(h);
  	yspace *= m;
  	var cs = [xspace,",",yspace].join("");
  	
  	return cs;
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
	,_initPoly: function(vismoShape,canvas,dimensions){
		VismoTimer.start("VismoVector._initPoly");
		var shape = document.createElement("vismoShapeVml_:shape");
		
		
		shape.name=vismoShape.properties.name;
		//var css = jQuery(canvas).css();
		var w =dimensions.width;// css.width;
		var h = dimensions.height;//css.height;

    var css = ["height:",h,"px; width:",w,"px; position:absolute;z-index:4;"].join("")
		shape.style.cssText = css;

		//jQuery(this.el).css({"height": h,"width": w,"position":"absolute","z-index":4});
		this.el = shape;
		VismoTimer.end("VismoVector._initPoly");
	}
	,getVMLElement: function(){
		return this.el;
	}
	,_createvmlpathstring: function(transformation,projection){ //mr bottleneck
	  if(this.ranonce) {alert("wtf");throw "neooonoo";}
	  this.ranonce = 1;
	  var multiplier = this._iemultiplier;
	  
	    VismoTimer.start("VismoVector.createvmlpathstring");
		var vml = this.el;

		cindex = "1,1";
		
		
		if(!this.cache) {this.cache = {};}
	    if(!this.cache[cindex]){ this.cache[cindex] = {};}
	    var vshape = this.vismoShape;
		if(!this.cache[cindex]["pathstring"]){
		    var path;
		    var buffer = [];
		    var c =vshape.getCoordinates("normal");
	    
	 
    		if(projection){
    			c = vshape._applyProjection(projection,transformation);
    		}
		
    		if(c.length < 2) return;

    		var x,y;
    		var startAtIndex = 0;
    		if(vshape.isCommand(c[0])){
    		    startAtIndex = 1;
    		}
    		x = c[startAtIndex];
    		y =c[startAtIndex+1];

    				
    		x *=multiplier;
    		y *= multiplier;
    		x = Math.round(x);
    		y = Math.round(y);
 
    		//path = "M";
    		buffer.push("M");
    		//path+= x + "," +y + " L";
    		buffer.push([x,",",y].join(""))
    		var lineTo = false,quadraticCurveTo = false,bezierCurveTo = false;
    		var clen = c.length;
    	for(var i =startAtIndex+2; i < clen; i+=2){
    		var cval = c[i];
    		var multiplier =multiplier;
  			switch(cval){
  			  case 'M':
            buffer.push(" M");
            lineTo = false;
            i+=1;
            break;
      		case 'z':
      		  buffer.push(" XE");
      		  break;
  			  case 'q':
            quadraticCurveTo = true;
            i += 1;
  			    break;
  			  case 'c':
            bezierCurveTo = true;
            i+=1;
            break;
      	}
      	if(lineTo){
  				//path += " ";
  				buffer.push(" ");
  			}
  			else{
  			  buffer.push(" L");
  			}
    		var x =Math.round(c[i] * multiplier);
    		var y =Math.round(c[i+1] * multiplier);

			
    			if(quadraticCurveTo){
    			    var x2 =parseInt(c[i+2] * multiplier);
        			var y2 =parseInt(c[i+3] * multiplier);
    			    buffer.push([" c ",x,",",y,",",x2,",",y2,",",x2,",",y2,""].join(""));
    			    i += 2;
    			    quadraticCurveTo = false;
    			}
    			else if(bezierCurveTo){
    			    var x2 =parseInt(c[i+2] * multiplier);
        			var y2 =parseInt(c[i+3] * multiplier);
        			var x3 = parseInt(c[i+4] * multiplier);
        			var y3 = parseInt(c[i+5] * multiplier);
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
        jQuery(selector).html(text);
    }
    ,blankf: function(){}
};
//VismoTimer.start = VismoTimer.blankf;
//VismoTimer.end = VismoTimer.blankf;
