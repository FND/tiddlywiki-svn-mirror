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
	
	this.labelHolders = {};
	this.controller = controller;
	this.tempshapes = {};
	this.easyShapeToNode = {};
	this.wrapper = wrapper;
	this.easyGraph = easyGraph;	
	wrapper.style.position = "relative";
	var width = 600;
	var height = 400;
	wrapper.style.width = width + "px";
	wrapper.style.height = height + "px";
	this.canvas = document.createElement("canvas");
	this.canvas.width = width;
	this.canvas.height = height;
	
	this.canvas.style.border = "solid 1px black";
	
	this.wrapper.appendChild(this.canvas);
	this.easyClicking = new EasyClicking(this.wrapper);
	this.setupMouseHandlers();
		
	this.easyController = new EasyMapController(this,this.wrapper);
	this.easyController.addControl("pan");
	this.easyController.addControl("mousepanning");
	this.easyController.addControl("mousewheelzooming");
	this.easyController.addControl("zoom");
	this.transform({});
		
	this.createDrawingControls();
	
	
};

EasyDiagram.prototype = {
	getEasyGraph: function(){
		return this.easyGraph;
	}
	,getTemporaryShape: function(name){
		if(!this.tempshapes[name]) 
			return false;
		else
			return this.tempshapes[name];
	}
	,addTemporaryShape: function(name,easyShape){
		this.tempshapes[name] = easyShape;
	}
	,deleteTemporaryShape: function(name){
		delete this.tempshapes[name];
	}
	,setDrawingCommand: function(json){
		if(!json.type) throw "json must have a type property!";
		this.toolCommand = json;
	}
	,getDrawingCommand: function(){
		if(!this.toolCommand) this.toolCommand = {type:false};
		return this.toolCommand;
	}
	,createDrawingControls: function(){
		
		var tooltip = document.createElement("div");
		tooltip.style.position = "absolute";	
		//tooltip.style.zIndex = 30;
		tooltip.innerHTML = "..";
		this.tooltip = tooltip;
		
		var drawNode = document.createElement("button");
		drawNode.style.position = "absolute";
		drawNode.innerHTML = "new node";
		drawNode.style.top = 0;
		drawNode.style.left = this.wrapper.style.width;
		
		var drawEdge = document.createElement("button");
		drawEdge.style.position = "absolute";
		drawEdge.innerHTML = "new edge";
		drawEdge.style.top = 40+"px";
		drawEdge.style.left = this.wrapper.style.width;
		
		
		var deleteNode = document.createElement("button");
		deleteNode.style.position = "absolute";
		deleteNode.innerHTML = "delete";
		deleteNode.style.top = 80+"px";
		deleteNode.style.left = this.wrapper.style.width;
		
		 var save = document.createElement("button");
		save.style.position = "absolute";
		save.innerHTML = "save";
		save.style.top = 120+"px";
		save.style.left = this.wrapper.style.width;
		
		var easyGraph = this.easyGraph;
		var easyDiagram = this;
		easyDiagram.toolCommand = false;
		
		save.onclick = function(e){

			easyDiagram.controller.saveHandler(easyDiagram,easyGraph.burntojson());
		}
		deleteNode.onclick = function(e){
			easyDiagram.setDrawingCommand({type: "delete"});
		}
		drawEdge.onclick = function(e){
			easyDiagram.setDrawingCommand({type: "drawEdge",start: false, end: false});
		};
		drawNode.onclick = function(e){
			var uniqueid = Math.random();
			easyDiagram.setDrawingCommand({type: "newNode"});
			easyGraph.addNode({id:uniqueid,properties:{label: "new node",shape:'polygon'}});
			easyDiagram.selectedShape = easyGraph.getNode(uniqueid).getEasyShape();	
			easyDiagram.render();
		}
		
		this.wrapper.appendChild(tooltip);
		this.wrapper.appendChild(drawEdge);
		this.wrapper.appendChild(drawNode);
		this.wrapper.appendChild(deleteNode);
		this.wrapper.appendChild(save);
	}
	,getNodeFromShape: function(easyShape){
		if(this.easyShapeToNode[easyShape.properties.id])
			return this.easyShapeToNode[easyShape.properties.id]
		else
			return false;
	}
	,selectShape: function(s){
		var command =this.getDrawingCommand();
		var easyDiagram = this;
		if(s && !easyDiagram.selectedShape){//highlight with box?
			if(command.type == 'editlabel') return;
						
			easyDiagram.selectedShape = s;
			easyDiagram.selectedShape.properties.fill = "rgb(0,255,0)";
		}
		else{

			if(easyDiagram.selectedShape){
				easyDiagram.selectedShape.properties.fill = "rgb(255,0,0)";
			}
			easyDiagram.selectedShape= false;

		}
		
		easyDiagram.render();
		
	}
	,setTooltip: function(e){
		
		var newpos =EasyClickingUtils.getMouseFromEvent(e);
		newpos.x + 20;
		newpos.y + 20;
		//this.tooltip.style.left = newpos.x + "px";
		//this.tooltip.style.top = newpos.y + "px";
		
		var command = this.getDrawingCommand();
		if(command.type){
		this.tooltip.innerHTML =command.type;
		}
		else
		this.tooltip.innerHTML = "";
	
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
			node.setPosition(x - 20,y - 20);
		}
	}
	,deleteShape: function(easyShape){
		var n = this.getNodeFromShape(easyShape);
		
		if(n.properties.shape != 'path'){
			var edit = this.getLabelHolder(n.id,"editlabel");
			var view =this.getLabelHolder(n.id,"label");
			edit.style.display = "none";
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
		this.wrapper.onmousemove = function(e){						
			var t = easyDiagram.getTransformation();
			var newpos =EasyClickingUtils.getRealXYFromMouse(e,t);
			easyDiagram.moveSelectedShapes(newpos.x,newpos.y);
			easyDiagram.drawTemporaryLines(newpos.x,newpos.y);
			easyDiagram.setTooltip(e);
			easyDiagram.render();
		}
		this.wrapper.onmousedown = function(e){
			if(!e) e = window.event;
			var s = easyDiagram.easyClicking.getShapeAtClick(e);
			var target = EasyClickingUtils.resolveTarget(e);
			if(target.className == "easyControl") return;
			if(e.button <= 1){//left mouse
				var command = easyDiagram.getDrawingCommand();
				console.log("command is ", command);
				if(command){
					if(s){			
						
						if(command.type == 'drawEdge'){
							if(!command.start){
								command.start = s.properties.id;
								var t = easyDiagram.getTransformation();
								var startpos =EasyClickingUtils.getRealXYFromMouse(e,t);
								var p = new EasyShape({shape:"path",stroke: '#000000',lineWidth: '1'},[startpos.x,startpos.y,startpos.x,startpos.y]);
								easyDiagram.addTemporaryShape("pathinprogress",p);					
							}
							else if(!command.end){
								easyGraph.addEdge(command.start, s.properties.id);
								easyDiagram.setDrawingCommand(false);
								easyDiagram.deleteTemporaryShape("pathinprogress");
								easyDiagram.render();
							}
						}
						else if(command.type == 'delete'){
							easyDiagram.deleteShape(s);
						}
					}
				}
				easyDiagram.selectShape(s);
			}
			else{//right mouse
				console.log("clicked right mouse");
				easyDiagram.selectedShape = false;
				easyDiagram.toolCommand.start = false;
				easyDiagram.deleteTemporaryShape("pathinprogress");
				
			}
		}

	}

	,transform: function(matrix){
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
			this.tempshapes[i].render(this.canvas, this.tmatrix);
		}
	}
	,isNodeVisible: function(x,y){
		if(x < 0 || x > this.canvas.width || y >this.canvas.height || y < 0)
		return false;
		else
		return true;
	}
	
	,getLabelHolder: function(id,reference){
		if(this.labelHolders[id]){
			if(this.labelHolders[id][reference]){
				return this.labelHolders[id][reference]
			}
			else
				return false;
		}
		else
			return false;
	}
	,setLabelHolder: function(id,reference,domElement){
		if(!this.labelHolders[id]) this.labelHolders[id] = {};
		this.labelHolders[id][reference] = domElement;
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

		if(!this.getLabelHolder(node.id,"label")){
			var nodelabel = document.createElement("div");
			var nodelabeledit = document.createElement("input");
			nodelabel.style.display = "";
			nodelabeledit.style.display = "none";
			this.controller.renderLabel(nodelabel,node.getProperty("label"))
			nodelabeledit.value = node.getProperty("label");
			nodelabel.style.position = "absolute";
			nodelabeledit.style.position = "absolute";
			
			this.wrapper.appendChild(nodelabeledit);
			this.wrapper.appendChild(nodelabel);
			this.setLabelHolder(node.id,"label",nodelabel);
			this.setLabelHolder(node.id,"editlabel",nodelabeledit);
			
			var easyDiagram = this;
			nodelabeledit.onblur = function(e){
				node.setProperty("mode",0); //?
				easyDiagram.setDrawingCommand({type:false});
				nodelabeledit.style.display = "none";
				nodelabel.style.display = "";
				easyDiagram.controller.renderLabel(nodelabel,nodelabeledit.value)
				node.setProperty("label",nodelabeledit.value);
			}
			nodelabel.ondblclick = function(e){
				easyDiagram.setDrawingCommand({type:'editlabel'});
				node.setProperty("mode",1);//?
				nodelabeledit.style.display = "";
				nodelabel.style.display = "none";
			};
		}
		var bb = shape.getBoundingBox();
		var label = {};
		label.x = bb.x1 + 5;//parseFloat((bb.x2 - bb.x1) / 2);
		label.y = bb.y1 + 5;//parseFloat((bb.y2 - bb.y1) / 2);
		
		label = EasyTransformations.applyTransformation(label.x, label.y,this.tmatrix);
		
		var viewlabel = this.getLabelHolder(node.id,"label");
		var editlabel = this.getLabelHolder(node.id,"editlabel");
		if(viewlabel && editlabel){
			if(this.isNodeVisible(label.x,label.y)){			
				if(node.getProperty("mode") == 1){
					viewlabel.style.display = "none";
					editlabel.style.display = "";				
				}
				else{
					viewlabel.style.display = "";
					editlabel.style.display = "none";	
				}


			
				viewlabel.style.top = label.y + "px";
				viewlabel.style.left = label.x + "px";
				editlabel.style.top = label.y + "px";
				editlabel.style.left = label.x + "px";
				this.easyClicking.addToMemory(shape);
				shape.render(this.canvas,this.tmatrix);
			}
			else{
				viewlabel.style.display = "none";
				editlabel.style.display = "none";	
			}
		}
	}
};