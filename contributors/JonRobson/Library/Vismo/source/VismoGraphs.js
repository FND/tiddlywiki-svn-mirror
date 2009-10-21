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
    eachEdge: function(node,f){
        var edges = this.getEdges(node.id);
        for(var i=0; i < edges.length; i++){
            f(edges[i]);
        }
    }
	
    ,eachNode: function(f){
        var nodes = this.getNodes();

        for(var i=0; i < nodes.length;i++){
     
                f(nodes[i]);
            
        }
    }
    ,getNode: function(id){
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
    /* returns  a list of edges (parents and children) containing id [fromNode,toNode]*/
    ,getEdges: function(id){
        var c = this.getChildren(id);
        var p = this.getParents(id);
        
        var edges = [];
        var node = this.getNode(id);
        
        for(var i=0; i < c.length; i++){
            edges.push([node,this.getNode(c[i])]);
        }
        for(var i=0; i < p.length; i++){
            edges.push([this.getNode(p[i]),node]);
        }
        return edges;    
        
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
        //not working properly with new lines
        if(typeof(a) !="string"||typeof(b) != "string") return;
        a = a.replace(/\n/,"");
        b= b.replace(/\n/,"");
        if(a == b) return;
        if(!a || !b ||(a && a.length == 0) || (b && b.length==0)) {
        
            return;
        
        }
        /* cannot set a as a parent of b if b is a parent of a */
        if(this._parents[a] && this._parents[a].indexOf(b) > -1){
            return; //can't do this! this would create nasty loop
        }
        var p = this.getNode(a);
        var c = this.getNode(b);
        if(!p) this.addNode({id:a,properties:{name:a}});
        if(!c) this.addNode({id:b,properties:{name:b}});

        if(!this._children[a]) this._children[a] = [];
        if(!this._parents[b]) this._parents[b] = [];
        
        this._children[a].push(b);
        this._parents[b].push(a);
        
        if(!this._orphans[a])this._orphans[a] = true;
        this._orphans[b] = false;
        
    }
};

/* options 
algorithm: name of an algorithm defined in VismoGraphAlgorithms

*/
var VismoGraphRenderer = function(place,options){

    if(!options.lineColor){
        options.lineColor = "rgb(0,0,0)";
    }
    if(!options.defaultNodeColor){
        options.defaultNodeColor = "#ffffff";
    }
    if(!options.lineWidth){
        options.lineWidth = "2";
    }
    if(!options.lineType){
        options.lineType = 'normal';
    }
    if(options["algorithm"]){
        options.algorithm = VismoGraphAlgorithms[options["algorithm"]];
    }
    
    if(!options.algorithm){
        throw "GraphRenderer requires an option called algorithm which is a function. This will take two parameters graph and root and should set XPosition and YPosition on every node.";
    }

    if(!options.plotNode){
       options.plotNode = function(el,shape){
          jQuery(el).text(shape.properties.id);  
        };
    }
    if(!options.nodeWidth) options.nodeWidth= 5;
    if(!options.nodeHeight) options.nodeHeight = 5; 
    
    this.options = options;
    this._edgeShapeCoordinates = [];
    this._graph = options.graph;
    
    var canvasopts;
    if(!options.vismoCanvas) canvasopts = {};
    else canvasopts = options.vismoCanvas;
    
    if(!options.vismoController){
        canvasopts.vismoController = {};
    } 
    else{
        canvasopts.vismoController = options.vismoController;
    }
    if(options.move)canvasopts.move = options.move;
    if(options.dblclick)canvasopts.dblclick = options.dblclick;
    
    this._canvas = new VismoCanvas(place,canvasopts);
    this.options.canvas_width = this._canvas.width();
    this.options.canvas_height = this._canvas.height(); 
    if(options.root){
        this.compute(options.root,this.options);  
    }
    if(options.centerOn){
        this.centerOn(options.centerOn);
    }
     
};

