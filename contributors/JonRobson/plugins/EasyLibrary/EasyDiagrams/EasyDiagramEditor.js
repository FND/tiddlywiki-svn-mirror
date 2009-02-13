var EasyDiagramEditor = function(easyDiagram){
	this.setEasyDiagram(easyDiagram);
	this.setupMouseHandlers();	
	this.createDrawingControls();	
	this.tempshapes = {};
};

EasyDiagramEditor.prototype = {
	setEasyDiagram: function(easyDiagram){
		this.easyDiagram = easyDiagram;
	}
	,getEasyDiagram: function(){
		return this.easyDiagram;
	}
	,_renderTemporaryShapes: function(){
		for(i in this.tempshapes){
			this.tempshapes[i].render(this.getEasyDiagram().canvas, this.getEasyDiagram().tmatrix);
		}
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
	,createDrawingControls: function(){
		var wrapper =this.getEasyDiagram().wrapper;
		var drawNode = document.createElement("button");
		drawNode.style.position = "absolute";
		drawNode.innerHTML = "new node";
		drawNode.style.top = 0;
		drawNode.style.left = wrapper.style.width;
		
		var drawEdge = document.createElement("button");
		drawEdge.style.position = "absolute";
		drawEdge.innerHTML = "new edge";
		drawEdge.style.top = 100+"px";
		drawEdge.style.left = wrapper.style.width;
		
		var easyGraph = this.easyGraph;
		var easyDiagram = this;
		easyDiagram.drawEdgeCommand = false;
		drawEdge.onclick = function(e){
			easyDiagram.drawEdgeCommand = {start: false, end: false};
		};
		drawNode.onclick = function(e){
			var uniqueid = Math.random();
			easyGraph.addNode({id:uniqueid,properties:{}});
			easyDiagram.render();
			easyDiagram.selectedShape = easyGraph.getNode(uniqueid).getEasyShape();	
		}
		
		wrapper.appendChild(drawEdge);
		wrapper.appendChild(drawNode);
	}
	,getNodeFromShape: function(easyShape){
		var easyDiagram = this.getEasyDiagram();
		if(easyDiagram.easyShapeToNode[easyShape.properties.id])
			return easyDiagram.easyShapeToNode[easyShape.properties.id]
		else
			return false;
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
		console.log(this.selectedShape);
		if(this.selectedShape) {
			var shape = this.selectedShape;
			var node = this.getNodeFromShape(shape);
			node.setPosition(x,y);
		}
	}
	,setupMouseHandlers: function(){
		var easyDiagramEditor = this;
		var easyDiagram = this.getEasyDiagram();
		var easyGraph = easyDiagram.getEasyGraph();
		
		var wrapper =easyDiagram.wrapper;
		var oldmousemove = wrapper.onmousemove;
		var oldmousemove = wrapper.onmousedown;
		wrapper.onmousemove = function(e){
			
		
			//easyDiagramEditor.moveSelectedShapes(newx,newy);
			//easyDiagramEditor.drawTemporaryLines(newx,newy);
			console.log("moving..");
			//easyDiagramEditor.render();
			//if(oldmousemove)oldmousemove(e);
		};
		wrapper.onmousedown = function(e){
			//if(oldmousedown)oldmousedown(e);
			var s = easyDiagram.easyClicking.getShapeAtClick(e);
			var target = EasyClickingUtils.resolveTarget(e);
			if(target.className == "easyControl") return;
			easyDiagramEditor.drawEdgeCommand = false;			
			/*
			if(easyDiagramEditor.drawEdgeCommand){
				if(s && !easyDiagram.drawEdgeCommand.start){
					easyDiagram.drawEdgeCommand.start = s.properties.id;
					var t = easyDiagram.tmatrix;
					var startpos =EasyClickingUtils.getRealXYFromMouse(e,t);
					var p = new EasyShape({shape:"path",stroke: '#000000',lineWidth: '1'},[startpos.x,startpos.y,startpos.x,startpos.y]);
					easyDiagramEditor.addTemporaryShape("pathinprogress",p);					
				}
				else if(s && !easyDiagram.drawEdgeCommand.end){
					easyGraph.addEdge(easyDiagramEditor.drawEdgeCommand.start, s.properties.id);
					easyDiagramEditor.drawEdgeCommand = false;
					easyDiagramEditor.deleteTemporaryShape("pathinprogress");
				}
			}
			else{
*/
	
				if(s && !easyDiagramEditor.selectedShape){//highlight with box?				
					easyDiagramEditor.selectedShape = s;
					easyDiagramEditor.selectedShape.properties.fill = "rgb(0,255,0)";
				}
				else{

						if(easyDiagramEditor.selectedShape){
							easyDiagramEditor.selectedShape.properties.fill = "rgb(255,0,0)";
						}
						easyDiagramEditor.selectedShape= false;
			
				}
			
				
			
			//}
			//easyDiagramEditor.render();
		}

	}
	
	,render: function(){
		this._renderTemporaryShapes();
		this.getEasyDiagram().render();
	}
};