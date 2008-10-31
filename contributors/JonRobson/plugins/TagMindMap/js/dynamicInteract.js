/***
!Layer 2: DynamicInteract: Extension of RGraph
***/
{{{

//tag mindmap constructor
var Tagmindmap = function(divID,clickFunction){

/*Generic  properties */

this.graph_showCirclesFlag = false; //shows circles in the mind map
Config['levelDistance'] = 80; //in pixel
this.excludeNodeList = [];
this.ignoreLoneNodes = true;
this.maxNodeNameLength = 0;
						   
if(clickFunction)
  this.callWhenClickOnNode = clickFunction; //function taking one parameter node name
else
  this.callWhenClickOnNode = function(n){return};

this._init_defaults();
this._init_html_elements(divID);

};

//tagmindmap class body
Tagmindmap.prototype = {


	/*defines a mouse down event on the graph for the visualisation */
	_init_defaults: function(){		
		this.thehiddenbridge = "RGRAPHTREEBRIDGE"; //a hidden node which bridges all dislocated nodes.
		this.graphUtil = GraphUtil;
		
		this.getNodeParentsAndChildren = function(id){return {};}
		tiddlytagmindmapobject = this;
		this.wrapperonmousedown = function (event){		
			
			var targ;
			if (!event)var event = window.event;
			if (event.target) targ = event.target;
			else if (event.srcElement) targ = event.srcElement;
			if (targ.nodeType == 3)  targ = targ.parentNode;
			var tname;
			tname=targ.tagName +"";
		
			//check if a node was clicked on, if so bail out! :)
			if(tname == "SPAN")return;
		
	
			if(tiddlytagmindmapobject){
				tiddlytagmindmapobject.canvas.setPosition();
				var canvasPos = tiddlytagmindmapobject.canvas.getPosition();
				var myX= 0;
				var myY =0;
	
				if (event.pageX || event.pageY) 	{
					myX = event.pageX;
					myY = event.pageY;
				}
				else if (event.clientX || event.clientY) 	{
					myX = event.clientX + document.body.scrollLeft
						+ document.documentElement.scrollLeft;
					myY = event.clientY + document.body.scrollTop
						+ document.documentElement.scrollTop;
				}
				console.log("clicked at " +myX + " " + myY);
				var canvasSize = tiddlytagmindmapobject.canvas.getSize();
				console.log(canvasPos.x + " " + canvasPos.y)
				var centerY = canvasPos.y+ (canvasSize.y / 2);;
				var centerX = canvasPos.x + (canvasSize.x / 2);
				console.log("center is at " + centerX + " " + centerY);
				offsetY= centerY -myY;
				offsetX= centerX -myX;
				console.log("offset " + offsetX + " " + offsetY);

				tiddlytagmindmapobject.rgraph.offsetCenter(offsetX,offsetY);
		
				tiddlytagmindmapobject.rgraph.plot();
			}

			return false;
		};
	},
	
	_init_html_elements: function(wrapperID){
			if(!document.getElementById(wrapperID)){ throw (wrapperID + " html element doesn't exist");}

			this.wrapperID = wrapperID;
			this.canvasID = wrapperID + "_canvas"; //the canvas object ID
			this.labelContainer = wrapperID + "_label_container";
			
			Config.nodeLabelPrefix = this.canvasID +"_";//labelIDPrefix; //allows 2 mind maps on same page, by making sure all divs use unique names			
			
			/*setup the divs */
			var wrapper = document.getElementById(wrapperID);

			wrapper.onmousedown =  this.wrapperonmousedown;
			
			if(!wrapper.style.height){wrapper.style.height = "200px";}
			if(!wrapper.style.width){wrapper.style.width = "200px";}
			//console.log(parseInt(wrapper.style.width) + "w<<");
			
			//console.log(parseInt(wrapper.style.height) + "h<<");
			Config.labelContainer = this.labelContainer;
			var labelContainer = document.createElement("div");
			labelContainer.id=this.labelContainer;
			
			var canvas = document.createElement("canvas");
			canvas.id = this.canvasID;
			canvas.width = parseInt(wrapper.style.width);
			canvas.height =parseInt(wrapper.style.height);

			wrapper.appendChild(labelContainer);
			wrapper.appendChild(canvas);
			if(config.browser.isIE && G_vmlCanvasManager) {G_vmlCanvasManager.init_(document);}
			
},



zoom: function(inc){
	Config['levelDistance'] = parseInt(Config['levelDistance']);
 	Config['levelDistance']+= inc;
	if(Config['levelDistance'] <= 0) Config['levelDistance']= 1;
	return Config['levelDistance'];
	
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
  var allNodeAdjacencies = new Array();
  
  var node1= json['node'];
						 if(json['parents']){ 
							  for(var i=0; i < json['parents'].length; i++){
							    var parent = json['parents'][i];
								//alert("draw " + parent['id'] + " to " + node1['id']);
								temp = this.drawEdge(parent['id'],node1['id'],parent['name'],node1['name'],parent['data'],node1['data']);
								res = temp | res;
								allNodeAdjacencies.push(parent['id']);
							  }
						  }

						if(json['children']){
							for(var i=0; i < json['children'].length; i++){
						    	var child = json['children'][i];
								temp = this.drawEdge(node1['id'],child['id'],node1['name'],child['name'],node1['data'],child['data']);
								allNodeAdjacencies.push(child['id']);
								res = temp | res;
						  	}
						}


	//is it an orphan with no kids?
	/* 
	this._fix_if_orphan(node1);
	*/
	if(json['children'] && json['parents']){
	 if(!this.ignoreLoneNodes && json['children'].length ==0 && json['parents'].length == 0)
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
if(this.graph.nodes[nodeid].name != newName){
this.graph.nodes[nodeid].name = newName;

if(this.thehiddenbridge != nodeid && this.graph_index) this.graph_index[newName] = nodeid;
 
//this.computeThenPlot();
}
},

setNodeData: function(id,data,newvalue){
	
	if(!newvalue){
		this.graph.nodes[id].data = data;
	}
	else{
		this.graph.nodes[id].data[data] = newvalue;	
	}

},

_nodeInExcludeList: function(id){
	return this._findItemInArray(id,this.excludeNodeList);
},

drawEdge: function(id_a,id_b,name_a,name_b,data_a,data_b){

if(this._nodeInExcludeList(id_a) || this._nodeInExcludeList(id_b)) return;
plotNeeded=false;

if(id_a != "" && id_b != ""){

  plotNeeded = this._make_connection(id_a,id_b,name_a);

  if(name_a){this.setNodeName(id_a,name_a);}
  if(name_b){this.setNodeName(id_b,name_b);}

	
  if(data_a) {this.setNodeData(id_a,data_a); }
  if(data_b) {this.setNodeData(id_b,data_b);}

}  
return plotNeeded;
},



_make_connection: function(a,b){

  this._setupMapIfNeeded(a);
  var node1, node2; 
  var drawn = false;

  node1 = this.graphUtil.getNode(this.graph,a)  
  node2 = this.graphUtil.getNode(this.graph,b)  
 
  //check if adjacent before re-drawing
  if(node1 != null && node2 !=null){
	if(node1.adjacentTo(node2)) {return false;}

  }
 
  //if neither node is currently in tree, then we need to create a "bridge" to connect the trees
  if(node1 == null && node2 == null) {
	console.log(a + "connected to hidden bridge");
	this._make_connection(this.thehiddenbridge,a);
	
  }

  if(node1 == null) {node1= new Graph.Node(a,a,[]);drawn= true; }
  if(node2 == null) {node2= new Graph.Node(b,b,[]);drawn= true; }
  
  if(!node1.adjacentTo(node2)){
	this.graph.addAdjacence(node1,node2);
	return true;
 }

  


},
computeThenPlot: function(){
var ajaxload = document.getElementById(this.ajaxLoadingLabelID);
var labels = document.getElementById(this.labelContainer);
labels.style.display = "block";
var loadNotInProgress = true;

/*
if(ajaxload){
	if(ajaxload.style.display != "none") loadNotInProgress = false;
}
*/

if(loadNotInProgress){
  this.rgraph.compute();;
  this.rgraph.plot(); //problem in plot...
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

  var tagmindmapobj = this;
    var effectHash = {};
  var controller =  {
  	onBeforeCompute: function(node) {
		
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
  	
	
  //Add a controller to assign the node's name to the created label.	
  	onCreateLabel: function(domElement, node) {
		if(node.id != this.thehiddenbridge)
			tagmindmapobj.rgraph_currentNode = node.id;	
			
		var clickfunction = function(e){
						tagmindmapobj.rgraph.onClick(node.id);
				  	  	if(node.id != this.thehiddenbridge){
						  tagmindmapobj.rgraph_currentNode = node.id;	 
						}  
				
		  };

	//define on click event
	
	    if(domElement.addEvent){
		//dblclick
			domElement.addEvent('click',clickfunction);
		}
		else {
		  domElement.onclick = clickfunction;

		}

  	},
  	
  	//Take off previous width and height styles and
  	//add half of the *actual* label width to the left position
  	// That will center your label (do the math man). 
  	onPlaceLabel: function(domElement, node) {
	
		domElement.innerHTML = '';
 
			if(node.id != tagmindmapobj.thehiddenbridge){
			
				if(node.data){
				var img;
					if(node.data.linkimg) img = node.data.linkimg;
					else img = tagmindmapobj.linkimg;

						
					if(node.data.url){
						var tooltip =node.data.url;
						if(node.data.tooltip)
							tooltip = node.data.tooltip;
					  if(tagmindmapobj.useDHTML)
					    linky = "<a href=\"#\" onClick=\"openmypage('"+node.name + "', '" + node.data.url + "'); return false\"><img src='"+img+"' border='0' alt='(link)'></a>";
					  else
					    linky = "<a href=\"" + node.data.url + "\"><img src='"+img+"' border='0' title='" + tooltip+ "'></a>";
	    			     		}
		     		else
					  linky = "";
					 

				}
				if(node.data.color) domElement.style.color = node.data.color;
				if(node.data.weight) domElement.style.fontSize = node.data.weight;
					  
				var trimmedName = tagmindmapobj._trimNodeName(node.name);

				domElement.innerHTML = "<span title='" + node.name +"'>" + trimmedName + "</span>" + linky;
				
				
				
			}
			else domElement.style.display = "none";

			
			var left = parseInt(domElement.style.left);
			domElement.style.width = '';
			domElement.style.height = '';
			var w = domElement.offsetWidth;
			domElement.style.left = (left - w /2) + 'px';


	},
	
	onAfterCompute: function() {
 
						  if(tagmindmapobj.rgraph_currentNode != tagmindmapobj.thehiddenbridge){
						    tagmindmapobj.callWhenClickOnNode(tagmindmapobj.rgraph.graph.nodes[tagmindmapobj.rgraph_currentNode]);
						  }
		if(tagmindmapobj.ajaxfocusResultDIV){
		document.getElementById(tagmindmapobj.ajaxfocusResultDIV).innerHTML = "Please wait while node details are loaded...";
		}
		tagmindmapobj.getNodeParentsAndChildren(tagmindmapobj.getCurrentNodeID());


	},
	
	onBeforePlotLine: function(adj){
	  lineW = tagmindmapobj.canvas.getContext().lineWidth;  
      nodeid = adj.nodeFrom.id;
	  nodeid2 = adj.nodeTo.id;
	  if(nodeid == tagmindmapobj.thehiddenbridge || nodeid2 == tagmindmapobj.thehiddenbridge){
		tagmindmapobj.canvas.getContext().lineWidth = "0";
		}
	  else tagmindmapobj.canvas.getContext().lineWidth = "1";

	},
	
	onAfterPlotLine: function(adj){
	
	}
  	
  };
  
  return controller;

},

//if the map needs to be setup, the first node will be created with id and name given in parameters
_setupMapIfNeeded: function(lastOpenNode){

var ctx = document.getElementById(this.canvasID).getContext;
if(!ctx) {console.log("no context available! Please install ExplorerCanvas");}

if(this.graphloaded) return;
this.graphloaded = true;
this.rgraph_currentNode =lastOpenNode;


   var json = {"id":this.thehiddenbridge, "name":this.thehiddenbridge, "children":[{"id":lastOpenNode,"name":lastOpenNode, "data":[], "children":[]}],"data":[]};
     this.canvas= new Canvas(this.canvasID, '#ccddee', '#772277'); 
		  controller = this._getController();
		
         
		this.rgraph= new RGraph(this.canvas, controller);
		this.graph = this.rgraph.graph;	  

		  
  Config['drawConcentricCircles'] = this.graph_showCirclesFlag;
	 
  this.rgraph.loadTreeFromJSON(json);
  this.rgraph.root = lastOpenNode;
}




};

}}}
