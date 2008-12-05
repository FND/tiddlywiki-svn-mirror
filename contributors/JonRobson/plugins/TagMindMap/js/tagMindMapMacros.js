/***
!Layer 1: TiddlyWiki Specific 
Jon Robson
***/

{{{


//set descriptions
merge(config.optionsDesc,{
txtTTMM_canvasWidth: "TiddlyTagMindMapPlugin : Width of  visualisation. You will need to refresh the page to see the change."
,txtTTMM_canvasHeight: "TiddlyTagMindMapPlugin : Height of visualisation. You will need to refresh the page to see the change."
,txtTTMM_inflation: "TiddlyTagMindMapPlugin : The visualisation can be inflated and deflated to allow you to see the structure from above or close up. This value allows you to set a start inflation."
,txtTTMM_maxNodeNameLength:"TiddlyTagMindMapPlugin : maximum length of a tiddler name. Any tiddlers with names longer than this will be abbrieviated using '...'. Set to zero to make labels disappear altogether and rely completely on tooltips."
,chkTTMM_ignoreLoneNodes: "TiddlyTagMindMapPlugin : any lone tiddlers/nodes (ie. tiddlers that are not tagged with any data) will be ignored in the visualisation. This cleans up the visualisation greatly."
,txtTTMM_excludeNodeList: "TiddlyTagMindMapPlugin :Anything tagged with this will be ignored in the visualisation. Formatted in form ['tiddlername1', 'tiddlername2']"
,chkTTMM_leaveRedBreadCrumbTrail: "TiddlyTagMindMapPlugin : When you visit a node it will be coloured red leaving a breadcrumb trail of where you have been."
}
);

/*MACROS*/
var tiddlytagmindmapobjects = {}; //a library of created ttmm objects
//var ttmm_lastID = null; //the index of the last ttmm to be opened
//var ttmm_primaryID = null; //the primary ttmm  - this is the first to be opened. If that is closed, then the primary one becomes the next one opened after it's destruction.
/* Zooming TagMindMap (zoom in) */

config.macros.tiddlytagmindmap = {};
config.macros.TagMindMapEdge = {};
config.macros.LoadMindMap = {label: "loadall",prompt: "load all tiddlers into tag mind map"};

//macros below will become redundant soon..
config.macros.ToggleTagMindMap = {label: "toggle",prompt: "Toggle on or off the tag mind map"};
config.macros.RecenterMindMap = {label: "re-center",	prompt: "Center the mind map"};

config.macros.RecenterMindMap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {

	var btn= createTiddlyButton(place,this.label,this.prompt,this.onClick);	
	if(params[0])btn.wrapperID = params[0];
};

config.macros.RecenterMindMap.onClick = function(e)
{
var ttmm = getAssociatedTiddlyTagMindMapObject(this,true);
	if(ttmm.rgraph){
		var t = ttmm.controlpanel.transformation;
		t.translate.x = 0;
		t.translate.y = 0;
		ttmm.controlpanel.setTransformation(t);
	}
}


/*accepts either name of node or json representing node {id,name,data}*/
config.macros.TagMindMapEdge.handler = function (place,macroName,params,wikifier,paramString,tiddler) {

var id1 = params[0]; var id2 = params[1];
var name1,name2,data1,data2;
if(id1.id){
	//its a json
	name1 = id1.name;
	data1 = id1.data;
	id1 = id1.id;
	
}

if(id2.id){
	//its a json
	name2 = id2.name;
	data2 = id2.data;
	id2 = id2.id;
}

var ttmm = getAssociatedTiddlyTagMindMapObject(this,false);


if(ttmm){
	ttmm.drawEdge(id1,id2,name1,name2,data1,data2);
	
	if(!params[2])
		ttmm.computeThenPlot();
	}

};

config.macros.TagMindMapEdge.commit = function(){
	var ttmm = getAssociatedTiddlyTagMindMapObject(this,false);
	ttmm.computeThenPlot();
};
	
config.macros.LoadMindMap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
	var btn =createTiddlyButton(place,this.label,this.prompt,this.onClick);	
	if(params[0])btn.wrapperID = params[0];
};

config.macros.LoadMindMap.onClick = function(e,id)
{
	var ttmm;
	if(id) 
		ttmm = tiddlytagmindmapobjects[id];
	else
		ttmm = getAssociatedTiddlyTagMindMapObject(this,true); 
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
	
	var id = getAssociatedTiddlyTagMindMapObject(this,true).wrapperID;

	if(document.getElementById(id).style.display== "none"){
		document.getElementById(id).style.display=  "";
	}
	else{
		document.getElementById(id).style.display=  "none";
	}
};



config.macros.tiddlytagmindmap.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
	var settings = this.get_ttmm_settings(paramString);

	var elem = this.setup_ttmm_html(place,settings);

		try{

		tiddlytagmindmapobjects[elem.id]= new Tagmindmap(elem,settings);
		tiddlytagmindmapobjects['last'] = elem.id;
		tiddlytagmindmapobjects['cur'] = elem.id;	
		settings.startupFunction(elem.id);

		//console.log("created ttmm ",ttmm_current);
	}
	catch(e){console.log("exception thrown during tiddlytagmindmap creation:"+e);}

};

config.macros.tiddlytagmindmap.set_ttmm_setting_defaults = function(){
	if(!config.options.txtTTMM_canvasWidth)config.options.txtTTMM_canvasWidth = 800;
	if(!config.options.txtTTMM_canvasHeight)config.options.txtTTMM_canvasHeight = 200;
	if(!config.options.txtTTMM_inflation)config.options.txtTTMM_inflation = 80;
	if(!config.options.txtTTMM_maxNodeNameLength)config.options.txtTTMM_maxNodeNameLength = 25;
	if(config.options.chkTTMM_ignoreLoneNodes == null) config.options.chkTTMM_ignoreLoneNodes = false;
	if(config.options.chkTTMM_leaveRedBreadCrumbTrail == null) config.options.chkTTMM_leaveRedBreadCrumbTrail = true;
	if(!config.options.txtTTMM_excludeNodeList) config.options.txtTTMM_excludeNodeList= "['excludeLists']";
}	
config.macros.tiddlytagmindmap.get_ttmm_settings = function(paramString){
	this.set_ttmm_setting_defaults();
	var settings = {};
	var exList = null;
	var that = this;
	if(config.options.txtTTMM_excludeNodeList) settings.excludeList = eval(config.options.txtTTMM_excludeNodeList);
	var startupFunction = function(id){};
	settings.tagcloud = {};

	var clickF = function(node,id){story.displayTiddler(null, node.id,null,null,null,null,null,id);};
	settings.clickFunction = clickF;
	
	settings.dynamicUpdateFunction = createJSON;
	
	if(paramString){
		var prms = paramString.parseParams(null, null, true);
		settings.breadcrumbs = eval(getParam(prms, "breadcrumbs"));
		settings.ignoreLoneNodes = eval(getParam(prms, "ignoreLoneNodes"));
		settings.arrowheads = eval(getParam(prms, "directed"));
		settings.tagcloud.off = eval(getParam(prms, "notagcloud"));
			
		settings.width = getParam(prms, "width");
		settings.height = getParam(prms, "height");
		settings.toolbar= getParam(prms, "toolbar");
		settings.zoomLevel = getParam(prms,"zoom");
		settings.maxNodeNameLength = getParam(prms,"maxNodeNameLength");
		exList = getParam(prms, "exclude");
			
		if(getParam(prms, "click") == "none") settings.clickFunction = function(node,id){return;} ;	
		var startState = getParam(prms, "startState");
		if(startState){
			if(startState == 'all')
				startupFunction = function(id){config.macros.LoadMindMap.onClick(null,id);}
			else if(startState == 'empty'){
				startupFunction = function(id){};
			}
			else if(startState == 'default'){

				startupFunction = function(id){
					var startState = store.filterTiddlers(store.getTiddlerText("DefaultTiddlers"));
					that.loadTiddlersIntoTTMM(startState,id);
				}
			}
			else{
				if(startState){
					startupFunction = function(id){
						if(startState.length == 0) return;
						that.loadTiddlersIntoTTMM(startState,id);
					} 
				}
			
			}
		}
	}
	
	if(!exList){
		exList = [];
		if(config.options.txtTTMM_excludeNodeList)exList = config.options.txtTTMM_excludeNodeList;
	}
	/*set the excluded nodes */
	var l = eval(exList);
	settings.excludeNodeList = [];
	for(var i=0; i < l.length; i++){
		settings.excludeNodeList.push(l[i]);	
		settings.excludeNodeList = settings.excludeNodeList.concat(getChildren(l[i]));		
	}

	
	/*set some defaults based on tweaked preferences if none passed as parameters*/
	if(!settings.maxNodeNameLength)	settings.maxNodeNameLength = config.options.txtTTMM_maxNodeNameLength;
	if(settings.ignoreLoneNodes==null) settings.ignoreLoneNodes = config.options.chkTTMM_ignoreLoneNodes;
		if(settings.tagcloud == null)settings.tagcloud.off = false;
	if(!settings.width) settings.width = config.options.txtTTMM_canvasWidth;
	if(!settings.height) settings.height =config.options.txtTTMM_canvasHeight;
	if(!settings.toolbar)  settings.toolbar = "01111";
	if(!settings.zoomLevel) settings.zoomLevel = config.options.txtTTMM_inflation;
	if(!settings.breadcrumbs) settings.breadcrumbs = config.options.chkTTMM_leaveRedBreadCrumbTrail;
	settings.startupFunction = startupFunction;
	
	
	return settings;
}
config.macros.tiddlytagmindmap.setup_ttmm_html = function(place,settings){
	if(!place) { //give a default place
		place = document.getElementById('tagmindmap');
		if(!place) throw "no place to put ttmm!"; //unable to create
		if(place.style.width) settings.width = place.style.width;
		if(place.style.height) settings.height = place.style.height;
	}

	/*setup tag mind map */
	var newTTMM = document.createElement("div");
	newTTMM.id = "ttmm_" +Math.random();
	newTTMM.style.width = settings.width +"px";
	newTTMM.style.height= settings.height +"px";
	newTTMM.setAttribute("class","ttmm");
	/*setup toolbar */
	var toolbar = document.createElement("div");
	toolbar.setAttribute("class","ttmm_toolbar");
	var html="", divider = " ";

	if(settings.toolbar[0] == 1){//MAKE VERTICAL
		toolbar.style.height = "1px";
		toolbar.style.position = "relative";
		var temp =  parseInt(settings.width) +10;
		toolbar.style.top = "0px";
		toolbar.style.left = temp+"px";
		divider = "\n";
	}
	if(settings.toolbar[1] == 1) html += "<<ToggleTagMindMap " + newTTMM.id+">>" + divider;
	if(settings.toolbar[2] == 1) html += "<<LoadMindMap " + newTTMM.id+">>"+ divider;
	//if(settings.toolbar[3] == 1) {html += "<<ZoomMindMapIn  " + newTTMM.id+">>"+ divider+ "<<ZoomMindMapOut " + newTTMM.id+">>"+ divider;}
	if(settings.toolbar[4] == 1){html += "<<RecenterMindMap " + newTTMM.id+">>";}
	
	place.appendChild(toolbar);
	wikify(html,toolbar);
	place.appendChild(newTTMM);

	if(!document.getElementById(tiddlytagmindmapobjects['first']))tiddlytagmindmapobjects['first'] = newTTMM.id; //no primary ttmm exists
	
	if(!newTTMM.style.width) newTTMM.style.width = settings.width;
	if(!newTTMM.style.height) newTTMM.style.height = settings.height;
	
	return newTTMM;
}
function getAssociatedTiddlyTagMindMapObject(that,primaryPlease){

		if(that.wrapperID) return tiddlytagmindmapobjects[that.wrapperID];
		else {
			if(primaryPlease) 
				return tiddlytagmindmapobjects[tiddlytagmindmapobjects['first']];
			else 
				return tiddlytagmindmapobjects[tiddlytagmindmapobjects['last']];
		}
}	


function getParents(a){ 

  if(store.getTiddler(a)){
    return store.getTiddler(a).tags;
  }
  else
    return [];
} 

function getChildren(a){
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



function createJSONTagMindMapNode(id){
	
	var json = {};
	json.id = id;
	json.name = id;
	return json;
};
function createJSONTagMindMapNodes(mylist) { 
									var res=[]; 
                                    for (var t=0; t<mylist.length; t++){
										res[t] = createJSONTagMindMapNode(mylist[t]);
									} 
									return res;
								};
	
function createJSON(nodeid){
	if(!nodeid) return "{}";
    var myjson = {};
	
	var children = getChildren(nodeid);
    var parents = getParents(nodeid);
    myjson.node  = createJSONTagMindMapNode(nodeid);
	myjson.children =  createJSONTagMindMapNodes(children);
 	myjson.parents = createJSONTagMindMapNodes(parents);

	return myjson;
}




config.macros.tiddlytagmindmap.loadTiddlersIntoTTMM=  function(tiddlerList,visualisationID){
	
	var viz;
	if(!visualisationID) 
		viz = tiddlytagmindmapobjects[tiddlytagmindmapobjects['first']];
	else
		viz = tiddlytagmindmapobjects[visualisationID];
	var nodesLoaded = false;
	
	
	var title ="";var firstTitle="";
	for(var i =0; i < tiddlerList.length; i++){
		
		if(tiddlerList[i].title) title = tiddlerList[i].title;
		else title = tiddlerList[i];
		if(i==0) firstTitle = title;
		nodesLoaded = viz.createNodeFromJSON(createJSON(title)) | nodesLoaded;
	}


	if(viz.rgraph){
		if(nodesLoaded !=0){

			viz.rgraph.compute();
			viz.rgraph.plot();
			
		}
		viz.centerOnNode(title);
	}
}

Story.prototype.beforettmm_displayTiddler = Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,visualisationID)
{

try{
	if(!document.getElementById(tiddlytagmindmapobjects['first'])) config.macros.tiddlytagmindmap.handler(); //try and setup a default one
}catch(e){};
	var title = (tiddler instanceof Tiddler)? tiddler.title : tiddler;


	if(tiddlytagmindmapobjects){
		try{
		var res = config.macros.tiddlytagmindmap.loadTiddlersIntoTTMM([title],visualisationID);

		}
		catch(e){
			//console.log("exception in display tiddler: " + e);
		}
	}

story.beforettmm_displayTiddler(srcElement,tiddler,template,animate,unused,customFields,toggle);

};

}}}
