var VismoGraph = function(layoutAlgorithm){

	this.nodes = {};
	this.nodeParents = {};
	this.nodeChildren = {};
	this.nodeDepths = {}; /* depths[0] gives a list of all nodes at depth 0 */
	var vismoGraph = this;
	if(!layoutAlgorithm){
		layoutAlgorithm= function(node){
		      
	                var oldpos = node.getPosition();
			if(oldpos.x && oldpos.y) return oldpos;
			var x = Math.random() * 200;
		        var y = Math.random()*200; return {x:x,y:y};		
		};
	}
        this.setLayoutAlgorithm(layoutAlgorithm);
        
        
        this.activeNode = false;
	return false;
};



VismoGraph.prototype = {
        setRootNode: function(id){
                var node =this.getNode(id);
                if(!node) return false;
		this.activeNode = node;
		return true;	
	}
	,getRootNode: function(){
	        return this.activeNode;
	}
        ,setLayoutAlgorithm: function(fun){
                var i;
                for(i in this.nodes){
                        this.nodes[i].setPosition(false);
                }
                if(typeof(fun) == 'string') fun = this.layoutAlgorithms[fun];
                this.positionCalculationFunction = fun;
                this.calculateNodePositions();
              
        }
	/*querying */
	,getNode: function(id){
		if(!this.nodes[id]) 
			return false;
		else
			return this.nodes[id];
	}
	,getNodes: function(){
	        return this.nodes;
	}	
	,getNodeChildren: function(id){
		if(!this.nodeChildren[id]) {
			return [];
		}
		else{
			return this.nodeChildren[id];
		}
	}
	,getNodeParents: function(id){                
		if(!this.nodeParents[id]) return [];
		return this.nodeParents[id];
	}
	/*manipulating */
	,getNodesAtDepth: function(depth){
	        var i;
	        var res = [];
	        for(i in this.nodes){
	                var d = this.nodes[i].getProperty("_depth");
	                if(d == depth) res.push(this.nodes[i].getID());
	        }
	        return res;
	}
        ,getNodeDepth: function(id){
                var node;
                if(typeof id == 'string')node = this.getNode(id);
                else node = id;
                
                if(node){
                        return parseInt(node.getProperty("_depth"));
                }
                else{
                        return false;
                }
        }
        
        ,setChildrenDepth: function(id,done){
           var chidlers = this.getNodeChildren(id);
           for(var i=0; i < chidlers.length; i++){
                this.setNodeDepth(chidlers[i],done);
           }
        }
        ,setNodeDepth: function(id,done){ /*a node depth is how far it is from an orphan */
                if(!done) done = [];
             
                if(done.contains(id)) return;        
                var node = this.getNode(id);
                var parents = this.getNodeParents(id);
                var newdepth = 0;
               
                
                for(var i=0; i < parents.length; i++){
                        var parent = this.getNode(parents[i]);
                     
                        var parentDepth = parent.getProperty("_depth");
                        if(!parentDepth){
                                this.setNodeDepth(parents[i],done);
                                
                        }
                        newdepth = parentDepth + 1;
                }
                
             
                
                var oldDepth = node.getProperty("_depth");
                if(oldDepth != false){
                        if(oldDepth > newdepth) return;
                }                

                node.setProperty("_depth",newdepth);
                
                done.push(node.getID());
                this.setChildrenDepth(node.getID(),done);
        }
	,addNode: function(nodejson){
	        
	        if(this.getNode(nodejson.id)) return false;
		var node = new VismoGraphNode(nodejson);
		this.nodes[nodejson.id] = node;
		if(!this.activeNode) this.activeNode = node;
		this.setNodeDepth(node.getID());
		return node;
	}
	,deleteNode: function(nodejson){
		var id = nodejson.id;
		delete this.nodes[id];
		
		/*delete it's attachment to children */
		var children = this.getNodeChildren();
		for(var i=0; i < children.length; i++){
			this.deleteEdge(id, children[i]);
		}
		
		
		var parents = this.getNodeParents();
		for(var i=0; i < parents.length; i++){
			this.deleteEdge(parents[i],id);
		}
		
		
		return false
	}
		
	,addEdge: function(id1,id2){

		if(!this.nodes[id1]) {
			var json = {};
			json.id = id1;
			json.properties = {};
			this.addNode(json);
		}
		if(!this.nodes[id2]) {
			var json = {};
			json.id = id2;
			json.properties = {};
			this.addNode(json);
		}

		
		if(!this.nodeChildren[id1])this.nodeChildren[id1] = [];
		if(!this.nodeParents[id2]) this.nodeParents[id2] = [];
		
		
		this.nodeChildren[id1].push(id2);
		this.nodeParents[id2].push(id1);
		
		this.setNodeDepth(id1);
		this.setNodeDepth(id2);
		return false;	
	}
	,deleteEdge: function(id1,id2){		
		var childrenOfOne = this.getNodeChildren(id1);	
		var newkids = [];
		for(var i=0; i < childrenOfOne.length; i++){
			if(i != id2) newkids.push(i);
		}
		this.nodeChildren[id1] = newkids;
		
		
		var parentsOfTwo = this.getNodeParents(id2);
		
		var newparents = [];
		for(var i=0; i < parentsOfTwo.length; i++){
			if(i != id1) newparents.push(i);
		}
		this.nodeParents[id2] = newparents;
		
		
		return false;
	}

	,calculateNodePositions: function(){
	        var i;
	        
		for(i in this.nodes){
		        
			if(!this.nodes[i].getPosition()){

			        var newpos =this.positionCalculationFunction(this.nodes[i],this);
			        if(newpos){
			        this.nodes[i].setPosition(newpos.x,newpos.y);
			        }
		        }
		}
		return false;
	}
	
	,burntojson: function(){
		var json = {};
		json.nodes = [];
		var i;
		for(i in this.nodes){
			var node = this.nodes[i].burntojson();
			json.nodes.push(node);
		}
		
		json.edges = [];
		for(i in this.nodes){
			var children = this.getNodeChildren(i);
			for(var c = 0; c < children.length; c++){
				var child = children[c];
				json.edges.push([i,child]);
			}
		}
		
		return json;
	}
	,loadfromjson: function(json){
		var i;
		for(var i=0; i< json.nodes.length;i++){
			this.addNode(json.nodes[i]);
		}
		
		for(var i=0; i< json.edges.length;i++){
			var pair = json.edges[i];
			this.addEdge(pair[0],pair[1]);
		}
		
	}


	,burnToVismoShapes: function(){
		return [];
	}
};

