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


config.macros.TagMindMapEdge={ /* params: node1|commit node2 */
	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		
		var id1 = params[0]; var id2 = params[1];
		var ttmm = config.macros.tiddlytagmindmap.getAssociatedTiddlyTagMindMapObject(null,false);
		if(!ttmm) return;
			
			
		if(id1 == "commit") {
			this.commit(); 
			return;
		}
		var name1,name2,data1,data2;
		if(id1.id){
			//its a json
			if(id1.name)name1 = id1.name;
			if(id1.data)data1 = id1.data;
			id1 = id1.id;
	
		}

		if(id2.id){
			//its a json
			if(id1.name)name2 = id2.name;
			if(id2.data)data2 = id2.data;
			id2 = id2.id;
		}
		
		if(!data1){ data1 = {};}
		if(!data2){ data2 = {};}
		
		if(!store.tiddlerExists(id1)){
			if(!data1.color && ttmm.settings.emptyTiddlerColor)data1.color = ttmm.settings.emptyTiddlerColor;
			data1.emptyTiddler = true;
		}
		if(!store.tiddlerExists(id2)){
			if(!data2.color && ttmm.settings.emptyTiddlerColor)data2.color = ttmm.settings.emptyTiddlerColor;
			data2.emptyTiddler = true;
		}
		


		if(ttmm){
		ttmm.drawEdge(id1,id2,name1,name2,data1,data2);
		
		}
	}
	,commit: function(){
		var ttmm = config.macros.tiddlytagmindmap.getAssociatedTiddlyTagMindMapObject(null,false);
		ttmm.computeThenPlot();
	}
};
	
config.macros.LoadMindMap={
	label: "loadall",
	prompt: "load all tiddlers into the tag mind map",
	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		var btn =createTiddlyButton(place,this.label,this.prompt,this.onClick);	
		
		if(params[0]){
			btn.wrapperID = params[0];
		}
	}
	,onClick: function(e,id)
	{
		var ttmm;
		if(id) 
			ttmm = config.macros.tiddlytagmindmap.store[id];
		else
			ttmm = config.macros.tiddlytagmindmap.getAssociatedTiddlyTagMindMapObject(this.wrapperID,true); 
		var list = store.getTiddlers();
		for (var t=0; t<list.length; t++) { 

			ttmm.createNodeFromJSON(config.macros.tiddlytagmindmap.createJSON(list[t].title,ttmm));
		}

		ttmm.computeThenPlot();


	}
};

config.macros.ToggleTagMindMap={
	label: "toggle",
	prompt: "Toggle on or off the tag mind map",
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
		if(params[0])btn.wrapperID = params[0];
	}
	,onClick: function(e){ 
	
		var id = config.macros.tiddlytagmindmap.getAssociatedTiddlyTagMindMapObject(this.wrapperID,true).wrapper.id;

		if(document.getElementById(id).style.display== "none"){
			document.getElementById(id).style.display=  "";
		}
		else{
			document.getElementById(id).style.display=  "none";
		}
	}

};