VismoGraphRenderer.prototype = {
    algorithm: function(id){
        if(id){
            var newalg = VismoGraphAlgorithms[id];
            if(newalg){
                this.options.algorithm = newalg;
            }
            else{
                throw "algorithm "+ id + " does not exist!";
            }
            
        }
    }
    ,clear: function(){
        this._canvas.clear(true);
        this._edgeShapeCoordinates = [];
    }
    ,reset: function(){
        var nodes = this._graph.getNodes();
        for(var i=0; i < nodes.length;i++){
            var node = nodes[i];
            node.XPosition = false;
            node.YPosition = false;
        }
    }
    ,graph: function(){
        return this._graph;
    }
    ,compute: function(root){
        this.reset();
        
        if(!root) root = this.options.root;
        var graph = this._graph;
        if(this.options.root != root) this.clear();
        if(root)this.options.root = root;
        //console.log("aboute to compute",this.options);
        this.options.algorithm.compute(graph,this.options);
        //console.log("dome compute");
        this.plot(root);
        
        if(this._edgeShapeCoordinates.length > 0){
            var edge = new VismoShape({"z-index":"-1",shape:"path",stroke:this.options.lineColor,lineWidth:this.options.lineWidth,coordinates:this._edgeShapeCoordinates});
            this._canvas.add(edge);
        }
        this._canvas.render();

        var node = graph.getNode(root);
        var half_height = this._canvas.height() /2;
        this._canvas.centerOn(node.XPosition,node.YPosition + half_height);

    }
    ,centerOn: function(id){
        var node = this._graph.getNode(id);
        this._canvas.centerOn(node.XPosition,node.YPosition);
    }
    ,plot: function(id){
        var lineType = this.options.lineType;
        var node = this._graph.getNode(id);
        var y = -node.YPosition;
        var x = node.XPosition;
        var shape = this.plotNode(id,{x:x,y:y});
        
        var children = this._graph.getChildren(id);
        for(var i=0; i < children.length; i++){
            var parentpos = {x:x,y:y};
            var ch =children[i];
            var child_shape = this.plot(ch);
            var bb = child_shape.getBoundingBox();
            var childxy = {x:bb.center.x,y:bb.center.y};
            if(parentpos && childxy){
                 
                if(shape.properties.hidden){
                    //do nowt
                }
                else if(lineType == 'quadratic'){
                    this._edgeShapeCoordinates=this._edgeShapeCoordinates.concat(["M",parentpos.x,parentpos.y,"q",childxy.x,parentpos.y,childxy.x,childxy.y]);                    
                }
                else if(lineType == 'normal'){
                    this._edgeShapeCoordinates=this._edgeShapeCoordinates.concat(["M",parentpos.x,parentpos.y,childxy.x,childxy.y]);                    
                }
                else if(lineType =='bezier'){
                    var hdistance = parentpos.x - childxy.x;
                    var vdistance = parentpos.y - childxy.y;
                    var b1,b2;
                    b2 = -vdistance/2;
                    b1 = -hdistance/10;
                   
                    if(hdistance == 0){
                        b1 = 0;
                        b2 = 0;
                    }
                    
                    
                    var coords = ["M",parentpos.x,parentpos.y,"c",parentpos.x +b1, parentpos.y, childxy.x, childxy.y-b2,childxy.x,childxy.y];
                    this._edgeShapeCoordinates=this._edgeShapeCoordinates.concat(coords);
                }
            }
        }
        
        return shape;
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
            node.properties.id = id;
            if(!node.properties.fill)node.properties.fill = this.options.defaultNodeColor;
            var shape= new VismoShape(node.properties);
            this._canvas.add(shape);   
            if(!node.properties.hidden)this.plotLabel(node,{x:pos.x,y:pos.y},shape);       
        }
        else{
            shape = exists;
        } 
       
        return shape;
        
    }

    ,plotLabel: function(node,pos,vismoShape){
        
        //if(!VismoOptimisations.inVisibleArea(this._canvas.getDomElement(),pos.x,pos.y,this._canvas.transformation)) return;
        
        var el = document.createElement("div");
        var props = node.properties;
        if(props.hover){
            jQuery(el).hover(function(e){this.innerHTML = props.hover;},function(e){this.innerHTML = props.label;});
           
        }
        
       
        if(typeof("node._depth") != 'undefined'){
            var fromroot = node._depth;
            if(fromroot < 0) fromroot = - fromroot;
            jQuery(el).addClass("fromRoot"+fromroot);
        }
        jQuery(el).hover(function(e){jQuery(this).addClass("hoverNode");},function(e){jQuery(this).removeClass("hoverNode");});
        
        if(this.options.plotNode){
            this.options.plotNode(el,vismoShape)
        }
        this._canvas.addLabel(el,pos.x,pos.y,vismoShape);
    }
 };