var VismoDrawingTools = function(wrapper){
	this.wrapper =wrapper;
	this._setup(wrapper);
	this.toolCommand = false;
	this.commands = {};
	
	this.tooltip = document.createElement("div");
	this.tooltip.style.position = "absolute";
	this.tooltip.className = "tooltip";
	this.wrapper.appendChild(this.tooltip);
	this.setupMouseHandlers();
	this.innerHTML = "love me!";
};


VismoDrawingTools.prototype = {

	setupMouseHandlers: function(){
		var vismoDrawingTools = this;
		var omm = this.wrapper.onmousemove;
		var omd = this.wrapper.onmousedown;
		this.wrapper.onmousemove = function(e){
			if(omm) omm(e);
			vismoDrawingTools.setTooltip(e);
		};
		
		this.wrapper.onmousedown = function(e){
			if(omd) omd(e);
			if(!e) e = window.event;
			if(e.button <= 1){//left mouse
				var command = vismoDrawingTools.getCurrentCommand();
				if(command && command.type){
					if(command.type == 'drawEdge'){
						if(!command.start){
							var c = vismoDrawingTools.getCommandAction("lineStart");
							if(c){
								var result = c(e,command);
								command.start = result;
							}	
						}
						else if(!command.end){
							var c = vismoDrawingTools.getCommandAction("lineEnd");
							if(c){
								c(e,command);
							}					
							vismoDrawingTools.setCurrentCommand(false);
						}
					}
					else if(command.type == 'delete'){
						//vismoDrawingTools.wrapper.style.cursor = "crosshair";
						var c = vismoDrawingTools.getCommandAction("delete");
						if(c){c(e);}
					
					}
					else if(command.type == 'newNode'){
					//	vismoDrawingTools.wrapper.style.cursor = "move";
							command.type = 'shapeEnd';
					}
					else if(command.type == 'shapeEnd'){
						var c = vismoDrawingTools.getCommandAction("shapeEnd");
						if(c){
							c(e,command);
						}
						vismoDrawingTools.setCurrentCommand(false);
					}
					else{
						//unrecognised command
						//console.log("dont recognise",command.type);
					}

				
				}
				else{
					var c = vismoDrawingTools.getCommandAction("none");
					if(c){
						c(e);
					}
					vismoDrawingTools.wrapper.style.cursor = "hand";
				}
			
			}
			else{//right mouse
				vismoDrawingTools.toolCommand.start = false;
				var c = vismoDrawingTools.getCommandAction("rightmouse");
				if(c){
					c(e);
				}
			

			}
		}
	

	}
	,setTooltip: function(e){
		
		
		var xy =VismoClickingUtils.getMouseFromEvent(e);
		this.tooltip.style.left = parseInt(xy.x +10) + "px";
		this.tooltip.style.top = parseInt(xy.y + 10) + "px";
		var command = this.getCurrentCommand();
	
				switch(command.type){
						case "drawEdge":
							this.tooltip.innerHTML ="&larr;";
							break;
						default:
							this.tooltip.innerHTML = "";
				}
		
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
		newCanvas.className ="vismoDrawingToolbar";
		newCanvas.height = height;
		newCanvas.style.position = "absolute";
		newCanvas.style.left =this.wrapper.width;
		newCanvas.style.top = 0;
		newCanvas.style.zIndex = 3;
		newCanvas.setAttribute("class","vismoDrawingTools");
		this.wrapper.appendChild(newCanvas);

		newCanvas.vismoDrawingTools = this;
		newCanvas.vismoClicking = new VismoClickableCanvas(newCanvas);
		
		var vismoDrawingTools = this;
		newCanvas.onmousedown = function(e){
			
			var s =this.vismoClicking.getShapeAtClick(e);
			if(s){
		
				switch(s.properties.action){
					case "save":
						var action = vismoDrawingTools.getCommandAction("save");
						if(action) action();
						break;
					case "delete":
						vismoDrawingTools.setCurrentCommand({type: "delete"});
						break;
					case "newLine":
						vismoDrawingTools.setCurrentCommand({type: "drawEdge",start: false, end: false});
						break;
					case "newShape":
						vismoDrawingTools.setCurrentCommand({type: "newNode"});
						var action = vismoDrawingTools.getCommandAction("shapeStart");
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
	/*
		if(p.label == 'line'){
			p.vismoShapeLabel =new VismoShape({shape:'path'}, [left+padding,top+w,left+width-padding,top+w]);			
		}
		else if(p.label == 'box'){
			p.vismoShapeLabel =new VismoShape({shape:'image',src:'icons/poly.png',width:width,height:height}, [left,top]);			
		}
		else if(p.label == 'save'){
			p.vismoShapeLabel =new VismoShape({shape:'image',src:'icons/save.png', alt:'save'}, [left,top,left+width,top,left+width,top+height,left,top+height]);
												
		}
		else if(p.label == 'cross'){
			p.vismoShapeLabel =new VismoShape({shape:'path',stroke:'rgb(255,0,0)'}, [left+padding,top+height-padding,left+width-padding,top+padding,"M",left+padding,top+padding,left+width-padding,top+height-padding]);			
		}
		else if(p.label == 'dropdown'){
			p.vismoShapeLabel = new VismoShape({shape:'path'}, [left+padding,top+height - 5,left+w,top+height-padding,left+width-padding,top+height - 5]);
		}*/
		
		
		var c = [left,top, left + width,top,left+width,top+height, left,top+height];
		var s = new VismoShape(p,c);
		s.render(canvas);
		//if(p.vismoShapeLabel) p.vismoShapeLabel.render(canvas);
		return s;
	}
	,_setup: function(wrapper){
		var canvas = this._createclickablecanvas(50,parseInt(wrapper.style.height));
		var vismoClicking = canvas.vismoClicking;
		var width = 20;
		var height = 20;
		var padding = 5;
		vismoClicking.add(this._createButton(canvas,5,5,{action:"newShape",label:"box",title: "new node"}));
		vismoClicking.add(this._createButton(canvas,5+(height+padding),5,{action: "newLine", label:"line", title: "new edge"}));
		vismoClicking.add(this._createButton(canvas,5+height+padding,10+width,{action:"changeEdgeType",label:"dropdown2",width:10,height:10,padding:1, title: "edge options"}));
		
		vismoClicking.add(this._createButton(canvas,5+((height+padding)*2),5,{action: "delete", label:"cross",title: "delete node"}));
		vismoClicking.add(this._createButton(canvas,5+((height+padding) *3),5,{action: "save", label: "save",title: "save drawing"}));
				
		var tooltip = document.createElement("div");
		tooltip.style.position = "absolute";	
		//tooltip.style.zIndex = 30;
		tooltip.innerHTML = "..";
		this.tooltip = tooltip;

	}
};
