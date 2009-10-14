VismoGraphAlgorithms.random ={  
     name: "Random"
    ,reset: function(graph){
       var nodes = graph.getNodes();
       for(var i=0; i < nodes.length; i++){
           var node = nodes[i];
           node.XPosition = false;
           node.YPosition = false;
       }
    }
    ,compute: function (graph,options) {	
        var root = options.root;
        var nodes = graph.getNodes();
        var w= 400;
        var h = 400;
        for(var i=0; i < nodes.length;i++){
            var node = nodes[i];
            
            node.XPosition = - (w/2)+ Math.random() * (w);
            node.YPosition =- (h/2)+ Math.random()  * (h);
        }
    }

};