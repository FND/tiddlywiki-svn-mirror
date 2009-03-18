/***
296.56
58 * 151.46
246.56
!Layer 2: DynamicInteract: Extension of RGraph
***/
{{{
Array.prototype.contains = function(item)
{
	return this.indexOf(item) != -1;
};
if(!Array.indexOf) {
	Array.prototype.indexOf = function(item,from)
	{
		if(!from)
			from = 0;
		for(var i=from; i<this.length; i++) {
			if(this[i] === item)
				return i;
		}
		return -1;
	};
}

var Tagmindmap = function(wrapper,settings){
	if(settings.clickFunction)
		this.callWhenClickOnNode = settings.clickFunction;
	else
		this.callWhenClickOnNode = function(node,id){return};
	
	if(settings.dynamicUpdateFunction)
		this.dynamicUpdateFunction = settings.dynamicUpdateFunction;
	else
		this.dynamicUpdateFunction = function(node,id){return {};};		
	this.wrapper = wrapper;
	
	this._setup(settings);
	//this._init_html_elements(wrapper.id);
	
	
	this.controlpanel =new EasyController(this,wrapper);
	this._init_html_elements();
	
	var x = this.controlpanel;
	initialT = {translate: {x:0,y:0}, scale: {x:1,y:1}};
	x.setTransformation(initialT);
	x.addControl("zoom");
	x.addControl("pan");
	x.addControl("mousepanning");
	//x.addControl("mousewheelzooming");


	this.children = {};
	this.parents = {};
};

Tagmindmap.prototype = {
	transform: function(t){

		var compute = false;
		if(this.settings.zoomLevel != t.scale.x) {
			if(t.scale.x > 0){			
			this.settings.zoomLevel = parseFloat(t.scale.x * 100);
		
			}
			compute = true;
		}
	
		if(this.rgraph){
			var c= {x:t.translate.x, y:t.translate.y};
		
			this.rgraph.offsetCenter(c.x,c.y);
			if(compute) this.rgraph.compute();
			this.rgraph.plot();
		}
	},
	_setup: function(settings){
		
		
		this.settings = {'arrowheads':false,'maxNodeNameLength':99999,'breadcrumbs': true,'lineColor':'#ccddee','nodeColor':'#ccddee','zoomLevel':100, 'ignoreLoneNodes':false,'excludeNodeList': ['excludeLists']}; //put all default settings here
		this.settings.tagcloud = {'smallest': 0.8, 'largest': 1.4, 'upper':0, 'off': false}; //upper is the maximum sized node
	
		this.graph_showCirclesFlag = false; //shows circles in the mind map
		this.maxNodeNameLength = 0;
		this.displacement = {'x':0, 'y':0};
		this.maxChildrenOnSingleNode = 0;	
		this.thehiddenbridge = "RGRAPHTREEBRIDGE"; //a hidden node which bridges all dislocated nodes.

		this.settings.breadcrumb_startcolor = "red"; //rgb(0,0,0)
		/*above defaults below read in */
		for(var i in settings){
			this.settings[i] = settings[i];
		}
		this.settings.arrowheads = settings.arrowheads;
		this.settings.breadcrumbs = settings.breadcrumbs;
		this.settings.tagcloud.off = settings.tagcloud.off;
		this.settings.excludeNodeList = settings.excludeNodeList;
		this.settings.ignoreLoneNodes = settings.ignoreLoneNodes;
		this.maxNodeNameLength = settings.maxNodeNameLength;
		this.settings.zoomLevel = settings.zoomLevel;
		var ttmm = this;
	},

	
	_init_html_elements: function(){
			var wrapperID = this.wrapper.id;
			if(!document.getElementById(wrapperID)){ throw (wrapperID + " html element doesn't exist");}

			var canvasID = wrapperID + "_canvas"; //the canvas object ID
			this.labelContainer = wrapperID + "_label_container";
			this.nodeLabelPrefix = canvasID +"_";
			/*setup the divs */
			var wrapper = this.wrapper;
			wrapper.style.position = "relative";
			
			if(!wrapper.style.height){wrapper.style.height = "200px";}
			if(!wrapper.style.width){wrapper.style.width = "200px";}

			var labelContainer = document.createElement("div");
			labelContainer.id=this.labelContainer;
			labelContainer.style.position= 'relative';		
			var canvas = document.createElement("canvas");
			canvas.id = canvasID;
			canvas.width = parseInt(wrapper.style.width);
			canvas.height =parseInt(wrapper.style.height);
			
			wrapper.appendChild(labelContainer);
			wrapper.appendChild(canvas);
			this.canvas = canvas;
			if(config.browser.isIE && G_vmlCanvasManager) {G_vmlCanvasManager.init_(document);} //ie hack - needs changing to work outside tw		
	},
	

	createNodeFromJSON: function(json){

		if(json == {}) return;
		var temp = false;
		var res = false;
		var node1= json['node'];
		if(json['parents']){ 
			for(var i=0; i < json['parents'].length; i++){
				var parent = json['parents'][i];
				temp = this.drawEdge(parent['id'],node1['id'],parent['name'],node1['name'],parent['data'],node1['data']);
				res = temp | res;
			}
		 }

		if(json['children']){
			for(var i=0; i < json['children'].length; i++){
			   	var child = json['children'][i];
				temp = this.drawEdge(node1['id'],child['id'],node1['name'],child['name'],node1['data'],child['data']);
				res = temp | res;
			 }
		}

		if(json['children'] && json['parents']){
		 if(!this.settings.ignoreLoneNodes && json['children'].length ==0 && json['parents'].length == 0)
		   temp = this.drawEdge(this.thehiddenbridge, node1['id'],null,node1['name'],null,node1['data']);
		res = temp | res;
		 }
		
		return res;
	},

	centerOnNode:function(id){
		//var cur =this.getCurrentNodeID();
		//if(cur == id) return;

		this.rgraph.onClick(id);
		
	},

	getCurrentNodeID: function(){
		if(!this.rgraph.graph.root) return false;
		if(this.rgraph.graph.root.id == this.thehiddenbridge) return false;
		else return this.rgraph.graph.root.id;
	},

	setNodeName: function(nodeid,newName){
		var node = this.controller.getNode(nodeid);
		if(node.name != newName){
			node.name = newName;
			if(this.thehiddenbridge != nodeid && this.graph_index) this.graph_index[newName] = nodeid;
		}
	},
	mergeNodeData: function(id,data){

			var node = this.controller.getNode(id);
			if(!node) return;

			for (var key in data){
				if(typeof node.data[key] == 'array')
					node.data[key] = node.data[key].concat(data[key]);
				else
					node.data[key] = data[key];
			}
			
			if(node.data.weight > this.settings.tagcloud.upper) {
				this.settings.tagcloud.upper = node.data.weight;
			}
	},
	setNodeData: function(id,data,newvalue){
		var node = this.controller.getNode(id);
		if(!node) return;
		
		if(!newvalue){
			node.data = data;
		}
		else{
			node.data[data] = newvalue;	
		}

		if(node.data.weight > this.settings.tagcloud.upper) {
			this.settings.tagcloud.upper = node.data.weight;
		}
	
	},

	_nodeInExcludeList: function(id){
		return this.settings.excludeNodeList.contains(id);
	},

	drawEdge: function(id_a,id_b,name_a,name_b,data_a,data_b){
		if(this._nodeInExcludeList(id_a) || this._nodeInExcludeList(id_b)) return false;
		plotNeeded=false;

		if(id_a != "" && id_b != ""){

		  plotNeeded = this._make_connection(id_a,id_b);

		  if(name_a){this.setNodeName(id_a,name_a);}
		  if(name_b){this.setNodeName(id_b,name_b);}
		
		  if(data_a) {this.mergeNodeData(id_a,data_a); }
		  if(data_b) {this.mergeNodeData(id_b,data_b);}

		}  
		return plotNeeded;
	},

	_make_connection: function(a,b){
	  	  var drawn = this._setupMapIfNeeded(a);
		  var node1, node2; 
		  node1 = this.controller.getNode(a);
		  node2 = this.controller.getNode(b);

		  if(node1 && node2){
			if(node1.adjacentTo(node2)) {return false;}

		  }
		  else if(!node1 && !node2) {//neither in graph yet
			drawn = this._make_connection(this.thehiddenbridge,a);  //if neither node is currently in tree, then we need to create a "bridge" to connect the trees
		  
		  }
		
		
		  if(!node1) {node1= new Graph.Node(a,a,{});drawn= true; }//create this node
		  if(!node2) {node2= new Graph.Node(b,b,{});drawn= true; }//create that node

		  if(node1){			
	
			  if(!node1.adjacentTo(node2)){

		
				this.controller.addAdjacence(node1,node2);
				
				node1 = this.controller.getNode(a);
			  	node2 = this.controller.getNode(b);
			
				if(!this.children[a]) this.children[a] = [];
				if(!this.parents[b]) this.parents[b] = [];
				this.children[a].push(b);
				this.parents[b].push(a);

				return true;
			 }
		 }
	},
	deleteNode: function(id){
		var node = this.rgraph.controller.getNode(id);
		//console.log("start",node,"end");
		var parents = node.data.parents;
		var children = node.data.children;
		//console.log(id,parents,children);
		if(children){
			//sort out children
			for(var i=0; i < children.length; i++){
				var childNode = this.rgraph.controller.getNode(children[i]);
			
				var oldparents = childNode.data.parents;
				var newparents = [];
				for(var j=0; j < oldparents.length; j++){
					if(oldparents[j] != id)newparents.push(oldparents[j]);
				}

				this.setNodeData(children[i],"parents",newparents);
				
				if(newparents.length == 0) { //connect it up to the bridge
					this.drawEdge(this.thehiddenbridge,children[i]);
			
				}
			}
		}
			
		//sort out parents
		if(parents){
			for(var i=0; i < parents.length; i++){
				if(parents[i] != this.thehiddenbridge){
					
			
					var parentNode = this.rgraph.controller.getNode(parents[i]);
			
					var oldchildren = parentNode.data.children;
					var newchildren = [];
					for(var j=0; j < oldchildren.length; j++){
						if(oldchildren[j] != id)newchildren.push(oldchildren[j]);
					}
					this.setNodeData(parents[i],"children",newchildren);
				}
			}
		}
				
		this.rgraph.controller.removeNode(id);


	},
	computeThenPlot: function(){
		try{
		  this.rgraph.compute();
		  this.rgraph.plot(); 
		}
		catch(e){
			console.log(e+"in computeThenPlot");
		}
	},

	_trimNodeName: function(node_name){
		if(this.maxNodeNameLength ==0) return "<span>&nbsp;&nbsp;&nbsp;</span>";
		if(this.maxNodeNameLength){
			var nlength = this.maxNodeNameLength;

			  if(node_name.length > nlength)
			    return node_name.substr(0,nlength/2) + "..." + node_name.substr(node_name.length-nlength/2,node_name.length);
			  else
			    return node_name;
		}
		return node_name;
	},

	
	_getController: function(){

  		var ttmm = this;
		    var effectHash = {};
		  var controller =  {
			
			removeNode: function(id){
				
				var el = document.getElementById(this.getNodeLabelPrefix()+id);
				el.parentNode.removeChild(el);
				
				var graph = ttmm.rgraph.graph;
				if(graph) graph.removeNode(id);	
			
			},
			getNode: function(id){
			
			  var n = GraphUtil.getNode(ttmm.rgraph.graph,id); 

			return n;
			},
			addAdjacence: function(node1,node2){
				ttmm.rgraph.graph.addAdjacence(node1,node2);	
			},
			/*some custom defined controller operations (search in RGraph source)*/
			getZoomLevel: function(){	
				return parseFloat(ttmm.settings.zoomLevel);
			},
			setOffset: function(d){ttmm.displacement = d;},
			getOffset: function(){return ttmm.displacement;},
			getNodeLabelContainer: function(){
				return ttmm.labelContainer;
			},
			getNodeLabelPrefix: function(){return ttmm.nodeLabelPrefix;},
		  	onBeforeCompute: function(node) {									
				ttmm.createNodeFromJSON(ttmm.dynamicUpdateFunction(node.id));
				if(ttmm.settings.breadcrumbs) {
					ttmm.setNodeData(node.id,"color",ttmm.settings.breadcrumb_startcolor);	
				}
			},
		  	getName: function(node1, node2) {
		  		for(var i=0; i<node1.data.length; i++) {
		  			var dataset = node1.data[i];
		  			if(dataset.key == node2.name) return dataset.value;
		  		}
  		
				for(var i=0; i<node2.data.length; i++) {
		  			var dataset = node2.data[i];
		  			if(dataset.key == node1.name) return dataset.value;
		  		}
		  	},	
		
		  	onCreateLabel: function(domElement, node) {			
			}

			,attachClickFunction: function(domElement,node){	
				if(node.id == this.thehiddenbridge) return;
				
				var clickfunction = function(event){
					
					if(ttmm.rgraph.root == node.id){ //special case for when node is already centered
						ttmm.callWhenClickOnNode(node,ttmm.wrapper.id,event);
						return;	
					} 
					else{ //need to center first
						var t = ttmm.controlpanel.transformation;
						t.translate = {x:0,y:0};
						ttmm.controlpanel.setTransformation(t);
						ttmm.rgraph.onClick(node.id);
						var todo = function(){

							ttmm.callWhenClickOnNode(node,ttmm.wrapper.id,event);
						};
						ttmm._afterComputeFunction = todo;
									

					}
					return false;
				};
				
				if(domElement.addEvent){ //for ie
					domElement.addEvent('click',clickfunction);
				}
				else {
					domElement.onclick = clickfunction;
				}
				
			}
			,getMaxChildren: function(){
				var max =0,num;
				for(var i in ttmm.children){
					if(ttmm.children[i])
						num = ttmm.children[i].length;
					else
						num =0;
					if(num > max) max = num;
				}
				return max;
			},
		  	
			calculateNodeWeight: function(node){
				var weight=0, u=0;
				
				if(node.data.weight) { //user has defined some sort of weight
					weight = parseFloat(node.data.weight);
					u =parseFloat(ttmm.settings.tagcloud.upper);
				}
				else{ //just take number of children
					
					if(ttmm.children[node.id]){
						weight = ttmm.children[node.id].length;
					}
					u = this.getMaxChildren();
				}
				
				var s,l;
				
				if(ttmm.settings.tagcloud.smallest){
					s = parseFloat(ttmm.settings.tagcloud.smallest);
				}
				else{	
					s = 0.5;
				} 
				if(ttmm.settings.tagcloud.largest) {
					l =parseFloat(ttmm.settings.tagcloud.largest);
				}
				else{
					l = 2;
				}
				
				var fontsize = s + ((l - s) * parseFloat(weight / u));	
				//console.log(s,l,weight,u,fontsize);
				
				return fontsize;
			},
			onPlaceLabel: function(domElement, node) {
				domElement.innerHTML = ""; //quick and dirty flush
 				if(node.id != ttmm.thehiddenbridge){
						if(node.data.color) domElement.style.color = node.data.color;
							
						if(node.data.title){
							domElement.title = node.data.title;
						}
						else{
							domElement.title = node.name;
						}
						
					
						var prefix, nodeLabel,suffix;
						if(node.data.nodeLabelPrefix) prefix =node.data.nodeLabelPrefix;
						
						if(prefix){
							prefix.setAttribute("class","nodeLabelPrefix");
							domElement.appendChild(prefix);
						}
					
						if(!node.data.label){
							nodeLabel = document.createElement("span");
						 	var labelText = ttmm._trimNodeName(node.name);
							nodeLabel.appendChild(document.createTextNode(labelText));
						}
						else{
							nodeLabel = node.data.label;
						}
						
						if(!ttmm.settings.tagcloud.off){
							var fontsize = this.calculateNodeWeight(node);

						
							
							nodeLabel.style.fontSize = fontsize + "em";
							
						}
					
						nodeLabel.setAttribute("class","nodeLabel");
				
						this.attachClickFunction(nodeLabel,node);

						domElement.appendChild(nodeLabel);
						
					
						if(node.data.nodeLabelSuffix) suffix =node.data.nodeLabelSuffix;
						if(suffix){	
							suffix.setAttribute("class","nodeLabelSuffix");																						 
							domElement.appendChild(suffix);		
						}
						
						
				}
				else domElement.style.display = "none";

			
				var left = parseInt(domElement.style.left);
				domElement.style.width = '';
				domElement.style.height = '';
				var w = domElement.offsetWidth;
				domElement.style.left = (left - w /2) + 'px';


			},
	
			onAfterCompute: function() {
				if(ttmm._afterComputeFunction){
					ttmm._afterComputeFunction();	
					ttmm._afterComputeFunction = false;			
				}
						
			},
	
			onBeforePlotLine: function(adj){
			  lineW = ttmm.canvas.getContext().lineWidth;  
		      nodeid = adj.nodeFrom.id;
			  nodeid2 = adj.nodeTo.id;
			  if(nodeid == ttmm.thehiddenbridge || nodeid2 == ttmm.thehiddenbridge){
				ttmm.canvas.getContext().lineWidth = "0";
				}
			  else ttmm.canvas.getContext().lineWidth = "1";

			},
	
			onAfterPlotLine: function(adj){
				var l =this.getNodeLabelContainer();				
				//document.getElementById(l).innerHTML = "";	
				var context = ttmm.canvas.getContext();
				var canvas = ttmm.canvas;
				var node = adj.nodeFrom, child = adj.nodeTo;

				var pos = node.pos.toComplex();
				var posChild = child.pos.toComplex();
				var d = this.getOffset();//jon
				
				//draw arrowhead.. (angle needs to be calculated)
				if(ttmm.settings.arrowheads){
					if(node.id == ttmm.thehiddenbridge)return;
					//console.log("arrowhead from",node.id, "to",child.id)
					canvas.path('stroke', function(context) {
					var r = 20;
					var ctx = context;
					ctx.save();
					//ctx.beginPath();
					ctx.translate(posChild.x +d.x,posChild.y+d.y);
					var o = parseFloat(posChild.y-pos.y);
					var a = parseFloat(posChild.x -pos.x);
   
					if(a !=0){
					var rad = Math.atan2(o,a);
					ctx.rotate(rad);
					ctx.moveTo(2,0);
					ctx.lineTo(-r,-4);
					ctx.lineTo(-r,4);

				    ctx.lineTo(2,0);
					ctx.fill();		
					}

					ctx.restore();

				});
			
			}
			
			ttmm.canvas.getContext().lineWidth = "1";

			}
  	
		  };
  
		return controller;

},

	_setupMapIfNeeded: function(lastOpenNode){
		
		if(!this.canvas){
			this._init_html_elements();
		}
		var ctx = this.canvas.getContext;
		if(!ctx) {console.log("no context available! Please install ExplorerCanvas");}

		if(this.graphloaded) return false;
		
		this.graphloaded = true;
		//this._firstnode =lastOpenNode;


	  	var json = {"id":this.thehiddenbridge,"children":[{"id":lastOpenNode,"name":lastOpenNode, "data":{"parents":[this.thehiddenbridge], "children":[]}, "children":[]}], 'data':{"parents":[], "children":[lastOpenNode]}};
		
		json.data = {};
		json.data.nodraw=true;
	    	this.canvas= new Canvas(this.canvas.id, this.settings.nodeColor, this.settings.lineColor); 
		controller = this._getController();	
		this.rgraph= new RGraph(this.canvas, controller,this.labelContainer);
  


	  	Config['drawConcentricCircles'] = this.graph_showCirclesFlag;
 
	 	this.rgraph.loadTreeFromJSON(json);

		this.controller = controller;
		this.rgraph.compute();
		this.centerOnNode(lastOpenNode);
		//this.rgraph.graph.root = this.controller.getNode(lastOpenNode);	

	  		
				  //if(!this.rgraph.graph.root) this.rgraph.graph.root =this.controller.getNode(this._firstNode);
		return true;
	
	}


};

}}}