config.macros.tiddlytagmindmap={
	store: {}, //a library of created ttmm objects
	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		if(!place) { //give a default place
			place = document.getElementById('tagmindmap');
			if(!place) throw "no place to put ttmm!"; //unable to create
			paramString =place.getAttribute("parameters");

		}
		
		var settings = this.get_ttmm_settings(paramString);

		var elem = this.setup_ttmm_html(place,settings);

			try{
			
			this.store[elem.id]= new Tagmindmap(elem,settings);
			
			this.store['last'] = elem.id;
			this.store['cur'] = elem.id;
		
	
			if(settings.startupFunction){
				settings.startupFunction(elem.id);
			}
		
		}
		catch(e){console.log("exception thrown during tiddlytagmindmap creation:"+e);}
	},
	get_ttmm_setting_defaults: function(){
		if(!config.options.txtTTMM_canvasWidth)config.options.txtTTMM_canvasWidth = 800;
		if(!config.options.txtTTMM_canvasHeight)config.options.txtTTMM_canvasHeight = 200;
		if(!config.options.txtTTMM_inflation)config.options.txtTTMM_inflation = 80;
		if(!config.options.txtTTMM_maxNodeNameLength)config.options.txtTTMM_maxNodeNameLength = 25;
		if(config.options.chkTTMM_ignoreLoneNodes == null) config.options.chkTTMM_ignoreLoneNodes = false;
		if(config.options.chkTTMM_leaveRedBreadCrumbTrail == null) config.options.chkTTMM_leaveRedBreadCrumbTrail = true;
		if(!config.options.txtTTMM_excludeNodeList) config.options.txtTTMM_excludeNodeList= ['excludeLists'];
	
		var settings = {};
		/*set some defaults based on tweaked preferences if none passed as parameters*/
		settings.maxNodeNameLength = config.options.txtTTMM_maxNodeNameLength;
		settings.ignoreLoneNodes = config.options.chkTTMM_ignoreLoneNodes;
		settings.tagcloud = {off:false};
		settings.width = config.options.txtTTMM_canvasWidth;
		settings.height =config.options.txtTTMM_canvasHeight;
		settings.toolbar = "010";
		settings.zoomLevel = parseInt(config.options.txtTTMM_inflation);
		settings.breadcrumbs = config.options.chkTTMM_leaveRedBreadCrumbTrail;
		
		var clickfunction = function(node,id,e){
			//var tiddlerElem = story.findContainingTiddler(resolveTarget(e));
			story.displayTiddler(null, node.id,null,null,null,null,null,id);
		};
		settings.clickFunction = clickfunction;
		return settings;
	},
	get_ttmm_settings: function(paramString){
		var settings = this.get_ttmm_setting_defaults();

		var exList = null;
		var that = this;
		var startupFunction = function(id){};


	
		settings.dynamicUpdateFunction = this.createJSON;
	
		if(paramString){
			var prms = paramString.parseParams(null, null, true);
			settings.breadcrumbs = eval(getParam(prms, "breadcrumbs"));
			settings.ignoreLoneNodes = eval(getParam(prms, "ignoreLoneNodes"));
			settings.arrowheads = eval(getParam(prms, "directed"));
			settings.tagcloud.off = eval(getParam(prms, "notagcloud"));
		
			if(getParam(prms, "id")) settings.id = getParam(prms, "id");	
			if(getParam(prms, "width")) settings.width = getParam(prms, "width");
			if(getParam(prms, "height"))settings.height = getParam(prms, "height");
			if(getParam(prms, "toolbar")) settings.toolbar= getParam(prms, "toolbar");
			if(getParam(prms,"zoom")) settings.zoomLevel = parseInt(getParam(prms,"zoom"));
			if(getParam(prms,"maxNodeNameLength"))settings.maxNodeNameLength = getParam(prms,"maxNodeNameLength");
			if(getParam(prms, "exclude")) exList = getParam(prms, "exclude");
			if(getParam(prms,"displayemptytiddlers"))settings.displayemptytiddlers = getParam(prms,"displayemptytiddlers");
			if(getParam(prms,"emptyTiddlerColor")){
				settings.emptyTiddlerColor =getParam(prms,"emptyTiddlerColor");
			}
			
			if(getParam(prms, "click") == "none") {
				settings.clickFunction = function(node,id){return;} ;	
			}
			else if(getParam(prms, "click") == "existing") {
				settings.clickFunction = function(node,id,e){
					if(!node.data.emptyTiddler){
						//var tiddlerElem = story.findContainingTiddler(resolveTarget(e));
						story.displayTiddler(null, node.id,null,null,null,null,null,id);
					}
					return;
					} ;	
			}

			var startState = getParam(prms, "startState");
			if(startState){
				if(startState == 'all')
					startupFunction = function(id){
						config.macros.LoadMindMap.onClick(null,id);
					}
				else if(startState == 'empty'){
					startupFunction = function(id){
					
					};
				}
				/*else if(startState == 'default'){

					startupFunction = function(id){
						con
						var startState = store.filterTiddlers(store.getTiddlerText("DefaultTiddlers"));
						that.loadTiddlersIntoTTMM(startState,id);
					}
				}*/
				else{//parse as a list of tiddler names
					if(startState){
						startupFunction = function(id){
							if(startState.length == 0) return;
							that.loadTiddlersIntoTTMM(startState,id);
						} 
					}
			
				}
				settings.startupFunction = startupFunction;
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

	

	
	
		return settings;
	}
	,setup_ttmm_html: function(place,settings){
		if(place.id == 'tagmindmap')settings.id = 'default';
		if(place.style.width) settings.width = place.style.width;
		if(place.style.height) settings.height = place.style.height;

		/*setup tag mind map */
		var newTTMM = document.createElement("div");
		if(!settings.id) settings.id="ttmm_" +Math.random();
		newTTMM.id = settings.id;
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


		place.appendChild(toolbar);
		wikify(html,toolbar);
		place.appendChild(newTTMM);

		if(!document.getElementById(this.store['first']))this.store['first'] = newTTMM.id; //no primary ttmm exists

		if(!newTTMM.style.width) newTTMM.style.width = settings.width;
		if(!newTTMM.style.height) newTTMM.style.height = settings.height;

		return newTTMM;
	}

	,loadTiddlersIntoTTMM: function(tiddlerList,visualisationID){
		var viz;
		if(!visualisationID) 
			viz = this.store[this.store['first']];
		else
			viz = this.store[visualisationID];
		var nodesLoaded = false;


		var title ="";var firstTitle="";
		for(var i =0; i < tiddlerList.length; i++){

			if(tiddlerList[i].title) title = tiddlerList[i].title;
			else title = tiddlerList[i];
			if(i==0) firstTitle = title;
	
			nodesLoaded = viz.createNodeFromJSON(this.createJSON(title,viz)) | nodesLoaded;
	
		}


		if(viz.rgraph){
			if(nodesLoaded !=0){
				viz.rgraph.compute();
				viz.rgraph.plot();

			}
		
			viz.centerOnNode(title);
		}
	}

	,getAssociatedTiddlyTagMindMapObject: function(id,getFirstCreatedTTMM){
			if(id) return this.store[id];
			else {
				if(getFirstCreatedTTMM) 
					return this.store[this.store['first']];
				else 
					return this.store[this.store['last']];
			}
	}


	,_createJSONTagMindMapNodes: function(mylist,storeElement) { 
		var res=[]; 
		for (var t=0; t<mylist.length; t++){
			var node =mylist[t];
			res.push(config.macros.tiddlytagmindmap._createJSONTagMindMapNode(node,storeElement));
		} 
		
		return res;
	}
	
	,_createJSONTagMindMapNode: function(id,storeElement){


		var json = {};
		json.id = id;
		json.name = id;

		nodeData = {};

		var parents = getParents(id);
		for(var i=0; i < parents.length; i++){
			var nodeid = parents[i];
					
			if(store.tiddlerExists(nodeid)){
				var tiddler = store.getTiddler(nodeid);
				if(tiddler.fields.childrencolor) nodeData.color = tiddler.fields.childrencolor;
			}	
		}
				
		var children = getChildren(id);
		for(var i=0; i < children.length; i++){
			var nodeid = children[i];
			
			if(store.tiddlerExists(nodeid)){
				var tiddler = store.getTiddler(nodeid);
				if(tiddler.fields.parentcolor) nodeData.color = tiddler.fields.parentcolor;
			}	
		}

		
		
		if(store.tiddlerExists(id)){
			var tiddler = store.getTiddler(id);
			if(tiddler.fields.nodecolor) nodeData.color = tiddler.fields.nodecolor;
			if(tiddler.fields.nodeprefix) {
				var place =createTiddlyElement(null,"div");
				wikify(tiddler.fields.nodeprefix,place);
				nodeData.nodeLabelPrefix = place;
			}
			if(tiddler.fields.nodesuffix) {
				var place =createTiddlyElement(null,"div");
				wikify(tiddler.fields.nodesuffix,place);
				nodeData.nodeLabelSuffix = place;

			}
			if(tiddler.fields.nodelabel) {
				var place =createTiddlyElement(null,"div");
				wikify(tiddler.fields.nodelabel,place);
				nodeData.label = place;
			}
			if(tiddler.fields.nodetooltip) {nodeData.title = tiddler.fields.nodetooltip;}

		}

		if(!nodeData.color){
			var empty = false;
			 if(!store.tiddlerExists(id) && !store.isShadowTiddler(id)){		
				empty = true;
			}
			if(store.tiddlerExists(id)){
				var tiddler = store.getTiddler(id);
				if(tiddler.text == null || tiddler.text == "") empty =true; 
			}

			if(empty){
				nodeData.emptyTiddler = true;
				//nodeData.color = "#cccccc";
				//console.log(storeElement.settings);
				if(storeElement && storeElement.settings.emptyTiddlerColor) nodeData.color= storeElement.settings.emptyTiddlerColor;
				//storeElement
				
			}
		}

		if(nodeData){
			json.data =nodeData;
		}
		
		return json;
	}
	
	,createJSON: function(nodeid,storeElement){
		if(!nodeid) return "{}";
	    	var myjson = {};

		var children = getChildren(nodeid);
	    	var parents = getParents(nodeid);
	

		myjson.children = config.macros.tiddlytagmindmap._createJSONTagMindMapNodes(children,storeElement);
	 	myjson.parents = config.macros.tiddlytagmindmap._createJSONTagMindMapNodes(parents,storeElement);
		myjson.node  = config.macros.tiddlytagmindmap._createJSONTagMindMapNode(nodeid,storeElement);

		return myjson;
	}
	
	

};


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



	



story.beforettmm_displayTiddler = story.displayTiddler;
story.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,visualisationID)
{
	try{
		if(!document.getElementById(config.macros.tiddlytagmindmap.store['first'])) {					
			config.macros.tiddlytagmindmap.handler(); //try and setup a default one
		}
	}
	catch(e){
		
	};

	
	var title = (tiddler instanceof Tiddler)? tiddler.title : tiddler;

	if(config.macros.tiddlytagmindmap.store){
		try{
			if(!visualisationID && config.macros.tiddlytagmindmap.store['first']) { //call came from outside tagmindmap
				visualisationID =config.macros.tiddlytagmindmap.store['first'];
			}
			if(visualisationID){
				res = config.macros.tiddlytagmindmap.loadTiddlersIntoTTMM([title],visualisationID);
			}
		}
		catch(e){
			console.log("exception in display tiddler for "+title+" in visualisation" + visualisationID +": " + e);
		}
	}
	story.beforettmm_displayTiddler(srcElement,tiddler,template,animate,unused,customFields,toggle);
};

}}}
