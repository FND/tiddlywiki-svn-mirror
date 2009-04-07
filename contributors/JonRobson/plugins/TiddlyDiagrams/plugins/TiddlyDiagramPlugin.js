/***
|''Name:''|easyGraphs |
|''Description:''|An attempt to bring nice easy to use maps to tiddlywiki using geojson|
|''Author:''|JonRobson |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/verticals/GeoTiddlyWiki|
|''Version:''|0.0.5 |
|''Date:''|4/11/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|
|''Dependencies:''|This plugin requires a tiddler geojson containing geojson data eg.[[geojson]]|

Nicer icons
Resize function: on mouse over, move resizer function to right hand corner, when you click on it
arrowheads
for edit template.. macro to convert json to readable text eg.. <<node id:foo properties:{fill:rgb(255,0,255)}>><<edge from:foo to:blah>>
***/

//{{{
/***
!StyleSheet

.editorWindow {border:solid 1px black; height:150px; background:white;}
.easyColorSlider {border:solid 1px black;}
.easyColorSliderMixBox {border:solid 1px black;}
!(end of StyleSheet)

***/
var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
config.shadowTiddlers["StyleSheetTiddlyDiagramsPlugin"] = stylesheet;
store.addNotification("StyleSheetTiddlyDiagramsPlugin", refreshStyles);
var mygraph;
config.macros.TiddlyDiagram = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		var prms = paramString.parseParams(null, null, true);		
		if(getParam(prms,"tiddler")){
			
			var tiddlerName = getParam(prms,"tiddler");
			tiddler = store.getTiddler(tiddlerName);
			if(!tiddler){
				store.createTiddler(tiddlerName);
				tiddler = store.getTiddler(tiddlerName);	
				console.log("no tiddler ",tiddlerName,store);
			}
		}		

		var x = new VismoGraph();
		
		var json = {};
		if(tiddler.fields.tiddlydiagram){
			json =eval(tiddler.fields.tiddlydiagram);
			try{
				x.loadfromjson(json);
			}catch(e){}
		}

		var controller = {
			saveHandler: function(easyDiagram,json){
				var t = easyDiagram.getTransformation();
				json.transformation = t;
				var title = tiddler.title;
				var text = tiddler.text;
				var tags = tiddler.tags;
				var fields = tiddler.fields;
				fields.tiddlydiagram = json.toSource();
				store.saveTiddler(title,title,text,null,null,tags,fields);
				alert("saved diagram!");
			}
			,renderLabel: function(domElement,value){
			 
				domElement.innerHTML = "";
				if(!value || value==null || value == "") {
					domElement.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
				}
				else{
					wikify(value,domElement);
				}
			}
		};

		var width = getParam(prms,"width");
		var height = getParam(prms,"height");	
		if(height && width){
			place.style.height = height +"px";
			place.style.width = width + "px";
		}
		
		var mydiagram = new VismoDiagram(place,x,controller);
		if(json.transformation)mydiagram.setTransformation(json.transformation);
		mygraph = mydiagram;
		mygraph.render();
		
	}

	,loadForEditTemplate: function(){
	}
	,savewikifiedFromEditTemplate: function(){
		
	}
};
config.macros.WikifedTiddlyDiagram = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		var textarea = document.createElement("textarea");
		textarea.edit = "tiddlydiagram";
		
		var json = eval(tiddler.fields.tiddlydiagram);
		var wikified = "";
		for(var i=0; i < json.nodes.length; i++){
			var p = json.nodes[i].properties;
			var j;
			wikified += "<<node "
			for(j in p){
				if(typeof p[j] == 'object'){
					wikified += j+":" + p[j].toSource() + " ";
				}
				else{
					wikified += j+":\""+p[j] + "\" ";
				}
			}
			wikified += ">>\n"
			
		}
		var from,to;
		for(var i=0; i < json.edges.length; i++){
			from=json.edges[i][0];
			to = json.edges[i][1];
			wikified += "<<edge "+ from+" "+ to+">>\n";
		}
		
		textarea.value = wikified;
		place.appendChild(textarea);
		
		
		
	}
	
};

