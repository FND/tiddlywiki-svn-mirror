var VismoGraphRenderer = function(wrapper,vismoGraph,options){
        this.canvas = new VismoClickableCanvas(wrapper);
        if(!options) options = {};
        this.vismoGraph = vismoGraph;
        if(options.controller) this.controller = new VismoController(this.canvas,wrapper);
        if(options.moveableNodes) this.canvas.makeMoveable(options.oncompletemove);
        this.labelHolder = document.createElement("div");
        wrapper.appendChild(this.labelHolder);
        this.addedNodes = {};
        this.addedLabels = {};
        this.edge = false;
};
VismoGraphRenderer.prototype = {
        render: function(){
                this.canvas.clear();
                this.renderEdges();
                this.renderNodes();
                this.renderNodeLabels();
                this.canvas.render();
        }
	,renderEdges: function(directed){
		var edgeCoords = [];
		var nodes =  this.vismoGraph.getNodes();
		for(i in nodes){
			try{
				var node =nodes[i];
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
						
					}
				}
				//update coordinates using children
			}
			catch(e){
				console.log(e);
				throw e;
			}
		}
                if(!this.edge){
                        var newedge =  new VismoShape({shape:"path",stroke: '#000000',lineWidth: '1'},edgeCoords);
                        this.canvas.add(newedge);
                        this.edge = newedge;
                }
                else{
                        this.edge.setCoordinates(edgeCoords)
                }
	        
	}
	,getNodeFromShape: function(shape){
	        var id = shape.getProperty("_nodeID");
	        return this.vismoGraph.getNode(id);
	}
	,renderNodes: function(){
	        var nodes = this.vismoGraph.getNodes();
	        for(i in nodes){
	                var node = nodes[i];
	                var pos = node.getPosition();
	                
	                var properties = node.getProperties();
	                properties.shape = 'circle';
	                properties._nodeID = node.getID();
	                var s= new VismoShape(properties,[pos.x,pos.y,10]);
	                if(!this.addedNodes[node.getID()]){
	                        this.canvas.add(s);
	                        this.addedNodes[node.getID()] = s;
	                }
	        }
	}
	,renderNodeLabels: function(){
	        var nodes = this.vismoGraph.getNodes();
	        for(i in nodes){

	                var node = nodes[i];
	                var id =node.getID();
	                var pos = node.getPosition();        
	                if(!this.addedLabels[id]){
                	        var label = document.createElement("div");
                                label.innerHTML = node.getProperty("name");
                                var s = this.canvas.addLabel(label,pos.x.valueOf(),pos.y.valueOf());
                                this.addedLabels[id] = s;
	                }
	                else{
	                        this.addedLabels[id].setCoordinates([pos.x,pos.y]);
	                }
	        }	        

                
	}


};