var EasyGraph = function(positionCalculationFunction){

	this.nodes = {};
	this.nodeParents = {};
	this.nodeChildren = {};
	
	var easyGraph = this;
	if(!positionCalculationFunction){
		this.positionCalculationFunction = function(node){
			
		
			var oldpos = node.getPosition();
			if(oldpos.x && oldpos.y) return oldpos;
			
			return {x:1,y:1};
			/*
			var range = 200;
			var nodepos = {};
			var parents =easyGraph.getNodeParents(node.id);
			var partners =EasyGraphUtils.getPartners(node.id,easyGraph);
			var siblings = EasyGraphUtils.getSiblings(node.id,easyGraph);
			for(var i=0; i < siblings.length; i++){
				var sib = easyGraph.getNode(siblings[i]);
				var pos = sib.getPosition();
				if(pos.x){
					nodepos.x = pos.x;
				}
			}
			
			for(var i=0; i < partners.length; i++){
				var partner = easyGraph.getNode(partners[i]);
				var pos = partner.getPosition();
				if(pos.x){
					nodepos.x = pos.x;
				}
			}
			
			for(var i=0; i < parents.length; i++){
				var parentPos;
				var parent =easyGraph.getNode(parents[i]);
				parentPos = parent.getPosition();
				if(parentPos.x){
					if(nodepos.x){
						if(parentPos.x >= nodepos.x)
							nodepos.x = parentPos.x + 200;
					}
					else{
						nodepos.x = parentPos.x + 200;
					}
				}
			}
			if(!nodepos.x) {
				nodepos.x = 5;
			}
			var children =easyGraph.getNodeChildren(node.id); 
			for(var i=0; i < children.length; i++){
				
			}
		
			nodepos.y = Math.random() * 400;
			return nodepos;
			*/
			
			
			
			
		};
	}

	return false;
};

EasyGraph.prototype = {

	/*querying */
	getNode: function(id){
		if(!this.nodes[id]) 
			return false;
		else
			return this.nodes[id];
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

	,addNode: function(nodejson){
		this.nodes[nodejson.id] = new EasyGraphNode(nodejson);
		return false;
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
	,setFocusedNode: function(id){
		console.log("not implemented yet");
		return false;	
	}
	,calculateNodePositions: function(){
		for(i in this.nodes){
			var newpos =this.positionCalculationFunction(this.nodes[i]);
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


	,burnToEasyShapes: function(){
		return [];
	}
};

