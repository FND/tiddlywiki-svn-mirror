var VismoGraphRenderer = function(wrapper,vismoGraph,options){
        this.canvas = new VismoCanvas(wrapper,options);
        this.editor = new VismoCanvasEditor(this.canvas,options);
        //if(options.moveableNodes) this.canvas.makeMoveable(options.oncompletemove);
        if(!options) options = {};
        this.vismoGraph = vismoGraph;
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
	getVismoController: function(){
	        return this.controller;
	}
	,getVismoCanvas: function(){
	        return this.canvas;
	}
	,setRootNode: function(id){
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
                this.vismoGraph.calculateNodePositions();
                //if(this.options.beforeRender) this.options.beforeRender(this);
                this.canvas.clear();
                this.renderEdges();
                
                
                this.renderNodes();
                //this.renderNodeLabels();
                this.canvas.render();
                //if(this.options.afterRender) this.options.afterRender(this);
        }
	,renderEdges: function(directed){
		var edgeCoords = [];
	        
	        var nodes = this.vismoGraph.getNodes();
	        for(i in nodes){
				var node =nodes[i];
				var npos = node.getPosition();		
				
				if(npos){
        				var children = this.vismoGraph.getNodeChildren(node.getID());
        				for(var j=0; j < children.length; j++){
        					var child = this.vismoGraph.getNode(children[j]);
        					if(child){
        						var cpos = child.getPosition();
				                        
        					        if(cpos){
        					                
                						edgeCoords.push("M");
                						edgeCoords.push(npos.x);
                						edgeCoords.push(npos.y);
                						edgeCoords.push(cpos.x);
                						edgeCoords.push(cpos.y);
						
                						if(this.options.directed){
                						}
        						}
						
        					}
        				}
				}
				//update coordinates using children
		
			}
		
	
                if(!this.edge){
                        
                        if(edgeCoords.length > 0){
                                var newedge =  new VismoShape({shape:"path",stroke: '#000000',lineWidth: '1'},edgeCoords);
                                this.canvas.add(newedge);
                                this.edge = newedge;
                        }
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
	        var i;
	        for(i in nodes){
	                var node = nodes[i];
	                var pos = node.getPosition();
	                if(pos){
        	                var properties = node.getProperties();
        	                properties.shape = 'circle';
        	                properties._nodeID = node.getID();
	                

        	                if(!this.addedNodes[node.getID()]){
        	                       
                                        var x = pos.x;
                                        var y= pos.y;
                                       
                                        var s = new VismoShape(properties,[x,y,10]);
        	                      
        	                        this.canvas.add(s);
        	                        this.addedNodes[node.getID()] = s;
        	                        
        	                }
        	                else{
	                        
        	                        this.addedNodes[node.getID()].setProperties(properties);
	                        	          
        	                }
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
                	                if(pos){    
                        	                if(!this.addedLabels[id]){
                                        	        var label = document.createElement("div");
                                        	        label.className = "nodeLabel";
                                        	        this.options.renderLabel(label,node);

                                                        var s = this.canvas.addLabel(label,pos.x,pos.y);
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

                
	}


};