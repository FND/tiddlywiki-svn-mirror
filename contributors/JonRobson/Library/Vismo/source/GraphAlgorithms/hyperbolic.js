VismoGraphAlgorithms.hyperbolic ={   
    size: {width:400,height:400}
    ,reset: function(graph){
       var nodes = graph.getNodes();
       for(var i=0; i < nodes.length; i++){
           var node = nodes[i];
           node.XPosition = false;
           node.YPosition = false;
       }
    }
    ,computeLevels: function(graph,id, flags) {

		var filterer = VismoGraphAlgorithms._utils.filter(flags);
		graph.eachNode(function(elem) {
			if(filterer(elem)){
			    elem._flag = false;
			    elem._depth = -1;
			}
		});
		var root = graph.getNode(id);
		root._depth = 0;
		var queue = [root];
		while(queue.length != 0) {
			var node = queue.pop();
			node._flag = true;
			graph.eachEdge(node, function(adj) {
				if(filterer(node)){
				    var n = adj[1];
				    if(n._flag == false && filterer(n)) {
					    if(n._depth < 0) n._depth = node._depth + 1;
					    queue.unshift(n);
				    }
				}
			});
		}
	}
    ,compute: function (graph,options) {	
        
        var root = options.root;
        var nodes = graph.getNodes();
        var utils = VismoGraphAlgorithms._utils;
        utils.root = root;
        
        var prop = ['pos', 'startPos']; 
        var node = graph.getNode(root); 
        node._depth = 0; 
        utils.computeLevels(graph, utils.root, 0, "ignore"); 
        var md = utils.getMaximumDepth();
        this.size.width = options.canvas_width *  (md);
        this.size.height = options.canvas_height * (md);
        console.log(utils,md,this.size.width,this.size.height);
        
        utils.computeAngularWidths(graph); 
        

        this.computePositions(graph,prop);
   
        for(var i=0; i < nodes.length;i++){
            var node = nodes[i];
     
             var scale = Math.min(this.size.width, this.size.height)/2; 
            if(node.pos){
                var pos = node.pos.toComplex();
                node.XPosition =  pos.x * scale;
                node.YPosition = pos.y * scale; 
            }
           
        }
    }
    ,computePositions: function(graph,property) {
        var utils = VismoGraphAlgorithms._utils;
        var get_type = function(elem) {
          return Object.prototype.toString.call(elem).match(/^\[object\s(.*)\]$/)[1].toLowerCase();
        };
        
        var type = get_type(property);
        var propArray = (type) ? ((type != 'array') ? [property] : property) : [];
        var aGraph = graph;
        var root = graph.getNode(utils.root), that = this, config = this.config; 
        var scale = Math.min(this.size.width, this.size.height)/ 2; 
 
 
        //Set default values for the root node 
        for(var i=0; i<propArray.length; i++)  
            root[propArray[i]] =  new Polar(0, 0); 
        root.angleSpan = { 
            begin: 0, 
            end: 2 * Math.PI 
        }; 
    root._rel = 1; 
   
        //Estimate better edge length. 
        var edgeLength = (function() { 
            var depth = 0; 
            graph.eachNode(function(node) { 
                depth = (node._depth > depth)? node._depth : depth; 
        node._scale = scale; 
            }, "ignore"); 
            for(var i=0.51; i<=1; i+=0.01) { 
                var valSeries = (function(a, n) { 
                    return (1 - Math.pow(a, n)) / (1 - a); 
                })(i, depth + 1); 
                if(valSeries >= 2) return i - 0.01; 
            } 
            return 0.5; 
        })(); 
       
        utils.eachBFS(graph, utils.root, function (elem) { 
            var angleSpan = elem.angleSpan.end - elem.angleSpan.begin; 
            var angleInit = elem.angleSpan.begin;
             
            var totalAngularWidths = (function (element){ 
                var total = 0; 
                utils.eachSubnode(graph,element, function(sib) { 
                    total += sib._treeAngularWidth; 
                }, "ignore"); 
                return total; 
            })(elem); 
 
            for(var i=1, rho = 0, lenAcum = edgeLength, depth = elem._depth; i<=depth+1; i++) { 
                rho += lenAcum; 
                lenAcum *= edgeLength; 
            } 
              
            utils.eachSubnode(graph,elem, function(child) { 
                if(!child._flag) { 
                    child._rel = child._treeAngularWidth / totalAngularWidths; 
                    var angleProportion = child._rel * angleSpan; 
                    var theta = angleInit + angleProportion / 2; 
                 
                    for(var i=0; i<propArray.length; i++) 
                        child[propArray[i]] = new Polar(theta, rho); 
                 
                    child.angleSpan = { 
                        begin: angleInit, 
                        end: angleInit + angleProportion 
                    }; 
                    angleInit += angleProportion; 
                } 
            }, "ignore"); 
 
        }, "ignore"); 
    } 
    
};

