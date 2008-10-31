/***
!Layer 1: TiddlyWiki Specific
***/

{{{
function refreshDisplay(hint){}; //it's nasty!	
	
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

merge(config.macros.ZoomMindMapIn,{label: "zoom+",	prompt: "Expand the tag mind map"});
	
config.macros.ZoomMindMapIn.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
createTiddlyButton(place,this.label,this.prompt,this.onClick);	
};

config.macros.ZoomMindMapIn.onClick = function(e)
{
config.options.txtTTMM_inflation = ttmm_current.zoom(10);
if(ttmm_current)ttmm_current.computeThenPlot();
}

/* Zooming TagMindMap (zoom out) */

merge(config.macros.ZoomMindMapOut,{label: "zoom-",prompt: "shrink the tag mind map"});
	
config.macros.ZoomMindMapOut.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
createTiddlyButton(place,this.label,this.prompt,this.onClick);	
};

config.macros.ZoomMindMapOut.onClick = function(e)
{
config.options.txtTTMM_inflation =ttmm_current.zoom(-10);
//saveOptionCookie("txtTTMM_inflation");
if(ttmm_current)ttmm_current.computeThenPlot();
}

/*Load All Tiddlers into TagMindMap Macro */

config.macros.TagMindMapEdge.handler = function (place,macroName,params,wikifier,paramString,tiddler) {

var from = params[0]; var to = params[1];
if(ttmm_current){
	ttmm_current.drawEdge(from,to);
	ttmm_current.computeThenPlot();
	}

};



merge(config.macros.LoadMindMap,{label: "loadall",prompt: "load all tiddlers into tag mind map"});
	
config.macros.LoadMindMap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
createTiddlyButton(place,this.label,this.prompt,this.onClick);	
};

config.macros.LoadMindMap.onClick = function(e)
{
	var list = store.getTiddlers();
	for (var t=0; t<list.length; t++) { 
		ttmm_current.createNodeFromJSON(createJSON(list[t].title));	
	}
	ttmm_current.computeThenPlot();

}
/*Toggler Macro */
merge(config.macros.ToggleTagMindMap,{label: "toggle",prompt: "Toggle on or off the tag mind map"});

config.macros.ToggleTagMindMap.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
};

config.macros.ToggleTagMindMap.onClick = function(e)
{
	if(document.getElementById(ttmm_current.wrapperID).style.display== "none"){
		document.getElementById(ttmm_current.wrapperID).style.display=  "";
	}
	else{
		document.getElementById(ttmm_current.wrapperID).style.display=  "none";
	}
};

var tiddlytagmindmapobjects = {};
var ttmm_current = null;
var ttmm_loadedStatus = true;
/* Init TagMindMap macro */

config.macros.tiddlytagmindmap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
console.log("entered macro");

var settings = {};

if(params){
	var prms = paramString.parseParams(null, null, true);
	settings.ignoreLoneNodes = getParam(prms, "ignoreLoneNodes");
	console.log(settings.ignoreLoneNodes + "<<");
	if(settings.ignoreLoneNodes == 'false') settings.ignoreLoneNodes = false; else settings.ignoreLoneNodes = true;
	settings.width = getParam(prms, "width");
	settings.height = getParam(prms, "height");
	var toolbar = getParam(prms, "toolbarSettings");
	if(!toolbar) toolbar = "1111";

	if(toolbar[0] == '1')settings.verticalToolbar = false;
	if(toolbar[1] == '1')settings.loadButton = true;
	if(toolbar[2] == '1')settings.toggleButton = true;
	if(toolbar[3] == '1')settings.zoomButtons = true;	
	
	var startState = getParam(prms, "startState");
	
	var startupFunction;
	if(startState == 'all')
		startupFunction = config.macros.LoadMindMap.onClick;
	else if(startState == 'defaultTiddlers')
		startupFunction = function(){//default tiddlers
		loadTiddlersIntoTTMM(store.filterTiddlers(store.getTiddlerText("DefaultTiddlers")));}; 
	else
		startupFunction = function(){};
		
}

