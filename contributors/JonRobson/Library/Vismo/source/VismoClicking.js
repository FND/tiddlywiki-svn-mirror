var VismoCanvas = function(element,options){
    this._lastTransformation = {scale:{}};

    if(element.length){ //for jquery
        var result = [];
        for(var i=0; i < element.length; i++){
            var x = new VismoCanvas(element[i],options);
            result.push(x);
        }
        return x;
    }
    this.className = "VismoCanvas";
    this._idtoshapemap = {};
    if(!options) options = {};
	if(typeof element == 'string') element= document.getElementById(element);
	if(!element) throw "Element doesn't exist!";
	
	element.style.width = jQuery(element).width();
	element.style.height = jQuery(element).height();
	if(element.vismoClicking) {
		var update = element.vismoClicking;
		return update;
	}
	if(!options.pointsize){
        options.pointsize = 5;
    }	

	this.options = options;

	var wrapper = element;
	
	this.settings = {};
	this.settings.browser = !VismoUtils.browser.isIE ? 'good' : 'ie'
	this.settings.globalAlpha = 1;
	var canvas;
	var hideoverflow;
	if(this.settings.browser =='good'){
	    canvas = document.createElement('canvas');
	    hideoverflow = canvas;
	}    
	else
	{
	    hideoverflow = document.createElement("div");
	    canvas = document.createElement('div');
	    canvas.className = "VismoIECanvas";
	    canvas.style.setAttribute('cssText', 'position:absolute;left:0px;top:0px;', 0);
	    hideoverflow.appendChild(canvas);
	    
	}
	
	
	//.VismoIECanvas
	var width =parseInt(wrapper.style.width);
	var height =parseInt(wrapper.style.height);
	canvas.width = width;
	canvas.height = height;
	
	this.setTransformation({translate:{x:0,y:0},scale:{x:1,y:1},origin:{x:canvas.width/2, y:canvas.height/2}});
	if(!element.className)element.className = "VismoCanvas";
	jQuery(canvas).css({width:width, height:height,'z-index':1,position:'absolute'});        
	element.appendChild(hideoverflow);
	jQuery(hideoverflow).css({width:width, height:height,position:"absolute",overflow:"hidden",left:"0px",top:"0px"});
	var labels =  document.createElement("div");
    jQuery(labels).css({position:"absolute","z-index":9});      
    labels.className = "VismoLabels";
    wrapper.appendChild(labels);
    this.labelHolder = labels;
    this.labels = [];
	this.canvas = canvas;

	this.memory = [];
	
	element.vismoClicking = true;//this;//true;//this
    jQuery(this.canvas).mousedown(function(e){e.preventDefault();});

	this.wrapper = wrapper;

	this._setupMouse();

    var vc = this;
	if(options.vismoController){
	    if(!options.vismoController.handler){
	        options.vismoController.handler = function(t){
	            vc.transform(t);
	        }
	    }
	    this.vismoController = new VismoController(this.getDomElement(),options.vismoController);
	}
	
	this.mouse({down:options.mousedown,up:options.mouseup,move:options.move,dblclick:options.dblclick,keypress:options.keypress});
	var tooltipfunction;
	if(options.tooltipfunction){
	    if(typeof options.tooltipfunction == 'boolean'){
	        tooltipfunction = function(el,s){
	            if(s){
	                el.innerHTML = "cool"+s.getProperty("id");}
	            }
	    }
	    else{
	        tooltipfunction = options.tooltipfunction;
	    }
	    this.addTooltip(tooltipfunction)
	}

	if(options.shapes) {
		for(var i=0; i < options.shapes.length; i++){
	        
			this.add(options.shapes[i]);
		
		}
		this.render();
	}
	
	var x = window.onbeforeunload;
	var that = this;

	window.onbeforeunload =function(){
	    that.teardown();
	    x();
    };

};

