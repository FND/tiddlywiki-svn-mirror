/*requires VismoShapes
Adds controls such as panning and zooming to a given dom element.

Mousewheel zooming currently not working as should - should center on location where mousewheel occurs
Will be changed to take a handler parameter rather then a targetjs
 */

var VismoController = function(targetjs,elem,options){ //elem must have style.width and style.height etM
	if(!options) options = ['pan','zoom','mousepanning','mousewheelzooming'];

	if(typeof elem == 'string') elem= document.getElementById(elem);
	this.setMaxScaling(99999999);
	if(!elem.style.position) elem.style.position = "relative";
	this.wrapper = elem; //a dom element to detect mouse actions
	this.targetjs = targetjs; //a js object to run actions on (with pan and zoom functions)	

	var md = elem.onmousedown;
	var mu = elem.onmouseup;
	var mm = elem.onmousemove;
	for(var i=0; i < elem.childNodes.length; i++){
		var child = elem.childNodes[i];
		child.onmousedown = function(e){if(md)md(e);}
		child.onmouseup = function(e){if(mu)mu(e);}
		child.onmousemove = function(e){if(mm)mm(e);}
	}
	var controlDiv = this.wrapper.controlDiv;
	if(!controlDiv) {
		controlDiv = document.createElement('div');
		controlDiv.style.position = "absolute";
		controlDiv.style.top = "0";
		controlDiv.style.left = "0";
		controlDiv.className = 'easyControls'
		this.wrapper.appendChild(controlDiv);
		this.wrapper.controlDiv = controlDiv;
	}
	
	
	this.transformation = {'translate':{x:0,y:0}, 'scale': {x:1, y:1},'rotate': {x:0,y:0,z:0},origin:{}};	
	this.transformation.origin.x = parseInt(elem.style.width) / 2;
	this.transformation.origin.y = parseInt(elem.style.height) / 2;
	//looks for specifically named function in targetjs
	if(!this.targetjs.transform) alert("no transform function defined in " + targetjs+"!");
	this.wrapper.easyController = this;
	this.enabled = true;
	this.addControls(options);

};
VismoController.prototype = {
	getTransformation: function(){
		return this.transformation;
	}
	,addMouseWheelZooming: function(){ /*not supported for internet explorer*/
		if(VismoUtils.browser.isIE) return;
		this.crosshair = {lastdelta:false};
		this.crosshair.pos = {x:0,y:0};
		this.crosshair.el =document.createElement("div");
		this.crosshair.el.style.position = "absolute";
		this.crosshair.el.className = "easyController_crosshair";
		this.crosshair.el.appendChild(document.createTextNode("+"));
		this.crosshair.el.style.zIndex = 3;
		var t = this.getTransformation();
		this.crosshair.el.style.left = parseInt(t.origin.x-5) + "px";
		this.crosshair.el.style.top = parseInt(t.origin.y-5) + "px";
		this.crosshair.el.style.width = "10px";
		this.crosshair.el.style.height = "10px";
		this.crosshair.el.style.display = "table";
		this.crosshair.el.style.verticalAlign = "middle";
		this.crosshair.el.style.textAlign = "center";
		this.wrapper.appendChild(this.crosshair.el);
		var mw = this.wrapper.onmousewheel;
		

		var that = this;
		var mm = this.wrapper.onmousemove;
		


		var onmousewheel = function(e){
	        	if (!e) return;/* For IE. */
	                
			e.preventDefault();		
					
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;

			if(!that.goodToTransform(e)) return;
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
	
			var sensitivity = 0.8;
			var scale =that.transformation.scale;
			var origin = that.transformation.origin;


			var mousepos = VismoClickingUtils.getMouseFromEvent(e);
	
			var w = parseInt(that.wrapper.style.width) / 2;
			var h = parseInt(that.wrapper.style.height) / 2;
			var translation =  VismoTransformations.undoTransformation(mousepos.x,mousepos.y,that.transformation);
			that.transformation.translate= {x: -translation.x, y: -translation.y};
			//{x: -mousepos.x + w,y: -mousepos.y + h};
			that.transformation.origin = {
											x: mousepos.x,
											y: mousepos.y
										};
			
			that.crosshair.el.style.left = mousepos.x + "px";
			that.crosshair.el.style.top = mousepos.y + "px";
			if(!that.crosshair.lastdelta) {
				that.crosshair.lastdelta = delta;
			}

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
					that.transform();					
				}

			}
			


			
			return false;

		};

		
		var element = this.wrapper;

		if (element.addEventListener){
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
		
		if(t.getAttribute("class") == "easyControl") return false;
		
		return true;
		
	}
	,addMousePanning: function(){
		var that = this;
		var md = that.wrapper.onmousedown;
		var mu = that.wrapper.onmouseup;	
		var mm = that.wrapper.onmousemove;
		var panning_status = false;	
		
		var cancelPanning = function(e){
			panning_status = false;
			that.wrapper.style.cursor= '';
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
			
			var t = that.transformation;
			//if(this.transformation) t = this.transformation;
			var sc = t.scale;

			/* work out deltas */
			var xd =parseFloat(pos.x /sc.x);
			var yd = parseFloat(pos.y / sc.y);
			t.translate.x = panning_status.translate.x + xd;
			t.translate.y =panning_status.translate.y +yd;

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

			if(target.getAttribute("class") == "easyControl") return;

			var t = that.transformation.translate;
			var sc =that.transformation.scale; 
			var realpos = VismoClickingUtils.getMouseFromEvent(e);
			if(!realpos) return;
			this.easyController = that;
			
			var element = VismoClickingUtils.resolveTargetWithVismoClicking(e);
			
			panning_status =  {clickpos: realpos, translate:{x: t.x,y:t.y},elem: element,isClick:true};
			that.wrapper.onmousemove = onmousemove;
			that.wrapper.style.cursor= "move";	
		};
		
		this.wrapper.onmouseup = function(e){
			if(panning_status.isClick && mu){mu(e);};
			cancelPanning(e);

		};
		
		jQuery(document).mousemove(function(e){
			if(panning_status){
				var t= VismoClickingUtils.resolveTargetWithVismoClicking(e);
				if(t != that.wrapper)cancelPanning(e);
			}
		});
	
	},
	setTransformation: function(t){
		if(this.enabled){
			if(!t.scale && !t.translate && !t.rotate) alert("bad transformation applied - any call to setTransformation must contain translate,scale and rotate");
			this.transformation = t;
			this.targetjs.transform(t);
		}
		//console.log("transformation set to ",t);
	},
	createButtonLabel: function(r,type){
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
		var label = this.createButtonLabel(r,properties.actiontype);
		label.render(canvas,{translate:{x:0,y:0}, scale:{x:1,y:1},origin:{x:offset.x + r,y:offset.y + r}});
		canvas.easyClicking.add(button);
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
	
	_createcontrollercanvas: function(width,height){
		var newCanvas = document.createElement('canvas');
		jQuery(newCanvas).css({width: width, height:height,position:"absolute",left:0,top:0,'z-index': 15});
		newCanvas.width = width;
		newCanvas.height = height;
		newCanvas.setAttribute("class","easyControl");
		this.wrapper.appendChild(newCanvas);
		newCanvas.easyController = this;
		newCanvas.easyClicking = new VismoClickableCanvas(newCanvas);
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
		if(this.enabled){
			var t = this.transformation;
			var s = t.scale;
			var tr = t.translate;
			if(s.x <= 0) s.x = 0.1125;
			if(s.y <= 0) s.y = 0.1125;

			this.targetjs.transform(this.transformation);

		}
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
