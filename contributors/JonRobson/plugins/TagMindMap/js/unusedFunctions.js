	
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

									setNodeURL: function(nodeid, url){
									this.graph.nodes[nodeid].data.url = url;

									},


									getNodeName: function(nodeid){
										if(this.graph.nodes[nodeid])
											return this.graph.nodes[nodeid].name;
										else
											return "";
									},

									getNodeData: function(id,data){
									return this.graph.nodes[id].data;
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
									
									
									_fix_if_orphan: function(node){
										var obj = this;
										var bridge = this.thehiddenbridge;
										var parents = this.graphUtil.getParents(this.graph,node);
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
									
									
									createAjaxDiv: function(){
									  ajaxtag = document.createElement('div');
									  var container = document.getElementById(Config.labelContainer);
									  container.appendChild(ajaxtag);

									  ajaxtag.id = this.ajaxLoadingLabelID;
									  ajaxtag.innerHTML = this.ajaxLoadingContent;
									  ajaxtag.style.display = "none";

									},
									
									clear: function(){
									var labels = document.getElementById(this.labelContainer);
									labels.style.display ="none";
									this.canvas.clear();

									},
									_init_ajax: function(){
										/* AJAX CONFIGURATION */
										this.ajaxURL=null; //the ajax url to call when a user clicks a node
										this.ajaxLoadingLabelID =Config.nodeLabelPrefix + Config.nodeLabelPrefix + "ajax";
										this.ajaxLoadingContent = "loading.. ";
										this.getNodeParentsAndChildren = function(nodeid){

																		this.ajaxGetLatestNodes(nodeid);
																		};
									},
									