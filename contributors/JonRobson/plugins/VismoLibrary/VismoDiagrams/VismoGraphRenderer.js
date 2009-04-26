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
        options.directed = true;
        if(!options.renderLabel){
                options.renderLabel = function(label,node){
                        
                        label.innerHTML = node.getProperty("name");
         
                };
        }
        this.options = options;
        
};
VismoGraphRenderer.prototype = {
	setRootNode: function(id){
		this.vismoGraph.setRootNode(id);
		return false;	
	}
	,getRootNode: function(){
	        return this.vismoGraph.getRootNode();
	}
	,getVismoGraph: function(){
	        return this.vismoGraph;
	}
	,getVismoController: function(){
                return this.controller;
        }
        ,render: function(){
                if(this.options.beforeRender) this.options.beforeRender(this);
                this.canvas.clear();
                this.renderEdges();
                this.renderNodes();
                this.renderNodeLabels();
                this.canvas.render();
                if(this.options.afterRender) this.options.afterRender(this);
        }
	,renderEdges: function(directed){
		var edgeCoords = [];
		var nodes =  this.vismoGraph.getNodes();
		for(i in nodes){
			try{
				var node =nodes[i];
				var npos = node.getPosition();
				if(!npos) {
					this.vismoGraph.calculateNodePositions();
					this.render();
					return;
				}				


				var children = this.vismoGraph.getNodeChildren(node.id);
				for(var j=0; j < children.length; j++){
					var child = this.vismoGraph.getNode(children[j]);
					if(child){
						var cpos = child.getPosition();
						if(!cpos) {
							this.vismoGraph.calculateNodePositions();
							this.render();
							return;
						}
						edgeCoords.push("M");
						
						edgeCoords.push(npos.x);
						edgeCoords.push(npos.y);
						edgeCoords.push(cpos.x);
						edgeCoords.push(cpos.y);
						
						if(this.options.directed){
						       /* 
                        				var o = parseFloat(cpos.y-npos.y);
                					var a = parseFloat(cpos.x -npos.x);
                					var rad = Math.atan2(o,a);
                					var r = 4;
              
						        var newx = ((cpos.x - r) * Math.cos(rad)) - ((cpos.y - r)* Math.sin(rad));
						        var newy = ((cpos.x - r)* Math.sin(rad)) - ((cpos.y -r)* Math.cos(rad));
						        edgeCoords.push(newx);
						        edgeCoords.push(newy);
							edgeCoords.push(cpos.x);
        						edgeCoords.push(cpos.y);
        						var newx = ((cpos.x + r) * Math.cos(rad)) - ((cpos.y + r)* Math.sin(rad));
						        var newy = ((cpos.x + r)* Math.sin(rad)) - ((cpos.y +r)* Math.cos(rad));
						        edgeCoords.push(newx);
						        edgeCoords.push(newy);	
						        	edgeCoords.push(cpos.x);
                						edgeCoords.push(cpos.y);				      
						        */
						}
						
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
	                
	                if(!this.addedNodes[node.getID()]){
	                        var s = this.canvas.add(new VismoShape(properties,[pos.x,pos.y,10]));
	                        this.addedNodes[node.getID()] = s;
	                }
	                else{
	                        
	                        this.addedNodes[node.getID()].setProperties(properties);
	                }
	        }
	     
	}
	,renderNodeLabels: function(){
	        
	        var node = this.getRootNode();
	      
	        if(node){
        	        var nodes =this.vismoGraph.getNodeChildren(node.getID());
        	        var i,id;
        	        for(id in this.addedLabels){
                                jQuery(this.addedLabels[id].element).css({display:"none"});
        	        }
        	        
        	        nodes.push(node.getID());
        	        for(var i=0; i < nodes.length; i++){
                  
        	                var node =this.vismoGraph.getNode(nodes[i]);
        	                if(node){
                	                var id =node.getID();
                	                var pos = node.getPosition();        
                	                if(!this.addedLabels[id]){
                                	        var label = document.createElement("div");
                                	        this.options.renderLabel(label,node);

                                                var s = this.canvas.addLabel(label,pos.x.valueOf(),pos.y.valueOf());
                                                this.addedLabels[id] = s;
                	                }
                	                else{
                	                        var el =this.addedLabels[id].element;
                	                        el.innerHTML = "";
                	                        this.options.renderLabel(el,node);
                	                        jQuery(el).css({display:""});
                	                        this.addedLabels[id].vismoshape.setCoordinates([pos.x,pos.y]);
                	                }
        	                }
        	        }	   
	        }     

                
	}


};