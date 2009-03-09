var EasyDiagram = function(wrapper,easyGraph,controller){
	if(!easyGraph){
		easyGraph = new EasyGraph();
	}
	if(!controller){
		controller = {
			renderLabel: function(domElement,value){
				domElement.innerHTML = value;
			}
			,saveHandler: function(easyDiagram,json){
				alert(json);
			}
		};
	}
	this.wrapper = wrapper;
	this.controller = controller;
	this.tempshapes = {};
	this.easyShapeToNode = {};
	this.labelContainer = document.createElement("div");
	this.labelContainer.style.overflow = "hidden";
	this.labelContainer.style.position = "absolute";
	this.labelContainer.style.width = this.wrapper.style.width;
	this.labelContainer.style.height = this.wrapper.style.height;
	this.labelContainer.className = "annotations";
	wrapper.appendChild(this.labelContainer);
	
	
	this.easyGraph = easyGraph;
	this.resizing = {};	
	wrapper.style.position = "relative";
	wrapper.className = "easyDiagram";
	var width,height;
	if(!wrapper.style.width){
		width= 600;
		height = 400;	
		wrapper.style.width = width + "px";
		wrapper.style.height = height + "px";
		
	}
	else{
		width = parseInt(wrapper.style.width);
	 	height= parseInt(wrapper.style.height);
		
	}


	this.canvas = document.createElement("canvas");
	this.canvas.width = width;
	this.canvas.height = height;
	
	this.canvas.style.border = "solid 1px black";
	
	this.wrapper.appendChild(this.canvas);
	this.easyDrawingTools = new EasyDrawingTools(this.wrapper);
	
	this.easyClicking = new EasyClicking(this.wrapper);
	this.setupMouseHandlers();
		
	this.easyController = new EasyMapController(this,this.wrapper);
	this.easyController.addControl("pan");
	this.easyController.addControl("mousepanning");
	this.easyController.addControl("mousewheelzooming");
	this.easyController.addControl("zoom");
	this.transform({});
		
	
	this._setDrawingCommands();
	
	
};

