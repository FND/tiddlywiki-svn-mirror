/***
!Layer 1: TiddlyWiki Specific

?? on dbl click re-center (offset 0s)
?? tagcloud concept
***/

{{{

var oldRefreshElements = refreshElements;

function refreshElements(root,changeList)
{
	//do something here to stop refreshing of tagmindmap
	var nodes = root.childNodes;

//if(root.id == 'contentWrapper') return;
console.log(root,nodes);
	
	oldRefreshElements(root,changeList);
};


	
//load defaults
if(!config.options.txtTTMM_canvasWidth)config.options.txtTTMM_canvasWidth = 800;
if(!config.options.txtTTMM_canvasHeight)config.options.txtTTMM_canvasHeight = 200;
//if(!config.options.txtTTMM_inflation)
config.options.txtTTMM_inflation = 80;

//if(config.options.txtTTMM_inflation <=0) config.options.txtTTMM_inflation = 10;
if(!config.options.txtTTMM_maxNodeNameLength)config.options.txtTTMM_maxNodeNameLength = 25;
if(config.options.chkTTMM_ignoreLoneNodes == null) config.options.chkTTMM_ignoreLoneNodes = false;
if(config.options.chkTTMM_leaveRedBreadCrumbTrail == null) config.options.chkTTMM_leaveRedBreadCrumbTrail = true;
if(!config.options.txtTTMM_excludeNodeList) config.options.txtTTMM_excludeNodeList= 'excludeLists';

var ttmm_loadOnStart = false; //load all nodes on start

//set descriptions
merge(config.optionsDesc,{
txtTTMM_canvasWidth: "TiddlyTagMindMapPlugin : Width of  visualisation. You will need to refresh the page to see the change."
,txtTTMM_canvasHeight: "TiddlyTagMindMapPlugin : Height of visualisation. You will need to refresh the page to see the change."
,txtTTMM_inflation: "TiddlyTagMindMapPlugin : The visualisation can be inflated and deflated to allow you to see the structure from above or close up. This value allows you to set a start inflation."
,txtTTMM_maxNodeNameLength:"TiddlyTagMindMapPlugin : maximum length of a tiddler name. Any tiddlers with names longer than this will be abbrieviated using '...'. Set to zero to make labels disappear altogether and rely completely on tooltips."
,chkTTMM_ignoreLoneNodes: "TiddlyTagMindMapPlugin : any lone tiddlers/nodes (ie. tiddlers that are not tagged with any data) will be ignored in the visualisation. This cleans up the visualisation greatly."
,txtTTMM_excludeNodeList: "TiddlyTagMindMapPlugin :Anything tagged with this will be ignored in the visualisation. Eventually this will allow multiple tags but I am currently being lazy. Sorry.."
,chkTTMM_leaveRedBreadCrumbTrail: "TiddlyTagMindMapPlugin : When you visit a node it will be coloured red leaving a breadcrumb trail of where you have been."
}
);

/*MACROS*/

/* Zooming TagMindMap (zoom in) */

config.macros.tiddlytagmindmap = {};
config.macros.TagMindMapEdge = {};

config.macros.ToggleTagMindMap = {};
config.macros.LoadMindMap = {};
config.macros.ZoomMindMapIn = {};
config.macros.ZoomMindMapOut = {};
config.macros.RecenterMindMap = {};

merge(config.macros.ZoomMindMapIn,{label: "zoom+",	prompt: "Expand the tag mind map"});
merge(config.macros.ZoomMindMapOut,{label: "zoom-",prompt: "shrink the tag mind map"});
merge(config.macros.LoadMindMap,{label: "loadall",prompt: "load all tiddlers into tag mind map"});
merge(config.macros.ToggleTagMindMap,{label: "toggle",prompt: "Toggle on or off the tag mind map"});
merge(config.macros.RecenterMindMap,{label: "re-center",	prompt: "Center the mind map"});

config.macros.RecenterMindMap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {

	var btn= createTiddlyButton(place,this.label,this.prompt,this.onClick);	
	if(params[0])btn.wrapperID = params[0];
};

config.macros.RecenterMindMap.onClick = function(e)
{
var ttmm = getAssociatedTiddlyTagMindMapObject(this);
	if(ttmm){
		ttmm.rgraph.controller.setOffset({'x':0, 'y':0});
		ttmm.computeThenPlot();
	}
}

config.macros.ZoomMindMapIn.handler = function (place,macroName,params,wikifier,paramString,tiddler) {

var btn= createTiddlyButton(place,this.label,this.prompt,this.onClick);	
if(params[0])btn.wrapperID = params[0];
};

config.macros.ZoomMindMapIn.onClick = function(e)
{
var ttmm = getAssociatedTiddlyTagMindMapObject(this);
	if(ttmm){
		var z =ttmm.zoom(10);
		ttmm.computeThenPlot();
	}
}
/* Zooming TagMindMap (zoom out) */
	
config.macros.ZoomMindMapOut.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
if(params[0])btn.wrapperID = params[0];	
};

config.macros.ZoomMindMapOut.onClick = function(e)
{
	var ttmm = getAssociatedTiddlyTagMindMapObject(this);
		if(ttmm){
			var z =ttmm.zoom(-10);
			ttmm.computeThenPlot();
		}
}

config.macros.TagMindMapEdge.handler = function (place,macroName,params,wikifier,paramString,tiddler) {

var from = params[0]; var to = params[1];
var ttmm = tiddlytagmindmapobjects[ttmm_lastID];
if(ttmm){
	ttmm.drawEdge(from,to);
	ttmm.computeThenPlot();
	}

};

	
config.macros.LoadMindMap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
	var btn =createTiddlyButton(place,this.label,this.prompt,this.onClick);	
	if(params[0])btn.wrapperID = params[0];
};

config.macros.LoadMindMap.onClick = function(e)
{
	var ttmm = getAssociatedTiddlyTagMindMapObject(this); 
	var list = store.getTiddlers();
	for (var t=0; t<list.length; t++) { 
		ttmm.createNodeFromJSON(createJSON(list[t].title));	
	}
	ttmm.computeThenPlot();

}

config.macros.ToggleTagMindMap.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{

	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	if(params[0])btn.wrapperID = params[0];
};

config.macros.ToggleTagMindMap.onClick = function(e)
{ 
	
	var id = getAssociatedTiddlyTagMindMapObject(this).wrapperID;

	if(document.getElementById(id).style.display== "none"){
		document.getElementById(id).style.display=  "";
	}
	else{
		document.getElementById(id).style.display=  "none";
	}
};

var tiddlytagmindmapobjects = {};
//var ttmm_current = null
var ttmm_lastID = null;
var ttmm_primaryID = null;
/* Init TagMindMap macro */

config.macros.tiddlytagmindmap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
	var settings = {};
	startupFunction = function(){};
	if(params){
		var prms = paramString.parseParams(null, null, true);
		settings.ignoreLoneNodes = getParam(prms, "ignoreLoneNodes");
		if(settings.ignoreLoneNodes == 'false') settings.ignoreLoneNodes = false; else settings.ignoreLoneNodes = true;
		settings.width = getParam(prms, "width");
		settings.height = getParam(prms, "height");
		settings.toolbar= getParam(prms, "toolbarSettings");
	
		var startState = getParam(prms, "startState");
	
		var startupFunction;
		if(startState == 'all')
			startupFunction = config.macros.LoadMindMap.onClick;
		else if(startState == 'defaultTiddlers')
			startupFunction = function(){//default tiddlers
			loadTiddlersIntoTTMM(store.filterTiddlers(store.getTiddlerText("DefaultTiddlers")));}; 
	}
	/*set some defaults based on tweaked preferences if none passed as parameters*/
	if(!settings.ignoreLoneNodes) settings.ignoreLoneNodes = config.options.chkTTMM_ignoreLoneNodes;
	if(!settings.width) settings.width = config.options.txtTTMM_canvasWidth;
	if(!settings.height) settings.height =config.options.txtTTMM_canvasHeight;
	if(!settings.toolbar)  settings.toolbar = "01111";

	var id = setup_ttmm_html(place,settings);

		try{
	/*creating the object */
   	 	var clickF = function(node){story.displayTiddler(null, node.id,null,null,null,null,null,id);};

		tiddlytagmindmapobjects[id]= new Tagmindmap(id,clickF);
							
		var excludeLists = config.options.txtTTMM_excludeNodeList;
		tiddlytagmindmapobjects[id].excludeNodeList = getParents(excludeLists);
		//Config['levelDistance'] = config.options.txtTTMM_inflation;
		tiddlytagmindmapobjects[id].ignoreLoneNodes = settings.ignoreLoneNodes;
		tiddlytagmindmapobjects[id].maxNodeNameLength = config.options.txtTTMM_maxNodeNameLength;
		
		ttmm_lastID = id;
		ttmm_current = tiddlytagmindmapobjects[id];
		startupFunction();
		
		console.log("created new instance with id",id);
	}
	catch(e){console.log("exception thrown during startup:"+e);}

};

}}}

