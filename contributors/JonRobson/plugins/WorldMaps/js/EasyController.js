var EasyMapController = function(targetjs,elem){ //elem must have style.width and style.height
	this.wrapper = elem; //a dom element to detect mouse actions
	this.targetjs = targetjs; //a js object to run actions on (with pan and zoom functions)	
	this.utils = EasyMapUtils; //some utilities that it may find useful
	
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
};
EasyMapController.prototype = {
	addMouseWheelZooming: function(){
		var mw = this.wrapper.onmousewheel;
		var that = this;
		var onmousewheel = function(e){
	        	if (!e) /* For IE. */
	                e = window.event;
			e.preventDefault();		
					
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;

	
	
			var t = EasyMapUtils.resolveTarget(e);
		
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
				var pos = that.utils.getMouseFromEventRelativeToCenter(e);
				var t=  that.transformation.translate;
				var newx = s.x+ delta;
				var newy = s.y + delta;
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
			
			var p =this.panning;
			if(!p) return;
			if(!p) return;
			var t = EasyMapUtils.resolveTarget(e);
			if(t.getAttribute("class") == "easyControl") return;
			var pos = that.utils.getMouseFromEventRelativeTo(e,p.clickpos.x,p.clickpos.y);		
			if(!pos)return;
			
			var t = that.transformation;
			if(this.transformation) t = this.transformation;
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
			var target = EasyMapUtils.resolveTarget(e);
			if(!target) return;
			if(target.getAttribute("class") == "easyControl") return;
			
			var t = that.transformation.translate;
			var sc =that.transformation.scale; 
			var realpos = that.utils.getMouseFromEvent(e);
			if(!realpos) return;

			this.panning= {clickpos: realpos, translate:{x: t.x,y:t.y},isClick:true};
			that.wrapper.onmousemove = onmousemove;
			that.wrapper.style.cursor= "move";
			this.style.cursor = "move";

		};
		
		this.wrapper.onmouseup = function(e){
			
			that.wrapper.style.cursor= '';
			that.wrapper.onmousemove = mm;
			if(this.panning && this.panning.isClick && mu){ mu(e);}
			this.panning = null;

			
			return false;
		};
	
	
	},
	setTransformation: function(t){
		if(!t.scale && !t.translate && !t.rotate) alert("bad transformation applied - any call to setTransformation must contain translate,scale and rotate");
		this.transformation = t;
		this.wrapper.transformation = t;
		this.targetjs.transform(t);
		//console.log("transformation set to ",t);
	},
	drawButtonLabel: function(ctx,r,type){
		ctx.beginPath();
		if(type == 'arrow'){
			ctx.moveTo(0,-r);
			ctx.lineTo(0,r);
			ctx.moveTo(0,r);
			ctx.lineTo(-r,0);
			ctx.moveTo(0,r);
			ctx.lineTo(r,0);
		}
		else if(type == 'plus'){
			ctx.moveTo(-r,0);
			ctx.lineTo(r,0);
			ctx.moveTo(0,-r);
			ctx.lineTo(0,r);
		}
		else if(type == 'minus'){
			ctx.moveTo(-r,0);
			ctx.lineTo(r,0);

		}
		ctx.stroke();
		ctx.closePath();
		
	},	
	drawButton: function(canvas,width,angle,offset,properties) {
		var ctx = canvas.getContext('2d');
		var rad = angle ? EasyMapUtils._degToRad(angle) : 0;
		var w = width || 100;
		var r = w/2;
		var l = w/10;
		offset = {
			x: offset.x || 0,
			y: offset.y || 0
		};
		ctx.save();
		ctx.lineWidth = l;
		ctx.fillStyle = "rgba(150,150,150,0.8)";
		ctx.beginPath();
		ctx.translate(offset.x+r,offset.y+r);
		ctx.rotate(rad);
		ctx.moveTo(-r,r);
		ctx.lineTo(r,r);
		ctx.lineTo(r,-r);
		ctx.lineTo(-r,-r);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		this.drawButtonLabel(ctx,r,properties.buttonType);
		ctx.restore();
		
		var coords = [
			offset.x, offset.y,
			offset.x + width, offset.y,
			offset.x + width, offset.y + width,
			offset.x, offset.y + width
		];
		var button = new EasyShape(properties,coords);
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
		newCanvas.width = width;
		newCanvas.height = height;
		newCanvas.style.position = "absolute";
		newCanvas.style.left = 0;
		newCanvas.style.top = 0;
		newCanvas.style["z-index"] = 3;
		newCanvas.setAttribute("class","easyControl");
		this.wrapper.appendChild(newCanvas);

		newCanvas.controller = this;
		if(!newCanvas.getContext) {
			G_vmlCanvasManager.init_(document);
		}
		newCanvas.memory = [];
		//return clickableCanvas(newCanvas);
		return newCanvas;
	},
	addPanningActions: function(controlDiv){
		var panCanvas = this._createcontrollercanvas(44,44);		
		panCanvas.memory.push(this.drawButton(panCanvas,10,180,{x:16,y:2},{'actiontype':'N','name':'pan north','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,270,{x:30,y:16},{'actiontype':'E','name':'pan east','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,90,{x:2,y:16},{'actiontype':'W','name':'pan west','buttonType': 'arrow'}));
		panCanvas.memory.push(this.drawButton(panCanvas,10,0,{x:16,y:30},{'actiontype':'S','name':'pan south','buttonType': 'arrow'}));			
		panCanvas.onclick = this._panzoomClickHandler;		

	},
	addRotatingActions: function(){
		
		var rotateCanvas = this._createcontrollercanvas(44,40);		
		rotateCanvas.memory.push(this.drawButton(rotateCanvas,10,270,{x:30,y:16},{'actiontype':'rotatezright','name':'rotate to right','buttonType': 'arrow'}));
		rotateCanvas.memory.push(this.drawButton(rotateCanvas,10,90,{x:2,y:16},{'actiontype':'rotatezleft','name':'rotate to left','buttonType': 'arrow'}));
		rotateCanvas.onclick = this._panzoomClickHandler;

	},	
	addZoomingActions: function(){
		var zoomCanvas = this._createcontrollercanvas(20,30);

		var left = 14;
		var top = 50;
		zoomCanvas.style.left = left +"px";
		zoomCanvas.style.top = top + "px";
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:2},{'actiontype':'in','name':'zoom in','buttonType': 'plus'}));		
		zoomCanvas.memory.push(this.drawButton(zoomCanvas,10,180,{x:2,y:16},{'actiontype':'out','name':'zoom out','buttonType': 'minus'}));
		zoomCanvas.onclick = this._panzoomClickHandler;	
	},	
	
	transform: function(){
		var t = this.transformation;
		var s = t.scale;
		var tr = t.translate;
		var style = this.wrapper.style;
		
		
		var width = parseInt(style.width);
		var height = parseInt(style.height);
		if(s.x <= 0) s.x = 0.1;
		if(s.y <= 0) s.y = 0.1;
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
		this.targetjs.transform(this.transformation);
	},
	_panzoomClickHandler: function(e) {
		
		if(!e) {
			e = window.event;
		}
		var controller = this.controller;
			
		var hit = controller.utils.getShapeAtClick(e);
		if(!hit) {
		
			return false;
		}

		var pan = {};
		var t =controller.transformation;
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
				t.rotate.z -= 0.1;
				var left =6.28318531;
				
				if(t.rotate.z <0 )t.rotate.z =left;
				break;
			case "rotatezleft":
				t.rotate.z += 0.1;
				break;
			default:
				break;
		}
		controller.transform();

		return false;
	}
};