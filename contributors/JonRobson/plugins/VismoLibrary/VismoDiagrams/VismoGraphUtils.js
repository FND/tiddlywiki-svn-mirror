var VismoGraphUtils = {

	getPartners: function(id,easyGraph){
		var partners = [];
		var childrenNodes = easyGraph.getNodeChildren(id);
		var marked = {};
		marked[id] = true;
		
		for(var i=0; i < childrenNodes.length; i++){
			var child = childrenNodes[i];
			var partnerNodes = easyGraph.getNodeParents(child);
			for(var j=0; j < partnerNodes.length; j++){
				var partner = partnerNodes[j];
				
				
				if(!marked[partner]){
					partners.push(partner);	
					marked[partner] = true;				
				}

			}
		}
		console.log(id,"has partners", partners);
		return partners;
		
	}
	,getSiblings: function(id,easyGraph){
		
		var parentnodes = easyGraph.getNodeParents(id);
		
		var siblings = [];
		var marked = {};
		marked[id] = true;
		
		for(var i=0; i < parentnodes.length; i++){
			var parent = parentnodes[i];
			var siblingNodes = easyGraph.getNodeChildren(parent);
			for(var j=0; j < siblingNodes.length; j++){
				var sib = siblingNodes[j];
				
				
				if(!marked[sib]){
					console.log("value is ",marked[sib]);
					siblings.push(sib);	
					marked[sib] = true;				
				}

			}
		}
		
		return siblings;
		
	}
};