{{{
function setup_ttmm_html(place,settings){
	if(!place) { //give a default place
		place = document.getElementById('tagmindmap');
		if(!place) return; //unable to create
		if(place.style.width) settings.width = place.style.width;
		if(place.style.height) settings.height = place.style.height;
	}

	/*setup tag mind map */
	var newTTMM = document.createElement("div");
	newTTMM.id = "ttmm_" +Math.random();
	newTTMM.style.width = settings.width +"px";
	newTTMM.style.height= settings.height +"px";
	newTTMM.style.border = "solid";
	newTTMM.style.border_width = "1px";

	/*setup toolbar */
	var toolbar = document.createElement("div");
	toolbar.id = newTTMM.id + "_toolbar";
	var html="", divider = " ";

	if(settings.toolbar[0] == 1){
		//shift menu to right
		toolbar.style.height = "1px";
		toolbar.style.position = "relative";
		var temp =  parseInt(settings.width) +10;
		toolbar.style.top = "0px";
		toolbar.style.left = temp+"px";
		divider = "\n";
	}
	if(settings.toolbar[1] == 1) html += "<<ToggleTagMindMap " + newTTMM.id+">>" + divider;
	if(settings.toolbar[2] == 1) html += "<<LoadMindMap " + newTTMM.id+">>"+ divider;
	if(settings.toolbar[3] == 1) {
		html += "<<ZoomMindMapIn  " + newTTMM.id+">>"+ divider;
		html += "<<ZoomMindMapOut " + newTTMM.id+">>"+ divider;
	}
	html += "<<RecenterMindMap " + newTTMM.id+">>";
	place.appendChild(toolbar);
	wikify(html,toolbar);
	place.appendChild(newTTMM);

	if(!ttmm_primaryID)ttmm_primaryID = newTTMM.id;
	
	if(!newTTMM.style.width) newTTMM.style.width = settings.width;
	if(!newTTMM.style.height) newTTMM.style.height = settings.height;
	
	return newTTMM.id;
}
function getAssociatedTiddlyTagMindMapObject(that){
		if(that.wrapperID) return tiddlytagmindmapobjects[that.wrapperID];
		else return tiddlytagmindmapobjects[ttmm_lastID];
}	
/*Colouring Functions */
function doColouring(currentNode,ttmm){

if(config.options.chkTTMM_leaveRedBreadCrumbTrail) colorNode(ttmm,currentNode, "red");

/*below coming soon */
//colorNode("TiddlyTagMindMap for Everyone","green");
//colorChildrenOf("TiddlyTagMindMap for Developers","blue");
//colorParentsOf("TiddlyTagMindMap for Developers","white");
}


function getParents(a){ 
  if(store.getTaggedTiddlers(a)){
    var tags = store.getTaggedTiddlers(a);
    if(tags.length == 0) return [];

    var a = new Array();
    for (var t=0; t<tags.length; t++) { 
	a.push(tags[t].title);
    }
    return a;
}
  else
    return []; 
} 

function getChildren(a){
  if(store.getTiddler(a)){
    return store.getTiddler(a).tags;
  }
  else
    return [];
}

function colorNode(ttmm,nodename,color){
	if(ttmm){
		ttmm.setNodeData(nodename, "color",color);
	  //var divName = ttmm_current.canvasID+ "_"+nodename; 
	  //var elem = document.getElementById(divName); 
	  //if(elem)elem.style.color = color; 
	}
}

function colorParentsOf(node,color){ 
  var tags = getParents(node); 
  for (var t=0; t<tags.length; t++) { 
    colorNode(tags[t].title,color);
  } 
} 

function colorChildrenOf(node,color){ 
  var tags = getChildren(node); 
  for (var t=0; t<tags.length; t++) { 
    colorNode(tags[t],color);
  } 
} 

var createJSONTagMindMapNode = function(id){ 
	return "{\"id\":\"" + id+ "\", \"name\": \"" + id+ "\", \"data\":{}}";
	};
var createJSONTagMindMapNodes  = function(mylist) { 
									var res=""; 
                                    for (var t=0; t<mylist.length; t++){
										if(t != 0) res+= ",";
										res += createJSONTagMindMapNode(mylist[t]);

									} 
									return res;
								};
	
var createJSON = function(nodeid){
	if(!nodeid) return "{}";
    var children = getChildren(nodeid);
    var parents = getParents(nodeid);
    var json = "{ 'node': " + createJSONTagMindMapNode(nodeid) + ", ";
	json += "'children':[" + createJSONTagMindMapNodes(children)+ "],";
 	json += "'parents' :[ "+ createJSONTagMindMapNodes(parents)+ "]";
	json += "}";

	var myjson = eval("("+json+")");
	return myjson;
}


Story.prototype.beforettmm_displayTiddler = Story.prototype.displayTiddler;

/*rturns the object where clicking links should update*/

function loadTiddlersIntoTTMM(tiddlerList,visualisationID){
	
	var viz;
	if(!visualisationID) 
		viz = tiddlytagmindmapobjects[ttmm_primaryID];
	else
		viz = tiddlytagmindmapobjects[visualisationID];
	var nodesLoaded = false;
	var title = "";
	for(var i =0; i < tiddlerList.length; i++){
		if(tiddlerList[i].title) title = tiddlerList[i].title;
		else title = tiddlerList[i];
		nodesLoaded = viz.createNodeFromJSON(createJSON(title)) | nodesLoaded;
	}
	
	if(nodesLoaded && viz.rgraph){
		doColouring(title,viz);

		viz.centerOnNode(title);
		viz.computeThenPlot();
	}
}
Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,visualisationID)
{

if(!ttmm_lastID) config.macros.tiddlytagmindmap.handler();



	var title = (tiddler instanceof Tiddler)? tiddler.title : tiddler;


if(tiddlytagmindmapobjects){
	try{
	var res = loadTiddlersIntoTTMM([title],visualisationID);
	}
	catch(e){
		console.log("exception in display tiddler: " + e);
	}
	
}


story.beforettmm_displayTiddler(srcElement,tiddler,template,animate,unused,customFields,toggle);

};

}}}
