/*requires VismoShapes
Adds controls such as panning and zooming to a given dom element.

Mousewheel zooming currently not working as should - should center on location where mousewheel occurs
Will be changed to take a handler parameter rather then a targetjs
 */

var VismoController = function(targetjs,elem,options){ //elem must have style.width and style.height etM   
        
        if(elem.vismoController) throw "this already has a vismo controller!"
        elem.vismoController = this;              
	this.enabledControls = [];

	if(typeof elem == 'string') elem= document.getElementById(elem);
	this.setLimits({});
	if(!elem.style.position) elem.style.position = "relative";
	this.wrapper = elem; //a dom element to detect mouse actions
	this.targetjs = targetjs; //a js object to run actions on (with pan and zoom functions)	
	this.defaultCursor = "";
	var md = elem.onmousedown;
	var mu = elem.onmouseup;
	var mm = elem.onmousemove;
	for(var i=0; i < elem.childNodes.length; i++){
		var child = elem.childNodes[i];
		child.onmousedown = function(e){if(md)md(e);}
		child.onmouseup = function(e){if(mu)mu(e);}
		child.onmousemove = function(e){if(mm)mm(e);}
	}
        
	controlDiv = document.createElement('div');
	controlDiv.style.position = "absolute";
	controlDiv.style.top = "0";
	controlDiv.style.left = "0";
	controlDiv.className = 'vismoControls';
	jQuery(controlDiv).css({'z-index':30, height:"120px",width:"60px"});
	this.wrapper.appendChild(controlDiv);
	this.controlDiv = controlDiv;
        this.controlCanvas = new VismoCanvas(this.controlDiv);
	this.controlDiv.vismoController = this;
	var vismoController = this;
	var preventDef = function(e){
                if (e && e.stopPropagation) //if stopPropagation method supported
                 e.stopPropagation()
                else
                 e.cancelBubble=true
          return false;      
	};
	var f = function(e,s){
	        vismoController._panzoomClickHandler(e,s,vismoController);
	        return preventDef(e);
	};
	this.controlCanvas.setOnMouse(preventDef,f,preventDef,preventDef,preventDef);

	this.wrapper.vismoController = this;
	
	

	this.transformation = {'translate':{x:0,y:0}, 'scale': {x:1, y:1},'rotate': {x:0,y:0,z:0},origin:{}};	
	             
	this.transformation.origin.x = jQuery(elem).width() / 2;
	this.transformation.origin.y = jQuery(elem).height() / 2;
        var t = this.transformation;

	//looks for specifically named function in targetjs
	if(!this.targetjs.transform) alert("no transform function defined in " + targetjs+"!");
	this.wrapper.vismoController = this;
	this.enabled = true;


	if(!options) options = {};
	if(!options.controls)options.controls =['pan','zoom','mousepanning','mousewheelzooming'];
	this.options = options;
	this.addControls(this.options.controls);


};
VismoController.prototype = {
	setLimits: function(transformation){
	        this.limits = transformation;
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
	        
	       	       
	        if(VismoUtils.browser.isIE) return;
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
		if(!this.crosshair.el){
		this.crosshair.el =document.createElement("div");
		jQuery(this.crosshair.el).css({position:"absolute",display:"none"});
		
		this.crosshair.el.className = "vismoController_crosshair";
		this.crosshair.el.appendChild(document.createTextNode("+"));
		this.crosshair.el.style.zIndex = 3;
		var t = this.getTransformation();
		this.crosshair.el.style.left = parseInt(t.origin.x-5) + "px";
		this.crosshair.el.style.top = parseInt(t.origin.y-5) + "px";
		this.crosshair.el.style.width = "10px";
		this.crosshair.el.style.height = "10px";
		this.crosshair.el.style.verticalAlign = "middle";
		this.crosshair.el.style.textAlign = "center";
		this.wrapper.appendChild(this.crosshair.el);
		}
		var mw = this.wrapper.onmousewheel;
		

		var that = this;
		var mm = this.wrapper.onmousemove;
		


		var onmousewheel = function(e){		
				
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;

                        
			if(!that.goodToTransform(e)) return false;
			
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
			
			that.crosshair.el.style.left = mousepos.x + "px";
			that.crosshair.el.style.top = mousepos.y + "px";
	


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
			
                        if (e && e.stopPropagation) //if stopPropagation method supported
                        e.stopPropagation();
                        else
                        e.cancelBubble=true;
                        if(e.preventDefault)e.preventDefault();

			
			return false;

		};

		
		var element = this.wrapper;
                if(VismoUtils.browser.isIE) {
		        document.onmousewheel = function(e){
		                if(!e)e = window.event;
		                var el =  e.srcElement;
		                if(!el) return;
		                while(el.parentNode){
		                        
		                        if(el == element) {
		                                onmousewheel(e); 
		                                
		                                return false;    
		                        }
		                        el = el.parentNode;
		                }
		                return;
		        };
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
		this.enabled = false;
	}
	,enable: function(){
		this.enabled = true;
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
		var md = that.wrapper.onmousedown;
		var mu = that.wrapper.onmouseup;	
		var mm = that.wrapper.onmousemove;
		var panning_status = false;	
		
		var cancelPanning = function(e){
			panning_status = false;
			
			if(!VismoUtils.browser.isIE)jQuery(that.wrapper).removeClass("panning");
			//style.cursor= that.defaultCursor;
			that.wrapper.onmousemove = mm;
			return false;
		};
		var onmousemove = function(e){

			if(mm)mm(e);
			if(!that.enabled) return;
			if(!panning_status) {
				return;
			}
			if(!that.goodToTransform(e)) return;
			var pos =  VismoClickingUtils.getMouseFromEventRelativeToElement(e,panning_status.clickpos.x,panning_status.clickpos.y,panning_status.elem);		
			if(!pos)return;
			
			var t = that.getTransformation();
			//if(this.transformation) t = this.transformation;
			var sc = t.scale;

			/* work out deltas */
			var xd =parseFloat(pos.x /sc.x);
			var yd = parseFloat(pos.y / sc.y);
			t.translate.x = panning_status.translate.x + xd;
			t.translate.y =panning_status.translate.y +yd;

                        that.setTransform
			that.transform();
			
			if(pos.x > 5  || pos.y > 5) panning_status.isClick = false;
			if(pos.x < 5|| pos.y < 5) panning_status.isClick = false;
			return false;	
		};

		this.wrapper.onmousedown = function(e){
			if(panning_status){
				return;
			}
			if(md) {md(e);}
			if(!that.enabled) return;
			var target =  VismoClickingUtils.resolveTarget(e);
			if(!target) return;

			if(target.getAttribute("class") == "vismoControl") return;
			
			var t = that.transformation.translate;
			var sc =that.transformation.scale; 
			
			var realpos = VismoClickingUtils.getMouseFromEvent(e);
			if(!realpos) return;
			this.vismoController = that;

			var element = VismoClickingUtils.resolveTargetWithVismo(e);
			
			panning_status =  {clickpos: realpos, translate:{x: t.x,y:t.y},elem: element,isClick:true};
			that.wrapper.onmousemove = onmousemove;
			if(!VismoUtils.browser.isIE)jQuery(that.wrapper).addClass("panning");	
		};
			
		this.wrapper.onmouseup = function(e){
			if(panning_status.isClick && mu){mu(e);};
			cancelPanning(e);

		};
		
		jQuery(document).mousemove(function(e){
			if(panning_status){
			        var parent= e.target;
			        while(parent.parentNode){
			                parent = parent.parentNode;
			                if(parent == that.wrapper) return;
			        }
				
				if(parent != that.wrapper)cancelPanning(e);
			}
		});
	
	},
	setTransformation: function(t){
	        if(!t.origin){
	                var w = jQuery(this.wrapper).width();
	                var h = jQuery(this.wrapper).height();
	                t.origin = {x: w/2, y: h/2};
	
	        }
		if(this.enabled){
			if(!t.scale && !t.translate && !t.rotate) alert("bad transformation applied - any call to setTransformation must contain translate,scale and rotate");
			this.transformation = t;
			this.targetjs.transform(t);
		}
		//console.log("transformation set to ",t);
	},
	createButtonLabel: function(r,type,offset){
		var properties=  {'shape':'path', stroke: '#000000',lineWidth: '1'};
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
		var bb = button.getBoundingBox();
		buttoncenter = {x:bb.center.x,y:bb.center.y}; 
		var label = this.createButtonLabel(r,properties.actiontype,buttoncenter);
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
		this.createButton(10,180,{x:-6,y:-54},{'actiontype':'N','name':'pan north','buttonType': 'narrow'});
		this.createButton(10,270,{x:10,y:-38},{'actiontype':'E','name':'pan east','buttonType': 'earrow'});
		//this.createButton(10,90,{x:16,y:16},{'actiontype':'O','name':'re-center','buttonType': ''});
		this.createButton(10,90,{x:-22,y:-38},{'actiontype':'W','name':'pan west','buttonType': 'warrow'});
		this.createButton(10,0,{x:-6,y:-20},{'actiontype':'S','name':'pan south','buttonType': 'sarrow'});			
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
		this.createButton(10,180,{x:-6,y:12},{'actiontype':'in','name':'zoom in','buttonType': 'plus'});		
		this.createButton(10,180,{x:-6,y:42},{'actiontype':'out','name':'zoom out','buttonType': 'minus'});	
	        this.applyLayer();
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
                                
                                if(s.y > lim.scale.y) t.scale.y = lim.scale.y;
                                if(s.x > lim.scale.x) t.scale.x = lim.scale.x;
		        }
		        
		        this.targetjs.transform(this.transformation);

		}
	},
	_panzoomClickHandler: function(e,hit,controller) {
		var pan = {};
		var t =controller.getTransformation();
		if(!t.scale) t.scale = {x:1,y:1};
		if(!t.translate) t.translate = {x:0,y:0};
		if(!t.rotate) t.rotate = {x:0,y:0,z:0};
		
		var scale =t.scale;
		pan.x = parseFloat(30 / scale.x);
		pan.y = parseFloat(30 / scale.y);
		
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
                //console.log("done",controller);
		return false;
	}
};
VismoController.prototype.panzoomcontrolsSVG ="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   xmlns:dc=\"http://purl.org/dc/elements/1.1/\"   xmlns:cc=\"http://creativecommons.org/ns#\"   xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"   xmlns:svg=\"http://www.w3.org/2000/svg\"   xmlns=\"http://www.w3.org/2000/svg\"   xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"   xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"   width=\"60px\"   height=\"120px\"   id=\"svg3820\"   sodipodi:version=\"0.32\"   inkscape:version=\"0.46\"   sodipodi:docname=\"panzoomcontrols.svg\"   inkscape:output_extension=\"org.inkscape.output.svg.inkscape\">  <defs     id=\"defs3\">    <linearGradient       id=\"linearGradient3735\">      <stop         style=\"stop-color:#ffffff;stop-opacity:1;\"         offset=\"0\"         id=\"stop3737\" />      <stop         style=\"stop-color:#0000f0;stop-opacity:1;\"         offset=\"1\"         id=\"stop3739\" />    </linearGradient>    <linearGradient       id=\"linearGradient3745\">      <stop         style=\"stop-color:#000000;stop-opacity:1;\"         offset=\"0\"         id=\"stop3747\" />      <stop         style=\"stop-color:#ffffef;stop-opacity:0;\"         offset=\"1\"         id=\"stop3749\" />    </linearGradient>    <inkscape:perspective       sodipodi:type=\"inkscape:persp3d\"       inkscape:vp_x=\"0 : 526.18109 : 1\"       inkscape:vp_y=\"6.123234e-14 : 1000 : 0\"       inkscape:vp_z=\"744.09448 : 526.18109 : 1\"       inkscape:persp3d-origin=\"372.04724 : 350.78739 : 1\"       id=\"perspective3826\" />  </defs>  <sodipodi:namedview     inkscape:document-units=\"mm\"     id=\"base\"     pagecolor=\"#ffffff\"     bordercolor=\"#666666\"     borderopacity=\"1.0\"     inkscape:pageopacity=\"0.0\"     inkscape:pageshadow=\"2\"     inkscape:zoom=\"4\"     inkscape:cx=\"14.379355\"     inkscape:cy=\"60.049799\"     inkscape:current-layer=\"layer1\"     showgrid=\"true\"     inkscape:window-width=\"1440\"     inkscape:window-height=\"776\"     inkscape:window-x=\"-84\"     inkscape:window-y=\"22\" />  <metadata     id=\"metadata4\">    <rdf:RDF>      <cc:Work         rdf:about=\"\">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />      </cc:Work>    </rdf:RDF>  </metadata>  <g     inkscape:label=\"Layer 1\"     inkscape:groupmode=\"layer\"     id=\"layer1\">    <rect       style=\"opacity:1;fill:#fafafa;fill-opacity:1;stroke:#000000;stroke-width:1.25095212000000000;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"       id=\"rect4374\"       width=\"3.036346\"       height=\"29.855259\"       x=\"26.456741\"       y=\"77.110023\" />    <path       sodipodi:type=\"arc\"       style=\"opacity:0;fill:#ffc100;fill-opacity:0.18999999;fill-rule:evenodd;stroke:#00d300;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:0.98500001\"       id=\"path2811\"       sodipodi:cx=\"36.681629\"       sodipodi:cy=\"40.457794\"       sodipodi:rx=\"22.848825\"       sodipodi:ry=\"23.466362\"       d=\"M 59.530455,40.457794 A 22.848825,23.466362 0 1 1 13.832804,40.457794 A 22.848825,23.466362 0 1 1 59.530455,40.457794 z\"       transform=\"translate(-10.077156,-13.286926)\" />    <path       sodipodi:type=\"star\"       style=\"fill:#ffffff\"       id=\"path2817\"       sodipodi:sides=\"5\"       sodipodi:cx=\"21.984276\"       sodipodi:cy=\"13.286215\"       sodipodi:r1=\"0.34933102\"       sodipodi:r2=\"0.17466551\"       sodipodi:arg1=\"-0.78539816\"       sodipodi:arg2=\"-0.15707963\"       inkscape:flatsided=\"false\"       inkscape:rounded=\"0\"       inkscape:randomized=\"0\"       d=\"M 22.23129,13.0392 L 22.156791,13.258891 L 22.295532,13.444808 L 22.063572,13.441843 L 21.929628,13.631245 L 21.860769,13.409722 L 21.639246,13.340862 L 21.828648,13.206918 L 21.825683,12.974959 L 22.0116,13.1137 L 22.23129,13.0392 z\"       transform=\"translate(-2.9137398,-0.9362086)\" />    <path       sodipodi:type=\"arc\"       style=\"fill:#fafafa;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.99893030000000005;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;opacity:1\"       id=\"path3847\"       sodipodi:cx=\"113.64216\"       sodipodi:cy=\"108.12209\"       sodipodi:rx=\"23.233507\"       sodipodi:ry=\"20.960665\"       d=\"M 136.87567,108.12209 A 23.233507,20.960665 0 1 1 90.408651,108.12209 A 23.233507,20.960665 0 1 1 136.87567,108.12209 z\"       transform=\"matrix(0.9778731,0,0,-1.0598112,-84.661617,141.94941)\" />    <path       style=\"fill:#dcdcdc;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       d=\"M 39.621219,21.031683 L 47.389849,26.975113 L 39.969679,33.117243 L 41.484209,27.164163 L 39.621219,21.031683 z\"       id=\"north\"       inkscape:label=\"north\"       sodipodi:nodetypes=\"ccccc\" />    <path       style=\"fill:#dcdcdc;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       d=\"M 20.231889,13.770245 L 26.175319,6.0016174 L 32.317449,13.421792 L 26.364359,11.907259 L 20.231889,13.770245 z\"       id=\"path3757\"       inkscape:label=\"north\"       sodipodi:nodetypes=\"ccccc\" />    <path       style=\"fill:#dcdcdc;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       d=\"M 20.048989,40.437803 L 25.992419,48.206433 L 32.134549,40.786253 L 26.181459,42.300793 L 20.048989,40.437803 z\"       id=\"path3761\"       inkscape:label=\"north\"       sodipodi:nodetypes=\"ccccc\" />    <path       style=\"fill:#dcdcdc;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       d=\"M 12.629649,33.160653 L 4.8610222,27.217223 L 12.281197,21.075093 L 10.766664,27.028173 L 12.629649,33.160653 z\"       id=\"path3765\"       inkscape:label=\"north\"       sodipodi:nodetypes=\"ccccc\" />    <path       sodipodi:type=\"arc\"       style=\"fill:#ff0000;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"       id=\"path3849\"       sodipodi:cx=\"114.65231\"       sodipodi:cy=\"133.62845\"       sodipodi:rx=\"0\"       sodipodi:ry=\"2.5253813\"       d=\"M 114.65231,133.62845 A 0,2.5253813 0 1 1 114.65231,133.62845 A 0,2.5253813 0 1 1 114.65231,133.62845 z\" />    <path       sodipodi:type=\"arc\"       style=\"fill:#fafafa;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:3.29227274000000003;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;opacity:1\"       id=\"path4600\"       sodipodi:cx=\"113.64216\"       sodipodi:cy=\"108.12209\"       sodipodi:rx=\"23.233507\"       sodipodi:ry=\"20.960665\"       d=\"M 136.87567,108.12209 A 23.233507,20.960665 0 1 1 90.408651,108.12209 A 23.233507,20.960665 0 1 1 136.87567,108.12209 z\"       transform=\"matrix(0.3044572,0,0,-0.3133744,-6.349179,108.99488)\" />    <path       sodipodi:type=\"arc\"       style=\"fill:#fafafa;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:3.29227274000000003;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;opacity:1\"       id=\"path4602\"       sodipodi:cx=\"113.64216\"       sodipodi:cy=\"108.12209\"       sodipodi:rx=\"23.233507\"       sodipodi:ry=\"20.960665\"       d=\"M 136.87567,108.12209 A 23.233507,20.960665 0 1 1 90.408651,108.12209 A 23.233507,20.960665 0 1 1 136.87567,108.12209 z\"       transform=\"matrix(0.3044572,0,0,-0.3133744,-6.5991733,140.49488)\" />    <path       style=\"fill:#dcdcdc;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;fill-opacity:1\"       d=\"M 29.344931,79.34136 L 26.693281,79.164583 L 26.870057,76.336156 L 22.804193,76.159379 L 23.157747,73.330952 L 26.870057,73.507729 L 26.870057,70.856078 L 29.875261,71.032855 L 29.875261,73.684505 L 33.587572,74.038059 L 33.587572,76.512933 L 29.521708,76.336156 L 29.344931,79.34136 z\"       id=\"path3299\" />    <path       style=\"fill:#dcdcdc;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;fill-opacity:1\"       d=\"M 26.781669,107.80241 L 22.715805,107.62563 L 23.069359,104.79721 L 26.781669,104.97398 L 29.786873,105.15076 L 33.499184,105.50431 L 33.499184,107.97919 L 29.43332,107.80241 L 26.781669,107.80241 z\"       id=\"path3301\"       sodipodi:nodetypes=\"ccccccccc\" />  </g></svg>";