EasyDiagram.prototype = {
	_setDrawingCommands: function(){
		/*helpers*/		
		var getshape = function(e){
			var s = easyDiagram.easyClicking.getShapeAtClick(e);
			if(!s) return false;
			if(s.getProperty("_temp")) return false;
			var target = EasyClickingUtils.resolveTarget(e);
			if(target.className == "easyControl") return false;
			if(target.className == "easyDrawingTools") return false;
			return s;
		};
		
		/*saving */
		var easyDiagram = this;
		var easyGraph = this.getEasyGraph();
		var saveaction = function(){
			easyDiagram.controller.saveHandler(easyDiagram,easyGraph.burntojson());
		};
		this.easyDrawingTools.setCommandAction("save",saveaction);
		
		/* move around shapes */
		var nocommand = function(e){
			if(easyDiagram.resizing.onNode)return;
			var s = getshape(e);
			if(s)easyDiagram.selectShape(s);
		};
		this.easyDrawingTools.setCommandAction("none",nocommand);
		
		/*right click*/
		var rightclick = function(e){
		
			easyDiagram.selectShape(false);
			easyDiagram.deleteTemporaryShape("pathinprogress");	
		};	
		this.easyDrawingTools.setCommandAction("rightmouse",rightclick);
		
		/*start line*/
		var startLine = function(e){
			var s = getshape(e);
		
			if(!s) return;
			var t = easyDiagram.getTransformation();
			var startpos =EasyClickingUtils.getRealXYFromMouse(e,t);
			var p = new EasyShape({shape:"path",stroke: '#000000',lineWidth: '1'},[startpos.x,startpos.y,startpos.x,startpos.y]);
			easyDiagram.addTemporaryShape("pathinprogress",p);
			
			return s.properties.id;
		};
		this.easyDrawingTools.setCommandAction("lineStart",startLine);
		
		/*end line */
		var endLine = function(e,command){
			var s = getshape(e); 
			if(!s) return;
			easyGraph.addEdge(command.start, s.properties.id);	
			easyDiagram.deleteTemporaryShape("pathinprogress");
			easyDiagram.render();
		}
		this.easyDrawingTools.setCommandAction("lineEnd",endLine);
		
		/*shape Start */
		var newnode = function(e){
			var uniqueid = Math.random();
			easyGraph.addNode({id:uniqueid,properties:{label: "new node",shape:'polygon'}});
			s = easyGraph.getNode(uniqueid).getEasyShape();	
			easyDiagram.selectShape(s);
			easyDiagram.render();
		};
		this.easyDrawingTools.setCommandAction("shapeStart",newnode);
		
		var laynode = function(e){
			easyDiagram.selectShape(false);
		}
		this.easyDrawingTools.setCommandAction("shapeEnd",laynode);
		/*delete */
		var deleteCommand = function(e){
			var s = getshape(e);
			if(s)easyDiagram.deleteShape(s);	
		}
		this.easyDrawingTools.setCommandAction("delete",deleteCommand);
		
		
	}
	,getEasyGraph: function(){
		return this.easyGraph;
	}
	,getTemporaryShape: function(name){
		if(!this.tempshapes[name]) 
			return false;
		else
			return this.tempshapes[name];
	}
	,addTemporaryShape: function(name,easyShape,clickable){
		this.tempshapes[name] = easyShape;
		if(clickable){			
			easyShape.setProperty("_clickable",true);
		}
	
	}
	,deleteTemporaryShape: function(name){
		delete this.tempshapes[name];
		
	}
	,getNodeFromShape: function(easyShape){
		if(this.easyShapeToNode[easyShape.properties.id])
			return this.easyShapeToNode[easyShape.properties.id]
		else
			return false;
	}
	,selectShape: function(s){
		var command =this.easyDrawingTools.getCurrentCommand();
		var easyDiagram = this;
		if(s && !easyDiagram.selectedShape){//highlight with box?
			if(command.type == 'editlabel' || command.type == 'drawEdge') return;
			easyDiagram.selectedShape = s;
			s.setProperty("_oldcolor",s.getProperty("fill"));
			easyDiagram.selectedShape.properties.fill = "rgb(255,255,255)";
		}
		else{

			if(easyDiagram.selectedShape){
				easyDiagram.selectedShape.properties.fill = easyDiagram.selectedShape.getProperty("_oldcolor");
			}
			easyDiagram.selectedShape= false;

		}
		
		easyDiagram.render();
		
	}

	,drawTemporaryLines: function(x,y){
		var line =this.getTemporaryShape("pathinprogress");
		if(line){
			var c = line.getCoordinates();
			c[2]= x;
			c[3]= y;
			line.setCoordinates(c);
		}
	}
	
	,moveSelectedShapes: function(x,y){
		if(this.selectedShape) {
			var shape = this.selectedShape;
			var node = this.getNodeFromShape(shape);
			if(node)node.setPosition(x - 20,y - 20);
		}
		this.render();
	}
	,deleteShape: function(easyShape){
		var n = this.getNodeFromShape(easyShape);
		
		if(n.properties.shape != 'path'){
			var view =n.getProperty("_labelHolder");
			view.style.display = "none";
			this.getEasyGraph().deleteNode(n);
			this.render();
		}
	}
	
	,setTransformation: function(t){
		this.easyController.setTransformation(t);
	}
	,getTransformation: function(){
		return this.tmatrix;
	}
	,setupMouseHandlers: function(){
		var easyDiagram = this;
		var easyGraph = this.easyGraph;
		var easyDrawingTools = this.easyDrawingTools;
		var omm = this.wrapper.onmousemove;
		var omd = this.wrapper.onmousedown;
		
		this.wrapper.onmousemove = function(e){		
			//if(omm) omm(e);				
			var t = easyDiagram.getTransformation();
			var newpos =EasyClickingUtils.getRealXYFromMouse(e,t);
			easyDiagram.moveSelectedShapes(newpos.x,newpos.y);
			easyDiagram.performResizing(e);
			
			easyDiagram.drawTemporaryLines(newpos.x,newpos.y);
			easyDiagram.render();
		}
		
		var omd = this.wrapper.onmousedown;
		this.wrapper.onmousedown = function(e){
			var target = EasyClickingUtils.resolveTarget(e);
	
			if(target.tagName == "A"){	
				return;
			}
			
			if(omd)omd(e);
			if(easyDiagram.resizing.onNode){
				easyDiagram.resizing = {};
				easyDiagram.easyController.enable();
			}
			else{
				var s = easyDiagram.easyClicking.getShapeAtClick(e);
				if(s){	
					if(s.getProperty("_resizer")){
						easyDiagram.startResizing(s);
					}
				}
			}
			

		};
		
	}
	,performResizing: function(e){
		var resizer = this.getTemporaryShape("resizer");
		if(this.resizing.onNode){
			var t = this.getTransformation();
			var newcorner = EasyClickingUtils.getRealXYFromMouse(e,t);
			var w = newcorner.x - this.resizing.bb.x1;
			var h = newcorner.y - this.resizing.bb.y1;
			if(w > 0 && h > 0){
				this.resizing.onNode.setDimensions(w,h);	
				this.resizing.bb =this.resizing.onNode.easyShape.getBoundingBox();
				var resizerpos = {x: this.resizing.bb.x2-1, y: this.resizing.bb.y2-1};
				resizer.setCoordinates([resizerpos.x,resizerpos.y,resizerpos.x + 15,resizerpos.y, resizerpos.x + 15,resizerpos.y + 15,resizerpos.x, resizerpos.y + 15]);
				
			}
		}		
		var t = EasyClickingUtils.resolveTarget(e);
		var s =this.easyClicking.getShapeAtClick(e);
		if(s && !s.getProperty("_temp") && t.className != "easyDrawingTools"){
			var bb = s.getBoundingBox();
			var resizerpos = {x: bb.x2-2, y:bb.y2-2};
			
			if(!resizer){
				var resizer = new EasyShape({_resizer:true,shape:"polygon", fill: "rgb(0,0,0)"},[resizerpos.x,resizerpos.y,resizerpos.x + 15,resizerpos.y, resizerpos.x + 15,resizerpos.y + 15,resizerpos.x, resizerpos.y + 15]);
				this.addTemporaryShape("resizer",resizer,true);
				
			}
			resizer.setCoordinates([resizerpos.x,resizerpos.y,resizerpos.x + 15,resizerpos.y, resizerpos.x + 15,resizerpos.y + 15,resizerpos.x, resizerpos.y + 15]);
			resizer.actingOn = s;
		}
	}
	,startResizing: function(easyShape){
		if(!this.resizing.onNode){
			this.easyController.disable();
			this.resizing.onNode = this.getNodeFromShape(easyShape.actingOn);	
			this.resizing.bb =this.resizing.onNode.easyShape.getBoundingBox();
		}
	}
	,transform: function(matrix){
		if(this.easyDrawingTools.getCurrentCommand().type == 'editlabel') return;
		var o1 = parseInt(this.canvas.width) /2;
		var o2 = parseInt(this.canvas.height) /2;
		this.tmatrix = EasyTransformations.clone(matrix);
		this.tmatrix.origin={x:o1,y:o2};
		this.easyClicking.setTransformation(this.tmatrix);
		this.render();
	}
	
	,render: function(){
		this.easyClicking.clearMemory();

		if(this.canvas.getContext){
			var ctx =this.canvas.getContext('2d');
			ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		}
		this._renderEdges();
		
		
		for(i in this.easyGraph.nodes){
			var node = this.easyGraph.nodes[i];
			this._renderNode(node);
		}
		this._renderTemporaryShapes();
		
	}

	,_renderTemporaryShapes: function(){
		for(i in this.tempshapes){
			shape =this.tempshapes[i];
			shape.setProperty("_temp",true);
			if(shape.getProperty("_clickable")){
				this.easyClicking.addToMemory(shape);
			}
			shape.render(this.canvas, this.getTransformation());
		}
	}
	,isNodeVisible: function(node){
		
		var bb = node.easyShape.getBoundingBox();
		var topleft  =EasyTransformations.applyTransformation(bb.x1, bb.y1,this.tmatrix);
		var bottomRight  =EasyTransformations.applyTransformation(bb.x2, bb.y2,this.tmatrix);
		if((bottomRight.x < 0 || bottomRight.x > this.canvas.width || bottomRight.y >this.canvas.height || bottomRight.y < 0)&& (topleft.x < 0 || topleft.x > this.canvas.width || topleft.y >this.canvas.height || topleft.y < 0))
		return false;
		else
		return true;
	}
	

	,_renderEdges: function(directed){
		var edgeCoords = [];
		for(i in this.easyGraph.nodes){
			try{
				var node =this.easyGraph.nodes[i];
				var npos = node.getPosition();
				if(!npos.x || !npos.y) {
					this.easyGraph.calculateNodePositions();
					this.render();
					return;
				}				


				var children = this.easyGraph.getNodeChildren(node.id);
				for(var j=0; j < children.length; j++){
					var child = this.easyGraph.getNode(children[j]);
					if(child){
						var cpos = child.getPosition();
						if(!cpos.x || !cpos.y) {
							this.easyGraph.calculateNodePositions();
							this.render();
							return;
						}
						if(edgeCoords.length >0) edgeCoords.push("M");
						edgeCoords.push(npos.x);
						edgeCoords.push(npos.y);
						edgeCoords.push(cpos.x);
						edgeCoords.push(cpos.y);
						
						/*draw arrowhead */
						/*
						var o = parseFloat(cpos.y-npos.y);
						var a = parseFloat(cpos.x -npos.x);
					
						var rad = Math.atan2(o,a);
						var r = 50;
					
						var rotate = function(x,y,degrees){
							degrees =  (degrees * Math.PI) / 180.0;
							var res = {};
							res.x = x * Math.cos(degrees) + y *  Math.sin(degrees);
							res.y = -y * Math.sin(degrees) + y * Math.cos(degrees);
							return res;
						};
						var rotatedcoords= {};
						edgeCoords.push("M");
						edgeCoords.push(cpos.x);
						edgeCoords.push(cpos.y);
						
			
						rotatedcoords = rotate(cpos.x-5,cpos.y-10,rad);
						edgeCoords.push(rotatedcoords.x);
						edgeCoords.push(rotatedcoords.y);
						edgeCoords.push("M");
						edgeCoords.push(cpos.x);
						edgeCoords.push(cpos.y);
				
						rotatedcoords = rotate(cpos.x+5,cpos.y+10,rad);
						edgeCoords.push(rotatedcoords.x);
						edgeCoords.push(rotatedcoords.y);
						*/
					}
				}
				//update coordinates using children
			}
			catch(e){
				console.log(e);
				throw e;
			}
		}


		var e = new EasyShape({shape:"path",stroke: '#000000',lineWidth: '1'},edgeCoords);
		this.edgeShape = e;
				
		this.edgeShape.render(this.canvas, this.tmatrix);
	}
	,_renderNode: function(node){	
		var npos = node.getPosition();
		var shape = node.easyShape;
		this.easyShapeToNode[shape.properties.id] = node;

		if(!node.getProperty("_labelHolder")){
			var nodelabel = document.createElement("div");
			nodelabel.style.display = "";
			this.controller.renderLabel(nodelabel,node.getProperty("label"))
			nodelabel.style.position = "absolute";
			this.labelContainer.appendChild(nodelabel);
			//this.setLabelHolder(node.id,"label",nodelabel);
			node.setProperty("_labelHolder",nodelabel);
			var easyDiagram = this;
			nodelabel.ondblclick = function(e){
				easyDiagram.openNodeEditor(e,node);
			};
		}
		var bb = shape.getBoundingBox();
		var label = {};
		label.x = bb.x1 + 5;//parseFloat((bb.x2 - bb.x1) / 2);
		label.y = bb.y1 + 5;//parseFloat((bb.y2 - bb.y1) / 2);
		
		label = EasyTransformations.applyTransformation(label.x, label.y,this.tmatrix);
		
		var viewlabel = node.getProperty("_labelHolder");
		if(viewlabel){
			if(this.isNodeVisible(node)){
				viewlabel.style.display = "";				
				viewlabel.style.top = label.y + "px";
				viewlabel.style.left = label.x + "px";
				
				var t = this.getTransformation();
				viewlabel.style.fontSize = parseFloat(1 * t.scale.x) + "em";
				var w = node.getProperty("width") * t.scale.x;
				var h = node.getProperty("height") * t.scale.y;
				viewlabel.style.width =  w+ "px";
				viewlabel.style.height = h + "px";
				this.easyClicking.addToMemory(shape);
				shape.render(this.canvas,this.getTransformation());
			}
			else{
				viewlabel.style.display = "none";	
			}
		}
	}
	,openNodeEditor: function(event,node){
		var easyDrawingTools = this.easyDrawingTools;
		easyDrawingTools.setCurrentCommand({type:'editlabel'});
		var easyDiagram = this;
		var changer = function(newcolor){
			node.setProperty("fill",newcolor);
		};
		
		if(!this.editorWindow){
			/* setup edit window */
			this.editorWindow = document.createElement("div");
			this.wrapper.appendChild(this.editorWindow);
			this.editorWindow.style.position = "absolute";
			this.editorWindow.className = "editorWindow";
			this.editorColor = document.createElement("div");
			this.editorWindow.appendChild(this.editorColor);
			this.editorColor.style.position = "relative";
			var nodelabeledit = document.createElement("textarea");
			nodelabeledit.style.position = "relative";
			this.editorWindow.appendChild(nodelabeledit);
			this.editorLabel  =nodelabeledit;
			this.editorColor.easyColorSlider =new EasyColorSlider(this.editorColor,100,20,changer);
			var savebutton = document.createElement("button");
			savebutton.innerHTML = "Save";
			this.editorSave = savebutton;
			savebutton.style.position = "relative";
			savebutton.style.top = "90px";
			this.editorWindow.appendChild(savebutton);
		}
		
		this.editorSave.onclick = function(e){
			easyDiagram.closeNodeEditor(e,node);
		};
		
		this.editorLabel.value = node.getProperty("label");
		this.editorColor.easyColorSlider.setChangeFunction(changer);
		this.editorColor.easyColorSlider.setColor(node.getProperty("fill"));
		var editorPos =node.getPosition();
		editorPos = EasyTransformations.applyTransformation(editorPos.x,editorPos.y,this.getTransformation());
		this.editorWindow.style.left = editorPos.x + "px";
		this.editorWindow.style.top = parseInt(editorPos.y) + "px";
		this.editorColor.style.top = "60px";
		this.editorWindow.style.display = "";
		node.setProperty("_mode",1);//?
	}
	,closeNodeEditor: function(event,node){
		var easyDrawingTools = this.easyDrawingTools;
		easyDrawingTools.setCurrentCommand(false);		

		this.editorWindow.style.display = "none";
		
		node.setProperty("_mode",0); //?
		node.setProperty("label",this.editorLabel.value);
		var nodelabel =node.getProperty("_labelHolder");
		this.controller.renderLabel(nodelabel,this.editorLabel.value);
	}
};