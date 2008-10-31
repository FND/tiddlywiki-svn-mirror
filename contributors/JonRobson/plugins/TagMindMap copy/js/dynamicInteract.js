/***
!Layer 2: DynamicInteract: Extension of RGraph
***/
{{{

//tag mindmap constructor
var Tagmindmap = function(cid,ajaxURL,editNodeURL,clickFunction){

/*Generic  properties */
this.canvasID = cid; //the canvas object you want to load the graph into
this.graph_showCirclesFlag = false; //shows circles in the mind map
Config['levelDistance'] = 80; //in pixel
this.excludeNodeList = [];
this.ignoreLoneNodes = true;

/*individual Node properties and toolbar */
this.useDHTML = true;
this.nodeToolBar = true;
this.maxNodeNameLength = 0;

this.linkimg = "images/linkTo.gif"; //default link image

/*NODE options toolbar */
this.editNodeImageURL = "./images/edit.gif";
this.editNodeURL = editNodeURL;	
this.userCanDeleteNodes = true;	
this.toolbarDeleteImage = "./images/Close_24.gif";
this.toolbarDeleteFunction  = this.name + ".deleteNode";
this.labelContainer = "label_container";

		
/* AJAX CONFIGURATION */
this.ajaxURL=ajaxURL; //the ajax url to call when a user clicks a node
this.ajaxLoadingLabelID =Config.nodeLabelPrefix + Config.nodeLabelPrefix + "ajax";
this.ajaxLoadingContent = "loading.. "; 

						   
if(clickFunction)
  this.callWhenClickOnNode = clickFunction; //function taking one parameter node name
else
  this.callWhenClickOnNode = function(n){return};

/*define the function that will retrieve new nodes here! */
this.getNodeParentsAndChildren = function(nodeid){
                                 
								this.ajaxGetLatestNodes(nodeid);
								};

this.visualisationType = "RGRAPH"; //coming soon
this.defineGraphUtil();
//this.graph_index = {}; //allows you to look up a node id from its name
//this.graphloaded = false; //stores whether the graph has been loaded

this.thehiddenbridge = "RGRAPHTREEBRIDGE"; //a hidden node which bridges all dislocated nodes.
Config.nodeLabelPrefix = cid +"_";//labelIDPrefix; //allows 2 mind maps on same page, by making sure all divs use unique names


};

//tagmindmap class body
Tagmindmap.prototype = {
_toggleAjaxLoadingOn: function(){
var obj = document.getElementById(this.ajaxLoadingLabelID);

if(obj)
obj.style.display='';
},

_toggleAjaxLoadingOff: function(){
	var obj = document.getElementById(this.ajaxLoadingLabelID);
	
	if(obj)
	obj.style.display='none';
},

_createxmlhttp: function(){
   var xmlHttpReq = false;var self = this;

    // Mozilla/Safari
    if (window.XMLHttpRequest) {
        self.xmlHttpReq = new XMLHttpRequest();
       	/* if (self.xmlHttpReq.overrideMimeType) {
    		self.xmlHttpReq.overrideMimeType('text/xml');
    	} */
    }
    // IE
    else if (window.ActiveXObject) {
        self.xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
    }

    
return self.xmlHttpReq;
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

/*given a list of adjacencies removes any adjacencies that exist in graph for the node with nodeid that are not in the list*/
_purgeAllDeletedNodes: function(nodeid,expectedAdjacencies){
expectedAdjacencies.push(this.thehiddenbridge); //don't delete bridge here
	var fromNode = GraphUtil.getNode(this.graph,nodeid);
	for(var i = 0; i < fromNode.adjacencies.length; i++){
		var thisAdjacence = fromNode.adjacencies[i];
		if(thisAdjacence.nodeTo){
			
			if(!this._findItemInArray(thisAdjacence.nodeTo.id,expectedAdjacencies)){ //then adjacency should be removed
			this.deleteAdjacency(nodeid,thisAdjacence.nodeTo.id);
			//alert("deleted " + nodeid + "to " + thisAdjacence.nodeTo.id+" from " + expectedAdjacencies)
			}
		}

	}


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


									
performAjax: function(url,ajaxType, ajaxParams, on200,sync){

if(url.indexOf("?") > -1) url += "&stopCachingRandomNumber=" + Math.random();

if(!sync) sync = true;

	var obj = this;
	if(obj.ajaxfocusResultDIV) 	document.getElementById(obj.ajaxfocusResultDIV).innerHTML = "";	

				try{
				  
					obj._toggleAjaxLoadingOn();
					var xmlhttp = this._createxmlhttp();
					 xmlhttp.open(ajaxType, url ,sync); 
					
					 if(ajaxType == "POST"){
						xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						xmlhttp.setRequestHeader("Content-length", ajaxParams.length);
						xmlhttp.setRequestHeader("Connection", "close");	
					}

					 xmlhttp.onreadystatechange=function() {

							  if (xmlhttp.readyState==4) {			  
						
									on200(xmlhttp.responseText,xmlhttp.status); 
									obj._toggleAjaxLoadingOff();
						 	  }
					};
					 xmlhttp.send(ajaxParams);
					if(!sync) {
					  on200(xmlhttp.responseText,xmlhttp.status);
					  obj._toggleAjaxLoadingOff();
					
					}
					
				}
				catch(e){
					alert(e);
					if(sync) obj._toggleAjaxLoadingOff();
				}
				


},


/*retrieves new nodes from database */
ajaxGetLatestNodes: function (id_no_prefix,sync){

	var obj = this;
	if(obj.ajaxURL){
		url = obj.ajaxURL+id_no_prefix;
	  
		var f = function(response){
			if(response != "{}") {				   
				var json= {};
				try{
					json= eval("("+response+")");
					obj.createNodeFromJSON(json);
					if(obj.ajaxURL !=null)
	     				obj.computeThenPlot();

				}
				catch(e){}
			}
								    			
		  };
	  
		this.performAjax(url,"GET",null,f,sync);
		
	}	

},

/* Allows you to add data to the mind map */
ajaxPost: function (params, url){


var obj = this;
var f =  function(response){
		};
this.performAjax(url,"POST",params,f,false);
obj.getNodeParentsAndChildren(obj.getCurrentNodeID());

},



centerOnNode:function(id){

	if(this.getCurrentNodeID() == id) return;

	/* 
	this.rgraph.unflagRoot();
	
	try{
	this.rgraph.flagRoot(id);
	
	}catch(e){
	}*/
	var oldId = this.rgraph_currentNode;
	this.rgraph_currentNode = id;
	//
	
	
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

setNodeURL: function(nodeid, url){
this.graph.nodes[nodeid].data.url = url;

},


getNodeName: function(nodeid){
	if(this.graph.nodes[nodeid])
		return this.graph.nodes[nodeid].name;
	else
		return "";
},


setNodeName: function(nodeid,newName){
if(this.graph.nodes[nodeid].name != newName){
this.graph.nodes[nodeid].name = newName;

if(this.thehiddenbridge != nodeid && this.graph_index) this.graph_index[newName] = nodeid;
 
//this.computeThenPlot();
}
},

getNodeData: function(id,data){
return this.graph.nodes[id].data;
},

setNodeData: function(id,data){
this.graph.nodes[id].data = data;
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

//if(plotNeeded)
  //this.computeThenPlot();
return plotNeeded;
},

_fix_if_orphan: function(node){
	var obj = this;
	var bridge = this.thehiddenbridge;
	var parents = this.graphUtil.getParents(this.graph,node);
	//var children = GraphUtil.getChildren(this.graph,node);
	//if(parents.length == 0) //it is orphaned
	
	//basically should always have at least one parent even if a bridge..
	obj.drawEdge(bridge,node.id);	
},

_clearAdjacency: function(node, adj){
	//clear from
	
var fromNode = GraphUtil.getNode(this.graph,node);

	if(fromNode){
		var newAdj = new Array();
		//something going wrong here!

		//look at adjacencies for the node
		for(var i = 0; i < fromNode.adjacencies.length; i++){
		var thisAdjacence = fromNode.adjacencies[i];
		//Graph.Adjacence object = thisAdjacence
			if(thisAdjacence.nodeTo){
			  	if(thisAdjacence.nodeTo.id != adj){ //then adjacency is okay.
				  newAdj.push(fromNode.adjacencies[i]);
				}
			}

		  }
		fromNode.adjacencies = newAdj;
		//alert(node.adjacencies.toSource());
		
		//alert(this.graph.nodes[node.id].toSource());

		this._fix_if_orphan(fromNode);
	}	  
	},

deleteAdjacency: function(from,to){

if(from && to){
	this._clearAdjacency(from,to);
	this._clearAdjacency(to,from);
	//this.computeThenPlot(); 
}

},

deleteNode: function(a){
var obj = this;
var bridge = this.thehiddenbridge;
var newCenter = null;

nodeToDelete = a;

this.graphUtil.eachNode(this.graph, function(node){
  
	  obj._clearAdjacency(node, a);
	  newCenter = node.id;
	  obj._fix_if_orphan(node);

});
//delete this.graph.nodes[nodeToDelete];

if(newCenter == null)
	this.rgraph_currentNode = newCenter;
else
	obj.rgraph_currentNode = this.thehiddenbridge;
	
delete this.graph.nodes[nodeToDelete];

document.getElementById(Config.nodeLabelPrefix +nodeToDelete).style.display = 'none'; //disable the item holding this

//this.computeThenPlot();

},

_make_connection: function(a,b){

  this._setupMapIfNeeded(a);

  //in here make sure you check that the edge doesn't already exist.
  var node1, node2; 
  var drawn = false;

  node1 = this.graphUtil.getNode(this.graph,a)  
  node2 = this.graphUtil.getNode(this.graph,b)  
 
  //check if adjacent
  if(node1 != null && node2 !=null){
	if(node1.adjacentTo(node2)) {return false;}

  }
  

  //if neither node is currently in tree, then we need to create a "bridge" to connect the trees
  if(node1 == null && node2 == null) {this._make_connection(this.thehiddenbridge,a);

  }

  if(node1 == null) {node1= new Graph.Node(a,a,[]);drawn= true; }
  if(node2 == null) {node2= new Graph.Node(b,b,[]);drawn= true; }
  
  //node1.drawn =true;
  //node2.drawn = true;
  //create the link
  if(!node1.adjacentTo(node2)){
	this.graph.addAdjacence(node1,node2);
	this._disconnectFromBridgeWhereRequired();
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
	    			  //linky = " <a href='" + node.data.url + "' target='"+tagmindmapobj.linktarget+"'><img src='"+img+"' border='0' alt='(link)'></a>"
		     		}
		     		else
					  linky = "";
					 
					if(tagmindmapobj.userCanDeleteNodes)
						linky += "<a href=\"javascript:" + tagmindmapobj.toolbarDeleteFunction + "('" + node.id+"');\"><img src='" + tagmindmapobj.toolbarDeleteImage + "' alt='delete' border='0'></a>";
					
					if(tagmindmapobj.nodeToolBar){
					  editURL =tagmindmapobj.editNodeURL + node.id ;
					  linky += "&nbsp;<a href=\"#\" onClick=\"openmypage('Edit: "+node.name + "', '" + editURL+"'); return false\"><img src='"+ tagmindmapobj.editNodeImageURL + "' alt='edit this node' border='0'></a>";
					}

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
	//alert("!");
	  lineW = tagmindmapobj.canvas.getContext().lineWidth;  
      nodeid = adj.nodeFrom.id;
	  nodeid2 = adj.nodeTo.id;
	  if(nodeid == tagmindmapobj.thehiddenbridge || nodeid2 == tagmindmapobj.thehiddenbridge){tagmindmapobj.canvas.getContext().lineWidth = "0";}
	  else tagmindmapobj.canvas.getContext().lineWidth = "1";

	},
	
	onAfterPlotLine: function(adj){
	
	}
  	
  };
  
  return controller;

},

//if the map needs to be setup, the first node will be created with id and name given in parameters
_setupMapIfNeeded: function(lastOpenNode){

var isST = false, isHypertree=false, isRGRAPH = false;
if(this.visualisationType =="ST") isST = true;
else if(this.visualisationType =="HYPERTREE") isHypertree = true;
else isRGRAPH = true;		

var ctx = document.getElementById(this.canvasID).getContext;
if(!ctx) {console.log("no context available! Bad IE bad!");}

if(this.graphloaded) return;
this.graphloaded = true;
this.rgraph_currentNode =lastOpenNode;


   var json = {"id":this.thehiddenbridge, "name":this.thehiddenbridge, "children":[{"id":lastOpenNode,"name":lastOpenNode, "data":[], "children":[]}],"data":[]};
		
	//Create canvas instance with canvas id, fill and stroke colors.

          this.canvas= new Canvas(this.canvasID, '#ccddee', '#772277'); 
		  controller = this._getController();
		
         
		 
		  /*
		  if(isST){
		  this.rgraph = new ST(this.canvas,controller)
		  this.graph = eval(json.toSource()); 
		  this.graph_nodes = this.rgraph.graph.nodes;
		  }*/
		this.rgraph= new RGraph(this.canvas, controller);
		this.graph = this.rgraph.graph;	  

		  
	 Config['drawConcentricCircles'] = this.graph_showCirclesFlag;
	 


  
  
  //load graph from tree data.
  this.rgraph.loadTreeFromJSON(json);

  this.rgraph.root = lastOpenNode;
//	this.rgraph.onClick(lastOpenNode);
  //this.centerOnNode(lastOpenNode);
  
  //this.rgraph.controller.onBeforeCompute(this.graphUtil.getNode(this.graph, this.rgraph.root));
  //this.rgraph.controller.onAfterCompute();
  this.createAjaxDiv();


},

createAjaxDiv: function(){
  ajaxtag = document.createElement('div');
  var container = document.getElementById(Config.labelContainer);
  container.appendChild(ajaxtag);
  
  ajaxtag.id = this.ajaxLoadingLabelID;
  ajaxtag.innerHTML = this.ajaxLoadingContent;
  ajaxtag.style.display = "none";

},



colorNode: function(nodeid,color){

  if(this.graph.nodes[nodeid]){
  this.graph.nodes[nodeid].data.color = color; 
  //var elem = document.getElementById(getFriendlyName(divName)); 
  //if(elem)elem.style.color = color; 
  }
},

drawExampleTree: function(){


this.drawEdge('earth','europe',null,null,{'url':'http://www.google.co.uk', 'weight':'24px','color':'blue', 'linkimg':'images/linkTo.gif'});

this.drawEdge('earth','asia');


this.drawEdge('europe','uk',null,null,{'url':'http://www.yahoo.co.uk', 'weight':'24px','color':'red', 'linkimg':'images/linkTo.gif'});
this.drawEdge('europe','france');
this.drawEdge('europe','spain');
this.drawEdge('europe','germany');
this.drawEdge('europe','russia');

this.drawEdge('asia','russia');
this.drawEdge('asia','vietnam');
this.drawEdge('asia','china');
this.drawEdge('asia','india');

this.drawEdge('france','lille');
this.drawEdge('france','paris');

this.centerOnNode('earth');
},

_disconnectFromBridgeWhereRequired: function(){
    //check the bridge doesn't connect to things it shouldn't to any more
	//this.thehiddenbridge;
	var bridge = this.graph.nodes[this.thehiddenbridge];

	for(var i = 0; i < bridge.adjacencies.length; i++){
			var id = bridge.adjacencies[i];
			var node = this.graph.nodes[id];
			if(node){
				var parents = this.graphUtil.getParents(this.graph,node);
				if(parents.length > 1) {//it has more parents then just the bridge
					this.deleteAdjacency(this.thehiddenbridge,node.id);	
				}
			}
	}


},
clear: function(){
var labels = document.getElementById(this.labelContainer);
labels.style.display ="none";
this.canvas.clear();
//this.rgraph.graph.nodes = {};
//this.graphloaded = false;

},

defineGraphUtil: function(){
var obj = this;
this.graphUtil = GraphUtil;

}



};

}}}
