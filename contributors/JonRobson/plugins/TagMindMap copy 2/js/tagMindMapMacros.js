/***
!Layer 1: TiddlyWiki Specific
***/

{{{
//load defaults
if(!config.options.txtTTMM_canvasWidth)config.options.txtTTMM_canvasWidth = 800;
if(!config.options.txtTTMM_canvasHeight)config.options.txtTTMM_canvasHeight = 200;
if(!config.options.txtTTMM_inflation)config.options.txtTTMM_inflation = 80;

if(config.options.txtTTMM_inflation <=0) config.options.txtTTMM_inflation = 10;
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

}}}

{{{

/*MACROS*/
var canvasID ="infovis";

/* Zooming TagMindMap (zoom in) */

config.macros.ZoomMindMapIn = {};
merge(config.macros.ZoomMindMapIn,{
	label: "Expand",
	prompt: "Expand the tag mind map"});
	
config.macros.ZoomMindMapIn.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
createTiddlyButton(place,this.label,this.prompt,this.onClick);	
};

config.macros.ZoomMindMapIn.onClick = function(e)
{
config.options.txtTTMM_inflation = tiddlytagmindmapobject.zoom(10);
if(tiddlytagmindmapobject)tiddlytagmindmapobject.computeThenPlot();
}

/* Zooming TagMindMap (zoom out) */

config.macros.ZoomMindMapOut = {};
merge(config.macros.ZoomMindMapOut,{
	label: "Shrink",
	prompt: "shrink the tag mind map"});
	
config.macros.ZoomMindMapOut.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
createTiddlyButton(place,this.label,this.prompt,this.onClick);	
};

config.macros.ZoomMindMapOut.onClick = function(e)
{
config.options.txtTTMM_inflation =tiddlytagmindmapobject.zoom(-10);
saveOptionCookie("txtTTMM_inflation");
if(tiddlytagmindmapobject)tiddlytagmindmapobject.computeThenPlot();
}

/*Load All Tiddlers into TagMindMap Macro */

config.macros.LoadMindMap = {};
merge(config.macros.LoadMindMap,{
	label: "Load TagMindMap",
	prompt: "load all tiddlers into tag mind map"});
	
config.macros.LoadMindMap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
createTiddlyButton(place,this.label,this.prompt,this.onClick);	
};

config.macros.LoadMindMap.onClick = function(e)
{
var list = store.getTiddlers();
for (var t=0; t<list.length; t++) { 
	tiddlytagmindmapobject.createNodeFromJSON(createJSON(list[t].title));
	
}

tiddlytagmindmapobject.computeThenPlot();

}
/*Toggler Macro */

config.macros.ToggleTagMindMap = {};
merge(config.macros.ToggleTagMindMap,{
	label: "Toggle TagMindMap",
	prompt: "Toggle on or off the tag mind map"});

config.macros.ToggleTagMindMap.handler = function(place)
{
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
};

config.macros.ToggleTagMindMap.onClick = function(e)
{
  if(document.getElementById('tagmindmap').style.display== "none"){
    document.getElementById('tagmindmap').style.display=  "";

}
  else{
    document.getElementById('tagmindmap').style.display=  "none";
  }
};


var tiddlytagmindmapobject;
var ttmm_loadedStatus = true;
/* Init TagMindMap macro */
config.macros.tiddlytagmindmap = {};
config.macros.tiddlytagmindmap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
	var wrapper = document.getElementById('tagmindmap');
	
	if(!wrapper) {
		var theme;
		theme = config.options.txtTheme;
		if(theme == '') theme = "[[PageTemplate]]";
		else theme = "[["+theme+"]]"

		if(ttmm_loadedStatus){
			ttmm_loadedStatus = false;
			alert("TiddlyTagMindMapPlugin: please insert code <div id='tagmindmap'></div> into " + 	theme + " and your TagMindMapPlugin will be ready to go!");return;
		}
		return;
	}
	if(!wrapper.style.width) wrapper.style.width = config.options.txtTTMM_canvasWidth + "px";
	if(!wrapper.style.height) wrapper.style.height = config.options.txtTTMM_canvasHeight+"px";
	if(!tiddlytagmindmapobject){ 
		try{
	   	 var clickF = function(node){
		      story.displayTiddler(null, node.id);
		    };

			tiddlytagmindmapobject= new Tagmindmap('tagmindmap',
						function(A){
							story.displayTiddler(null,A.id);
							   }
								);
								
			var excludeLists = config.options.txtTTMM_excludeNodeList
			tiddlytagmindmapobject.excludeNodeList = getParents(excludeLists);
			Config['levelDistance'] = config.options.txtTTMM_inflation;
			tiddlytagmindmapobject.ignoreLoneNodes = config.options.chkTTMM_ignoreLoneNodes;
			
			tiddlytagmindmapobject.maxNodeNameLength = config.options.txtTTMM_maxNodeNameLength;
			
			if(ttmm_loadOnStart) config.macros.LoadMindMap.onClick();
			
		}
		catch(e){console.log("exception thrown:"+e);}
		
	}
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
  var divName = canvasID + "_"+nodename; 
  var elem = document.getElementById(divName); 
  if(elem)elem.style.color = color; 
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


Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle)
{

if(!tiddlytagmindmapobject) config.macros.tiddlytagmindmap.handler();
	var title = (tiddler instanceof Tiddler)? tiddler.title : tiddler;
	var tiddlerElem = this.getTiddler(title);
	

if(tiddlytagmindmapobject){
	try{
	var res = tiddlytagmindmapobject.createNodeFromJSON(createJSON(title));
	if(res && tiddlytagmindmapobject.rgraph){
		tiddlytagmindmapobject.centerOnNode(title);
		tiddlytagmindmapobject.computeThenPlot();
	}
	}
	catch(e){
		console.log("exception: " + e);
	}
	
}
	if(tiddlerElem) {
		if(toggle)
			this.closeTiddler(title,true);
		else
			this.refreshTiddler(title,template,false,customFields);
	} else {
		var place = this.getContainer();
		var before = this.positionTiddler(srcElement);
		tiddlerElem = this.createTiddler(place,before,title,template,customFields);
	}
	if(srcElement && typeof srcElement !== "string") {
		if(config.options.chkAnimate && (animate == undefined || animate == true) && anim && typeof Zoomer == "function" && typeof Scroller == "function")
			anim.startAnimating(new Zoomer(title,srcElement,tiddlerElem),new Scroller(tiddlerElem));
		else
			window.scrollTo(0,ensureVisible(tiddlerElem));
	}


//if(store.getTiddlerText(title) == null) allowed = false; 

doColouring(title);
};

}}}
