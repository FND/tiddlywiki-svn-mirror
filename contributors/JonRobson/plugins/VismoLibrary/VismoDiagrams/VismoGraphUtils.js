var VismoGraphUtils = {

	getPartners: function(id,vismoGraph){
		var partners = [];
		var childrenNodes = vismoGraph.getNodeChildren(id);
		var marked = {};
		marked[id] = true;
		
		for(var i=0; i < childrenNodes.length; i++){
			var child = childrenNodes[i];
			var partnerNodes = vismoGraph.getNodeParents(child);
			for(var j=0; j < partnerNodes.length; j++){
				var partner = partnerNodes[j];
				
				
				if(!marked[partner]){
					partners.push(partner);	
					marked[partner] = true;				
				}

			}
		}
		return partners;
		
	}
	,getSiblings: function(id,vismoGraph){
		
		var parentnodes = vismoGraph.getNodeParents(id);
		
		var siblings = [];
		var marked = {};
		marked[id] = true;
		
		for(var i=0; i < parentnodes.length; i++){
			var parent = parentnodes[i];
			var siblingNodes = vismoGraph.getNodeChildren(parent);
			for(var j=0; j < siblingNodes.length; j++){
				var sib = siblingNodes[j];
				
				
				if(!marked[sib]){
				
					siblings.push(sib);	
					marked[sib] = true;				
				}

			}
		}
		
		return siblings;
		
	}

};
