/*requires VismoShapes
Adds controls such as panning and zooming to a given dom element.

Mousewheel zooming currently not working as should - should center on location where mousewheel occurs
Will be changed to take a handler parameter rather then a targetjs
 */


var VismoController = function(elem,options){ //elem must have style.width and style.height etM  
    if(elem.length){ //for jquery
      var result = [];
      for(var i=0; i < elem.length; i++){
          var x = new VismoController(elem[i],options);
          result.push(x);
      }
      return x;
    }
    if(!options)options = {};
    if(!options.zoomfactor)options.zoomfactor=2;
    if(elem.vismoController) throw "this already has a vismo controller!"
    elem.vismoController = true;// this;              
    this.enabledControls = [];
    if(typeof elem == 'string') elem= document.getElementById(elem);
    this.setLimits({});
    //jQuery(elem).css()
    //if(!elem.style || !elem.style.position) elem.style.position = "relative";
    this.wrapper = elem; //a dom element to detect mouse actions
    this.handler = options.handler; //a js object to run actions on (with pan and zoom functions)	
    this.defaultCursor = "";
    var md = elem.onmousedown;
    var mu = elem.onmouseup;
    var mm = elem.onmousemove;
    for(var i=0; i < elem.childNodes.length; i++){
      var child = elem.childNodes[i];
      try{
        child.onmousedown = function(e){if(md)md(e);}
        child.onmouseup = function(e){if(mu)mu(e);}
        child.onmousemove = function(e){if(mm)mm(e);}
      }
      catch(e){

      }
    }
      
  controlDiv = document.createElement('div');
  controlDiv.style.position = "absolute";
  controlDiv.style.top = "0";
  controlDiv.style.left = "0";
  controlDiv.className = 'vismoControls';
  jQuery(controlDiv).css({'z-index':10000, height:"120px",width:"60px"});
  this.wrapper.appendChild(controlDiv);
  this.controlDiv = controlDiv;

  this.controlCanvas = new VismoCanvas(this.controlDiv);
  jQuery(this.controlDiv).mouseover(function(e){e.stopPropagation();e.preventDefault();});
  //this.controlDiv.vismoController = this;
  var vismoController = this;
  var preventDef = function(e){
                if (e && e.stopPropagation) //if stopPropagation method supported
                 e.stopPropagation()
                else
                 e.cancelBubble=true
          return false;      
  };
  var that = this;
  var f = function(e,s){
          var vismoController = that;
          vismoController._panzoomClickHandler(e,s,vismoController);
          return preventDef(e);
  };
  this.controlCanvas.mouse({up:preventDef,down:f,dblclick:preventDef});

  //this.wrapper.vismoController = this;
  var start_transformation = options.transformation;
  if(start_transformation){
    if(!start_transformation.origin) start_transformation.origin = {};
    this.transformation = start_transformation;
  }
  else{
    this.transformation = {'translate':{x:0,y:0}, 'scale': {x:1, y:1},'rotate': {x:0,y:0,z:0},origin:{}};	
  }	
             
             

  this.transformation.origin.x = jQuery(elem).width() / 2;
  this.transformation.origin.y = jQuery(elem).height() / 2;
  var t = this.transformation;

  //looks for specifically named function in targetjs
  if(!this.handler) {
      alert("no transform handler function defined");
  }
  //this.wrapper.vismoController = this;
  this.enabled = true;


  if(!options) options = {};
  if(!options.controls)options.controls =['pan','zoom','mousepanning','mousewheelzooming'];
  this.options = options;
  if(!this.options.controlStroke){
        this.options.controlStroke = "#000000";
    }
    if(!this.options.controlFill){
        this.options.controlFill = "rgba(150,150,150,0.7)";
    }
  
  
  this.addControls(this.options.controls);
  this.limits = {scale:{}};
  if(this.options.maxZoom) {
      this.limits.scale.x =this.options.maxZoom;
      this.limits.scale.y = this.options.maxZoom;
  }
  if(this.options.minZoom){
    
      this.limits.scale.minx =this.options.minZoom;
       this.limits.scale.miny =this.options.minZoom;
  }

  this.pansensitivity =100;
  if(this.options.pansensitivity){
      this.pansensitivity =this.options.pansensitivity;
  }

  jQuery(window).unload(function(){
    that.controlCanvas = null;
    that.controlDiv = null;
  })
};
VismoController.prototype = {
	setLimits: function(transformation){
	        this.limits = transformation;
	}
	,getHandler: function(){
	    return this.handler;
	}
	,setHandler: function(handler){
	    this.handler = handler;
	    handler(this.transformation);
	}
	,getEnabledControls: function(){
	        return this.enabledControls;
	}
	,_addEnabledControl: function(controlName){
	        this.enabledControls.push(controlName);      
	}
	,applyLayer: function(){
	        var that = this;
	        var hidebuttons = function(){
	               var shapes = that.controlCanvas.getMemory();
	                for(var i=0; i < shapes.length; i++){
	                        shapes[i].setProperty("hidden",true);
	                }

	                that.controlCanvas.render();
	        };	        
	        this.controlCanvas.render();
	        if(this.options.hidebuttons){
	                hidebuttons();
	                return;
	        }
	        
	       	       
	        if(VismoUtils.browser.isIE6) return;
	        var enabled = this.getEnabledControls();
	        var pan,zoom;
	        if(enabled.contains("pan")) pan = true;
	        if(enabled.contains("zoom")) zoom = true;
                var callback = function(response){
                        if(!response)return;
                        if(!VismoUtils.svgSupport())return;
                        
                        var shape;
                        if(false == true){
                                //return;
                                shape = document.createElement("div");
                                shape.innerHTML = response;
                        }
                        else{
                                shape = document.createElement('object');
                                
                                shape.setAttribute('codebase', 'http://www.adobe.com/svg/viewer/install/');
                                if(VismoUtils.browser.isIE)shape.setAttribute('classid', '15');
                                shape.setAttribute('style',"overflow:hidden;position:absolute;z-index:0;width:60px;height:120px;");
                                shape.setAttribute('type',"image/svg+xml");
                                var dataString = 'data:image/svg+xml,'+ response;
                                shape.setAttribute('data', dataString); // the "<svg>...</svg>" returned from Ajax call                                      
                                jQuery(shape).css({width:60,height:120})
                        }
                        that.controlDiv.appendChild(shape);
                        jQuery(that.controlDiv).css({"background-image":"none"});
                        hidebuttons();
                };
	        if(pan && zoom) callback(this.panzoomcontrolsSVG);

        	
	}
	,getTransformation: function(){ 
		return this.transformation;
	}
	,translate: function(x,y){
	        var t= this.getTransformation();
	        t.translate.x = x;
	        t.translate.y = y;
	        this.transform();
	},
	addMouseWheelZooming: function(){ /*not supported for internet explorer*/
                var that = this;
	        this._addEnabledControl("mousewheelzooming");
	
		this.crosshair = {lastdelta:false};
		this.crosshair.pos = {x:0,y:0};

		var t = this.getTransformation();

		var mw = this.wrapper.onmousewheel;
		

		var that = this;
		var mm = this.wrapper.onmousemove;
		

        var doingmw = false;
        var mwactive = false;
        
        var cancelMouseZoomCursor = function(){
            if(VismoUtils.browser.isIE6)that.wrapper.style.cursor = "";
            else jQuery(that.wrapper).removeClass("zooming");
        }
        jQuery(this.wrapper).mousedown(function(e){
            mwactive = true;
            if(VismoUtils.browser.isIE6)this.style.cursor = "crosshair";
            else {
                if(!jQuery(that.wrapper).hasClass("panning")){
                jQuery(that.wrapper).addClass("zooming");
                }
            }
            window.setTimeout(cancelMouseZoomCursor,2000);
        });
        jQuery(this.wrapper).mouseout(function(e){
            var newTarget;
            
            if(e.toElement) newTarget = e.toElement;
            else newTarget = e.relatedTarget;
            
            if(jQuery(newTarget,that.wrapper).length == 0){ //if not a child turn off
                mwactive = false;

            }
            cancelMouseZoomCursor();
        });
        var domw = function(e){
            if(!that.enabled) return;
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;

                        
			if(!that.goodToTransform(e)) {
			    doingmw = false;
			    return false;
			}
			var t = VismoClickingUtils.resolveTargetWithVismo(e);
		        
                
                       if(t != that.wrapper && t.parentNode !=that.wrapper) return false;
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
	
			var sensitivity = 0.4;
			var transform = that.getTransformation();
			var scale =transform.scale;
			var origin = transform.origin;


			var mousepos = VismoClickingUtils.getMouseFromEvent(e);
	
			var w = parseInt(that.wrapper.style.width) / 2;
			var h = parseInt(that.wrapper.style.height) / 2;
			var translation =  VismoTransformations.undoTransformation(mousepos.x,mousepos.y,that.transformation);
			transform.translate= {x: -translation.x, y: -translation.y};
			//{x: -mousepos.x + w,y: -mousepos.y + h};
			transform.origin = {
											x: mousepos.x,
											y: mousepos.y
										};
			



			if(delta > that.crosshair.lastdelta + sensitivity || delta < that.crosshair.lastdelta - sensitivity){	
				var newx,newy;
				if(delta > 0){
					newx = parseFloat(scale.x) * 2;
					newy = parseFloat(scale.y) * 2;					
				}
				else{
					newx = parseFloat(scale.x) / 2;
					newy = parseFloat(scale.y) / 2;
				}

				if(newx > 0 && newy > 0){
					scale.x = newx;
					scale.y = newy;
					that.setTransformation(transform);					
				}

			}
			that.crosshair.lastdelta = delta;	
			

            doingmw = false;
            return false;
        };
		var onmousewheel = function(e){	
		    if(!VismoUtils.browser.isIE){
		        jQuery(that.wrapper).addClass("zooming");	
		    }
		    if(e.preventDefault){e.preventDefault();}
		    if (e && e.stopPropagation) {
                e.stopPropagation();
            }
             e.cancelBubble=true;
            
		    if(!mwactive) return false;
			if(!doingmw) {
			    var f = function(){
			        domw(e);
                    return false;
			    };
			    window.setTimeout(f,50);
			    doingmw = true;
            }


			return false;

		};

		
		var element = this.wrapper;
            if(VismoUtils.browser.isIE) {
		        document.onmousewheel = function(e){
		                if(!e)e = window.event;
		            
		                var el = e.target;
		                
		                //var el =  e.srcElement;
		                if(!el) return;
		                while(el != element){
		                        
		                        if(el == element) {
		                                onmousewheel(e); 
		                                
		                                return false;    
		                        }
		                        el = el.parentNode;
		                }
		                return;
		        };
		        window.onmousewheel = document.onmousewheel;
		        return;
		}
		else if (element.addEventListener){

			element.onmousewheel = onmousewheel; //safari
		    element.addEventListener('DOMMouseScroll', onmousewheel, false);/** DOMMouseScroll is for mozilla. */
		
		}
		else if(element.attachEvent){ 	
			element.attachEvent("onmousewheel", onmousewheel); //safari
		}
		else{ //it's ie.. or something non-standardised. do nowt
		//window.onmousewheel = document.onmousewheel = onmousewheel;	
		}

		
	}
	,disable: function(){
	    //console.log("disabled");
        jQuery(".vismoControls",this.wrapper).css({display:"none"});	    
		this.enabled = false;
	}
	,enable: function(){
	    //console.log("enabled");
		this.enabled = true;
		jQuery(".vismoControls",this.wrapper).css({display:""});
	}
	
	,goodToTransform: function(e){
		var t =  VismoClickingUtils.resolveTarget(e);

		switch(t.tagName){
			case "INPUT":
				return false;
			case "SELECT":
				return false;
			case "OPTION":
				return false;
		}
		
		if(t && t.getAttribute("class") == "vismoControl") return false;
		
		return true;
		
	}
	,addMousePanning: function(){
	       
	    this._addEnabledControl("mousepanning");
		var that = this;
		
		var el = that.wrapper;
		var md = el.onmousedown;
		var mu = el.onmouseup;	
		var mm = el.onmousemove;
		var panning_status = false;	
		//alert('here');
		//jQuery(document).mouseup(function(e){alert("cool");}); //doesn't work?!
		var intervalMS = 100;
		if(VismoUtils.browser.isIE6){
		  intervalMS = 300;
		}
		var interval;
		var cancelPanning = function(e){
		    if(interval)window.clearInterval(interval);
			panning_status = false;
			that.transform();
			if(!VismoUtils.browser.isIE6){jQuery(that.wrapper).removeClass("panning");}
			//style.cursor= that.defaultCursor;
			that.wrapper.onmousemove = mm;
			return false;
		};
		jQuery(that.controlDiv).mousedown(function(e){
        
		    cancelPanning();
		});
		var onmousemove = function(e){
		    if(e && e.shiftKey) {return false;}
			if(mm){mm(e);}
			if(!that.enabled) {return;}
			if(!panning_status) {
				return;
			}
			if(!VismoUtils.browser.isIE && !jQuery(that.wrapper).hasClass("panning")){
			    jQuery(that.wrapper).addClass("panning")
			}
			if(!that.goodToTransform(e)) {return;}
			var pos =  VismoClickingUtils.getMouseFromEventRelativeToElement(e,panning_status.clickpos.x,panning_status.clickpos.y,panning_status.elem);		
			if(!pos){return;}
			
			var t = that.getTransformation();
			//if(this.transformation) t = this.transformation;
			var sc = t.scale;

			/* work out deltas */
			var xd =parseFloat(pos.x /sc.x);
			var yd = parseFloat(pos.y / sc.y);
			t.translate.x = panning_status.translate.x + xd;
			t.translate.y =panning_status.translate.y +yd;
            if(!VismoUtils.browser.isIE6){
                jQuery(that.wrapper).removeClass("zooming");
                //that.transform();
            }
			
			if(pos.x > 5  || pos.y > 5) panning_status.isClick = false;
			if(pos.x < 5|| pos.y < 5) panning_status.isClick = false;
			return false;	
		};
     
		jQuery(this.wrapper).mousedown(function(e){
		    e.preventDefault();
		    
		    var jqw = jQuery(that.wrapper);
			if(panning_status){
				return;
			}
			
			if(md) {md(e);}
			if(!that.enabled) return;
			interval =window.setInterval(function(){that.transform();},intervalMS);
			if(!VismoUtils.browser.isIE6){
			    jqw.addClass("panning");
			}
			var target =  VismoClickingUtils.resolveTarget(e);
			target = el;
			if(!target) return;

			
			var t = that.transformation.translate;
			var sc =that.transformation.scale; 
			
			var realpos = VismoClickingUtils.getMouseFromEvent(e);
			if(!realpos) return;
			//this.vismoController = that;

			var element = VismoClickingUtils.resolveTargetWithVismo(e);
			element = el;
			panning_status =  {clickpos: realpos, translate:{x: t.x,y:t.y},elem: element,isClick:true};
			that.wrapper.onmousemove = onmousemove;
				
		});
			
		jQuery(document).mouseup(function(e){
		    e.preventDefault();
			if(panning_status.isClick && mu){
			    mu(e);
			};
			
			if(panning_status){
			    cancelPanning(e);
            }
		});
		
		jQuery(document).mousemove(function(e){
			if(panning_status){
			        onmousemove(e);
			        var parent= e.target;
			        while(parent.parentNode){
			                parent = parent.parentNode;
			                if(parent == that.wrapper) return;
			        }
				
				//if(parent != that.wrapper)cancelPanning(e); (not a good idea for tooltips)
			}
		});
	    
	},

	setTransformation: function(t){
        if(this.limits){
            if(this.limits.scale){
            if(t.scale.x > this.limits.scale.x){ t.scale.x = this.limits.scale.x;}
            if(t.scale.y > this.limits.scale.y){ t.scale.y = this.limits.scale.y; }
            
            if(t.scale.x < this.limits.scale.minx){ t.scale.x = this.limits.scale.minx;}
            if(t.scale.y < this.limits.scale.miny){ t.scale.y = this.limits.scale.miny;}     
            }    
        }
        if(!t.origin){
            
                var w = jQuery(this.wrapper).width();
                var h = jQuery(this.wrapper).height();
                t.origin = {x: w/2, y: h/2};

        }
		if(this.enabled){
			if(!t.scale && !t.translate && !t.rotate) alert("bad transformation applied - any call to setTransformation must contain translate,scale and rotate");
			this.transformation = t;
			try{this.handler(t);}catch(e){};
		}
		//console.log("transformation set to ",t);
	},
	createButtonLabel: function(r,type,offset){
		var properties=  {'shape':'path', stroke: this.options.controlStroke,lineWidth: '1','z-index':'2'};
		properties.actiontype = type;
		var coords=[];
		if(type == 'E'){
			coords =[r,0,-r,0,'M',r,0,0,-r,"M",r,0,0,r];
		}
		else if(type =='W'){
			coords =[-r,0,r,0,'M',-r,0,0,r,"M",-r,0,0,-r]; 
		}
		else if(type == 'S'){
			coords =[0,-r,0,r,'M',0,r,-r,0,"M",0,r,r,0];	
		}
		else if(type == 'N'){
			coords =[0,-r,0,r,'M',0,-r,r,0,"M",0,-r,-r,0];	
		}
		else if(type == 'in'){
			coords =[-r,0,r,0,"M",0,-r,0,r];
		}
		else if(type == 'out'){
			coords = [-r,0,r,0];
		}
		for(var i=0; i < coords.length; i+=2 ){
		        if(coords[i] == "M") i+=1;
		        coords[i] += offset.x;
		        coords[i+1] += offset.y;
		}
		return new VismoShape(properties,coords);
	},	
	createButton: function(width,direction,offset,properties) {
	        var canvas = this.controlCanvas;
	        if(!canvas) throw "no canvas to create on..";
		if(!width) width = 120;
		var r = width/2;

		offset = {
			x: offset.x || 0,
			y: offset.y || 0
		};
		
		var coords;
		if(this.options.controlShape && this.options.controlShape == 'circle'){
		    	coords = [
        			offset.x , offset.y,
        			width/2
        		];
        		properties.shape = 'circle';  
		}
		else{
		    
    		coords = [
    			offset.x, offset.y,
    			offset.x + width, offset.y,
    			offset.x + width, offset.y + width,
    			offset.x, offset.y + width
    		];
    		properties.shape = 'polygon';
	    }
		properties.fill =this.options.controlFill;
		properties.stroke =this.options.controlStroke;
		var button = new VismoShape(properties,coords);
		var bb = button.getBoundingBox();
		buttoncenter = {x:bb.center.x,y:bb.center.y}; 
		var label = this.createButtonLabel(r-2,properties.actiontype,buttoncenter);
	    canvas.add(label);
		canvas.add(button);
		return button;
	},
	addControls: function(list){
		for(var i= 0; i < list.length; i++){
			this.addControl(list[i]);
		}
	}
	,addControl: function(controlType) {
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
	
	addPanningActions: function(controlDiv){
	        this._addEnabledControl("pan");
		this.createButton(12,180,{x:-6,y:-54},{'actiontype':'N','name':'pan north','buttonType': 'narrow'});
		this.createButton(12,270,{x:10,y:-38},{'actiontype':'E','name':'pan east','buttonType': 'earrow'});
		//this.createButton(10,90,{x:16,y:16},{'actiontype':'O','name':'re-center','buttonType': ''});
		this.createButton(12,90,{x:-22,y:-38},{'actiontype':'W','name':'pan west','buttonType': 'warrow'});
		this.createButton(12,0,{x:-6,y:-20},{'actiontype':'S','name':'pan south','buttonType': 'sarrow'});			
		this.applyLayer();		

	},
	addRotatingActions: function(){
		/*
		var rotateCanvas = this.controlCanvas.getDomElement();
		this.createButton(rotateCanvas,10,180,{x:16,y:2},{'actiontype':'rotatezup','name':'pan north','buttonType': 'narrow'});
		this.createButton(rotateCanvas,10,0,{x:16,y:30},{'actiontype':'rotatezdown','name':'pan south','buttonType': 'sarrow'});			
			
		this.createButton(rotateCanvas,10,270,{x:30,y:16},{'actiontype':'rotatezright','name':'rotate to right','buttonType': 'earrow'});
		this.createButton(rotateCanvas,10,90,{x:2,y:16},{'actiontype':'rotatezleft','name':'rotate to left','buttonType': 'warrow'});
		rotateCanvas.onmouseup = this._panzoomClickHandler;*/

	},	
	addZoomingActions: function(){
	        this._addEnabledControl("zoom");
		this.createButton(12,180,{x:-6,y:12},{'actiontype':'in','name':'zoom in','buttonType': 'plus'});		
		this.createButton(12,180,{x:-6,y:42},{'actiontype':'out','name':'zoom out','buttonType': 'minus'});	
	        this.applyLayer();
	}	
	,zoom: function(x,y){
         var t = this.getTransformation();
         t.scale.x = x;
         if(!y) y=  x;
         t.scale.y = y;
         this.setTransformation(t);
    }
    ,panTo: function(x,y){
            //if(!this.enabled) return;
            var t = this.getTransformation();
            
            var finalX = -x;
            var finalY = -y;
            var thisx,thisy;
            var direction = {};
            var difference = {};
            
            thisx = t.translate.x;
            thisy = t.translate.y;
            
            difference.x=  thisx - finalX;
            difference.y = thisy - finalY;
            
            direction.x = -difference.x / 5;
            direction.y = -difference.y / 5;

            var change = true;
            
            var that = this;
            var f = function(){
               
                    change= {x: false,y:false};
                    if(thisx > finalX && thisx + direction.x > finalX) {thisx += direction.x;change.x=true;}
                    else if(thisx < finalX && thisx + direction.x < finalX) {thisx += direction.x;change.x=true;}
                    else{
                            t.translate.x = finalX;
                    }
            
                    if(thisy > finalY && thisy + direction.y > finalY) {thisy += direction.y;change.y=true;}
                    else if(thisy < finalY && thisy + direction.y < finalY) {thisy += direction.y;change.y=true;}
                    else{
                            change.x = true;
                            t.translate.y =finalY;
                    }
            
                    if(change.x){
                            t.translate.x = thisx;
                    }
                    else{
                            t.translate.x = finalX;
                    }
                    if(change.y){
                            t.translate.y = thisy;
                    }
                    else{
                            t.translate.y = finalY;
                    }

                    if(t.translate.x != finalX && t.translate.y != finalY){
                            that.setTransformation(t); 
                            window.setTimeout(f,5);
                    }
                    else{
                            that.setTransformation(t);
                    }

            };
            
            f();
                                   
           

            //window.setTimeout(pan,200);
    }
  ,transform: function(){
    if(this.enabled){
      var t = this.getTransformation();
      var s = t.scale;
      var tr = t.translate;
      if(s.x <= 0) s.x = 0.1125;
      if(s.y <= 0) s.y = 0.1125;
      var ok = true;
      var lim = this.limits;
      if(lim.scale){
        if(s.y < lim.scale.miny) t.scale.y = lim.scale.miny;
        if(s.x < lim.scale.minx) t.scale.x = lim.scale.minx;

        if(s.y > lim.scale.y) t.scale.y = lim.scale.y;
        if(s.x > lim.scale.x) t.scale.x = lim.scale.x;
      }
      this.handler(this.transformation);

    }
	},
	_panzoomClickHandler: function(e,hit,controller) {
	
	    	if(!hit) return;
	   
		var pan = {};
		var t =controller.getTransformation();
		if(!t.scale) t.scale = {x:1,y:1};
		if(!t.translate) t.translate = {x:0,y:0};
		if(!t.rotate) t.rotate = {x:0,y:0,z:0};
		
		var scale =t.scale;
		
		pan.x = parseFloat(this.pansensitivity / scale.x);
		pan.y = parseFloat(this.pansensitivity / scale.y);
	
		switch(hit.getProperty("actiontype")) {
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
				scale.x *= this.options.zoomfactor;
				scale.y *= this.options.zoomfactor;
				break;
			case "out":
				scale.x /= this.options.zoomfactor;
				scale.y /= this.options.zoomfactor;			
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
                //console.log("done",controller);
		return false;
	}
};