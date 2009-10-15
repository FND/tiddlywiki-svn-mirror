VismoGraphAlgorithms.walkers ={   
    name: "Walkers"
    ,_MaxDepth: 100,
    reset: function(graph){
       var nodes = graph.getNodes();
       for(var i=0; i < nodes.length; i++){
           var node = nodes[i];
           node.XPosition = false;
           node.YPosition = false;
           node.leftNeighbor = false;
           node.rightNeighbor = false;
           node.prelim = false;
           node.modifier = false;
       }
    }
    ,compute: function (graph,options) {	
        var root = options.root;
        this.nodeWidth = options.nodeWidth | 40;
        this.nodeHeight = options.nodeHeight | 40;
        ////////////console.log(" lets _positiongraph (magic here)");
        this.nodeWidth +=5;
        this.nodeHeight += 5;
        this.reset(graph);
    	this.maxLevelHeight = [];
    	this.maxLevelWidth = [];			
    	this.previousLevelNode = [];
    	////////////console.log(root);
    	var rootnode = graph.getNode(root);		
    	this._firstWalk(graph,rootnode, 0);
	    this.rootXOffset = 0 + rootnode.XPosition;
    	this.rootYOffset = 0 + rootnode.YPosition;

    	this._secondWalk(graph, rootnode, 0, 0, 0);	
    },
    _setLevelHeight: function (node, level) {	
    	if (this.maxLevelHeight[level] == null) 
    		this.maxLevelHeight[level] = 0;
        if(this.maxLevelHeight[level] < node.h)
            this.maxLevelHeight[level] = node.h;	
    },
    _setLevelWidth: function (node, level) {
    	if (this.maxLevelWidth[level] == null) 
    		this.maxLevelWidth[level] = 0;
        if(this.maxLevelWidth[level] < this.nodeWidth)
            this.maxLevelWidth[level] =  this.nodeWidth;		
    },
    _setNeighbors: function(node, level) {
        node.leftNeighbor = this.previousLevelNode[level];
        if(node.leftNeighbor != null)
            node.leftNeighbor.rightNeighbor = node;
        this.previousLevelNode[level] = node;	
    },

    _getLeftSibling : function (node) {
        if(node.leftNeighbor != null && node.leftNeighbor.nodeParent == node.nodeParent)
            return node.leftNeighbor;
        else
            return null;	
    },

    _getRightSibling: function (node) {
        if(node.rightNeighbor != null && node.rightNeighbor.nodeParent == node.nodeParent)
            return node.rightNeighbor;
        else
            return null;	
    },
    _getChildrenCenter: function (graph,node) {
        ////////////console.log("getChildrenCenter",node.id);
        var children = graph.getChildren(node.id);
        ////////////console.log("children are ",children,graph);
      
        var firstchild = graph.getNode(children[0]);
        var lastchild = graph.getNode(children[children.length-1]);
        ////////////console.log("kids are",firstchild,lastchild);
        return firstchild.prelim + ((lastchild.prelim - firstchild.prelim) + this.nodeWidth) / 2;	
    },
    

    _firstWalk: function (graph, node, level) {
    		////console.log("walking",node);
    		var leftSibling = null;
		
            node.XPosition = 0;
            node.YPosition = 0;
            
            node.prelim = 0;
            node.modifier = 0;
            node.leftNeighbor = null;
            node.rightNeighbor = null;
            this._setLevelHeight(node, level);
            this._setLevelWidth(node, level);
            this._setNeighbors(node, level);
            var children= graph.getChildren(node.id);
            var parents = graph.getParents(node.id);
            var parents_children=graph.getChildren(parents);
            var siblingid = parents_children.indexOf(node.id);
            //////////console.log("has children",children);
            if(children.length == 0 || level == this._MaxDepth)
            {
     
                leftSibling = this._getLeftSibling(node);
                if(leftSibling != null){
                     ////////console.log("left sibling prelim",leftSibling.prelim,"size",this.nodeWidth(leftSibling));
                    
                    node.prelim = leftSibling.prelim + this.nodeWidth + 40;
                }
                else
                    node.prelim = 0;
            } 
            else
            {
                
                var n = graph.getChildren(node.id);
                for(var i = 0; i < n.length; i++)
                {
                    var iChild = graph.getNode(n[i]);
                    iChild.nodeParent = node;
                    this._firstWalk(graph, iChild, level + 1);
                }
                var midPoint = this._getChildrenCenter(graph,node);
                midPoint -= this.nodeWidth / 2;
                leftSibling = this._getLeftSibling(node);
                ////////////console.log("have leftSibling",leftSibling,"of ",node);
                if(leftSibling != null)
                {
                    ////////console.log("prelim",leftSibling.prelim,"size",this.nodeWidth(leftSibling));
                    node.prelim = leftSibling.prelim + this.nodeWidth + 40;
                    node.modifier = node.prelim - midPoint;
                    //////console.log("y",node.YPosition);
                    if(node.YPosition.toString() =='NaN') throw "bad modifier";
                    this._apportion(graph, node, level);
                } 
                else
                {            	
                    node.prelim = midPoint;
                }
            }	
            //////////console.log("finished first walk");
    },
    _apportion: function (graph, node, level) {
        //////////console.log("in apportion");
        var children = graph.getChildren(node.id);
            var firstChild = graph.getNode(children[0]);
            var firstChildLeftNeighbor = firstChild.leftNeighbor;
            var j = 1;
            for(var k = this._MaxDepth - level; firstChild != null && firstChildLeftNeighbor != null && j <= k;)
            {
              
                var modifierSumRight = 0;
                var modifierSumLeft = 0;
                var rightAncestor = firstChild;
                var leftAncestor = firstChildLeftNeighbor;
                for(var l = 0; l < j; l++)
                {
                    
                    rightAncestor = rightAncestor.nodeParent;
                    leftAncestor = leftAncestor.nodeParent;
                    modifierSumRight += rightAncestor.modifier;
                    modifierSumLeft += leftAncestor.modifier;
  
                }
                ////console.log("the node is",node,"left ancestor is",leftAncestor,"right is ",rightAncestor);
                var totalGap = (firstChildLeftNeighbor.prelim + modifierSumLeft + this.nodeWidth + 30) - (firstChild.prelim + modifierSumRight);
                if(totalGap > 0)
                {
                    var subtreeAux = node;
                    var numSubtrees = 0;
                    for(; subtreeAux != null && subtreeAux != leftAncestor; subtreeAux = this._getLeftSibling(subtreeAux))
                        numSubtrees++;

                    if(subtreeAux != null)
                    {
                        
                        var subtreeMoveAux = node;
                        ////console.log("subtree is",subtreeMoveAux);
                        var singleGap = totalGap / numSubtrees;
                        for(; subtreeMoveAux != leftAncestor; subtreeMoveAux = this._getLeftSibling(subtreeMoveAux))
                        {
                            ////console.log("left sibling is ",subtreeMoveAux,"looking for ",leftAncestor," to stop");
                            subtreeMoveAux.prelim += totalGap;
                            subtreeMoveAux.modifier += totalGap;
                            totalGap -= singleGap;
                        }

                    }
                }
                j++;
                var firstChildChildren = graph.getChildren(firstChild.id);
                if(firstChildChildren.length == 0){
            
                    firstChild = this._getLeftmost(graph,node, 0, j);
                    }
                else
                    firstChild = graph.getNode(firstChildChildren[0]);
                if(firstChild != null)
                    firstChildLeftNeighbor = firstChild.leftNeighbor;
            }
    },
    _getLeftmost:function (graph,node, level, maxlevel) {
       
        if(level >= maxlevel) return node;
        var children = graph.getChildren(node.id);
        
     
        if(children.length == 0) return null;

    
        for(var i = 0; i < children.length; i++)
        {
            var iChild = graph.getNode(children[i]);
            var leftmostDescendant = this._getLeftmost(graph,iChild, level + 1, maxlevel);
            if(leftmostDescendant != null)
                return leftmostDescendant;
        }

        return null;	
    },
    _secondWalk: function (graph, node, level, X, Y) {
        ////console.log("doing _secondWalk",level,node,node.id,node.leftNeighbor,node.rightNeighbor);
            if(level <= this._MaxDepth)
            {
                var xTmp = 0 + node.prelim + X;
                var yTmp = 0 + Y;
                var maxsizeTmp = 0;
                var nodesizeTmp = 0;
                var flag = false;
            
                 	            	    	
    	                maxsizeTmp = this.maxLevelHeight[level];
    	                nodesizeTmp = this.nodeHeight;	                
    	                node.XPosition = xTmp;
    	                node.YPosition = yTmp;
    	         
                if(flag)
                {
                    var swapTmp = node.XPosition;
                    node.XPosition = node.YPosition;
                    node.YPosition = swapTmp;
                    //////console.log("swapTmp",swapTmp,node.XPosition);
                    
                }
         
    	    node.YPosition = -node.YPosition - nodesizeTmp;
    	       //////console.log("nodesizeTmp",nodesizeTmp);
            
    	    ////////////console.log("getting Children",node);
    	     var Children = graph.getChildren(node.id);
    	     ////////////console.log(Children);
                if(Children.length != 0)
                    this._secondWalk(graph, graph.getNode(Children[0]), level + 1, X + node.modifier, Y + maxsizeTmp + 40);
                var rightSibling = this._getRightSibling(node);
                if(rightSibling != null)
                    this._secondWalk(graph, rightSibling, level, X, Y);
            }	
    ////////console.log("now",node.XPosition,node.YPosition);
    }
};