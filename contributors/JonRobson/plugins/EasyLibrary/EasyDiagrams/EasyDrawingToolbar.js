var EasyDrawingTools = function(wrapper){
	this.wrapper =wrapper;
	this._setup(wrapper);
	this.toolCommand = false;
	this.commands = {};
	this.setupMouseHandlers();
	
};


EasyDrawingTools.prototype = {

	setupMouseHandlers: function(){
		var easyDrawingTools = this;
		var omm = this.wrapper.onmousemove;
		var omd = this.wrapper.onmousedown;
		this.wrapper.onmousemove = function(e){
			if(omm) omm(e);
			easyDrawingTools.setTooltip(e);
		};
		
		this.wrapper.onmousedown = function(e){
			if(omd) omd(e);
			if(!e) e = window.event;
			if(e.button <= 1){//left mouse
				var command = easyDrawingTools.getCurrentCommand();
				if(command && command.type){
					if(command.type == 'drawEdge'){
						if(!command.start){
							var c = easyDrawingTools.getCommandAction("lineStart");
							if(c){
								var result = c(e,command);
								command.start = result;
							}	
						}
						else if(!command.end){
							var c = easyDrawingTools.getCommandAction("lineEnd");
							if(c){
								c(e,command);
							}					
							easyDrawingTools.setCurrentCommand(false);
						}
					}
					else if(command.type == 'delete'){
						var c = easyDrawingTools.getCommandAction("delete");
						if(c){c(e);}
						easyDrawingTools.setCurrentCommand(false);
					}
					else if(command.type == 'newNode'){
							command.type = 'shapeEnd';
					}
					else if(command.type == 'shapeEnd'){
						var c = easyDrawingTools.getCommandAction("shapeEnd");
						if(c){
							c(e,command);
						}
						easyDrawingTools.setCurrentCommand(false);
					}
					else{
						//unrecognised command
						console.log("dont recognise",command.type);
					}

				
				}
				else{
					var c = easyDrawingTools.getCommandAction("none");
					if(c){
						c(e);
					}
				}
			
			}
			else{//right mouse
				easyDrawingTools.toolCommand.start = false;
				var c = easyDrawingTools.getCommandAction("rightmouse");
				if(c){
					c(e);
				}
			

			}
		}
	

	}
	,setTooltip: function(e){
		
		var newpos =EasyClickingUtils.getMouseFromEvent(e);
		newpos.x + 20;
		newpos.y + 20;
		//this.tooltip.style.left = newpos.x + "px";
		//this.tooltip.style.top = newpos.y + "px";
		
		var command = this.easyDrawingTools.getCurrentCommand();
		if(command.type){
		this.tooltip.innerHTML =command.type;
		}
		else
		this.tooltip.innerHTML = "";
	
	}
	
	,setCurrentCommand: function(json){
		if(!json){
			json = {type:'false'};
		}
		
		
		if(!json.type) throw "json must have a type property!";
		if(json.type == 'false') json.type = false;
		this.toolCommand = json;
	
	}
	,getCurrentCommand: function(){
		if(!this.toolCommand) this.toolCommand = {type:false};
		return this.toolCommand;
	}
	/*accepted ids:
	
	lineStart, lineEnd
	shapeStart
	save
	rightmouse
	none (default where no tool is selected)
	*/
	
	,setCommandAction: function(id,action){
		this.commands[id] = {};
		this.commands[id].action = action;
	}
	,getCommandAction: function(id){
		if(this.commands[id]) {
			if(this.commands[id].action){
				return this.commands[id].action;
			}
		}
		
		return false;
	}
	,_createclickablecanvas: function(width,height){
		var newCanvas = document.createElement('canvas');
		newCanvas.style.width = width;
		newCanvas.style.height = height;
		newCanvas.width = width;
		newCanvas.className ="easyDrawingToolbar";
		newCanvas.height = height;
		newCanvas.style.position = "absolute";
		newCanvas.style.left = parseInt(this.wrapper.width);
		newCanvas.style.top = 0;
		newCanvas.style.zIndex = 3;
		newCanvas.setAttribute("class","easyDrawingTools");
		this.wrapper.appendChild(newCanvas);

		newCanvas.easyDrawingTools = this;
		newCanvas.easyClicking = new EasyClicking(newCanvas);
		
		var easyDrawingTools = this;
		newCanvas.onmousedown = function(e){
			
			var s =this.easyClicking.getShapeAtClick(e);
			if(s){
		
				switch(s.properties.action){
					case "save":
						var action = easyDrawingTools.getCommandAction("save");
						if(action) action();
						break;
					case "delete":
						easyDrawingTools.setCurrentCommand({type: "delete"});
						break;
					case "newLine":
						easyDrawingTools.setCurrentCommand({type: "drawEdge",start: false, end: false});
						break;
					case "newShape":
						easyDrawingTools.setCurrentCommand({type: "newNode"});
						var action = easyDrawingTools.getCommandAction("shapeStart");
						if(action) action();
						break;
					default:
						break;
				}
			}
		};
		return newCanvas;
	}
	,_createButton: function(canvas,top,left,properties){
		var p = {};
		p.shape = "polygon";
		p.fill = "rgb(100,100,100)";
		var i;
		for(i in properties){
			p[i] = properties[i];
		}
		if(!p.width){
			p.width = 20;
		}
		if(!p.height){
			p.height = 20;
		}
		if(!p.padding){
			p.padding = 5;
		}
		var width = p.width;
		var height = p.height;
		var padding = p.padding;
		
		var w = width / 2;
		if(p.label == 'line'){
			p.easyShapeLabel =new EasyShape({shape:'path'}, [left+padding,top+w,left+width-padding,top+w]);			
		}
		else if(p.label == 'box'){
			p.easyShapeLabel =new EasyShape({shape:'path'}, [left+padding,top+height-padding,left-padding+width,top+height-padding,left+width-padding,top+padding,left+padding,top+padding]);			
		}
		else if(p.label == 'save'){
			p.easyShapeLabel =new EasyShape({shape:'path'}, 
			[
			left+padding,top+height-padding,
			left+width-padding,top+height-padding,
			left+width-padding,top+padding,
			left+padding,top+padding,
			left+padding,top+height-padding,
			
			"M",
			left+padding+2,top+padding+2,
			left+width-padding-2,top+padding+2,
			left+width-padding-2,top+height-padding-8,
			left+padding+2,top+height-padding-8,
			left+padding+2,top+padding+2
			
			,"M",
			left+padding+2,top+height-padding-2,
			left+width-padding-2,top+height-padding-2,
			left+width-padding-2,top+height-padding-8,
			left+padding+2,top+height-padding-8,
			left+padding+2,top+height-padding-2
		


			]);									
		}
		else if(p.label == 'cross'){
			p.easyShapeLabel =new EasyShape({shape:'path',stroke:'rgb(255,0,0)'}, [left+padding,top+height-padding,left+width-padding,top+padding,"M",left+padding,top+padding,left+width-padding,top+height-padding]);			
		}
		else if(p.label == 'dropdown'){
			p.easyShapeLabel = new EasyShape({shape:'path'}, [left+padding,top+height - 5,left+w,top+height-padding,left+width-padding,top+height - 5]);
		}
		
		
		var c = [left,top, left + width,top,left+width,top+height, left,top+height];
		var s = new EasyShape(p,c);
		s.render(canvas);
		if(p.easyShapeLabel) p.easyShapeLabel.render(canvas);
		return s;
	}
	,_setup: function(wrapper){
		var canvas = this._createclickablecanvas(50,parseInt(wrapper.style.height));
		var easyClicking = canvas.easyClicking;
		var width = 20;
		var height = 20;
		var padding = 5;
		easyClicking.addToMemory(this._createButton(canvas,5,5,{action:"newShape",label:"box",title: "new node"}));
		easyClicking.addToMemory(this._createButton(canvas,5+(height+padding),5,{action: "newLine", label:"line", title: "new edge"}));
		easyClicking.addToMemory(this._createButton(canvas,5+height+padding,10+width,{action:"changeEdgeType",label:"dropdown2",width:10,height:10,padding:1, title: "edge options"}));
		
		easyClicking.addToMemory(this._createButton(canvas,5+((height+padding)*2),5,{action: "delete", label:"cross",title: "delete node"}));
		easyClicking.addToMemory(this._createButton(canvas,5+((height+padding) *3),5,{action: "save", label: "save",title: "save drawing"}));
				
		var tooltip = document.createElement("div");
		tooltip.style.position = "absolute";	
		//tooltip.style.zIndex = 30;
		tooltip.innerHTML = "..";
		this.tooltip = tooltip;

	}
};