VismoGraph.prototype.layoutAlgorithms = {
        tree: function(node,graph){     
                        
                     if(node.getPosition()) return node.getPosition();
                     
                      
                      var depth = graph.getNodeDepth(node.getID());
                      var spacing = 200;
                      var x,y;
                      var parents = graph.getNodeParents(node.getID());
                      x = depth * spacing
                      y = 0;
                 
                var calculateChildren = function(id,x){
                        var children = graph.getNodeChildren(id);
                        var pos = graph.getNode(id).getPosition();
                        
                        var starty = pos.y - (spacing*(children.length/2));
                        for(var i=0; i < children.length; i++){
                                var child = graph.getNode(children[i]);
                                if(!child.getPosition()){
                                    child.setPosition(x,starty);
                                    starty += spacing;
                                    calculateChildren(children[i],x+spacing);
                                }
                                
                        }
                        
                };
                      if(parents.length == 0){ //root node

                              var atdepth =graph.getNodesAtDepth(0);
                              var totalLeaves = 0;
                              for(var i=0; i < atdepth.length; i++){
                                      var id = atdepth[i];
                                      var leaves = VismoGraphUtils.getNodeLeaves(id,graph);
                                      totalLeaves += leaves.length;
                              }

                              var rooty = -(totalLeaves * spacing) /2;
                              for(var i=0; i < atdepth.length; i++){
                                        var root = graph.getNode(atdepth[i]);
                                        rooty += spacing;
                                        
                                      
                                        //console.log(node,atdepth[i]);
                                        root.setPosition(x,rooty);
                                        calculateChildren(atdepth[i],x+spacing);
                              }

                      }
                      return false;
                      /*
                      else{

                                    var siblings = VismoGraphUtils.getSiblings(node.getID(),graph);          
                                    var firstParent,parentPos;                                                    
                                    for(var i=0; i < parents.length; i++){
                                            var parent = graph.getNode(parents[i]);
                                            var pos =parent.getPosition();
                                            if(pos){
                                                    firstParent = parent;
                                                    parentPos = pos;
                                            }
                                    }

                                    if(firstParent){
                                            var siblings = graph.getNodeChildren(firstParent);
                                            var parentNode = graph.getNode(firstParent);

                                            var parentY = -(parentPos/2);
                                            node.setPosition(x,parentY);
                                            for(var i=0; i < siblings.length; i++){
                                                    parentY += spacing;
                                                    var sib =siblings[i];
                                                    sib.setPosition(x,parentY);
                                            }
                                    }



                            }
                            var thisy = y;



                            //return {x: x,y:y};*/
              }
};