/*set based on tweaked preferences if none passed as parameters*/
if(!settings.ignoreLoneNodes) settings.ignoreLoneNodes = config.options.chkTTMM_ignoreLoneNodes;
if(!settings.width) settings.width = config.options.txtTTMM_canvasWidth;
if(!settings.height) settings.height =config.options.txtTTMM_canvasHeight;

/*check no other instances are alive still*/

/*
if(ttmm_current){
	var ttmm = document.getElementById(ttmm_current.wrapperID);
	if(ttmm) {
		throw "Currently we can only support one tiddly tag mind map at a time. We're working hard to allow you more!";
	}
}
*/
	var wrapper;

	if(!place) {

		place = document.getElementById('tagmindmap');
			
		if(!place) return;
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

	if(settings.verticalToolbar){
		//shift menu to right
		toolbar.style.height = "1px";
		toolbar.style.position = "relative";
		var temp =  parseInt(ttmm_width) +10;
		toolbar.style.top = "0px";
		toolbar.style.left = temp+"px";
		divider = "\n";
	}
	if(settings.toggleButton) html += "<<ToggleTagMindMap>>" + divider;
	if(settings.loadButton) html += "<<LoadMindMap>>"+ divider;
	if(settings.zoomButtons) {
		html += "<<ZoomMindMapIn>>"+ divider;
		html += "<<ZoomMindMapOut>>";
	}

	place.appendChild(toolbar);
	wikify(html,toolbar);

	place.appendChild(newTTMM);
	wrapper = newTTMM;
	
	if(!wrapper.style.width) wrapper.style.width = settings.width;
	if(!wrapper.style.height) wrapper.style.height = settings.height;
		try{
		/*creating the object */
			
	   	 	var clickF = function(node){story.displayTiddler(null, node.id);};

			tiddlytagmindmapobjects[wrapper.id]= new Tagmindmap(wrapper.id,clickF);
								
			var excludeLists = config.options.txtTTMM_excludeNodeList;
			tiddlytagmindmapobjects[wrapper.id].excludeNodeList = getParents(excludeLists);
			Config['levelDistance'] = config.options.txtTTMM_inflation;
			tiddlytagmindmapobjects[wrapper.id].ignoreLoneNodes = settings.ignoreLoneNodes;
			tiddlytagmindmapobjects[wrapper.id].maxNodeNameLength = config.options.txtTTMM_maxNodeNameLength;
			
			
			ttmm_current = tiddlytagmindmapobjects[wrapper.id];
			startupFunction();
			
			console.log("created new instance")
			console.log(tiddlytagmindmapobjects[wrapper.id]);
		}
		catch(e){console.log("exception thrown during startup:"+e);}

};

}}}

{{{
	
/*Colouring Functions */
function doColouring(currentNode){

if(config.options.chkTTMM_leaveRedBreadCrumbTrail)colorNode(currentNode, "red");

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

function colorNode(nodename,color){
	if(ttmm_current){
		ttmm_current.setNodeData(nodename, "color",color);
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

function loadTiddlersIntoTTMM(tiddlerList){
	var nodesLoaded = false;
	var title = "";
	for(var i =0; i < tiddlerList.length; i++){
		if(tiddlerList[i].title) title = tiddlerList[i].title;
		else title = tiddlerList[i];
		
		nodesLoaded = ttmm_current.createNodeFromJSON(createJSON(title)) | nodesLoaded;
	}
	
	if(nodesLoaded && ttmm_current.rgraph){
		doColouring(title);
		ttmm_current.centerOnNode(title);
		ttmm_current.computeThenPlot();
	}
}
Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle)
{
if(!ttmm_current) config.macros.tiddlytagmindmap.handler();



	var title = (tiddler instanceof Tiddler)? tiddler.title : tiddler;

if(ttmm_current){
	try{
	
	var res = loadTiddlersIntoTTMM([title]);
	}
	catch(e){
		console.log("exception: " + e);
	}
	
}


story.beforettmm_displayTiddler(srcElement,tiddler,template,animate,unused,customFields,toggle);

};

}}}
