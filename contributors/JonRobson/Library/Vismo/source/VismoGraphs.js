var VismoGraph = function(properties){
    this._nodes = {};
    this._children = {};
    this._parents = {};
    this._orphans = {};
    this._spouses = {};
	if(properties.nodes){
    	for(var i=0; i < properties.nodes.length; i++){
    	    this.addNode(properties.nodes[i]);
    	}
	}
	if(properties.edges){
	    var edges = properties.edges;
	    for(var i=0; i < edges.length; i++){
	        var a = edges[i][0];
	        var b = edges[i][1]; 
    	    this.addEdge(a,b);
    	}
	}
};

VismoGraph.prototype = {
    getNode: function(id){
        return this._nodes[id];
    }
    ,depth: function(id,depthsofar){
       if(!depthsofar && depthsofar !== 0)depthsofar =0;
       var kids = this.getChildren(id);
       if(kids.length == 0) return depthsofar;
       
       var maxdepth = 0;
       for(var i=0; i < kids.length;i++){
           var depth = this.depth(kids[i],depthsofar+1)
           if(depth > maxdepth) maxdepth = depth;
       }
       return maxdepth;
    }
    /* a spouse shares the same children as another node*/
    ,isSpouse: function(id1,id2){
        if(id1 == id2) return false;
        var childrenX = this.getChildren(id1);
        var childrenY = this.getChildren(id2);
        var allchildren = childrenX.concat(childrenY);
        for(var i=0; i < allchildren.length; i++){
            // if the child also has y as a parent..
            var child = allchildren[0];
            if(this._parents[child].indexOf(id2) != -1 && this._parents[child].indexOf(id1) != -1) return true;
        }
        return false;
    }
    ,getSpouses: function(id){
        var n = this.getNodes();
        var spouses = [];
        for(var i=0; i < n.length;i++){
            
            if(this.isSpouse(id,n[i].id)){
                spouses.push(n[i].id);
            }
        }
        return spouses;
    }
    ,getNodes: function(){
        var nodes = [];
        for(var i in this._nodes){
            nodes.push(this._nodes[i]);
        }
        return nodes;
    }
    ,getChildren: function(id){
        if(typeof(id) != 'string'){
	        var done = {};
	        var allchildren = [];
	        for(var i=0; i < id.length;i++){
	            var parentid = id[i];
	            var children = this.getChildren(parentid);
	            for(var j=0; j < children.length;j++){
	                var childid = children[j];
	                if(!done[childid]){
	                    allchildren.push(childid);
	                    done[childid] = true;
	                }
	            }
	        }
	        return allchildren;
	        
	        
	    }
	    
        var children = this._children[id];

        if(!children){
            return [];
        }
        else {
            return children;
        }
    }
    ,isOrphan: function(id){
        if(!this._parents[id] || this._parents[id].length == 0){
            return true;
        }
        else{
            return false;
        }
    }
    ,getParents: function(id){
        var p = this._parents[id];

        if(!p){
            return [];
        }
        else {
            return p;
        }
    }
    ,getOrphans: function(){ 
        var orphans = [];
       var nodes = this.getNodes();
       for(var i=0; i < nodes.length; i++){
           var id = nodes[i].id;
           if(this.isOrphan(id)){
               orphans.push(id);
            }
        }
    
        return orphans;
    } 
    ,addNode: function(nodejson){
        var id = nodejson.id;
        if(!nodejson.properties){
            nodejson.properties = {};
        }
        this._nodes[id] = nodejson;
        this._orphans[id] = true;
    }
    ,addEdge: function(a,b){
        if(!this._children[a]) this._children[a] = [];
        if(!this._parents[b]) this._parents[b] = [];
        
        this._children[a].push(b);
        this._parents[b].push(a);
        
        if(!this._orphans[a])this._orphans[a] = true;
        this._orphans[b] = false;
        
    }
};

var VismoGraphRenderer = function(place,options){
    if(!options.algorithm){
        throw "GraphRenderer requires an option called algorithm which is a function. This will take two parameters graph and root and should set XPosition and YPosition on every node.";
    }
    
    this.algorithm = options.algorithm; 
    if(!options.nodeWidth) options.nodeWidth= 5;
    if(!options.nodeHeight) options.nodeHeight = 5; 
    this.options = options;
    this._edgeShapeCoordinates = [];
    this._graph = options.graph;

 
    
    var canvasopts = {vismoController:{}};
    if(options.move)canvasopts.move = options.move;
    if(options.dblclick)canvasopts.dblclick = options.dblclick;
    this._canvas = new VismoCanvas(place,canvasopts);

    if(options.root){
        this.compute(options.root);  
    }
     
};

VismoGraphRenderer.prototype = {
    clear: function(){
        this._canvas.clear(true);
        this._edgeShapeCoordinates = [];
    }

    ,compute: function(root){
        var graph = this._graph;
        if(this.options.root != root) this.clear();
        if(root)this.options.root = root;
        this.algorithm.compute(graph,this.options);
        
        this.plot(root);
        if(this._edgeShapeCoordinates.length > 0){
            this._canvas.add(new VismoShape({shape:"path",coordinates:this._edgeShapeCoordinates}));
        }
        this._canvas.render();

        var node = graph.getNode(root);
        var half_height = this._canvas.height() /2;
        this._canvas.centerOn(node.XPosition,node.YPosition + half_height);

    }
    ,plot: function(id){
        var node = this._graph.getNode(id);
        var y = -node.YPosition;
        var x = node.XPosition;
        this.plotNode(id,{x:x,y:y});
        var children = this._graph.getChildren(id);
        for(var i=0; i < children.length; i++){
            var parentpos = {x:x,y:y};
            var ch =children[i];
            var childxy = this.plot(ch);
            if(parentpos && childxy){
                this._edgeShapeCoordinates=this._edgeShapeCoordinates.concat(["M",parentpos.x,parentpos.y,childxy.x,childxy.y]);
            }
        }
        return {x: x,y:y};
    }
    
    ,plotNode: function(id,pos){
        var exists = this._canvas.getShapeWithID(id);
        if(!exists){
            var st,coords;
            st= "polygon";
            var hr = this.options.nodeWidth /2;
            var vr=this.options.nodeHeight /2;
            coords = [pos.x-hr,pos.y-vr,pos.x+hr,pos.y-vr,pos.x+hr,pos.y+vr,pos.x-hr,pos.y+vr];
            
            var node= this._graph.getNode(id);
            node.properties.shape = st;
            node.properties.coordinates = coords;
            var shape= new VismoShape(node.properties);
            this._canvas.add(shape);          
        }
        else{
            var b = exists.getBoundingBox();
            pos = b.center;
        } 
        return pos;
        
    }

 };