var VismoGraph = function(positionCalculationFunction){

	this.nodes = {};
	this.nodeParents = {};
	this.nodeChildren = {};
	this.nodeDepths = {}; /* depths[0] gives a list of all nodes at depth 0 */
	var vismoGraph = this;
	if(!positionCalculationFunction){
		this.positionCalculationFunction = function(node){
	                var oldpos = node.getPosition();
			if(oldpos.x && oldpos.y) return oldpos;
			var x = Math.random() * 200;
		        var y = Math.random()*200; return {x:x,y:y};		
		};
	}
	else this.positionCalculationFunction = positionCalculationFunction;
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
		//console.log(id, this.nodeChildren,"getch");
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
	        return this.nodeDepths[depth];
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
        
        ,setChildrenDepth: function(id,depth,done){
           var chidlers = this.getNodeChildren(id);
           for(var i=0; i < chidlers.length; i++){
                var curdepth = this.getNodeDepth(chidlers[i]);
                
                var parents = this.getNodeParents(chidlers[i]);
                for(var j=0; j < parents.length; j++){
                        var pdepth =this.getNodeDepth(parents[j]);
                       if(pdepth >= depth){
                               depth = pdepth + 1;
                       }
                }
                if(curdepth < depth) this.setNodeDepth(chidlers[i],depth,done);
           }
        }
        ,setNodeDepth: function(id,depth,done){

                
                var node;
                if(typeof id == 'string')node = this.getNode(id);
                else node = id;
 
                if(!done) done = []; 
                if(done.contains(node.getID())) return;
                               
                if(!node)return false;
             
                var oldDepth = node.getProperty("_depth");
                
                if(typeof(oldDepth) == 'number'){
                        if(oldDepth === depth) return; //do no more.. we're not changing anything
                        var nodes = this.nodeDepths[oldDepth];
                        var newnodes = [];
                        for(var i=0; i < nodes.length; i++){
                                if(nodes[i] != node.getID()){
                                        newnodes.push(nodes[i]);
                                }
                        }
                        this.nodeDepths[oldDepth] = newnodes;
                }
                
                if(!this.nodeDepths[depth]) this.nodeDepths[depth] = [];
                this.nodeDepths[depth].push(node.getID());
                node.setProperty("_depth",depth);
                
                done.push(node.getID());
                this.setChildrenDepth(node.getID(),depth+1,done);
        }
	,addNode: function(nodejson){
	        
	        if(this.getNode(nodejson.id)) return false;
		var node = new VismoGraphNode(nodejson);
		this.nodes[nodejson.id] = node;
		if(!this.activeNode) this.activeNode = node;
		this.setNodeDepth(node,-1);
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
		var to = this.getNode(id2);
		var from = this.getNode(id1);
		var depth = this.getNodeDepth(id1);
		
		var parents = this.getNodeParents(id2);
		for(var j=0; j < parents.length; j++){
		        var pdepth = this.getNodeDepth(parents[j]);
		        if(pdepth >= depth) depth = pdepth;
		}
	
		this.setNodeDepth(to,depth+1);

                /*
		var parents = this.getNodeParents(id2);
		for(var j=0; j < parents.length; j++){
		        var pdepth = this.getNodeDepth(parents[j]);
		        if(pdepth >= depth) depth = pdepth;
		}
		this.setNodeDepth(to,depth+1);
		*/
		
		if(!this.nodeChildren[id1])this.nodeChildren[id1] = [];
		if(!this.nodeParents[id2]) this.nodeParents[id2] = [];
		
		
		this.nodeChildren[id1].push(id2);
		this.nodeParents[id2].push(id1);
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
		for(i in this.nodes){
			var newpos =this.positionCalculationFunction(this.nodes[i],this);
			this.nodes[i].setPosition(newpos.x,newpos.y);
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

