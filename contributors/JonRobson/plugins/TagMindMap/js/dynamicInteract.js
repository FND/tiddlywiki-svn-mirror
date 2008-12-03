/***
296.56
58 * 151.46
246.56
!Layer 2: DynamicInteract: Extension of RGraph
***/
{{{

var Tagmindmap = function(divID,settings){
	if(settings.clickFunction)
		this.callWhenClickOnNode = settings.clickFunction;
	else
		this.callWhenClickOnNode = function(node,id){return};
	
	if(settings.dynamicUpdateFunction)
		this.dynamicUpdateFunction = settings.dynamicUpdateFunction;
	else
		this.dynamicUpdateFunction = function(node,id){return {};};		
	this.wrapperID = divID;

	this._setup(settings);
	this._init_html_elements(divID);
	
};

Tagmindmap.prototype = {
	_setup: function(settings){
		
		
		this.settings = {'arrowheads':false,'breadcrumbs': true,'lineColor':'#ccddee','nodeColor':'#ccddee','zoomLevel':100, 'ignoreLoneNodes':false,'excludeNodeList': ['excludeLists']}; //put all default settings here
		this.settings.tagcloud = {'smallest': 0.8, 'largest': 1.4, 'upper':0, 'off': false}; //upper is the maximum sized node
	
		this.graph_showCirclesFlag = false; //shows circles in the mind map
		this.maxNodeNameLength = 0;
		this.displacement = {'x':0, 'y':0};
		this.maxChildrenOnSingleNode = 0;	
		this.thehiddenbridge = "RGRAPHTREEBRIDGE"; //a hidden node which bridges all dislocated nodes.

		this.settings.breadcrumb_startcolor = "red"; //rgb(0,0,0)
		/*above defaults below read in */
		this.settings.arrowheads = settings.arrowheads;
		this.settings.breadcrumbs = settings.breadcrumbs;
		this.settings.tagcloud.off = settings.tagcloud.off;
		this.settings.excludeNodeList = settings.excludeNodeList;
		this.settings.ignoreLoneNodes = settings.ignoreLoneNodes;
		this.maxNodeNameLength = settings.maxNodeNameLength;
		this.settings.zoomLevel = settings.zoomLevel;
		var ttmm = this;
		this.wrapperonmousedown = function (event){
			var id = this.id;	
			var targ;
			if (!event)var event = window.event;
			if (event.target) targ = event.target;
			else if (event.srcElement) targ = event.srcElement;
			if (targ.nodeType == 3)  targ = targ.parentNode;
			var tname;
		
			if(targ.getAttribute("class") == "node")return; 	//if a node was clicked on we bail out! :)
			if(targ.getAttribute("class") == "nodeLink")return; 	//if a node was clicked on we bail out! :)
	
			if(ttmm.canvas){
				ttmm.canvas.setPosition();
				var canvasPos = ttmm.canvas.getPosition();
				var myX= 0;var myY =0;
				if (event.pageX || event.pageY) {myX = event.pageX;myY = event.pageY;}
				else if (event.clientX || event.clientY) 	{myX = event.clientX + document.body.scrollLeft+ document.documentElement.scrollLeft;myY = event.clientY + document.body.scrollTop+ document.documentElement.scrollTop;}
				
				var centerY = canvasPos.y+ (ttmm.canvas.getSize().y / 2);;
				var centerX = canvasPos.x + (ttmm.canvas.getSize().x / 2);
				offsetY= centerY -myY;
				offsetX= centerX -myX;
				ttmm.rgraph.offsetCenter(offsetX,offsetY);
				ttmm.rgraph.plot();
			}

			return false;
		};
	},

	
	_init_html_elements: function(wrapperID){
			if(!document.getElementById(wrapperID)){ throw (wrapperID + " html element doesn't exist");}
			this.wrapperID = wrapperID;
			this.canvasID = wrapperID + "_canvas"; //the canvas object ID
			this.labelContainer = wrapperID + "_label_container";
			this.nodeLabelPrefix = this.canvasID +"_";
			/*setup the divs */
			var wrapper = document.getElementById(wrapperID);
			wrapper.onmousedown =  this.wrapperonmousedown;
			
			if(!wrapper.style.height){wrapper.style.height = "200px";}
			if(!wrapper.style.width){wrapper.style.width = "200px";}

			var labelContainer = document.createElement("div");
			labelContainer.id=this.labelContainer;
			labelContainer.style.position= 'relative';		
			var canvas = document.createElement("canvas");
			canvas.id = this.canvasID;
			canvas.width = parseInt(wrapper.style.width);
			canvas.height =parseInt(wrapper.style.height);

			wrapper.appendChild(labelContainer);
			wrapper.appendChild(canvas);
			if(config.browser.isIE && G_vmlCanvasManager) {G_vmlCanvasManager.init_(document);} //ie hack - needs changing to work outside tw		
	},

	zoom: function(inc){
		this.settings.zoomLevel = parseInt(this.settings.zoomLevel);
		this.settings.zoomLevel += inc;
		if(this.settings.zoomLevel <= 0) this.settings.zoomLevel = 1;
		return this.settings.zoomLevel;
	},	

	_findItemInArray: function(item, arr) {
		for(i=0;i< arr.length;i++){
		  if(arr[i] == item) return true;
		}
	
		return false;
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

		if(this.getCurrentNodeID() == id) return;

		var oldId = this.rgraph_currentNode;
		this.rgraph_currentNode = id;

		try{
			this.rgraph.onClick(id);
		}
		catch(e){
			this.rgraph_currentNode = oldId;
		}
	},

	getCurrentNodeID: function(){
		if(this.rgraph_currentNode == this.thehiddenbridge) return "";
		else return this.rgraph_currentNode;
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
		return this._findItemInArray(id,this.settings.excludeNodeList);
	},

	drawEdge: function(id_a,id_b,name_a,name_b,data_a,data_b){

		if(this._nodeInExcludeList(id_a) || this._nodeInExcludeList(id_b)) return;
		plotNeeded=false;

		if(id_a != "" && id_b != ""){

		  plotNeeded = this._make_connection(id_a,id_b);

		  if(name_a){this.setNodeName(id_a,name_a);}
		  if(name_b){this.setNodeName(id_b,name_b);}
		
		
		
		  //if(data_a) {this.setNodeData(id_a,data_a); }
		 //if(data_b) {this.setNodeData(id_b,data_b);}

		  if(data_a) {this.mergeNodeData(id_a,data_a); }
		  if(data_b) {this.mergeNodeData(id_b,data_b);}

		}  
		return plotNeeded;
	},

	_make_connection: function(a,b){
	  	  this._setupMapIfNeeded(a);
		  var node1, node2; 
		  var drawn = false;

		  node1 = this.controller.getNode(a);
		  node2 = this.controller.getNode(b);

		  if(node1 && node2){
			if(node1.adjacentTo(node2)) {return false;}

		  }
		  else if(!node1 && !node2) {//neither in graph yet
			this._make_connection(this.thehiddenbridge,a);  //if neither node is currently in tree, then we need to create a "bridge" to connect the trees
		  
		  }
		
		
		  if(!node1) {node1= new Graph.Node(a,a,{});drawn= true; }//create this node
		  if(!node2) {node2= new Graph.Node(b,b,{});drawn= true; }//create that node

		  if(node1){			
	
			  if(!node1.adjacentTo(node2)){

	
				this.controller.addAdjacence(node1,node2);
				
				node1 = this.controller.getNode(a);
			  	node2 = this.controller.getNode(b);
			
				if(!node1.data.children) node1.data.children = [];
				if(!node2.data.parents) node2.data.parents = [];
				node1.data.children.push(b);
				node2.data.parents.push(a);

				//if(a == this.thehiddenbridge) console.log(b + " is bridged");
				//console.log("added edge from ",a," to ",b, node1.data,"/",node2.data);
				return true;
			 }
		 }
	},
	deleteNode: function(id){
		var node = this.rgraph.controller.getNode(id);
		//console.log("start",node,"end");
		var parents = node.data.parents;
		var children = node.data.children;
		console.log(id,parents,children);
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
		  this.rgraph.compute();
		  this.rgraph.plot(); 
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
			getZoomLevel: function(){return ttmm.settings.zoomLevel;},
			setOffset: function(d){ttmm.displacement = d;},
			getOffset: function(){return ttmm.displacement;},
			getNodeLabelContainer: function(){return ttmm.labelContainer;},
			getNodeLabelPrefix: function(){return ttmm.nodeLabelPrefix;},
		  	onBeforeCompute: function(node) {
									ttmm.createNodeFromJSON(ttmm.dynamicUpdateFunction(node.id));
									if(ttmm.settings.breadcrumbs) ttmm.setNodeData(node.id, "color",ttmm.settings.breadcrumb_startcolor);	
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
			
				if(node.id == this.thehiddenbridge) return;
				var clickfunction = function(e){
					
					ttmm.rgraph.onClick(node.id);					
					return false;
				};
				
				var dblclickfunction =function(e){
					ttmm.callWhenClickOnNode(ttmm.controller.getNode(node.id),ttmm.wrapperID);		
				};
					ttmm.rgraph_currentNode = node.id;	 
					if(domElement.addEvent){ //for ie
						domElement.addEvent('click',clickfunction);
						//domElement.addEvent('dblclick',dblclickfunction);
						}
					else {
						domElement.onclick = clickfunction;
						domElement.ondblclick = dblclickfunction;
						}
			},

			getMaxChildren: function(){
				var max =0,num;
				for(var i in ttmm.rgraph.graph.nodes){
					if(ttmm.rgraph.graph.nodes[i].data.children)
						num = ttmm.rgraph.graph.nodes[i].data.children.length;
					else
						num =0;
					if(num > max) max = num;
				}
				return max;
			},
		  	onPlaceLabel: function(domElement, node) {
				domElement.innerHTML = '';
				
 				if(node.id != ttmm.thehiddenbridge){
						if(node.data.color) domElement.style.color = node.data.color;
						
						if(!ttmm.settings.tagcloud.off){
							var weight=0, u=0;
							if(node.data.weight) { //user has defined some sort of weight
								weight = parseFloat(node.data.weight);
								u =parseFloat(ttmm.settings.tagcloud.upper);
							}
							else{ //just take number of children
								if(node.data.children)
									weight = node.data.children.length;
								u = this.getMaxChildren();
							}
							var s = parseFloat(ttmm.settings.tagcloud.smallest);
							var l =parseFloat(ttmm.settings.tagcloud.largest);
							
							var fontsize = s + ((l - s) * parseFloat(weight / u));
							domElement.style['fontSize'] = fontsize + "em";
							
						}
						
						if(!node.data.label){
						var trimmedName = ttmm._trimNodeName(node.name);
						}
						else
							trimmedName = node.data.label;
							
						if(node.data.title)
							domElement.title = node.data.title;
						else
							domElement.title = node.name;
					
						domElement.innerHTML = trimmedName;
						
						//domElement.appendChild(document.createTextNode(trimmedName));	
						if(node.data.links){
							var links =node.data.links;

							var link;
							for(var j=0; j < links.length; j++){
								var linktext;
								if(links[j][1])
									linktext = links[j][1]; 
								else 
									linktext = "go";
							
								var linkEl = document.createElement("a");
								linkEl.setAttribute("class","nodeLink");
								linkEl.setAttribute("target","_blank");
								
								link =links[j][0];
								if(typeof link == 'function'){

									var id =node.id;
									link = eval(link);
									var f =function(e){
										link(e,id);
									};
																
									linkEl.onmousedown = f;
								}
								else{
									linkEl.setAttribute("href",link);
								}

								linkEl.innerHTML = linktext;
								//linkEl.appendChild(document.createTextNode(" " +linktext+ " "));
																
								domElement.appendChild(linkEl)
							}
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
					var r = 30;
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

		var ctx = document.getElementById(this.canvasID).getContext;
		if(!ctx) {console.log("no context available! Please install ExplorerCanvas");}

		if(this.graphloaded) return;
		this.graphloaded = true;
		this.rgraph_currentNode =lastOpenNode;


	  	var json = {"id":this.thehiddenbridge,"children":[{"id":lastOpenNode,"name":lastOpenNode, "data":{"parents":[this.thehiddenbridge], "children":[]}, "children":[]}], 'data':{"parents":[], "children":[lastOpenNode]}};
		
		json.data = {};
		json.data.nodraw=true;
	    this.canvas= new Canvas(this.canvasID, this.settings.nodeColor, this.settings.lineColor); 
		controller = this._getController();	
		this.rgraph= new RGraph(this.canvas, controller,this.labelContainer);
  


	  	Config['drawConcentricCircles'] = this.graph_showCirclesFlag;
 
	 	this.rgraph.loadTreeFromJSON(json);
	  	this.rgraph.root = lastOpenNode;
		this.controller = controller;
	
	}


};

}}}
