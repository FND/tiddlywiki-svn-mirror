var VismoDiagram = function(wrapper,vismoGraph,controller){
	if(!vismoGraph){
		vismoGraph = new VismoGraph();
	}
	if(!controller){
		controller = {
			renderLabel: function(domElement,value){
				domElement.innerHTML = value;
			}
			,saveHandler: function(vismoDiagram,json){
				alert(json);
			}
		};
	}
	this.wrapper = wrapper;
	this.controller = controller;
	this.tempshapes = {};
	this.vismoShapeToNode = {};
	this.labelContainer = document.createElement("div");
	this.labelContainer.style.overflow = "hidden";
	this.labelContainer.style.position = "absolute";
	this.labelContainer.style.width = this.wrapper.style.width;
	this.labelContainer.style.height = this.wrapper.style.height;
	this.labelContainer.className = "annotations";
	
	wrapper.appendChild(this.labelContainer);
	
	
	this.vismoGraph = vismoGraph;
	this.resizing = {};	
	wrapper.style.position = "relative";
	wrapper.className = "vismoDiagram";
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
	this.vismoDrawingTools = new VismoDrawingTools(this.wrapper);
	
	this.vismoClicking = new VismoClickableCanvas(this.wrapper);
	this.setupMouseHandlers();
		
	this.vismoController = new VismoController(this,this.wrapper);
	this.vismoController.addControl("pan");
	this.vismoController.addControl("mousepanning");
	this.vismoController.addControl("mousewheelzooming");
	this.vismoController.addControl("zoom");
	this.transform({});
		
	
	this._setDrawingCommands();
	
	
};

