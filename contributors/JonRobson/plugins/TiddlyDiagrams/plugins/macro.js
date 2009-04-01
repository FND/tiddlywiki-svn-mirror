/*
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
for edit template.. macro to convert json to readable text eg.. &lt;&lt;node id:foo properties:{fill:rgb(255,0,255)}&gt;&gt;&lt;&lt;edge from:foo to:blah&gt;&gt;
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
			}
		}		

		var x = new EasyGraph();
		
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

		var newplace = document.createElement("div");
		var width = getParam(prms,"width");
		var height = getParam(prms,"height");	
		if(height && width){
			newplace.style.height = height +"px";
			newplace.style.width = width + "px";
		}
		
		var mydiagram = new EasyDiagram(newplace,x,controller);
		if(json.transformation)mydiagram.setTransformation(json.transformation);
		mygraph = mydiagram;
		mygraph.render();
		place.appendChild(newplace);
		
	}
};
//}}}