VismoCanvas.prototype = {
    teardown: function(){
        VismoUtils.scrubNode(this.canvas);
        VismoUtils.scrubNode(this.wrapper);
        VismoUtils.scrubNode(this.labelHolder); 
       jQuery(this.canvas).unbind("mousedown");
       this.wrapper.onmouseout = null;
       this.wrapper.onmouseover = null;
      
        
    }
	,getDomElement: function(args){
		return this.wrapper;
	}
	,addTooltip: function(args){
	    var addContent = arguments[0];
	    var wrapper = this.wrapper;
	        if(addContent) this.tooltipAddContent = addContent;
	        if(!this.tooltip){
	                var tooltip =  document.createElement("div");
                        jQuery(tooltip).css({position:"absolute","z-index":1000,display:"none"});      
                        tooltip.className = "VismoTooltip";
                        
                        jQuery(tooltip).mousedown(function(e){e.preventDefault();if(wrapper && wrapper.onmousedown)wrapper.onmousedown(e);});
                        jQuery(tooltip).mousemove(function(e){e.preventDefault();});
                        jQuery(this.wrapper).parent().append(tooltip);
                        this.tooltip = tooltip;
                        
        		                       
                }
                if(!this.tooltipAdded){
                        var move= this.onmousemove;
                        var that = this;
                        var lastshape;
        		var newmove = function(e,shape){
        		        if(!e) e = window.event;
        		        if(!that.tooltip) return;     
                                jQuery(that.tooltip).html("");
                        
                        if(shape && lastshape != shape){
                                var bb = shape.getBoundingBox();
                           	    //var pos = VismoClickingUtils.getMouseFromEvent(e);
                		        if(that.tooltipAddContent)that.tooltipAddContent(that.tooltip,shape);
                		        var pos = VismoTransformations.applyTransformation(bb.x2,bb.y1,that.getTransformation())
                		        //var pos= {x: bb.center.x, y:bb.center.y};
                		        var w = jQuery(that.wrapper).width();
                		        var h = jQuery(that.wrapper).height();
                		        var off = jQuery(that.wrapper).offset();
                		        if(pos.x > off.left + w) pos.x = off.left + w;
                		        
                		        //jQuery(that.tooltip).css({top:0, right:0});             
                                }
        		        if(that.tooltipAddContent && shape){
        		                that.tooltipAddContent(that.tooltip,shape);
        		                lastshape = shape;
        		                jQuery(that.tooltip).css({display:""});
        		        }
        		        else{
     		                  jQuery(that.tooltip).css({display:"none"});
        		        }     
        		        if(move)move(e,shape);
        		        
        		};
        		this.onmousemove = newmove;
                        this.tooltipAdded = true;
                }
	}
	,getXYWindow: function(args){
	    var e = arguments[0];
	       var t = this.getTransformation();
	       var pos = this.getXY(e);
	       return  VismoTransformations.applyTransformation(pos.x,pos.y,t);
	}
	,getXY: function(args){
	    var e = arguments[0];
		return VismoTransformations.getXY(e,this.getTransformation());
	}
	,mouse: function(args){
	    var args = arguments[0];
	    if(!args){
	        return {up: this.onmouseup, down: this.onmousedown, move: this.onmousemove, dblclick: this.ondblclick,keypress:this.onkeypress};
	    }
	    else{
	        
	        if(args.down)this.onmousedown = args.down;
    		if(args.up)this.onmouseup = args.up;
    		if(args.move)this.onmousemove=  args.move;
    		if(args.dblclick) this.ondblclick = args.dblclick;
    		if(args.keypress) this.onkeypress = args.keypress;

    		//if(this.madeMoveable) this.makeMoveable();
    		//if(this.tooltipAdded) this.addTooltip();	        
	    }
	}

	,_setupMouse: function(args){
		var that = this;
		this.onmousedown = function(e,s,pos){};
		this.onmouseup = function(e,s,pos){};
		this.onmousemove = function(e,s,pos){};
		this.ondblclick = function(e,s,pos){};
		this.onkeypress = function(e){};
	

		this._applyMouseBehaviours(this.wrapper);
		for(var i =0; i < this.wrapper.childNodes.length; i++){
			var child = this.wrapper.childNodes[i];
			//this._applyMouseBehaviours(child);
		}
	
	}
	,_applyMouseBehaviours: function(args){
	    var el = arguments[0];
	        var that = this;
		var newbehaviour = function(e){
				var t = VismoClickingUtils.resolveTargetWithVismo(e);
                                
				//if(t && t.getAttribute("class") == 'vismoControl') return false;
				var shape = that.getShapeAtClick(e);
				return shape;
			
		};
	    var applymice = function(el){
	        var down = el.onmousedown;
    		var up = el.onmouseup;
    		var mv = el.onmousemove;
    		var dblclick =el.ondblclick;
    		this.initialKeyPress = window.onkeypress;
    		//el.oncontextmenu=function(args) {  return false}; 		
    		el.onmouseover = function(e){

    				if(!that.keypressactive) {

    					that.keypressactive =  true;
    					/*window.onkeypress = that.onkeypress;
    					document.onkeypress = function(e){if(!e) e= window.event;if(that.initialKeyPress)that.initialKeyPress(e);if(!e) e= window.event;var s = newbehaviour(e); 
    					        if(that.onkeypress)that.onkeypress(e,s)
    					};*/
    				}
    		};
    		el.onmouseout = function(e){if(!e) e= window.event;that.keypressactive = false;};
	    
	    
    		jQuery(el).mousedown(function(e){
    			var s = newbehaviour(e); 
    			if(s){
    				if(s.getProperty("onmousedown")){
    				        s.getProperty("onmousedown")(e,s);	
    				        if(that.onmousedown)that.onmousedown(e,s);

    				}
    				else{
    				    if(that.onmousedown)that.onmousedown(e,s);
    				}
    			}
    			else {
    			        if(that.onmousedown)that.onmousedown(e,s);
    			        if(down)down(e,s);
    			}

    		});

            jQuery(el).dblclick(function(e){
    			if(!e) e= window.event;
    			var s = newbehaviour(e); 				
    			if(s) {

    				if(s.getProperty("ondblclick")){
    				        s.getProperty("ondblclick")(e,s);
    				}
    				else if(that.ondblclick){
            			        that.ondblclick(e,s);
            			}
            			else{


            			}
    			}
    			else {
    				if(that.ondblclick){
            			        that.ondblclick(e,s);
            			}
    				if(dblclick){
    				        dblclick(e,s);
                                    }
    			}
    		});
            jQuery(el).mouseup(function(e){ 
                    var s = newbehaviour(e);
                    if(s){
    		                if(s.getProperty("onmouseup")){
    		                        s.getProperty("onmouseup")(e,s);
    		                        if(that.onmouseup)that.onmouseup(e,s);

    		                }
    		                else{
    		                    if(that.onmouseup)that.onmouseup(e,s);
    		                }


    		        }
    		        else{
    		                if(that.onmouseup)that.onmouseup(e,s);
    		                if(up)up(e,s);
    		        }
    		});
    		var defaultCursor;
    		jQuery(el).mousemove(function(e){ if(!e) e= window.event;var s = newbehaviour(e);

    		        if(!VismoUtils.browser.isIE){
    		                if(jQuery(el).hasClass("overVismoShape")) jQuery(el).removeClass("overVismoShape");
    		        }
    		        if(!VismoUtils.browser.isIE){

    		                if(jQuery(el).hasClass("overVismoPoint"))jQuery(el).removeClass("overVismoPoint");
    		        }

    		        if(s && !s.getProperty("unclickable")){


            		        if(that.ondblclick || that.onmousedown || that.onmouseup) {
            		                var sh;
                    		        if(s){
                    		               sh  = s.getShape();
                    		               if(!VismoUtils.browser.isIE  &&sh == "point") jQuery(el).addClass("overVismoPoint");
                    		        }
            		                if(!VismoUtils.browser.isIE && !jQuery(el).hasClass("panning") && !jQuery(el).hasClass("zooming"))jQuery(el).addClass("overVismoShape");
            	                }

    		                if(s.getProperty("onmousemove"))s.getProperty("onmousemove")(e,s);
    		        }
    		        else{
    		                //el.style.cursor = defaultCursor;
    		        }
    		        if(that.onmousemove)that.onmousemove(e,s); 
    		        if(mv)mv(e,s);
    		});       	

        };
        applymice(el);
		


	}
	,getDimensions: function(args){
		return {width: parseInt(this.canvas.style.width), height: parseInt(this.canvas.style.height)};
	}
	,resize: function(args){
		var width = arguments[0]; var height=arguments[1];
		if(this.canvas.getAttribute("width")){
			this.canvas.width = width;
			this.canvas.height = height;
		}
		jQuery(this.hideoverflow).css({height:height,width:width});
		jQuery(this.wrapper).css({height:height,width:width});
		jQuery(this.canvas).css({height:height,width:width});
	}
	,setTransparency: function(args){	
	    var alpha = arguments[0];
		this.settings.globalAlpha = alpha
	}
	,_setupCanvasEnvironment: function(args){
		if(VismoUtils.browser.isIE) return;
		var ctx = this.canvas.getContext('2d');
		var s =this.getTransformation().scale;
		if(s && s.x)ctx.lineWidth = (0.5 / s.x);
		ctx.globalAlpha = this.settings.globalAlpha;
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		ctx.lineJoin = 'round'; //miter or bevel or round	
	}
	,clear: function(args){
	    var deleteMemory = arguments[0];
		if(deleteMemory){
			this.clearMemory();
		}
		this._maxX = 0;
		this._maxY = 0;

		
		if(!this.canvas.getContext) {
			return;
		}
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);		
		
	}	
	
	
	,ie_render: function(args){
	    var projection= arguments[0];
	    VismoTimer.start("VismoCanvas.ie_render");
	    //this.render = this.ie_render;
	    var that = this;
		var transformation = this.getTransformation();
		if(this.options.beforeRender) this.options.beforeRender(this);	
		if(transformation.scale.x) sc = transformation.scale.x; else sc = 1;
		
		//determine point size
		var ps = this.options.pointsize / parseFloat(sc);
			
		tran = transformation;
        var o = tran.origin,t = tran.translate, s = tran.scale;
        jQuery(this.canvas).css({left:o.x+(t.x*s.x),top:o.y +(s.y*t.y),zoom:s.x});
        
		var mem =that.memory;
        var firstTime = false;
	    var appendTo;
	    if(that.canvas.childNodes.length == 0){
	        firstTime = true;
	        appendTo  = document.createElement("div");
	    }
	    else{
	        appendTo = that.canvas;
	    }
	    var lastT = this._lastTransformation.scale;
	    var shapes = this._lastTransformation.shapes;
	    if(lastT.x  ===s.x && lastT.y === s.y && this.memory.length == shapes){
	        tran = false; //stop a transformation from being applied we've covered it here
	    }

	    var globalAlpha =that.settings.globalAlpha; 
		for(var i=0; i < mem.length; i++){
            var vs =mem[i];
		    var st = vs.properties.shape
	        //if(vs.optimise(appendTo,transformation,projection)){
		        
			    if(st == 'domElement')tran = transformation;
				vs.render(that.canvas,tran,projection,true,that.settings.browser,ps);        
				if(vs.vmlfill && !vs.vmlfill.opacity && globalAlpha) {
					vs.vmlfill.opacity =globalAlpha;
				}
			
				
			//}
			/*
			var lookahead = function(){
			    var newtransformation = VismoUtils.clone(transformation);
			    newtransformation.scale.x *=2;
			    newtransformation.scale.y *= 2;
			    vs.optimise(appendTo,newtransformation,projection,true);
			};
			window.setTimeout(lookahead,1000);
		    */
		}
	    
		this._lastTransformation = {scale:{x:s.x,y:s.y},shapes:this.memory.length};
		if(firstTime){
		    that.canvas.appendChild(appendTo.cloneNode(true));
		}
		VismoTimer.end("VismoCanvas.ie_render");
	    
        
	}
	,canvas_render: function(args){
	    var projection = arguments[0];
	    this.render = this.canvas_render;
	    var that = this;
		var transformation = this.getTransformation();
		if(this.options.beforeRender) this.options.beforeRender(this);	
		if(transformation.scale.x) sc = transformation.scale.x; else sc = 1;
		//determine point size
		var ps = this.options.pointsize / parseFloat(sc);
	
			
		
		var appendTo;
	    var mem =that.getMemory();
	    this._setupCanvasEnvironment();
	    var ctx = that.canvas.getContext('2d');
		ctx.save();
		tran = false;

		if(transformation){
			
			var o = transformation.origin;
			var tr = transformation.translate;
			var s = transformation.scale;
			var r = transformation.rotate;
			if(o && s && tr){
				ctx.translate(o.x,o.y);
				ctx.scale(s.x,s.y);
				ctx.translate(tr.x,tr.y);
			}
			if(r && r.x)ctx.rotate(r.x);
		}
	
		appendTo = that.canvas;
		
		for(var i=0; i < mem.length; i++){
		    var st = mem[i].getShape();
	        if(mem[i].optimise(that.canvas,transformation,projection)){
			    if(st == 'domElement')tran = transformation;
				mem[i].render(that.canvas,tran,projection,true,that.settings.browser,ps);        
				if(mem[i].vmlfill && that.settings.globalAlpha) {
					mem[i].vmlfill.opacity =that.settings.globalAlpha;
				}
			}
		}
	    if(ctx)ctx.restore();
	}
	,render: function(args){
	    var projection = arguments[0];
	    
		if(this.settings.browser == 'good'){
            this.canvas_render(projection);
		}
		else{
	        this.ie_render(projection);
		}
			
	}
	,getTransformation: function(args){
		if(!this.transformation) {
		var ox = parseInt(this.canvas.style.width);
		var oy = parseInt(this.canvas.style.height);
		this.transformation = {scale:{x:1,y:1},translate:{x:0,y:0},origin:{x: ox/2, y: oy/2}};
		//this.transformation = VismoTransformation.getBlankTransformation(this.canvas);
		}
		return this.transformation;
	}
	
	,setTransformation: function(args){
	    var transformation = arguments[0];
	        if(!transformation.origin){
	                transformation.origin = {};
	                transformation.origin.x = jQuery(this.wrapper).width() / 2;
	                transformation.origin.y = jQuery(this.wrapper).height() / 2;
	        }
	      
		if(transformation) this.transformation = transformation;
		var t = transformation.translate, s = transformation.scale;	
	    transformation.cache = {id1:[s.x,",",s.y].join(""),id2:[t.x,",",t.y].join("")};
	    
	}

	,remove: function(args){
        var vismoShape = arguments[0];
       var shapes = this.getMemory();
       
     
       for(var i=0; i < shapes.length; i++){
            if(shapes[i] == vismoShape){
                this.memory.splice(i,1);
            }
       }
       if(vismoShape.vml)vismoShape.vml.scrub();
       
	    var id = vismoShape.properties.id;
   	    delete this._idtoshapemap[id]
	       
	}
	,add: function(args){
	    var vismoShape = arguments[0];
	    this.needsSort = true;
	    if(!vismoShape._isVismoShape){
	        vismoShape = new VismoShape(vismoShape);
	        
	    }
	    if(vismoShape.properties.shape =='point'){
	        
            vismoShape.setDimensions(this.options.pointsize,this.options.pointsize);
        }
		if(!this.memory) this.memory = [];
		
		
		if(!vismoShape.getProperty("id")){
		    var newid  = this.memory.length +"_" + Math.random();
		    vismoShape.setProperty("id",newid);
		}
		var id = vismoShape.properties.id;
		this.memory.push(vismoShape);
		
		
		this._idtoshapemap[id] = vismoShape;
		vismoShape._vismoClickingID = id;

		return vismoShape;
	}
	,addLabel:function(args){
	    var domElement = arguments[0];
	    var x=  arguments[1];
	    var y = arguments[2];
	        this.labelHolder.appendChild(domElement);
	        var properties = {element: domElement,shape:"domElement"};
	  
	        var coords = [];
	        coords.push(x);
	        coords.push(y);
	        var shape = new VismoShape(properties,coords);
	        this.add(shape);
	              //console.log(shape);
	        return {element: domElement ,vismoshape: shape};
	}
	,transform: function(args){
	    var t = arguments[0];
		this.setTransformation(t);
		this.render();

	}
	,clearMemory: function(args){
		for(var i=0; i < this.memory.length; i++){
			if(this.memory[i].vml){
				this.memory[i].vml.scrub();
			}
		}
		this.memory = [];

	},
	getMemory: function(args){
        if(this.needsSort){
    	    this.memory =this.memory.sort(function(a,b){
    	        var z1 = a.getProperty("z-index");
    	        var z2 =b.getProperty("z-index");
    	        if(z1 < z2) return -1;
    	        else if(z1 == z2){
    	            return 0;
    	        }
    	        else{
    	            return 1;
    	        }
    	        });
	        this.needsSort = false;
	    }
	        
	    return this.memory;
	}
	,getMemoryID: function(args){
	    var vismoShape = arguments[0];
		if(vismoShape && vismoShape._vismoClickingID)
			return vismoShape._vismoClickingID;
		else{
			return false;
		}
	}
	,getShapeWithID: function(args){
	    var id = arguments[0];
	    var mem = this.getMemory();
	    if(this._idtoshapemap[id]) return this._idtoshapemap[id];
	    else return false;
	}
	,getShapeAtClick: function(args){
	    var e = arguments[0];
		if(!e) {
			e = window.event;
		}
	
		var node = VismoClickingUtils.resolveTarget(e);
		//alert(node.tagName);
		if(node && node.tagName) { //vml vismoShape
		    if(node.tagName.toUpperCase() == 'SHAPE'){
		        if(node._vismoClickingID){
		            
		            var shape = this.getShapeWithID(node._vismoClickingID);
		            if(shape) return shape;
		        }
		        
			}
			
		}

		var target = VismoClickingUtils.resolveTargetWithVismo(e);
	
		if(!target) return;
		
		var offset = jQuery(target).offset();

                var xy= VismoClickingUtils.scrollXY();
		x = e.clientX + xy.x - offset.left;
		y = e.clientY + xy.y - offset.top;

		if(this.memory.length > 0){
			var shape = false;
			
			if(target.vismoClicking){
			    var pos =  VismoTransformations.undoTransformation(x,y,this.transformation);
    			x = pos.x;
    			y = pos.y;
			    shape = this.getShapeAtPosition(x,y);
			}
			else{
			    //console.log("oh dear",target);
			}
			return shape;
		} else{
			return false;
		}
	},
	getShapeAtPosition: function(args) {
	    /* x and y should be in VismoShape coordinate world*/
	    var x= arguments[0];
	    var y=  arguments[1];
		var shapes = this.memory;

		var hitShapes = [];
		for(var i=0; i < shapes.length; i++){
			var shape = shapes[i];
			if(!shape.getProperty("unclickable"))
	                {		
	                        var st = shape.getShape();
				var g = shape.getBoundingBox();
			
				if(x >= g.x1 && x <= g.x2 && y >=  g.y1 && y <=g.y2){
					hitShapes.push(shapes[i]);
				}
			}

		}
		
		if(hitShapes.length > 1){
		    
		        var res = this._findNeedleInHaystack(x,y,hitShapes);
			return res;
		
		}
	        else return hitShapes[0];
	
		// var shapesInsideBox = _findShapesInsideBoundingBox(shapes, ..) TODO RENAME
		// var points = _findPointsInsideShapes(..)
		

	},
	_findNeedleInHaystack: function(args){
		var x= arguments[0];
	    var y=  arguments[1];
	    var shapes = arguments[2];
	    var hits = [];
		
		for(var i=0; i < shapes.length; i++){
			var st = shapes[i].getShape();
			var itsahit = false;
			if(st == 'polygon'){
				itsahit = this._inPoly(x,y,shapes[i]);
			}
			else if(st == 'path'){
			    //itsahit = this._onPath(x,y,shapes[i]);
			    itsahit = false; 
			}
			else if(st == 'image'){
				itsahit = true;
			}
			else if(st == 'point' || st == 'circle'){
				itsahit = this._inCircle(x,y,shapes[i]);
			}
			if(itsahit) {
				hits.push(shapes[i]);
			}
			
		}

		if(hits.length == 0){
			return null;
		}
		else if(hits.length == 1) 
			return hits[0];
		else {//the click is in a polygon which is inside another polygon
		    var bestZindex = {s:[],z:0};
		    for(var i=0; i < hits.length; i++){
		        var zin = hits[i].getProperty("z-index"); 
		        if(zin > bestZindex.z){
		            bestZindex.s = [hits[i]];
		            bestZindex.z = zin;
		        }  
		        else if(zin == bestZindex.z){
		            bestZindex.s.push(hits[i]);
		        }
	        }
	        if(bestZindex.s.length == 1) return bestZindex.s[0];
		    
			var g = bestZindex.s[0].getBoundingBox();
			var mindist = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
			var closerEdge = {id:0, closeness:mindist};
			for(var i=1; i < bestZindex.s.length; i++){
				var g = bestZindex.s[i].getBoundingBox();
				var mindist = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
			
				if(closerEdge.closeness > mindist) {
					closerEdge.id = i; closerEdge.closeness = mindist;
				}
				
			}
			return bestZindex.s[closerEdge.id];
		
		}

	}
	,_inCircle: function(args){
	    var x= arguments[0];
	    var y=  arguments[1];
	    var vismoShape = arguments[2];
		var bb = vismoShape.getBoundingBox();
        var transform = vismoShape.getTransformation();

		if(transform){
		        var newpos = VismoTransformations.applyTransformation(x,y,transform);
		        x= newpos.x;
		        y = newpos.y;
	    }
	    
		var a =((x - bb.center.x)*(x - bb.center.x)) + ((y - bb.center.y)*(y - bb.center.y));
		var dim = vismoShape.getDimensions();
		
		var w = dim.width;
		var h = dim.height;
		
		var inCircleOne;
		var inCircleTwo;
		
		if(transform && transform.scale) {
		    w *= transform.scale.x;
		    h *= transform.scale.y;
		}
		w *= w;
		h *=h;
		
		if (a <= w) inCircleOne= true;
		else inCircleOne = false;
		
		if (a <= h) inCircleTwo= true;		
		else inCircleTwo = false;
		

    		//console.log(bb.center.x,bb.center.y,x,y,vismoShape.properties.id,a,w,h,inCircleOne,inCircleTwo);
    		
		if(inCircleOne && inCircleTwo) return true;
		else return false;
	
	}
	,_onPath: function(args){
	    var x= arguments[0];
	    var y=  arguments[1];
	    var vismoShape = arguments[2];
	    return false;
	}
	,_inPoly: function(args) {
	    var x= arguments[0];
	    var y=  arguments[1];
	    var vismoShape = arguments[2];
		/* _inPoly adapted from inpoly.c
		Copyright (c) 1995-1996 Galacticomm, Inc.  Freeware source code.
		http://www.visibone.com/inpoly/inpoly.c.txt */
		var coords;
		coords = vismoShape.getCoordinates();
		var transform = vismoShape.getTransformation();
		
		if(transform){
		        var newpos = VismoTransformations.applyTransformation(x,y,transform);
		        x = newpos.x;
		        y = newpos.y;
		}
		
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