VismoDiagram.prototype = {
	_setDrawingCommands: function(){
		/*helpers*/		
		var getshape = function(e){
			var s = vismoDiagram.vismoClicking.getShapeAtClick(e);
			if(!s) return false;
			if(s.getProperty("_temp")) return false;
			var target = VismoClickingUtils.resolveTarget(e);
			if(target.className == "vismoControl") return false;
			if(target.className == "vismoDrawingTools") return false;
			return s;
		};
		
		/*saving */
		var vismoDiagram = this;
		var vismoGraph = this.getVismoGraph();
		var saveaction = function(){
			vismoDiagram.controller.saveHandler(vismoDiagram,vismoGraph.burntojson());
		};
		this.vismoDrawingTools.setCommandAction("save",saveaction);
		
		/* move around shapes */
		var nocommand = function(e){
			if(vismoDiagram.resizing.onNode)return;
			var s = getshape(e);
			if(s)vismoDiagram.selectShape(s);
		};
		this.vismoDrawingTools.setCommandAction("none",nocommand);
		
		/*right click*/
		var rightclick = function(e){
		
			vismoDiagram.selectShape(false);
			vismoDiagram.deleteTemporaryShape("pathinprogress");	
		};	
		this.vismoDrawingTools.setCommandAction("rightmouse",rightclick);
		
		/*start line*/
		var startLine = function(e){
			var s = getshape(e);
		
			if(!s) return;
			var t = vismoDiagram.getTransformation();
			var startpos =VismoClickingUtils.getRealXYFromMouse(e,t);
			var p = new VismoShape({shape:"path",stroke: '#000000',lineWidth: '1'},[startpos.x,startpos.y,startpos.x,startpos.y]);
			vismoDiagram.addTemporaryShape("pathinprogress",p);
			
			return s.properties.id;
		};
		this.vismoDrawingTools.setCommandAction("lineStart",startLine);
		
		/*end line */
		var endLine = function(e,command){
			var s = getshape(e); 
			if(!s) return;
			vismoGraph.addEdge(command.start, s.properties.id);	
			vismoDiagram.deleteTemporaryShape("pathinprogress");
			vismoDiagram.render();
		}
		this.vismoDrawingTools.setCommandAction("lineEnd",endLine);
		
		/*shape Start */
		var newnode = function(e){
			var uniqueid = Math.random();
			vismoGraph.addNode({id:uniqueid,properties:{label: "new node",fill:"rgb(255,255,255)",shape:'polygon'}});
			s = vismoGraph.getNode(uniqueid).getVismoShape();	
			vismoDiagram.selectShape(s);
			vismoDiagram.render();
		};
		this.vismoDrawingTools.setCommandAction("shapeStart",newnode);
		
		var laynode = function(e){
			vismoDiagram.selectShape(false);
		}
		this.vismoDrawingTools.setCommandAction("shapeEnd",laynode);
		/*delete */
		var deleteCommand = function(e){
			var s = getshape(e);
			if(s)vismoDiagram.deleteShape(s);	
		}
		this.vismoDrawingTools.setCommandAction("delete",deleteCommand);
		
		
	}
	,getVismoGraph: function(){
		return this.vismoGraph;
	}
	,getTemporaryShape: function(name){
		if(!this.tempshapes[name]) 
			return false;
		else
			return this.tempshapes[name];
	}
	,addTemporaryShape: function(name,vismoShape,clickable){
		this.tempshapes[name] = vismoShape;
		if(clickable){			
			vismoShape.setProperty("_clickable",true);
		}
	
	}
	,deleteTemporaryShape: function(name){
		delete this.tempshapes[name];
		
	}
	,getNodeFromShape: function(vismoShape){
		if(this.vismoShapeToNode[vismoShape.properties.id])
			return this.vismoShapeToNode[vismoShape.properties.id]
		else
			return false;
	}
	,selectShape: function(s){
		var command =this.vismoDrawingTools.getCurrentCommand();
		var vismoDiagram = this;
		if(s && !vismoDiagram.selectedShape){//highlight with box?
			if(command.type == 'editlabel' || command.type == 'drawEdge') return;
			vismoDiagram.selectedShape = s;
			s.setProperty("_oldcolor",s.getProperty("fill"));
			vismoDiagram.selectedShape.properties.fill = "rgb(255,255,255)";
		}
		else{

			if(vismoDiagram.selectedShape){
				vismoDiagram.selectedShape.properties.fill = vismoDiagram.selectedShape.getProperty("_oldcolor");
			}
			vismoDiagram.selectedShape= false;

		}
		
		vismoDiagram.render();
		
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

		if(this.selectedShape && !this.editing) {
			var shape = this.selectedShape;
			 
			var node = this.getNodeFromShape(shape);
			if(node)node.setPosition(x - 20,y - 20);
		}

	}
	,deleteShape: function(vismoShape){
		var n = this.getNodeFromShape(vismoShape);
		
		if(n.properties.shape != 'path'){
			var view =n.getProperty("_labelHolder");
			view.style.display = "none";
			this.getVismoGraph().deleteNode(n);
			this.render();
		}
	}
	
	,setTransformation: function(t){
		this.vismoController.setTransformation(t);
	}
	,getTransformation: function(){
		return this.tmatrix;
	}
	,setupMouseHandlers: function(){
		var vismoDiagram = this;
		var vismoGraph = this.vismoGraph;
		var vismoDrawingTools = this.vismoDrawingTools;
		var omm = this.wrapper.onmousemove;
		var omd = this.wrapper.onmousedown;
		
		this.wrapper.onmousemove = function(e){		
			if(omm) omm(e);				
			var t = vismoDiagram.getTransformation();
		
			var newpos =VismoClickingUtils.getRealXYFromMouse(e,t);
			vismoDiagram.moveSelectedShapes(newpos.x,newpos.y);
			vismoDiagram.performResizing(e);
			
			vismoDiagram.drawTemporaryLines(newpos.x,newpos.y);
			vismoDiagram.render();
		};
		
		var omd = this.wrapper.onmousedown;
		this.wrapper.onmousedown = function(e){
			this.selectedShape = false;
			var target = VismoClickingUtils.resolveTarget(e);
			
			if(target.tagName == "A"){	
				return;
			}
			
			if(omd)omd(e);
			if(vismoDiagram.resizing.onNode){
				vismoDiagram.resizing = {};
				vismoDiagram.vismoController.enable();
			}
			else{
				var s = vismoDiagram.vismoClicking.getShapeAtClick(e);
				if(s){	
					if(s.getProperty("_resizer")){
						vismoDiagram.startResizing(s);
					}
				}
			}
			
	
		};
		
	}
	,performResizing: function(e){
		var resizer = this.getTemporaryShape("resizer");
		if(this.resizing.onNode){
			var t = this.getTransformation();
			var newcorner = VismoClickingUtils.getRealXYFromMouse(e,t);
			var w = newcorner.x - this.resizing.bb.x1;
			var h = newcorner.y - this.resizing.bb.y1;
			if(w > 0 && h > 0){
				this.resizing.onNode.setDimensions(w,h);	
				this.resizing.bb =this.resizing.onNode.vismoShape.getBoundingBox();
				var resizerpos = {x: this.resizing.bb.x2-1, y: this.resizing.bb.y2-1};
				resizer.setCoordinates([resizerpos.x,resizerpos.y,resizerpos.x + 15,resizerpos.y, resizerpos.x + 15,resizerpos.y + 15,resizerpos.x, resizerpos.y + 15]);
				
			}
		}		
		var t = VismoClickingUtils.resolveTarget(e);
		var s =this.vismoClicking.getShapeAtClick(e);
		if(s && !s.getProperty("_temp") && t.className != "vismoDrawingTools"){
			var bb = s.getBoundingBox();
			var resizerpos = {x: bb.x2-2, y:bb.y2-2};
			
			if(!resizer){
				var resizer = new VismoShape({_resizer:true,shape:"polygon", fill: "rgb(0,0,0)"},[resizerpos.x,resizerpos.y,resizerpos.x + 15,resizerpos.y, resizerpos.x + 15,resizerpos.y + 15,resizerpos.x, resizerpos.y + 15]);
				this.addTemporaryShape("resizer",resizer,true);
				
			}
			resizer.setCoordinates([resizerpos.x,resizerpos.y,resizerpos.x + 15,resizerpos.y, resizerpos.x + 15,resizerpos.y + 15,resizerpos.x, resizerpos.y + 15]);
			resizer.actingOn = s;
		}
	}
	,startResizing: function(vismoShape){
		if(!this.resizing.onNode){
			this.vismoController.disable();
			this.resizing.onNode = this.getNodeFromShape(vismoShape.actingOn);	
			this.resizing.bb =this.resizing.onNode.vismoShape.getBoundingBox();
		}
	}
	,transform: function(matrix){
		if(this.vismoDrawingTools.getCurrentCommand().type == 'editlabel') return;
		var o1 = parseInt(this.wrapper.style.width) /2;
		var o2 = parseInt(this.wrapper.style.height) /2;
		this.tmatrix = VismoTransformations.clone(matrix);
		this.tmatrix.origin={x:o1,y:o2};
		this.vismoClicking.setTransformation(this.tmatrix);
		this.render();
	}
	
	,render: function(){
		this.vismoClicking.clearMemory();

		if(this.canvas.getContext){
			var ctx =this.canvas.getContext('2d');
			ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		}
		this._renderEdges();
		
		
		for(i in this.vismoGraph.nodes){
			var node = this.vismoGraph.nodes[i];
			this._renderNode(node);
		}
		this._renderTemporaryShapes();
		
	}

	,_renderTemporaryShapes: function(){
		for(i in this.tempshapes){
			shape =this.tempshapes[i];
			shape.setProperty("_temp",true);
			if(shape.getProperty("_clickable")){
				this.vismoClicking.add(shape);
			}
			shape.render(this.canvas, this.getTransformation());
		}
	}
	,isNodeVisible: function(node){
		
		var bb = node.vismoShape.getBoundingBox();
		var topleft  =VismoTransformations.applyTransformation(bb.x1, bb.y1,this.tmatrix);
		var bottomRight  =VismoTransformations.applyTransformation(bb.x2, bb.y2,this.tmatrix);
		if((bottomRight.x < 0 || bottomRight.x > this.canvas.width || bottomRight.y >this.canvas.height || bottomRight.y < 0)&& (topleft.x < 0 || topleft.x > this.canvas.width || topleft.y >this.canvas.height || topleft.y < 0))
		return false;
		else
		return true;
	}
	
/*these should be moved out */
	,_renderEdges: function(directed){
		var edgeCoords = [];
		for(i in this.vismoGraph.nodes){
			try{
				var node =this.vismoGraph.nodes[i];
				var npos = node.getPosition();
				if(!npos.x || !npos.y) {
					this.vismoGraph.calculateNodePositions();
					this.render();
					return;
				}				


				var children = this.vismoGraph.getNodeChildren(node.id);
				for(var j=0; j < children.length; j++){
					var child = this.vismoGraph.getNode(children[j]);
					if(child){
						var cpos = child.getPosition();
						if(!cpos.x || !cpos.y) {
							this.vismoGraph.calculateNodePositions();
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


		var e = new VismoShape({shape:"path",stroke: '#000000',lineWidth: '1'},edgeCoords);
		this.edgeShape = e;
				
		this.edgeShape.render(this.canvas, this.tmatrix);
	}
	,_renderNode: function(node){
	
		var npos = node.getPosition();
		var shape = node.vismoShape;
		this.vismoShapeToNode[shape.properties.id] = node;

		if(!node.getProperty("_labelHolder")){
			var nodelabel = document.createElement("div");
			nodelabel.style.display = "";
			this.controller.renderLabel(nodelabel,node.getProperty("label"))
			nodelabel.style.position = "absolute";
			this.labelContainer.appendChild(nodelabel);
			//this.setLabelHolder(node.id,"label",nodelabel);
			node.setProperty("_labelHolder",nodelabel);
			var vismoDiagram = this;
			nodelabel.ondblclick = function(e){
				vismoDiagram.openNodeEditor(e,node);
			};
		}
		var bb = shape.getBoundingBox();
		var label = {};
		label.x = bb.x1 + 5;//parseFloat((bb.x2 - bb.x1) / 2);
		label.y = bb.y1 + 5;//parseFloat((bb.y2 - bb.y1) / 2);
		
		label = VismoTransformations.applyTransformation(label.x, label.y,this.tmatrix);
		
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
				this.vismoClicking.add(shape);
				shape.render(this.canvas,this.getTransformation());
			}
			else{
				viewlabel.style.display = "none";	
			}
		}
	}
/*move to diagram editor */
	,openNodeEditor: function(event,node){
		this.editing = true;
		this.selectedShape = false;
		var vismoDrawingTools = this.vismoDrawingTools;
		vismoDrawingTools.setCurrentCommand({type:'editlabel'});
		var vismoDiagram = this;
		var changer = function(newcolor){
			node.setProperty("fill",newcolor);
			vismoDiagram.render();
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
			this.editorColor.vismoColorSlider =new VismoColorSlider(this.editorColor,100,20,changer);
			var savebutton = document.createElement("button");
			savebutton.innerHTML = "Save";
			this.editorSave = savebutton;
			savebutton.style.position = "relative";
			savebutton.style.top = "90px";
			this.editorWindow.appendChild(savebutton);
		}
		
		this.editorSave.onclick = function(e){
			vismoDiagram.closeNodeEditor(e,node);
		};
		
		this.editorLabel.value = node.getProperty("label");
		this.editorColor.vismoColorSlider.setChangeFunction(changer);
		this.editorColor.vismoColorSlider.setColor(node.getProperty("fill"));
		var editorPos =node.getPosition();
		editorPos = VismoTransformations.applyTransformation(editorPos.x,editorPos.y,this.getTransformation());
		this.editorWindow.style.left = editorPos.x + "px";
		this.editorWindow.style.top = parseInt(editorPos.y) + "px";
		this.editorColor.style.top = "60px";
		this.editorWindow.style.display = "";

	}
	,closeNodeEditor: function(event,node){
		var vismoDrawingTools = this.vismoDrawingTools;
		vismoDrawingTools.setCurrentCommand(false);		

		this.editorWindow.style.display = "none";
		
		
		node.setProperty("label",this.editorLabel.value);
		var nodelabel =node.getProperty("_labelHolder");
		this.controller.renderLabel(nodelabel,this.editorLabel.value);
		this.editing = false;
	}
};